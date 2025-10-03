const path = require('path');

// Test getFullPath function
const getFullPath = (dbPath) => {
  if (!dbPath) return null;
  
  // Jika path sudah absolute, return as is
  if (path.isAbsolute(dbPath)) {
    return dbPath;
  }
  
  // Convert relative path ke absolute path
  return path.join(__dirname, '..', dbPath);
};

// Test cases
const testPaths = [
  '/uploads/places/place-123456789-abc.jpg',
  'uploads/places/place-123456789-abc.jpg',
  './uploads/places/place-123456789-abc.jpg'
];

console.log('🧪 Testing getFullPath function:');
console.log('================================');

testPaths.forEach(testPath => {
  const fullPath = getFullPath(testPath);
  console.log(`Input:  ${testPath}`);
  console.log(`Output: ${fullPath}`);
  console.log(`Absolute: ${path.isAbsolute(testPath)}`);
  console.log('---');
});

// Check current directory
console.log('Current directory:', __dirname);
console.log('Expected upload dir:', path.join(__dirname, '..', 'uploads', 'places'));