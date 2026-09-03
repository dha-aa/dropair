#!/usr/bin/env node

import { execSync } from "child_process";
import startServer from "./server.js";

const command = process.argv[2];

const VERSION = "1.0.0";

if (command === "--uninstall") {
    execSync(`
        set -e

        echo "Uninstalling DropAir..."

        npm unlink -g dropair 2>/dev/null || true

        rm -rf "$HOME/.dropair"

        rm -f "/usr/local/bin/dropair"

        echo "DropAir has been uninstalled."
    `, {
        stdio: "inherit",
        shell: "/bin/bash"
    });

    process.exit(0);
}

if (command === "--update") {
  console.log("Updating DropAir...");

  execSync(
    'cd "$HOME/.dropair" && git pull && npm install',
    { stdio: "inherit", shell: "/bin/bash" }
  );

  console.log("DropAir updated successfully.");
  process.exit(0);
}

if (command === "--version" || command === "-v") {
  console.log(`DropAir v${VERSION}`);
  process.exit(0);
}

if (command === "--help" || command === "-h") {
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

  process.exit(0);
}

if (command?.startsWith("-")) {
  console.error(`Unknown option: ${command}`);
  console.error("Run 'dropair --help' for available options.");
  process.exit(1);
}

startServer();