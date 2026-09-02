# Dropair

Dropair is a simple way to share files between devices on the same Wi-Fi network.

No apps, no accounts, no cloud storage. Just open a browser and transfer files instantly between your phone, tablet, and computer.

> **Note:** Dropair is built for trusted networks such as home Wi-Fi. It does not include password protection or encryption, so it should not be used on public or untrusted networks.

## Features

- Browser-based: works on any device with a web browser
- Share any folder on your computer instantly
- Upload one or multiple files with progress tracking
- Download files directly to your device
- File list refreshes automatically as new files are added
- QR code for quick connection from a phone
- Cross-platform: macOS, Windows, and Linux
- No configuration required

## How It Works

Dropair turns any folder on your computer into a temporary web server. You navigate to the folder you want to share, run Dropair, and connect from any device on the same network.

```text
Your Computer (Dropair running)
        │
        │  Same Wi-Fi Network
        │
   ┌────┴────┬─────────────┐
   │         │             │
  Phone    Tablet   Another Computer
```

For example, to share a Downloads folder:

```bash
cd ~/Downloads
dropair
```

This displays a local URL, such as `http://192.168.1.10:3000`, along with a QR code. Open the URL on another device, or scan the QR code, to start sharing.

## Requirements

- Node.js 18 or later
- npm (included with Node.js)
- All devices on the same Wi-Fi network
- Read access to share files, write access to accept uploads

## Installation

### Quick Install

Run this command to install Dropair automatically:

```bash
curl -fsSL https://raw.githubusercontent.com/dha-aa/dropair/main/install.sh | bash
```

This clones the repository to `~/.dropair`, installs dependencies, and sets up the global `dropair` command.

### Manual Install

```bash
git clone https://github.com/dha-aa/dropair.git
cd dropair
npm install
npm link
```

### Verify Installation

```bash
dropair --version
dropair --help
```

This should show version `1.0.0` and the help menu.

## Basic Usage

Navigate to the folder you want to share:

```bash
cd ~/Documents
```

Start Dropair:

```bash
dropair
```

Connect from another device by opening the URL shown in the terminal or scanning the QR code.

Dropair shares whichever folder is active when it starts:

```bash
cd ~/Desktop
dropair

cd ~/Downloads
dropair

cd ~/Pictures
dropair
```

## CLI Commands

| Command | Description |
|---|---|
| `dropair` | Start the file-sharing server |
| `dropair --help` | Show available commands |
| `dropair --version` | Show the installed version |
| `dropair --update` | Update to the latest version |
| `dropair --uninstall` | Remove Dropair from the system |

The `--update` and `--uninstall` commands assume the default installation location. Custom installations need to be updated manually.

## Web Interface

- **Upload** – select files and track progress in real time
- **Download** – click a file to download it
- **Live updates** – the file list refreshes automatically as files are added
- Works from any device with a browser

## Configuration

| Setting | Value |
|---|---|
| Port | 3000 |
| Shared directory | The folder Dropair is run from |
| Network | Local Wi-Fi IP address |
| Hidden files | Files starting with `.` are not shown |

Port 3000 is currently fixed. If it is already in use, stop the conflicting process or edit `server.js` to use a different port.

## Security and Privacy

Dropair is designed for trusted networks, such as a home Wi-Fi connection. It does not include:

- Password protection
- Encryption or HTTPS
- User authentication
- Access controls

Recommended practices:

- Use only on trusted, private networks
- Avoid sharing sensitive or confidential files
- Stop the server once sharing is complete
- Share from a temporary folder containing only the intended files
- Be aware of who else has access to the network

## Project Structure

- `cli.js` – command-line interface
- `server.js` – Express server and routes
- `upload/storage.js` – file upload handling
- `download/download.js` – file listing
- `public/` – web interface files
- `utils/` – helper functions (IP detection, QR code generation, etc.)

## Troubleshooting

**Port 3000 is already in use**
Stop the conflicting application, or edit `server.js` to use a different port.

**Phone cannot connect**
Confirm both devices are on the same Wi-Fi network, and check that the firewall allows connections on port 3000.

**Uploads fail**
Verify write permissions on the shared folder. Some system folders are protected by default.

**QR code does not work**
Open the displayed URL manually. The detected IP address may be incorrect if there are multiple network connections or an active VPN.

**Command not found**
Confirm the installation step that links the `dropair` command has been completed, and that npm's global bin directory is included in your PATH.

## Contributing

Contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make and test your changes
4. Submit a pull request with a clear description

Areas worth testing before submitting a change:

- The web interface loads correctly
- Single and multiple file uploads work as expected
- Live file updates appear in the browser
- Downloads complete correctly

## License

Dropair is released under the [ISC License](https://opensource.org/license/isc-license-txt/).

## Links

- Source code: [github.com/dha-aa/dropair](https://github.com/dha-aa/dropair)
- Issues: report bugs or request features on GitHub

---

Built for simple, local file sharing.