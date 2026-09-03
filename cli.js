#!/usr/bin/env node

import { execSync } from "node:child_process";
import startServer from "./server.js";

const VERSION = "1.0.0";
const command = process.argv[2];

function runShell(command) {
    execSync(command, {
        stdio: "inherit",
        shell: "/bin/bash"
    });
}

function uninstall() {
    runShell(`
        set -e

        echo "Uninstalling DropAir..."

        npm unlink -g dropair 2>/dev/null || true
        rm -rf "$HOME/.dropair"
        rm -f "/usr/local/bin/dropair"

        echo "DropAir has been uninstalled."
    `);
}

function update() {
    console.log("Updating DropAir...");

    runShell(`
        set -e

        cd "$HOME/.dropair"
        git pull
        npm install
    `);

    console.log("DropAir updated successfully.");
}

function showVersion() {
    console.log(`DropAir v${VERSION}`);
}

function showHelp() {
    console.log(`
DropAir CLI

Usage:
  dropair                 Start DropAir
  dropair --help          Show help
  dropair --version       Show version
  dropair --update        Update DropAir
  dropair --uninstall     Uninstall DropAir

Options:
  -h, --help              Show help
  -v, --version           Show version
  --update                Update DropAir
  --uninstall             Uninstall DropAir
`);
}

function handleCommand() {
    switch (command) {
        case "--uninstall":
            uninstall();
            return;

        case "--update":
            update();
            return;

        case "--version":
        case "-v":
            showVersion();
            return;

        case "--help":
        case "-h":
            showHelp();
            return;

        default:
            if (command?.startsWith("-")) {
                console.error(`Unknown option: ${command}`);
                console.error("Run 'dropair --help' for available options.");
                process.exitCode = 1;
                return;
            }

            startServer();
    }
}

handleCommand();