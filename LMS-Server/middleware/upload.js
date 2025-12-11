const multer = require("multer");
const path = require("path");

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store temporarily in uploads folder
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  console.log("Incoming:", file.fieldname, file.mimetype);

  const allowedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  const allowedVideoTypes = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-matroska',   // MKV
  'video/x-msvideo',    // AVI
  'video/x-flv'         // FLV
];


  if (file.fieldname === 'image' && allowedImageTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  if (file.fieldname === 'video' && allowedVideoTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(new Error('Invalid file type: ' + file.mimetype), false);
};


const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024
  }
});

exports.uploadFiles = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "video", maxCount: 1 }
]);