# Dropair

Dropair is a lightweight local file-sharing server for devices connected to the same Wi-Fi network. It turns the directory from which you launch the application into a temporary browser-accessible file exchange.

You do not need a mobile application, user account, or cloud storage. Files are transferred directly between the devices and remain on the computer running Dropair.

> **Important:** Dropair is designed for trusted local networks. The current application does not provide authentication, authorization, HTTPS, or encryption. Do not run it on a public, guest, corporate, or otherwise untrusted network.

## Features

| Feature | Description |
|---|---|
| Browser-based access | Connect from a phone, tablet, or computer using a modern web browser. |
| Local file sharing | Shares the directory in which the server is started. |
| File uploads | Upload one or more files from the web interface. |
| File downloads | Download files from the shared directory. |
| Live updates | Connected browsers refresh their file list when an upload completes. |
| QR-code connection | A terminal QR code points to the server's local-network address. |
| Cross-platform runtime | Runs on macOS, Windows, and Linux wherever Node.js and npm are available. |
| Global CLI | Install and run `dropair` from any directory. |

## How it works

Dropair starts an Express server on port `3000`. The current working directory of the process becomes the shared directory:

```text
Computer running Dropair
        │
        │  Local Wi-Fi network
        │
   ┌────┴────┬─────────────┐
   │         │             │
 Phone    Tablet    Another computer
```

For example, the following commands share the `Downloads` directory:

```bash
cd ~/Downloads
dropair
```

The terminal displays a URL similar to:

```text
http://192.168.1.10:3000
```

Open that address on another device connected to the same network, or scan the QR code printed in the terminal.

## Requirements

