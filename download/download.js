import fs from "fs";
import getCwd from "./cwd.js";

export default function  getFiles() {
    const cwd = getCwd()
    const files = fs.readdirSync(cwd);
    const listOfThing = []
    for (const file of files) {
        const fullpath = `${cwd}/${file}`;
        const statas = fs.statSync(fullpath);

        listOfThing.push({
            name: file,
            // fullpath: fullpath,
            type: statas.isDirectory() ? "folder":"file"
        })
    }
    return listOfThing;
    

}

// i will later add this  right now im learing   the how user dan able to download file