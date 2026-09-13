import multer from "multer";
import getCwd from "../utils/cwd.js";


const storage = multer.diskStorage({
    destination:function (req,file,cb) {
        cb(null,getCwd());
    },
    filename: function(req,file,cb){
        cb(null,file.originalname)
    }
})

const upload = multer({storage:storage}).array("file");

export {
    upload
}

