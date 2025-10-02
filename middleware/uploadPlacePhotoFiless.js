const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Untuk Vercel + Filess.io - menggunakan /tmp directory dan TEXT database
const uploadDir = '/tmp/places';

// Pastikan folder /tmp/places ada
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi storage untuk foto places di /tmp directory
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

// Konfigurasi multer dengan batasan lebih kecil untuk TEXT compatibility
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1 * 1024 * 1024 // 1MB maksimal (karena base64 akan lebih besar ~33%)
  },
  fileFilter: fileFilter
});

// Middleware untuk single file upload dengan field name 'place_photo'
const uploadPlacePhoto = upload.single('place_photo');

// Utility function untuk convert file ke base64 dengan compression untuk TEXT limit
const fileToBase64Compressed = (filePath, mimetype) => {
  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = fileBuffer.toString('base64');
  const fullBase64 = `data:${mimetype};base64,${base64Data}`;
  
  // Check jika base64 string terlalu panjang untuk TEXT (65535 characters)
  console.log(`📊 Base64 size: ${fullBase64.length} characters (limit: 65535)`);
  
  if (fullBase64.length > 65000) { // Leave some margin
    throw new Error(`Base64 terlalu besar: ${fullBase64.length} chars. Limit TEXT: 65535 chars. Gunakan gambar yang lebih kecil.`);
  }
  
  return fullBase64;
};

// Simple image compression without Sharp - reduce quality
const simpleImageCompress = (inputPath, outputPath, quality = 0.8) => {
  try {
    // For simple compression, we'll just try to reduce file size by reducing quality
    // This is a basic approach - in production you'd want proper image processing
    const fs = require('fs');
    const buffer = fs.readFileSync(inputPath);
    
    // Simple approach: if file is too big, reject it
    // In real app, you'd use canvas or jimp for actual compression
    if (buffer.length > 500000) { // 500KB threshold
      return false;
    }
    
    // Just copy the file for now - in real app, compress here
    fs.writeFileSync(outputPath, buffer);
    return true;
    
  } catch (error) {
    console.log('Simple compression failed:', error.message);
    return false;
  }
};

// Utility function untuk resize image jika terlalu besar (optional - requires sharp)
const resizeImageIfNeeded = async (inputPath, outputPath, maxSize = 65000) => {
  try {
    // Try to require sharp for image processing
    const sharp = require('sharp');
    
    let quality = 80;
    let resized = false;
    
    while (quality > 10) {
      const processed = await sharp(inputPath)
        .jpeg({ quality })
        .toBuffer();
      
      const base64Size = (processed.toString('base64').length * 4/3) + 100; // Estimate
      
      if (base64Size <= maxSize) {
        fs.writeFileSync(outputPath, processed);
        resized = true;
        break;
      }
      
      quality -= 10;
    }
    
    return resized;
  } catch (error) {
    console.log('Sharp not available for image resizing:', error.message);
    return false;
  }
};

// Wrapper untuk error handling dengan TEXT database compatibility
const handleUploadPlacePhotoFiless = (req, res, next) => {
  uploadPlacePhoto(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File terlalu besar. Maksimal 1MB untuk kompatibilitas dengan database TEXT'
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
    
    // Jika ada file yang diupload, convert ke base64 dengan validasi TEXT limit
    if (req.file) {
      try {
        // First try normal conversion
        let base64Data;
        let finalPath = req.file.path;
        
        try {
          base64Data = fileToBase64Compressed(req.file.path, req.file.mimetype);
        } catch (sizeError) {
          console.log('Image too large, attempting resize...');
          
          // Try to resize if sharp is available
          const resizedPath = req.file.path + '_resized';
          const resized = await resizeImageIfNeeded(req.file.path, resizedPath);
          
          if (resized) {
            finalPath = resizedPath;
            base64Data = fileToBase64Compressed(resizedPath, req.file.mimetype);
            console.log('✅ Image resized successfully');
          } else {
            return res.status(400).json({
              success: false,
              message: 'Image terlalu besar dan tidak dapat dikompres. Gunakan gambar yang lebih kecil (max 1MB)'
            });
          }
        }
        
        // Tambahkan base64 data ke req.body
        req.body.place_photo_data = base64Data;
        req.body.place_photo_filename = req.file.filename;
        req.body.place_photo_path = finalPath;
        
        console.log(`✅ File uploaded and compressed for TEXT database: ${req.file.filename}`);
        console.log(`📊 Base64 size: ${base64Data.length} characters (limit: 65535)`);
        
        // Cleanup original file if resized
        if (finalPath !== req.file.path) {
          try {
            fs.unlinkSync(req.file.path);
          } catch (cleanupError) {
            console.log('Warning: Could not cleanup original file:', cleanupError.message);
          }
        }
        
      } catch (error) {
        console.error('Error processing file for TEXT database:', error);
        return res.status(500).json({
          success: false,
          message: 'Gagal memproses file upload: ' + error.message
        });
      }
    }
    
    next();
  });
};

// Function untuk serve file dari base64
const serveBase64AsFile = (base64Data, filename, res) => {
  try {
    // Extract mimetype dan base64 string
    const [header, base64String] = base64Data.split(',');
    const mimetype = header.match(/data:([^;]+)/)[1];
    
    // Convert base64 ke buffer
    const buffer = Buffer.from(base64String, 'base64');
    
    // Set headers
    res.setHeader('Content-Type', mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    // Send buffer
    res.send(buffer);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid base64 data'
    });
  }
};

// Cleanup function untuk hapus temporary files
const cleanupTempFiles = () => {
  try {
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      files.forEach(file => {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        
        // Hapus file yang lebih dari 30 menit (lebih agresif untuk TEXT limit)
        if (Date.now() - stats.mtime.getTime() > 30 * 60 * 1000) {
          fs.unlinkSync(filePath);
          console.log(`🧹 Cleaned up temp file: ${file}`);
        }
      });
    }
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
  }
};

// Auto cleanup setiap 15 menit (lebih sering untuk TEXT limit)
setInterval(cleanupTempFiles, 15 * 60 * 1000);

module.exports = {
  handleUploadPlacePhoto: handleUploadPlacePhotoFiless,
  fileToBase64: fileToBase64Compressed,
  serveBase64AsFile,
  cleanupTempFiles,
  uploadDir
};