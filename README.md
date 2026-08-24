# Dropair

**Share files between devices on the same Wi-Fi.**

Dropair turns your computer into a simple local file-sharing server.

Run Dropair on your Mac, Windows, or Linux machine, open the generated address on your phone, and start uploading or downloading files.

**No app. No account. No cloud.**

Everything stays on your local network.

---

## Features

* 📱 Works with phones, tablets, and computers
* 🌐 Access through any modern web browser
* 📤 Upload files
* 📥 Download files
* 📷 QR code for quick access
* 🔒 Files stay on your local network
* ⚡ Simple and lightweight
* 💻 macOS, Windows, and Linux support
* 🌍 Run from any directory
* 📦 Install as a global `dropair` command

---

## How It Works

Dropair starts a local web server on your computer.

```text
Computer
   │
   │  Local Wi-Fi
   │
   ├─────────────── Phone
   │
   ├─────────────── Tablet
   │
   └─────────────── Another Computer
```

Your computer hosts the files, while other devices connect through their browser.

For example:

```text
Computer: 192.168.1.10
Port:     3000

Phone → http://192.168.1.10:3000
```

A QR code is displayed in the terminal so you can connect quickly from your phone.

---

# Quick Start

## Requirements

* [Node.js](https://nodejs.org/) 16+
* npm
* Devices connected to the same Wi-Fi network

---

## Install

### Option 1 — Install with the installer

The easiest way is to use the installation script.

```bash
curl -fsSL https://raw.githubusercontent.com/dha-aa/dropair/main/install.sh | bash
```

By default, Dropair is installed to:

```text
~/.dropair
```

You can choose a custom installation directory:

```bash
./install.sh --dir ~/tools/dropair
```

After installation, Dropair is available as a global command.

---

### Option 2 — Install manually

Clone the repository:

```bash
git clone https://github.com/dha-aa/dropair.git
```

Enter the project:

```bash
cd dropair
```

Install dependencies:

```bash
npm install
```

Link the command globally:

```bash
npm link
```

---

# Start Dropair

Navigate to the folder you want to share:

```bash
cd ~/Documents
```

Then run:

```bash
dropair
```

Dropair will start the local server and display a QR code in your terminal.

Scan the QR code with your phone and open the displayed address.

### Important

Dropair uses your **current directory** as the file-sharing location.

For example:

```bash
cd ~/Downloads
dropair
```

Dropair will share your `Downloads` directory.

If you run:

```bash
cd ~/Documents
dropair
```

Dropair will share your `Documents` directory instead.

---

# Global Command

Once Dropair has been installed and linked, you can run it from anywhere:

```bash
dropair
```

For example:

```bash
cd ~/Desktop
dropair
```

or:

```bash
cd ~/Downloads
dropair
```

or:

```bash
cd ~/Documents
dropair
```

The directory where you run `dropair` becomes the directory used for file sharing.

---

# Installation Directory

The default installation directory is:

```text
~/.dropair
```

You can change it during installation:

```bash
./install.sh --dir ~/tools/dropair
```

The installation directory contains the Dropair source code and its dependencies.

The directory you **run `dropair` from** is separate from the installation directory.

For example:

```text
~/.dropair/
    Dropair application

~/Downloads/
    Files being shared
```

This means you don't need to keep Dropair inside the folder you want to share.

---

# Updating Dropair

Run the installer again:

```bash
./install.sh
```

If Dropair is already installed, the installer will detect the existing repository and ask whether you want to update it.

You can also specify the installation directory:

```bash
./install.sh --dir ~/.dropair
```

---

# Installer Options

```text
Usage:
  install.sh [OPTIONS]

Options:
  --dir DIR       Installation directory
  -h, --help      Show this help message
```

Examples:

```bash
./install.sh
```

```bash
./install.sh --dir ~/.dropair
```

```bash
./install.sh --help
```

---

# Configuration

| Setting       | Default           |
| ------------- | ----------------- |
| Port          | `3000`            |
| Save location | Current directory |

The save location is determined by the directory where you run:

```bash
dropair
```

---

# API

Dropair provides a local web interface for accessing and transferring files.

Once Dropair is running, open the displayed local URL in a browser.

For example:

```text
http://192.168.1.10:3000
```

The exact address depends on your computer's local network address.

---

# Project Structure

```text
dropair/
├── server.js
├── cli.js
├── upload/
├── download/
├── utils/
└── public/
```

The project is split into the CLI, local server, file-transfer functionality, utilities, and web interface.

---

# Troubleshooting

## Port already in use

If you see an error indicating that port `3000` is already being used, another application may already be running on that port.

Stop the application using the port or configure Dropair to use another port.

---

## Can't upload files

Make sure Dropair has write permission for the directory you're sharing.

For example:

```bash
cd ~/Downloads
dropair
```

The user running Dropair must have permission to write to that directory.

---

## QR code doesn't work

Make sure both devices are connected to the **same Wi-Fi network**.

For example:

```text
Mac       → Home Wi-Fi
Phone     → Home Wi-Fi
```

If the phone is using mobile data or a different Wi-Fi network, it may not be able to reach the Dropair server.

Some public, corporate, or guest Wi-Fi networks also prevent devices from communicating with each other.

---

## `dropair: command not found`

If you installed the project manually, make sure you ran:

```bash
npm link
```

from the Dropair project directory.

Then try:

```bash
dropair
```

If it still doesn't work, check that npm's global binary directory is included in your `PATH`.

---

# Development

Clone the repository:

```bash
git clone https://github.com/dha-aa/dropair.git
cd dropair
```

Install dependencies:

```bash
npm install
```

Run Dropair:

```bash
npm start
```

For development, you can also link the CLI:

```bash
npm link
```

Then run:

```bash
dropair
```

---

# Contributing

Contributions are welcome.

If you find a bug, have an idea, or want to improve Dropair:

1. Fork the repository
2. Create a branch
3. Make your changes
4. Test your changes
5. Open a pull request

Please keep changes focused and include relevant documentation when introducing new functionality.

---

# License

Dropair is released under the **ISC License**.
