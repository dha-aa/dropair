import fs from "fs";
import getCwd from "../utils/cwd.js";

// Returns an array of file objects in the current working directory, excluding hidden files (those starting with a dot). Each object contains the filename and its type (file or folder).  
export default function  getFiles() {
    const cwd = getCwd()
    
    // exmple of the return value
    // [
    //     {
    //         filename:"file1.txt",
    //         type:"file"
    //     },
    //     {
    //         filename:"folder1",
    //         type:"folder"
    //     }
    // ]
    return fs.readdirSync(cwd,{withFileTypes: true})
        .filter(item => !item.name.startsWith("."))
        .map(item => ({
            filename:item.name,
            type:item.isDirectory? "file" : "folder"
        }))
}
