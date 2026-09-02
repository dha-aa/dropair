import multer from "multer";
import getCwd from "../utils/cwd.js";

const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,getCwd())
    },
    filename: (req,file,cb) => {
        console.log(`File uploaded :${file.originalname}`)
        cb(null,file.originalname)
    }
})

export const upload = multer({storage:storage}).array("file");
