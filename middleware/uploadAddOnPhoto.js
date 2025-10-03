const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan folder upload exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'add-ons');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Format: addon-{timestamp}-{random}.{ext}
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `addon-${uniqueSuffix}${ext}`);
  }
});

// File filter untuk validasi tipe file
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file gambar (JPEG, JPG, PNG, WEBP) yang diperbolehkan!'));
  }
};

// Konfigurasi multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: fileFilter
});

// Middleware untuk handle upload add-on photo
const handleUploadAddOnPhoto = (req, res, next) => {
  const uploadSingle = upload.single('add_on_photo');
  
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File terlalu besar! Maksimal 5MB'
        });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
          success: false,
          message: 'Field name untuk upload foto harus "add_on_photo"'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Error upload file',
        error: err.message
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // Lanjutkan ke middleware berikutnya
    next();
  });
};

// Helper function untuk hapus file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ File deleted: ${filePath}`);
      return true;
    }
    console.log(`⚠️ File not found: ${filePath}`);
    return false;
  } catch (error) {
    console.error(`❌ Error deleting file: ${filePath}`, error);
    return false;
  }
};

// Helper function untuk convert DB path ke full path
const getFullPath = (dbPath) => {
  if (!dbPath) return null;
  
  // Jika path sudah absolute, return as is
  if (path.isAbsolute(dbPath)) {
    return dbPath;
  }
  
  // Convert relative path ke absolute path
  return path.join(__dirname, '..', dbPath);
};

module.exports = {
  handleUploadAddOnPhoto,
  deleteFile,
  getFullPath,
  uploadDir
};