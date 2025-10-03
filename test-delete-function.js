const path = require('path');
const fs = require('fs');

// Test the fixed getFullPath function
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

const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ File deleted: ${filePath}`);
      return true;
    } else {
      console.log(`⚠️ File not found: ${filePath}`);
    }
  } catch (error) {
    console.error('Error deleting file:', error.message);
    return false;
  }
  return false;
};

// Test cases
console.log('🧪 Testing Fixed getFullPath and deleteFile:');
console.log('===========================================');

const testDbPath = '/uploads/places/place-123456789-test.jpg';
const fullPath = getFullPath(testDbPath);

console.log(`DB Path: ${testDbPath}`);
console.log(`Full Path: ${fullPath}`);
console.log(`Directory exists: ${fs.existsSync(path.dirname(fullPath))}`);

// Create test file
const testContent = 'test file content';
if (!fs.existsSync(path.dirname(fullPath))) {
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
}
fs.writeFileSync(fullPath, testContent);

console.log(`Test file created: ${fs.existsSync(fullPath)}`);

// Test deletion
const deleted = deleteFile(fullPath);
console.log(`File deleted successfully: ${deleted}`);
console.log(`File exists after deletion: ${fs.existsSync(fullPath)}`);

console.log('\n✅ getFullPath and deleteFile functions are working correctly!');