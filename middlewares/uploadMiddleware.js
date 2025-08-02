const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

function checkFileType(file, cb){
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  

  if( extname){
    return cb(null, true);
  } else {
    cb(new Error('Error: Images Only!'), false);
  }
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, 
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
});

module.exports = upload;