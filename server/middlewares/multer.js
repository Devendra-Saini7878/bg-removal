import multer from "multer";


//multer middleware for parsing form data
const storage = multer.diskStorage({
    filename: (re, file, callback) => {
      callback(null,`${Date.now()}-${file.originalname}`);
    }
})

const upload = multer({storage});

export default upload;