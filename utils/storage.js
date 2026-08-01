import multer from "multer";
import getCwd from "./cwd.js";




const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,getCwd())
    },
    filename: (req,file,cb) => {
        cb(null,file.originalname)
    }
})

const upload = multer({storage:storage}).array("file");

export {
    upload,
}