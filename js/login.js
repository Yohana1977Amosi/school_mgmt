"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const forgotForm = document.getElementById("forgotPasswordForm");
    const showForgotButton = document.getElementById("showForgotPassword");
    const backToLoginButton = document.getElementById("backToLogin");
    const loginMessage = document.getElementById("loginMessage");
    const resetMessage = document.getElementById("resetRequestMessage");

    function setMessage(element, message, type) {
        element.textContent = message;
        element.classList.toggle("error", type === "error");
        element.classList.toggle("success", type === "success");
    }

    showForgotButton.addEventListener("click", () => {
        loginForm.hidden = true;
        showForgotButton.hidden = true;
        forgotForm.hidden = false;
        forgotForm.reset();
        setMessage(resetMessage, "", "");
        document.getElementById("resetEmail").focus();
    });

    backToLoginButton.addEventListener("click", () => {
        forgotForm.hidden = true;
        loginForm.hidden = false;
        showForgotButton.hidden = false;
        document.getElementById("username").focus();
    });

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        setMessage(loginMessage, "", "");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: document.getElementById("username").value,
                    password: document.getElementById("password").value,
                    userType: document.getElementById("userType").value
                })
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Unable to sign in.");
            }

            window.location.assign(result.redirect);
        } catch (error) {
            setMessage(
                loginMessage,
                error instanceof TypeError
                    ? "Unable to reach the server. Check your connection and try again."
                    : error.message,
                "error"
            );
        } finally {
            submitButton.disabled = false;
        }
    });

    forgotForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const submitButton = forgotForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        setMessage(resetMessage, "", "");

        try {
            const response = await fetch("/api/auth/request-password-reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: document.getElementById("resetEmail").value
                })
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Unable to request a reset link.");
            }

            setMessage(resetMessage, result.message, "success");
            forgotForm.reset();
        } catch (error) {
            setMessage(
                resetMessage,
                error instanceof TypeError
                    ? "Unable to reach the server. Check your connection and try again."
                    : error.message,
                "error"
            );
        } finally {
            submitButton.disabled = false;
        }
    });
});
