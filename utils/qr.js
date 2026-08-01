import qrcode from "qrcode-terminal";

export default function getQrcode(data) {
    return qrcode.generate(data,{small:true})
}