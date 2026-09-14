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

    // Store SSE clients
    const clients = new Set()

    app.use(expess.static(path.join(__dirname,"public")))

    app.post("/upload",upload,(req,res)=> {
        res.json({msg:"uploaded!"})
        
        // Emit SSE event to all connected clients
        const eventData = {
            type: 'file-uploaded',
            timestamp: new Date().toISOString()
        }
        
        clients.forEach(client => {
            client.res.write(`data: ${JSON.stringify(eventData)}\n\n`)
        })
    })

    // SSE endpoint for real-time updates
    app.get("/events", (req, res) => {
        const headers = {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        }
        
        res.writeHead(200, headers)
        
        const client = {
            id: Date.now(),
            res
        }
        
        clients.add(client)
        
        // Send initial connection message
        res.write(`data: ${JSON.stringify({type: 'connected', clientId: client.id})}\n\n`)
        
        // Remove client on disconnect
        req.on('close', () => {
            clients.delete(client)
        })
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