The dependency tree includes Express 5, whose supported runtime requirement is Node.js 18 or newer. Use the current LTS release of [Node.js](https://nodejs.org/) where possible.

You also need:

- npm, which is included with Node.js;
- a computer and connecting devices on the same local network; and
- read permission for the directory being shared and write permission if uploads are required.

## Installation

### Manual installation with HTTPS Git

Manual installation is the most predictable option when GitHub SSH authentication is not configured:

```bash
git clone https://github.com/dha-aa/dropair.git
cd dropair
npm install
npm link
```

After linking, the `dropair` command is available globally through npm's global binary directory.

### Installation script

The repository includes an installer that clones the project, installs dependencies, and runs `npm link`:

```bash
curl -fsSL https://raw.githubusercontent.com/dha-aa/dropair/main/install.sh | bash
```

The default installation directory is:

```text
~/.dropair
```

A custom installation directory can be supplied when running the script locally:

```bash
./install.sh --dir "$HOME/tools/dropair"
```

> **Installer note:** The current installer clones `git@github.com:dha-aa/dropair.git`, so it requires GitHub SSH access. If you do not have an SSH key configured for GitHub, use the manual HTTPS installation method instead.

### Verify the installation

```bash
dropair --version
dropair --help
```

The current CLI version is `1.0.0`.

## Start Dropair

Change into the directory you want to share and start the CLI:

```bash
cd ~/Documents
dropair
```

The directory is selected at runtime, so Dropair itself does not need to be installed inside the directory being shared.

For example:

```bash
cd ~/Desktop
dropair
```

shares the Desktop directory, while:

```bash
cd ~/Downloads
dropair
```

shares the Downloads directory.

### Starting from a cloned repository

If you are working directly from a clone and have not run `npm link`, start the application with:

```bash
node cli.js
```

The `npm start` script currently runs `node server.js`, but `server.js` only exports the server-start function; it does not invoke that function by itself. Therefore, `npm start` exits immediately in the current implementation. Use `node cli.js` or link the package with `npm link` and use `dropair`.

## CLI commands

| Command | Action |
|---|---|
| `dropair` | Start the local file-sharing server. |
| `dropair --help` | Display command usage and available options. |
| `dropair --version` | Display the CLI version. |
| `dropair --update` | Pull updates and reinstall dependencies in the default `~/.dropair` installation. |
| `dropair --uninstall` | Unlink the global command and remove the default `~/.dropair` installation. |

The current `--update` command is hard-coded to `$HOME/.dropair`. If you installed Dropair into a custom directory, update that installation manually from its repository directory:

```bash
cd "$HOME/tools/dropair"
git pull
npm install
npm link
```

Similarly, the current `--uninstall` command removes the default installation path and may not remove a custom installation directory. Remove a custom directory manually after unlinking the package if required.

## Web interface

The browser interface provides a file picker, an upload button, and a list of downloadable files. Multiple selected files are uploaded sequentially, and the button displays aggregate progress across the upload operation.

The interface refreshes the list in two ways:

1. It performs an initial request for the current directory contents.
2. It maintains a Server-Sent Events connection and refreshes the list when the server reports that an upload has completed.

The current interface displays top-level files only. The server identifies directories in its listing response, but the browser interface does not currently render folder entries or provide folder navigation.

## HTTP API

The server exposes the following routes.

| Method | Route | Description |
|---|---|---|
| `GET` | `/` | Serves the static web interface. |
| `POST` | `/upload` | Accepts uploaded files under the multipart form field named `file`. Multiple files are supported. |
| `GET` | `/api/files` | Returns a JSON array containing visible top-level files and directories. Dotfiles are excluded. |
| `GET` | `/api/files/stream` | Opens an SSE connection that sends an update notification after an upload completes. |
| `GET` | `/download/:filename` | Downloads a top-level file from the shared directory. |

A typical `/api/files` response looks like this:

```json
[
  { "filename": "photo.jpg", "type": "file" },
  { "filename": "Documents", "type": "folder" }
]
```

The server currently uses synchronous directory reads and file-stat operations when generating the listing. This is adequate for small directories but may become slow for very large shared folders.

## Configuration

The current configuration is intentionally minimal:

| Setting | Current value |
|---|---|
| Port | `3000` |
| Shared directory | `process.cwd()` — the directory where Dropair is launched |
| Network address | First non-internal IPv4 address detected on the host, or `127.0.0.1` if none is found |
| Hidden files | Entries beginning with `.` are excluded from the file listing |

The port is currently defined directly in `server.js`; there is no environment-variable or CLI option for changing it. If port `3000` is already in use, stop the conflicting process or modify the server source before starting Dropair.

## Security considerations

Dropair should be treated as a trusted-network utility rather than a production file server.

Because the server has no login mechanism, every device that can reach the advertised address may be able to list files, download files, and upload files. The server also does not use HTTPS, so traffic is not encrypted in transit.

Uploads retain their original filenames. Existing-file replacement behavior is not explicitly controlled, and the application does not currently provide a confirmation step or configurable upload policy. Use a temporary directory when sharing files with people or devices you do not fully trust.

Before using Dropair, confirm that:

- the computer and client devices are on a trusted network;
- the shared directory does not contain confidential or private files;
- the operating-system firewall permits only the access you intend to allow; and
- you stop the process when the transfer is complete.

## Project structure

```text
dropair/
├── cli.js                  # Command-line entry point
├── server.js               # Express server and HTTP routes
├── upload/
│   └── storage.js          # Multer upload storage configuration
├── download/
│   └── download.js         # Shared-directory listing logic
├── utils/
│   ├── cwd.js              # Current working-directory helper
│   ├── ip.js               # Local IPv4 address detection
│   └── qr.js               # Terminal QR-code output
├── public/
│   ├── index.html          # Browser interface markup
│   ├── app.js              # Browser upload/download behavior
│   └── style.css           # Responsive interface styling
├── install.sh              # Installer and updater workflow
├── uninstall.sh            # Uninstallation script
├── package.json            # Package metadata and npm scripts
└── package-lock.json       # Locked dependency versions
```

## Development

Install dependencies from the repository root:

```bash
npm install
```

Run the CLI directly:

```bash
node cli.js
```

Or create the global link used by the normal command:

```bash
npm link
dropair
```

The project currently has no automated test suite or linting configuration. When making changes, manually verify the following workflows:

- the web interface loads at `http://localhost:3000` or the advertised LAN address;
- a single file uploads successfully;
- multiple files upload and report progress correctly;
- newly uploaded files appear in an already-open browser tab; and
- listed files download successfully.

## Troubleshooting

### Port 3000 is already in use

Stop the process using port `3000`, or change the port constant in `server.js`. Port configuration is not currently exposed through the CLI or environment variables.

### The phone cannot connect

Confirm that both devices are connected to the same Wi-Fi network and that the computer's firewall allows inbound connections on port `3000`. Guest, corporate, and public networks often prevent devices from communicating with one another.

### Uploads fail

Confirm that the process has write permission for the directory from which Dropair was started. Also check that the directory is not read-only or protected by operating-system security controls.

### The QR code does not work

Try opening the displayed URL manually. The detected address may be incorrect on computers with multiple network interfaces, VPNs, virtual machines, or active containers. Ensure that the displayed IP address is reachable from the client device.

### `dropair: command not found`

From the repository directory, run:

```bash
npm link
```

Then verify that npm's global binary directory is included in your `PATH`.

## Contributing

Contributions are welcome. For a focused change:

1. Fork the repository.
2. Create a feature branch.
3. Make the change and update the documentation when behavior changes.
4. Manually test the upload, listing, live-refresh, and download workflows.
5. Open a pull request with a clear description of the change.

## License

Dropair is released under the [ISC License](https://opensource.org/license/isc-license-txt/).

## Repository

Source code and issue tracking are available at [github.com/dha-aa/dropair](https://github.com/dha-aa/dropair).
