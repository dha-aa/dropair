import qrcode from "qrcode-terminal";

// Generates and prints a small QR code for the provided data in the terminal.
export default function getQrcode(data) {
    qrcode.generate(data,{small:true})
}