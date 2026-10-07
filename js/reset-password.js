"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("resetPasswordForm");
    const message = document.getElementById("resetPasswordMessage");
    const token = new URLSearchParams(window.location.search).get("token") || "";

    function showMessage(text, isError) {
        message.textContent = text;
        message.classList.toggle("error", isError);
        message.classList.toggle("success", !isError);
    }

    if (!/^[a-f0-9]{64}$/i.test(token)) {
        form.hidden = true;
        showMessage("This reset link is invalid. Request a new password reset link.", true);
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const password = document.getElementById("newPassword").value;
        const confirmation = document.getElementById("confirmPassword").value;

        if (password !== confirmation) {
            showMessage("The passwords do not match.", true);
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        showMessage("", false);

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password })
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Unable to change the password.");
            }

            form.hidden = true;
            showMessage(result.message, false);
            window.history.replaceState({}, "", window.location.pathname);
        } catch (error) {
            showMessage(
                error instanceof TypeError
                    ? "Unable to reach the server. Check your connection and try again."
                    : error.message,
                true
            );
        } finally {
            submitButton.disabled = false;
        }
    });
});
