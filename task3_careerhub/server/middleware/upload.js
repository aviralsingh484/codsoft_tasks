const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Resumes are saved in server/uploads with a random name
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + crypto.randomBytes(4).toString('hex') + '.pdf');
  }
});

module.exports = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') return cb(null, true);
    const err = new Error('Only PDF files are allowed');
    err.status = 400;
    cb(err);
  }
});
