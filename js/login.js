"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const forgotForm = document.getElementById("forgotPasswordForm");
    const createAccountForm = document.getElementById("createAccountForm");
    const showForgotButton = document.getElementById("showForgotPassword");
    const backToLoginButton = document.getElementById("backToLogin");
    const showCreateAccountButton = document.getElementById("showCreateAccount");
    const backFromCreateAccountButton = document.getElementById("backFromCreateAccount");
    const loginLinks = document.getElementById("loginLinks");
    const loginMessage = document.getElementById("loginMessage");
    const resetMessage = document.getElementById("resetRequestMessage");
    const createAccountMessage = document.getElementById("createAccountMessage");

    function setMessage(element, message, type) {
        element.textContent = message;
        element.classList.toggle("error", type === "error");
        element.classList.toggle("success", type === "success");
    }

    showForgotButton.addEventListener("click", () => {
        loginForm.hidden = true;
        loginLinks.hidden = true;
        forgotForm.hidden = false;
        forgotForm.reset();
        setMessage(resetMessage, "", "");
        document.getElementById("resetEmail").focus();
    });

    backToLoginButton.addEventListener("click", () => {
        forgotForm.hidden = true;
        loginForm.hidden = false;
        loginLinks.hidden = false;
        document.getElementById("username").focus();
    });

    showCreateAccountButton.addEventListener("click", () => {
        loginForm.hidden = true;
        loginLinks.hidden = true;
        createAccountForm.hidden = false;
        createAccountForm.reset();
        setMessage(createAccountMessage, "", "");
        document.getElementById("newUsername").focus();
    });

    backFromCreateAccountButton.addEventListener("click", () => {
        createAccountForm.hidden = true;
        loginForm.hidden = false;
        loginLinks.hidden = false;
        document.getElementById("username").focus();
    });

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const submitButton = loginForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        setMessage(loginMessage, "", "");

        try {
            const result = await window.schoolAuth.request("/api/auth/login", {
                method: "POST",
                body: {
                    username: document.getElementById("username").value,
                    password: document.getElementById("password").value
                }
            });

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
            const result = await window.schoolAuth.request("/api/auth/request-password-reset", {
                method: "POST",
                body: {
                    email: document.getElementById("resetEmail").value
                }
            });

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

    createAccountForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const submitButton = createAccountForm.querySelector('button[type="submit"]');
        const password = document.getElementById("newAccountPassword").value;
        const confirmPassword = document.getElementById("confirmAccountPassword").value;
        submitButton.disabled = true;
        setMessage(createAccountMessage, "", "");

        if (password !== confirmPassword) {
            setMessage(createAccountMessage, "The passwords do not match.", "error");
            submitButton.disabled = false;
            return;
        }

        try {
            const result = await window.schoolAuth.request("/api/auth/register", {
                method: "POST",
                body: {
                    username: document.getElementById("newUsername").value,
                    email: document.getElementById("newEmail").value,
                    password,
                    userType: document.getElementById("newUserType").value
                }
            });

            createAccountForm.reset();
            document.getElementById("username").value = result.username;
            createAccountForm.hidden = true;
            loginForm.hidden = false;
            loginLinks.hidden = false;
            setMessage(
                loginMessage,
                "You have created your account successfully. Sign in with your username and password.",
                "success"
            );
            document.getElementById("password").focus();
        } catch (error) {
            setMessage(
                createAccountMessage,
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
