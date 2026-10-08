"use strict";

const contactForm = document.querySelector("#contactForm");
const contactStatus = document.querySelector("#contactStatus");

if (contactForm && contactStatus) {
    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!contactForm.reportValidity()) {
            return;
        }

        const submitButton = contactForm.querySelector('button[type="submit"]');
        const buttonLabel = submitButton.querySelector("span");
        const formData = new FormData(contactForm);
        const payload = Object.fromEntries(formData.entries());

        submitButton.disabled = true;
        buttonLabel.textContent = "Saving...";
        contactStatus.textContent = "";
        delete contactStatus.dataset.state;

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Your message could not be saved. Please try again.");
            }

            contactStatus.textContent = result.message;
            contactStatus.dataset.state = "success";
            contactForm.reset();
        } catch (error) {
            contactStatus.textContent = error instanceof TypeError
                ? "We could not reach the school server. Check your connection and try again."
                : error.message;
            contactStatus.dataset.state = "error";
        } finally {
            submitButton.disabled = false;
            buttonLabel.textContent = "Send message";
        }
    });
}
