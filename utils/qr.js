import qr from "qrcode-terminal"

export default function genQr(data){
    return qr.generate(data,{small:true})
}