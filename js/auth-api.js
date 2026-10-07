"use strict";

window.schoolAuth = {
    async request(url, { method = "POST", body } = {}) {
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body || {})
        });
        const contentType = response.headers.get("content-type") || "";

        // A static file server returns an HTML 404 page for API URLs. Explain that setup issue instead of exposing a JSON parse error.
        if (!contentType.toLowerCase().includes("application/json")) {
            throw new Error(
                'The authentication API returned a web page instead of JSON. Run "npm start", then open http://localhost:3000/login.html; do not open login.html directly or use Live Server.'
            );
        }

        let result;
        try {
            result = await response.json();
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new Error(
                    "The authentication server returned invalid JSON. Restart it with \"npm start\" and open http://localhost:3000/login.html."
                );
            }
            throw error;
        }
        if (!response.ok) {
            throw new Error(result.error || "The authentication request failed.");
        }

        return result;
    }
};
