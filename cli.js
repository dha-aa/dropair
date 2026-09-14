#!/usr/bin/env node
import path from "path";
import os from "os"
import startServer from "./server.js";
import {exec} from "child_process"

const commnd = process.argv[2]
const deaultPath = path.join(os.homedir(),".dropair")


function run(commnd){
    exec(commnd), (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        if(stderr){
            console.log(stderr)
        }
        if(stdout){
            console.log(stdout)
        }
    }

}


function unistall() {
    run(`cd ${deaultPath} && npm unlink -g && rm -rf ${deaultPath}`)
}

function update() {
    run(`cd ${deaultPath} && git pull && npm link`)
}

function help() {
   console.log(`
Usage:

    dropair             Start Dropair
    dropair --help.     Show help
    dropair --unistall  Uninstall dropair
    dropair --update    Update dropair
`)
}

switch(commnd){
    case "--unistall":
        unistall();
        break;
    case "--update":
        update();
        break;
    case "--help":
        help();
        break;
    default:
        startServer();
        break;
}

