# Dropair

Simple file sharing between devices on the same Wi-Fi network.

### Quick Install

```bash
curl -fsSL https://raw.githubusercontent.com/dha-aa/dropair/main/install.sh | bash
```

This installs Dropair and makes the `dropair` command available globally.

### Requirements

* Node.js 18+
* npm
* Devices connected to the same Wi-Fi network

## Usage

Go to the folder you want to share:

```bash
cd ~/Downloads
```

Start Dropair:

```bash
dropair
```

Dropair will display a local URL and QR code.

Open the URL on another device or scan the QR code to start sharing files.

For example:

```text
http://192.168.1.10:3000
```

The folder you are currently in is the folder Dropair will share:

```bash
cd ~/Desktop
dropair
```

or:

```bash
cd ~/Pictures
dropair
```

## Commands

```bash
dropair --help
dropair --version
dropair --update
dropair --uninstall
```

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test your changes.
5. Submit a pull request with a clear description.

Please test file uploads, downloads, and the web interface before submitting a PR.

## License

ISC License.

## Links

* Source: https://github.com/dha-aa/dropair

