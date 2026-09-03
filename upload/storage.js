import multer from "multer";
import getCwd from "../utils/cwd.js";


// Configures Multer to save uploaded files in the current working directory
// and preserves their original filenames.
const storage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null,getCwd())
    },
    filename: (req,file,cb) => {
        console.log(`File uploaded :${file.originalname}`)
        cb(null,file.originalname)
    }
})

// Exports the configured Multer instance to handle file uploads, allowing multiple files to be uploaded under the field name "file".
export const upload = multer({storage:storage}).array("file");
