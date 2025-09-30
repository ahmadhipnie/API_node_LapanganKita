const multer = require('multer');

// Konfigurasi multer untuk menerima form-data
// Menggunakan memory storage untuk simplicitas (file disimpan dalam memory)
const storage = multer.memoryStorage();

// Filter untuk file yang diizinkan (opsional)
const fileFilter = (req, file, cb) => {
  // Izinkan semua jenis file untuk sekarang
  // Bisa disesuaikan untuk file tertentu jika diperlukan
  cb(null, true);
};

// Konfigurasi multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Maksimal 5MB per file
    fieldSize: 1024 * 1024,    // Maksimal 1MB untuk field text
    fields: 20,                // Maksimal 20 field
    files: 5                   // Maksimal 5 file
  }
});

// Middleware untuk form-data tanpa file (hanya field)
const formDataFields = upload.none();

// Middleware untuk form-data dengan file (mixed)
const formDataMixed = upload.any();

// Middleware untuk form-data dengan single file
const formDataSingle = (fieldName) => upload.single(fieldName);

// Middleware untuk form-data dengan multiple files pada field yang sama
const formDataArray = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);

module.exports = {
  formDataFields,
  formDataMixed,
  formDataSingle,
  formDataArray,
  upload
};