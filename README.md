# DropAir

A simple file sharing application with CLI support for easy global access. Upload, share, and download files with QR code generation.

## Features

- 📤 **Easy File Upload**: Simple drag-and-drop interface for uploading files
- 📥 **Quick Download**: Download shared files with a single click
- 📱 **QR Code Sharing**: Generate QR codes for instant mobile access
- 💻 **CLI Integration**: Global command-line access for power users
- 🔄 **Auto Updates**: Built-in update mechanism to stay current
- 📋 **File Management**: View and manage uploaded files

## Installation

Install DropAir globally with one command:

```bash
curl -fsSL http://raw.githubusercontent.com/dha-aa/dropair/refs/heads/main/install.sh | bash
```

This will:
- Clone the repository to `~/.dropair`
- Install all dependencies via npm
- Create a global symlink for easy access

## CLI Usage

After installation, the following commands are available:

```bash
dropair              # Start Dropair
dropair --help       # Show help
dropair --uninstall  # Uninstall dropair
dropair --update     # Update dropair
```

## How It Works

1. **Start DropAir**: Run `dropair` to launch the web interface
2. **Upload Files**: Drag and drop files into the web interface
3. **Share**: Use the generated link or QR code to share files
4. **Download**: Recipients can download files directly from the link

## Development

DropAir is built with:
- Node.js backend for file handling
- Simple web interface for easy sharing
- CLI tool for global access

## License

MIT
