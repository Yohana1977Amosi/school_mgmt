"use strict";

require("dotenv").config();

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");
const express = require("express");
const { rateLimit } = require("express-rate-limit");
const helmet = require("helmet");
const nodemailer = require("nodemailer");

const app = express();
const port = Number(process.env.PORT || 3000);
const publicBaseUrl = (process.env.PUBLIC_BASE_URL || `http://localhost:${port}`)
    .replace(/\/+$/, "");
const databaseDirectory = path.join(__dirname, "data");

fs.mkdirSync(databaseDirectory, { recursive: true });

const database = new Database(
    path.join(databaseDirectory, "school-management.sqlite")
);

database.pragma("journal_mode = WAL");
database.pragma("foreign_keys = ON");
database.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL COLLATE NOCASE UNIQUE,
        email TEXT NOT NULL COLLATE NOCASE UNIQUE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
        token_hash TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS auth_sessions (
        token_hash TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        expires_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS password_reset_tokens_user_id
        ON password_reset_tokens(user_id);
    CREATE INDEX IF NOT EXISTS auth_sessions_user_id
        ON auth_sessions(user_id);
`);

const ROLES = [
    "Administrator",
    "Head Teacher",
    "Academic Teacher",
    "Teacher",
    "Bursar",
    "Librarian",
    "Parent",
    "Student"
];

const SESSION_LIFETIME_MS = 8 * 60 * 60 * 1000;
const RESET_TOKEN_LIFETIME_MS = 30 * 60 * 1000;
const PASSWORD_HASH_BYTES = 64;
const PASSWORD_SALT_BYTES = 16;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const COOKIE_NAME = "school_session";

const smtpHost = process.env.SMTP_HOST;
const smtpFrom = process.env.SMTP_FROM;
const smtpConfigured = Boolean(smtpHost && smtpFrom);
const mailer = smtpConfigured
    ? nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        ...(process.env.SMTP_USER && process.env.SMTP_PASS
            ? {
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            }
            : {}),
        disableFileAccess: true,
        disableUrlAccess: true
    })
    : null;

function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

function hashPassword(password) {
    const salt = crypto.randomBytes(PASSWORD_SALT_BYTES);
    const hash = crypto.scryptSync(
        password,
        salt,
        PASSWORD_HASH_BYTES,
        SCRYPT_OPTIONS
    );
    return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

function verifyPassword(password, storedHash) {
    const [saltHex, hashHex] = String(storedHash).split(":");

    if (
        !/^[a-f0-9]{32}$/i.test(saltHex || "") ||
        !/^[a-f0-9]{128}$/i.test(hashHex || "")
    ) {
        return false;
    }

    const expectedHash = Buffer.from(hashHex, "hex");
    const actualHash = crypto.scryptSync(
        password,
        Buffer.from(saltHex, "hex"),
        PASSWORD_HASH_BYTES,
        SCRYPT_OPTIONS
    );

    return crypto.timingSafeEqual(actualHash, expectedHash);
}

function createAccount({ username, email, password, role }) {
    const normalizedUsername = String(username || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (
        normalizedUsername.length < 3 ||
        normalizedUsername.length > 64 ||
        !/^[\p{L}\p{N}._-]+$/u.test(normalizedUsername)
    ) {
        throw new Error(
            "Username must be 3-64 characters and use only letters, numbers, dots, underscores, or hyphens."
        );
    }

    if (
        normalizedEmail.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
        throw new Error("Enter a valid email address.");
    }

    if (
        typeof password !== "string" ||
        password.length < 12 ||
        Buffer.byteLength(password, "utf8") > 1024
    ) {
        throw new Error("Password must be at least 12 characters long.");
    }

    if (!ROLES.includes(role)) {
        throw new Error(`Role must be one of: ${ROLES.join(", ")}.`);
    }

    const result = database.prepare(`
        INSERT INTO users (username, email, password_hash, role, created_at)
        VALUES (?, ?, ?, ?, ?)
    `).run(
        normalizedUsername,
        normalizedEmail,
        hashPassword(password),
        role,
        Date.now()
    );

    return Number(result.lastInsertRowid);
}

function parseCookie(cookieHeader, name) {
    if (!cookieHeader) {
        return "";
    }

    const entry = cookieHeader
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${name}=`));

    return entry ? entry.slice(name.length + 1) : "";
}

function sessionCookie(token, maxAgeSeconds) {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    return `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAgeSeconds}${secure}`;
}

function requireLogin(req, res, next) {
    const sessionToken = parseCookie(
        req.headers.cookie,
        COOKIE_NAME
    );

    if (!/^[a-f0-9]{64}$/i.test(sessionToken)) {
        res.redirect("/login.html");
        return;
    }

    const session = database.prepare(`
        SELECT users.id, users.username, users.role
        FROM auth_sessions
        JOIN users ON users.id = auth_sessions.user_id
        WHERE auth_sessions.token_hash = ? AND auth_sessions.expires_at > ?
    `).get(hashToken(sessionToken), Date.now());

    if (!session) {
        res.setHeader("Set-Cookie", sessionCookie("", 0));
        res.redirect("/login.html");
        return;
    }

    req.user = session;
    next();
}

function jsonRateLimit(maxRequests) {
    return rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: maxRequests,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        message: { error: "Too many attempts. Please wait and try again." }
    });
}

app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "10kb", type: "application/json" }));
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/login.html", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/reset-password.html", (req, res) => {
    res.sendFile(path.join(__dirname, "reset-password.html"));
});

app.use(
    "/admin",
    requireLogin,
    express.static(path.join(__dirname, "admin"), { index: false })
);

