const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup direktori upload
const uploadDir = path.join(__dirname, '../uploads/places');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration untuk temporary files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter untuk gambar saja
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('File harus berupa gambar!'), false);
  }
};

// Multer setup dengan limit yang tepat untuk TEXT field (65535 chars)
// Base64 conversion: original_size * 4/3 + ~30 chars prefix
// Jadi 40KB file = ~54KB base64 = aman untuk TEXT field
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 40 * 1024 // 40KB maksimal untuk pastikan base64 tidak exceed TEXT limit
  },
  fileFilter: fileFilter
});

const uploadPlacePhoto = upload.single('place_photo');

// Convert file ke base64 dengan validasi TEXT limit
const fileToBase64Safe = (filePath, mimetype) => {
  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = fileBuffer.toString('base64');
  const fullBase64 = `data:${mimetype};base64,${base64Data}`;
  
  console.log(`📊 File size: ${Math.round(fileBuffer.length/1024)}KB`);
  console.log(`📊 Base64 size: ${fullBase64.length} chars (TEXT limit: 65535)`);
  
  if (fullBase64.length > 65000) {
    throw new Error(`Gambar terlalu besar setelah konversi base64: ${fullBase64.length} karakter. Maksimal 65000 untuk database TEXT. Gunakan gambar yang lebih kecil (<40KB).`);
  }
  
  return fullBase64;
};

// Main upload handler untuk Filess.io TEXT fields
const handleUploadPlacePhotoSimple = (req, res, next) => {
  uploadPlacePhoto(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File terlalu besar. Maksimal 40KB untuk database TEXT field (menjadi ~54KB setelah base64)'
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // Process uploaded file
    if (req.file) {
      try {
        console.log(`🔄 Processing: ${req.file.originalname} (${Math.round(req.file.size/1024)}KB)`);
        
        // Convert to base64 with TEXT validation
        const base64Data = fileToBase64Safe(req.file.path, req.file.mimetype);
        
        // Add to request body for controller
        req.body.place_photo_data = base64Data;
        req.body.place_photo_filename = req.file.originalname;
        
        console.log(`✅ Upload processed successfully for TEXT database`);
        
        // Cleanup temporary file
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.log('Warning: Could not cleanup temp file:', cleanupError.message);
        }
        
      } catch (error) {
        console.error('❌ Processing failed:', error.message);
        
        // Cleanup on error
        try {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
          }
        } catch (cleanupError) {
          console.log('Warning: Could not cleanup temp file on error:', cleanupError.message);
        }
        
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
    }
    
    next();
  });
};

module.exports = {
  handleUploadPlacePhotoSimple
};