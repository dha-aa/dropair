import fs from "fs";
import getCwd from "../utils/cwd.js";

// Retrieves a list of files and folders in the current working directory, excluding hidden files (those starting with a dot).
export default function  getFiles() {
    const cwd = getCwd()
    const files = fs.readdirSync(cwd);
    const listOfThing = []
    for (const file of files) {

        if (file.startsWith(".")) {
            continue
        }
        //
        const fullpath = `${cwd}/${file}`;
        const statas = fs.statSync(fullpath);

       
        listOfThing.push({
            filename: file,
            type: statas.isDirectory() ? "folder":"file"
        })
    }
    // Returns the list of files and folders in the current working directory.
    // Example return value: [{filename: "example.txt", type: "file"}, {filename: "myFolder", type: "folder"}]
    return listOfThing;
    
}