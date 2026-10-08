"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const messagesList = document.querySelector("#messagesList");
    const messagesEmpty = document.querySelector("#messagesEmpty");
    const messagesStatus = document.querySelector("#messagesStatus");
    const messageCount = document.querySelector("#messageCount");
    const refreshButton = document.querySelector("#refreshMessages");

    function addTextElement(parent, tagName, className, text) {
        const element = document.createElement(tagName);
        if (className) {
            element.className = className;
        }
        element.textContent = text;
        parent.append(element);
        return element;
    }

    function renderMessage(message) {
        const card = document.createElement("article");
        card.className = "message-card";

        const header = document.createElement("div");
        header.className = "message-card__header";
        const sender = document.createElement("div");
        addTextElement(sender, "h3", "", message.subject);

        const meta = document.createElement("div");
        meta.className = "message-card__meta";
        addTextElement(meta, "span", "", message.name);
        const emailLink = document.createElement("a");
        emailLink.href = `mailto:${encodeURIComponent(message.email).replace(/%40/gi, "@")}`;
        emailLink.textContent = message.email;
        meta.append(emailLink);
        sender.append(meta);

        addTextElement(
            header,
            "time",
            "message-card__date",
            new Date(message.createdAt).toLocaleString()
        );
        header.prepend(sender);
        card.append(header);
        addTextElement(card, "p", "message-card__body", message.message);
        return card;
    }

    async function loadMessages() {
        refreshButton.disabled = true;
        messagesStatus.textContent = "";
        messagesList.replaceChildren();

        try {
            const response = await fetch("/api/admin/contact-messages", {
                headers: { Accept: "application/json" }
            });
            const contentType = response.headers.get("content-type") || "";

            if (!contentType.toLowerCase().includes("application/json")) {
                throw new Error("The server returned an unexpected response. Sign in again and refresh this page.");
            }

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || "Messages could not be loaded.");
            }

            const messages = result.messages;
            messageCount.textContent = `${messages.length} message${messages.length === 1 ? "" : "s"}`;
            messagesEmpty.hidden = messages.length > 0;
            messages.forEach((message) => messagesList.append(renderMessage(message)));
        } catch (error) {
            messageCount.textContent = "Messages unavailable";
            messagesEmpty.hidden = true;
            messagesStatus.textContent = error instanceof TypeError
                ? "Unable to reach the server. Check your connection and try again."
                : error.message;
        } finally {
            refreshButton.disabled = false;
        }
    }

    refreshButton.addEventListener("click", loadMessages);
    loadMessages();
});
