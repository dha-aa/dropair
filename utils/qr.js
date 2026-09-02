import qrcode from "qrcode-terminal";

export default function getQrcode(data) {
    qrcode.generate(data,{small:true})
}