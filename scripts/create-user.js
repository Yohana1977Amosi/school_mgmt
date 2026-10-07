"use strict";

const readline = require("node:readline/promises");
const { stdin, stdout } = require("node:process");
const { createAccount, database, ROLES } = require("../server");

function promptHidden(question) {
    if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
        return Promise.reject(
            new Error("Create a user from an interactive terminal so the password can be hidden.")
        );
    }

    return new Promise((resolve, reject) => {
        let answer = "";

        function cleanup() {
            stdin.removeListener("data", onData);
            stdin.setRawMode(false);
            stdin.pause();
        }

        function onData(character) {
            if (character === "\u0003") {
                cleanup();
                reject(new Error("User creation cancelled."));
                return;
            }

            if (character === "\r" || character === "\n") {
                stdout.write("\n");
                cleanup();
                resolve(answer);
                return;
            }

            if (character === "\u007f" || character === "\b") {
                answer = answer.slice(0, -1);
                return;
            }

            if (character >= " ") {
                answer += character;
            }
        }

        stdout.write(question);
        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding("utf8");
        stdin.on("data", onData);
    });
}

async function main() {
    const prompts = readline.createInterface({ input: stdin, output: stdout });

    try {
        const username = await prompts.question("Username: ");
        const email = await prompts.question("Account email: ");
        stdout.write(`Available roles: ${ROLES.join(", ")}\n`);
        const role = await prompts.question("Role: ");
        prompts.close();

        const password = await promptHidden("Password (minimum 12 characters): ");
        const confirmation = await promptHidden("Confirm password: ");

        if (password !== confirmation) {
            throw new Error("The passwords do not match.");
        }

        const userId = createAccount({
            username,
            email,
            password,
            role
        });

        stdout.write(`Created ${role} account "${username.trim()}" (ID ${userId}).\n`);
    } finally {
        prompts.close();
        database.close();
    }
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
