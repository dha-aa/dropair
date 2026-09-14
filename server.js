import expess from "express";
import path, { dirname } from "path"
import {fileURLToPath} from "url"
import getIp from "./utils/ip.js";
import { upload } from "./upload/storage.js";
import getCwd from "./utils/cwd.js";
import readDir from "./downlaod/download.js";
import genQr from "./utils/qr.js";


export default function startServer() {
    const app = expess();
    const PORT = 3000 

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename)

    app.use(expess.static(path.join(__dirname,"public")))

    app.post("/upload",upload,(req,res)=> {
        res.json({msg:"uploaded!"})
    })

    app.get("/download/:file",(req,res)=>{
        const file = req.params.file
        console.log(`Downloding: ${file}`)
        res.download(`${getCwd()}/${file}`)
    })
    app.get("/api/files",async(req,res) => {
        const data = await readDir()
        res.json(data)
    })
    
    app.listen(PORT,() => {
        genQr(`http://${getIp()}:${PORT}`)
        console.log(`Server runing on: http://${getIp()}:${PORT}`)
    })
    
    
}

