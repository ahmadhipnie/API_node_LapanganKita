const multer = require('multer');
const path = require('path');

// Untuk Vercel, gunakan memory storage karena disk adalah read-only
const storage = multer.memoryStorage();

// Filter file untuk hanya menerima gambar
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (JPEG, JPG, PNG, WEBP) yang diizinkan'), false);
  }
};

// Konfigurasi multer dengan memory storage
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
    
    // File akan tersimpan di memory (req.file.buffer)
    // Kita akan convert ke base64 untuk sementara
    if (req.file) {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExtension = path.extname(req.file.originalname);
      const fileName = `place-${uniqueSuffix}${fileExtension}`;
      
      // Convert ke base64 untuk disimpan di database (temporary solution)
      const base64Data = req.file.buffer.toString('base64');
      const dataUrl = `data:${req.file.mimetype};base64,${base64Data}`;
      
      // Tambahkan ke req.body untuk diproses di controller
      req.body.place_photo_data = dataUrl;
      req.body.place_photo_filename = fileName;
      req.body.place_photo_mimetype = req.file.mimetype;
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
    
    // Process multiple files
    if (req.files && req.files.length > 0) {
      req.body.place_photo_data_array = req.files.map(file => {
        const base64Data = file.buffer.toString('base64');
        return `data:${file.mimetype};base64,${base64Data}`;
      });
    }
    
    next();
  });
};

module.exports = {
  handleUploadPlacePhoto,
  handleUploadMultiplePlacePhotos
};