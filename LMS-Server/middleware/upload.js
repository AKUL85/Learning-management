const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});


const fileFilter = (req, file, cb) => {
  console.log("Processing file:", file.fieldname, file.mimetype);

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
    'video/x-matroska',
    'video/x-msvideo',
    'video/x-flv'
  ];

  const allowedDocumentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/vnd.oasis.opendocument.text',
    'application/zip',
    'application/x-zip-compressed'
  ];

  if (file.fieldname === 'image' && allowedImageTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  if (file.fieldname === 'video' && allowedVideoTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  if (file.fieldname === 'materials' && allowedDocumentTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(new Error(`Invalid file type for ${file.fieldname}: ${file.mimetype}`), false);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024
  }
});


exports.uploadCourseFiles = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "video", maxCount: 1 },
  { name: "materials", maxCount: 10 }
]);