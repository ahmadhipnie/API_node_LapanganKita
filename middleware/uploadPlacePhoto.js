const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan folder uploads/places ada
const uploadDir = path.join(__dirname, '../uploads/places');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi storage untuk foto places
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate nama file unik dengan timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    const fileName = `place-${uniqueSuffix}${fileExtension}`;
    cb(null, fileName);
  }
});

// Filter file untuk hanya menerima gambar
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (JPEG, JPG, PNG, WEBP) yang diizinkan'), false);
  }
};

// Konfigurasi multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB maksimal
  },
  fileFilter: fileFilter
});

// Middleware untuk single file upload dengan field name 'place_photo'
const uploadPlacePhoto = upload.single('place_photo');

// Wrapper untuk error handling
const handleUploadPlacePhoto = (req, res, next) => {
  uploadPlacePhoto(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File terlalu besar. Maksimal 5MB'
        });
      }
      return res.status(400).json({
        success: false,
        message: `Error upload: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // Jika ada file yang diupload, tambahkan path ke req.body
    if (req.file) {
      req.body.place_photo_path = `/uploads/places/${req.file.filename}`;
    }
    
    next();
  });
};

// Middleware untuk multiple files (jika diperlukan di masa depan)
const uploadMultiplePlacePhotos = upload.array('place_photos', 5);

const handleUploadMultiplePlacePhotos = (req, res, next) => {
  uploadMultiplePlacePhotos(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File terlalu besar. Maksimal 5MB per file'
        });
      }
      return res.status(400).json({
        success: false,
        message: `Error upload: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // Jika ada files yang diupload, tambahkan paths ke req.body
    if (req.files && req.files.length > 0) {
      req.body.place_photo_paths = req.files.map(file => `/uploads/places/${file.filename}`);
    }
    
    next();
  });
};

module.exports = {
  handleUploadPlacePhoto,
  handleUploadMultiplePlacePhotos,
  uploadDir
};