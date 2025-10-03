const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Pastikan folder upload exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'fields');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Format: field-{timestamp}-{random}.{ext}
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `field-${uniqueSuffix}${ext}`);
  }
});

// File filter untuk validasi tipe file
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipe file tidak diizinkan. Hanya JPEG, PNG, dan WEBP yang diperbolehkan.'), false);
  }
};

// Konfigurasi multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Middleware untuk single file upload
const uploadFieldPhoto = upload.single('field_photo');

// Wrapper untuk error handling
const handleUploadFieldPhoto = (req, res, next) => {
  uploadFieldPhoto(req, res, (err) => {
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
    
    // Jika ada file yang diupload, simpan info file path
    if (req.file) {
      // Path relatif untuk disimpan di database
      req.body.field_photo = `/uploads/fields/${req.file.filename}`;
      req.body.field_photo_filename = req.file.filename;
      req.body.field_photo_path = req.file.path;
      
      console.log(`✅ Field photo uploaded: ${req.file.filename}`);
      console.log(`📁 Saved to: ${req.file.path}`);
      console.log(`🔗 Database path: ${req.body.field_photo}`);
    }
    
    next();
  });
};

// Helper function untuk delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Field photo deleted: ${filePath}`);
      return true;
    } else {
      console.log(`⚠️ Field photo not found: ${filePath}`);
    }
  } catch (error) {
    console.error('Error deleting field photo:', error.message);
    return false;
  }
  return false;
};

// Helper function untuk get full file path dari database path
const getFullPath = (dbPath) => {
  if (!dbPath) return null;
  
  // Jika path dimulai dengan /uploads, convert ke path lokal
  if (dbPath.startsWith('/uploads/')) {
    return path.join(__dirname, '..', dbPath.substring(1)); // Remove leading slash
  }
  
  // Jika path sudah absolute, return as is
  if (path.isAbsolute(dbPath)) {
    return dbPath;
  }
  
  // Convert relative path ke absolute path
  return path.join(__dirname, '..', dbPath);
};

module.exports = {
  handleUploadFieldPhoto,
  deleteFile,
  getFullPath,
  uploadDir
};