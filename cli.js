#!/usr/bin/env node

import { execSync } from "child_process";
import startServer from "./server.js";

const command = process.argv[2];

if (command === "--uninstall") {
  console.log("Uninstalling DropAir...");

  execSync(
    "curl -fsSL https://raw.githubusercontent.com/dha-aa/dropair/main/uninstall.sh | bash",
    { stdio: "inherit" }
  );

  process.exit(0);
}

if (command === "--help") {
  console.log(`
DropAir CLI

Usage:
  dropair              Start DropAir
  dropair --help       Show help
  dropair --uninstall  Uninstall DropAir
  `);

  process.exit(0);
}

startServer();