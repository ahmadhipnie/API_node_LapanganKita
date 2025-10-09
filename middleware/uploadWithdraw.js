const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'withdraws');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: withdraw_timestamp_userId_originalname
    const timestamp = Date.now();
    const userId = req.body.id_users || 'unknown';
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const filename = `withdraw_${timestamp}_${userId}_${nameWithoutExt}${ext}`;
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
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file allowed
  }
});

// Middleware for single file upload
const uploadWithdraw = upload.single('file_photo');

// Wrapper middleware with error handling
const uploadWithdrawMiddleware = (req, res, next) => {
  uploadWithdraw(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File terlalu besar. Maksimal 5MB'
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
        message: 'File foto diperlukan untuk withdraw'
      });
    }

    // Add file path to request body
    req.body.file_photo = `uploads/withdraws/${req.file.filename}`;
    
    next();
  });
};

// Helper function to delete file
const deleteWithdrawFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted withdraw file: ${filePath}`);
      return true;
    }
  } catch (error) {
    console.error('Error deleting withdraw file:', error);
    return false;
  }
  return false;
};

module.exports = {
  uploadWithdrawMiddleware,
  deleteWithdrawFile
};