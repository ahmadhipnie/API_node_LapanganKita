const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'promosi');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: promosi_timestamp_originalname
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const filename = `promosi_${timestamp}_${nameWithoutExt}${ext}`;
    cb(null, filename);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('File harus berupa gambar (JPG, PNG, GIF, dll)'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (bigger for high quality promotional images)
    files: 1 // Only one file allowed
  }
});

// Middleware for single file upload
const uploadPromosi = upload.single('file_photo');

// Wrapper middleware with error handling
const uploadPromosiMiddleware = (req, res, next) => {
  uploadPromosi(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File terlalu besar. Maksimal 10MB'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: 'Hanya boleh upload 1 file'
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

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File foto diperlukan untuk promosi'
      });
    }

    // Add file path to request body
    req.body.file_photo = `uploads/promosi/${req.file.filename}`;
    
    next();
  });
};

// Optional middleware for update (file is optional)
const uploadPromosiOptionalMiddleware = (req, res, next) => {
  uploadPromosi(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File terlalu besar. Maksimal 10MB'
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

    // For update, file is optional
    if (req.file) {
      req.body.file_photo = `uploads/promosi/${req.file.filename}`;
    }
    
    next();
  });
};

// Helper function to delete file
const deletePromosiFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted promosi file: ${filePath}`);
      return true;
    }
  } catch (error) {
    console.error('Error deleting promosi file:', error);
    return false;
  }
  return false;
};

// Helper function to delete all promosi files (for cleanup)
const deleteAllPromosiFiles = () => {
  try {
    const files = fs.readdirSync(uploadDir);
    let deletedCount = 0;
    
    files.forEach(file => {
      const filePath = path.join(uploadDir, file);
      try {
        fs.unlinkSync(filePath);
        deletedCount++;
      } catch (error) {
        console.error(`Error deleting file ${file}:`, error);
      }
    });
    
    console.log(`Deleted ${deletedCount} promosi files`);
    return deletedCount;
  } catch (error) {
    console.error('Error cleaning up promosi files:', error);
    return 0;
  }
};

module.exports = {
  uploadPromosiMiddleware,
  uploadPromosiOptionalMiddleware,
  deletePromosiFile,
  deleteAllPromosiFiles
};