# Dropair

**Share files between devices on the same Wi-Fi.**

Dropair turns your computer into a simple local file-sharing server.
Open it on your Mac, Windows, or Linux machine, scan the QR code with your phone, and start uploading or downloading files.

**No app. No account. No cloud.**

## Features

* Works with phones, tablets, and computers
* Access through any web browser
* Upload files
* Download files
* QR code for quick access
* Files stay on your local network
* Simple and lightweight

## Quick Start

### Requirements

* [Node.js](https://nodejs.org/) 16+
* npm

### Install

```bash
git clone https://github.com/dha-aa/dropair.git
cd dropair
npm install
```

### Start

```bash
npm start
```

Dropair will start a local server and print a QR code in your terminal.

Scan the QR code with your phone and open the page.

> **Tip:** Start Dropair inside the folder you want to share. Uploaded files will be saved there.

## 🌍 Global Command

You can also install Dropair as a global command:

```bash
npm link
```

Then run it from any folder:

```bash
dropair
```

Dropair will use your **current directory** for file sharing.

## 🔧 API

### Upload

```bash
curl -F "file=@file.txt" http://<SERVER_IP>:3000/upload
```

Upload multiple files:

```bash
curl \
  -F "file=@file1.txt" \
  -F "file=@file2.txt" \
  http://<SERVER_IP>:3000/upload
```

### List files

```bash
curl http://<SERVER_IP>:3000/api/files
```

### Download

```bash
curl -O http://<SERVER_IP>:3000/download/file.txt
```

You can also open the download URL directly in your browser.

## ⚙️ Configuration

| Setting       | Default           |
| ------------- | ----------------- |
| Port          | `3000`            |
| Save location | Current directory |

## 📁 Project Structure

```text
dropair/
├── server.js
├── cli.js
├── upload/
├── download/
├── utils/
└── public/
```

## 🛠 Troubleshooting

**Port already in use**

Another application is using port `3000`. Stop it or change the port in `server.js`.

**Can't upload files**

Make sure you have write permission for the directory where Dropair is running.

**QR code doesn't work**

Make sure both devices are connected to the **same Wi-Fi network**.

## 🤝 Contributing

Found a bug or have an idea?

Issues and pull requests are welcome.

## 📄 License

ISC
