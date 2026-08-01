import express from "express";
import {fileURLToPath} from "url";
import path from "path";
import { getLocalIP } from "./utils/ip.js";
import getQrcode from "./utils/qr.js";
import getFiles from "./utils/download.js";
import { upload } from "./upload/storage.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

app.post("/upload",upload,(req,res) => {
    console.log("uploaded!")
})

const url = `http://${getLocalIP()}:${PORT}`

app.get("/api/files",(req,res) => {
    const files = getFiles()
    res.send(files)
})

app.listen(PORT,(req,res) => {
    getQrcode(url);
    console.log(`Server on ${url}`);
})