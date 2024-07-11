import multer from 'multer';
import path from 'path';

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/home/rahul/Downloads/backMern/backend/uploads/'); // Set the destination for the uploaded files to be relative
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`); // Set the file name
  },
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

// Initialize upload
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

export default upload;
