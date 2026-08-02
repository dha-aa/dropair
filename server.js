import express from "express";
import {fileURLToPath} from "url";
import path from "path";

// In built modile
import { getLocalIP } from "./utils/ip.js";
import getQrcode from "./utils/qr.js";
import { upload } from "./upload/storage.js";
import getCwd from "./utils/cwd.js";
import getFiles from "./download/download.js";

export default function startServer() {
    const app = express();
    const PORT = 3000;

    // server the public dir
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename)
    app.use(express.static(path.join(__dirname, "public")));

    app.post("/upload",upload,(req,res) => {
        res.json({
            msg:"uploaded succesfully"
        })
    })

    app.get("/api/files",(req,res) => {
        const files = getFiles()
        res.send(files)
    })

    const folderpath = getCwd();

    app.get("/download/:filename",(req,res) => {
        const filename = req.params.filename;
        const filepath = path.join(folderpath,filename);

        res.download(filepath,filename ,(err) => {
            console.log(err)
        })
    })

    // local url
    const url = `http://${getLocalIP()}:${PORT}`
    app.listen(PORT,(req,res) => {
        getQrcode(url);
        console.log(`Server on ${url}`);
    });

}