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
        notifyClients();
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
            if (err) {
                console.log("Download error:", err);
            }
        })
    })

        // Keep track of connected clients waiting for updates
    const sseClients = [];

    // SSE endpoint — the browser connects here and keeps it open
    app.get("/api/files/stream", (req, res) => {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        sseClients.push(res);

        // Clean up when the tab closes / connection drops
        req.on("close", () => {
            const index = sseClients.indexOf(res);
            if (index !== -1) sseClients.splice(index, 1);
        });
    });

    // Call this ONE line anywhere a file finishes uploading (in your /upload route)
    function notifyClients() {
        sseClients.forEach((client) => {
            try {
                client.write(`data: update\n\n`);
            } catch (err) {
                // Client disconnected, remove from array
                const index = sseClients.indexOf(client);
                if (index !== -1) sseClients.splice(index, 1);
            }
        });
    }

    // local url
    const url = `http://${getLocalIP()}:${PORT}`
    app.listen(PORT,(req,res) => {
        getQrcode(url);
        console.log(`Server on ${url}`);
    });

}