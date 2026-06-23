//1. Import multer for handling file uploads
import multer from "multer";

//2. Configure multer storage settings for saving uploaded files to the 'uploads' directory with unique filenames
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({
     storage: storage });
export default upload;