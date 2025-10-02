const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Untuk Vercel, gunakan /tmp directory (yang writable)
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

// Utility function untuk convert file ke base64
const fileToBase64 = (filePath, mimetype) => {
  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = fileBuffer.toString('base64');
  return `data:${mimetype};base64,${base64Data}`;
};

// Utility function untuk save base64 ke file
const base64ToFile = (base64Data, outputPath) => {
  // Extract base64 data (remove data:image/jpeg;base64, prefix)
  const base64String = base64Data.split(',')[1];
  const buffer = Buffer.from(base64String, 'base64');
  fs.writeFileSync(outputPath, buffer);
  return outputPath;
};

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
    
    // Jika ada file yang diupload, convert ke base64 dan simpan path
    if (req.file) {
      try {
        // Convert uploaded file ke base64
        const base64Data = fileToBase64(req.file.path, req.file.mimetype);
        
        // Tambahkan base64 data ke req.body
        req.body.place_photo_data = base64Data;
        req.body.place_photo_filename = req.file.filename;
        req.body.place_photo_path = req.file.path;
        
        console.log(`✅ File uploaded to /tmp: ${req.file.filename}`);
        
        // Optional: Cleanup file setelah convert ke base64
        // fs.unlinkSync(req.file.path);
        
      } catch (error) {
        console.error('Error converting file to base64:', error);
        return res.status(500).json({
          success: false,
          message: 'Gagal memproses file upload'
        });
      }
    }
    
    next();
  });
};

// Function untuk serve file dari base64 (jika diperlukan)
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
        
        // Hapus file yang lebih dari 1 jam
        if (Date.now() - stats.mtime.getTime() > 60 * 60 * 1000) {
          fs.unlinkSync(filePath);
          console.log(`🧹 Cleaned up temp file: ${file}`);
        }
      });
    }
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
  }
};

// Auto cleanup setiap 30 menit
setInterval(cleanupTempFiles, 30 * 60 * 1000);

module.exports = {
  handleUploadPlacePhoto,
  fileToBase64,
  base64ToFile,
  serveBase64AsFile,
  cleanupTempFiles,
  uploadDir
};