app.post("/api/auth/login", jsonRateLimit(10), (req, res) => {
    const { username, password, userType } = req.body || {};

    if (
        typeof username !== "string" ||
        typeof password !== "string" ||
        typeof userType !== "string" ||
        username.length > 64 ||
        password.length > 1024 ||
        !ROLES.includes(userType)
    ) {
        res.status(400).json({ error: "Enter your username, password, and user type." });
        return;
    }

    const user = database.prepare(`
        SELECT id, username, email, password_hash, role
        FROM users
        WHERE username = ? COLLATE NOCASE
    `).get(username.trim());

    const valid = user &&
        user.role === userType &&
        verifyPassword(password, user.password_hash);

    if (!valid) {
        res.status(401).json({ error: "Username, password, or user type is incorrect." });
        return;
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + SESSION_LIFETIME_MS;

    database.prepare(`
        INSERT INTO auth_sessions (token_hash, user_id, expires_at)
        VALUES (?, ?, ?)
    `).run(hashToken(sessionToken), user.id, expiresAt);

    database.prepare("DELETE FROM auth_sessions WHERE expires_at <= ?")
        .run(Date.now());

    res.setHeader(
        "Set-Cookie",
        sessionCookie(sessionToken, SESSION_LIFETIME_MS / 1000)
    );
    res.json({ redirect: "/admin/dashboard.html" });
});

app.get("/logout", (req, res) => {
    const sessionToken = parseCookie(
        req.headers.cookie,
        COOKIE_NAME
    );

    if (/^[a-f0-9]{64}$/i.test(sessionToken)) {
        database.prepare("DELETE FROM auth_sessions WHERE token_hash = ?")
            .run(hashToken(sessionToken));
    }

    res.setHeader("Set-Cookie", sessionCookie("", 0));
    res.redirect("/login.html");
});

app.post(
    "/api/auth/request-password-reset",
    jsonRateLimit(5),
    async (req, res) => {
        if (!mailer) {
            res.status(503).json({
                error: "Password reset email is not configured. Contact the school administrator."
            });
            return;
        }

        const email = typeof req.body?.email === "string"
            ? req.body.email.trim().toLowerCase()
            : "";

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
            res.status(400).json({ error: "Enter a valid email address." });
            return;
        }

        const user = database.prepare(`
            SELECT id, email
            FROM users
            WHERE email = ? COLLATE NOCASE
        `).get(email);

        if (user) {
            const token = crypto.randomBytes(32).toString("hex");
            const tokenHash = hashToken(token);
            const expiresAt = Date.now() + RESET_TOKEN_LIFETIME_MS;

            database.prepare(
                "DELETE FROM password_reset_tokens WHERE user_id = ?"
            ).run(user.id);

            database.prepare(`
                INSERT INTO password_reset_tokens (token_hash, user_id, expires_at)
                VALUES (?, ?, ?)
            `).run(tokenHash, user.id, expiresAt);

            const resetUrl = new URL(
                "/reset-password.html",
                `${publicBaseUrl}/`
            );
            resetUrl.searchParams.set("token", token);

            try {
                await mailer.sendMail({
                    from: smtpFrom,
                    to: user.email,
                    subject: "Reset your Smart School password",
                    text: `A password reset was requested for your account. This link expires in 30 minutes:\n\n${resetUrl.href}\n\nIf you did not request this, you can ignore this email.`,
                    html: `<p>A password reset was requested for your account.</p><p><a href="${resetUrl.href}">Reset your password</a></p><p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>`
                });
            } catch (error) {
                database.prepare(
                    "DELETE FROM password_reset_tokens WHERE token_hash = ?"
                ).run(tokenHash);
                console.error("Password reset email delivery failed:", error.message);
            }
        }

        res.json({
            message: "If the email matches an account and delivery is available, a reset link will arrive shortly. If it does not, contact the school administrator."
        });
    }
);

app.post(
    "/api/auth/reset-password",
    jsonRateLimit(10),
    (req, res) => {
        const { token, password } = req.body || {};

        if (
            typeof token !== "string" ||
            !/^[a-f0-9]{64}$/i.test(token) ||
            typeof password !== "string" ||
            password.length < 12 ||
            Buffer.byteLength(password, "utf8") > 1024
        ) {
            res.status(400).json({
                error: "Use a valid reset link and a password of at least 12 characters."
            });
            return;
        }

        const tokenHash = hashToken(token);
        const resetRecord = database.prepare(`
            SELECT user_id
            FROM password_reset_tokens
            WHERE token_hash = ? AND expires_at > ?
        `).get(tokenHash, Date.now());

        if (!resetRecord) {
            res.status(400).json({
                error: "This password reset link is invalid or has expired. Request a new one."
            });
            return;
        }

        const updatePassword = database.transaction(() => {
            database.prepare(
                "UPDATE users SET password_hash = ? WHERE id = ?"
            ).run(hashPassword(password), resetRecord.user_id);
            database.prepare(
                "DELETE FROM password_reset_tokens WHERE user_id = ?"
            ).run(resetRecord.user_id);
            database.prepare(
                "DELETE FROM auth_sessions WHERE user_id = ?"
            ).run(resetRecord.user_id);
        });

        updatePassword();
        res.json({ message: "Your password has been changed. You can now sign in." });
    }
);

app.use((error, req, res, next) => {
    if (res.headersSent) {
        next(error);
        return;
    }

    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
        res.status(400).json({ error: "Request body must contain valid JSON." });
        return;
    }

    console.error("Request failed:", error);
    res.status(500).json({ error: "An unexpected server error occurred." });
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`School Management System listening on ${publicBaseUrl}`);
        if (!mailer) {
            console.warn(
                "SMTP is not configured. Password reset requests will be unavailable until SMTP_* values are set."
            );
        }
    });
}

module.exports = { app, createAccount, database, ROLES };
