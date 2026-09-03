import fs from "fs";
import getCwd from "../utils/cwd.js";

export default function  getFiles() {
    const cwd = getCwd()
    return fs.readdirSync(cwd,{withFileTypes: true})
        .filter(item => !item.name.startsWith("."))
        .map(item => ({
            filename:item.name,
            type:item.isDirectory? "file" : "folder"
        }))
}
