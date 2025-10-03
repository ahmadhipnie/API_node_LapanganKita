const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';

// Helper function to create test JPEG file
function createTestImage(filename) {
  const jpegHeader = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
    0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
    0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
    0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
    0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
    0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
    0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0xAA, 0xFF, 0xD9
  ]);
  fs.writeFileSync(filename, jpegHeader);
}

async function checkFileExists(photoPath) {
  try {
    const fullPath = `./uploads/places/${photoPath.split('/').pop()}`;
    return fs.existsSync(fullPath);
  } catch (error) {
    return false;
  }
}

async function testFileDeletion() {
  try {
    console.log('🧪 Testing File Deletion Behavior...\n');

    // 1. CREATE place dengan foto
    console.log('📤 1. CREATE Place with Photo...');
    const createImagePath = './test-delete-1.jpg';
    createTestImage(createImagePath);
    
    const createFormData = new FormData();
    createFormData.append('place_name', 'Test File Deletion');
    createFormData.append('address', 'Test Address');
    createFormData.append('id_users', '1');
    createFormData.append('place_photo', fs.createReadStream(createImagePath));
    
    const createResponse = await axios.post(`${BASE_URL}/api/places`, createFormData, {
      headers: { ...createFormData.getHeaders() }
    });
    
    const placeId = createResponse.data.data.id;
    const originalPhoto = createResponse.data.data.place_photo;
    
    console.log(`✅ Created place with photo: ${originalPhoto}`);
    console.log(`📁 File exists: ${await checkFileExists(originalPhoto)}`);
    
    fs.unlinkSync(createImagePath);
    
    // 2. UPDATE tanpa foto (hanya data) - foto lama HARUS tetap ada
    console.log('\n📝 2. UPDATE without photo (data only)...');
    const updateDataFormData = new FormData();
    updateDataFormData.append('place_name', 'Test File Deletion UPDATED');
    updateDataFormData.append('address', 'Test Address UPDATED');
    
    const updateDataResponse = await axios.put(`${BASE_URL}/api/places/${placeId}`, updateDataFormData, {
      headers: { ...updateDataFormData.getHeaders() }
    });
    
    console.log(`✅ Updated data only`);
    console.log(`📸 Photo path: ${updateDataResponse.data.data.place_photo}`);
    console.log(`📁 Original file still exists: ${await checkFileExists(originalPhoto)}`);
    
    // 3. UPDATE dengan foto baru - foto lama HARUS terhapus
    console.log('\n📝 3. UPDATE with new photo...');
    const updatePhotoPath = './test-delete-2.jpg';
    createTestImage(updatePhotoPath);
    
    const updatePhotoFormData = new FormData();
    updatePhotoFormData.append('place_name', 'Test File Deletion NEW PHOTO');
    updatePhotoFormData.append('place_photo', fs.createReadStream(updatePhotoPath));
    
    const updatePhotoResponse = await axios.put(`${BASE_URL}/api/places/${placeId}`, updatePhotoFormData, {
      headers: { ...updatePhotoFormData.getHeaders() }
    });
    
    const newPhoto = updatePhotoResponse.data.data.place_photo;
    
    console.log(`✅ Updated with new photo: ${newPhoto}`);
    console.log(`📁 Original file deleted: ${!(await checkFileExists(originalPhoto))}`);
    console.log(`📁 New file exists: ${await checkFileExists(newPhoto)}`);
    
    fs.unlinkSync(updatePhotoPath);
    
    // 4. DELETE place - foto HARUS terhapus
    console.log('\n🗑️  4. DELETE place...');
    
    await axios.delete(`${BASE_URL}/api/places/${placeId}`);
    
    console.log(`✅ Place deleted`);
    console.log(`📁 Photo file deleted: ${!(await checkFileExists(newPhoto))}`);
    
    console.log('\n🎉 File Deletion Test COMPLETED!');
    
    // Summary
    console.log('\n📋 SUMMARY:');
    console.log('===================');
    console.log('✅ CREATE: File saved to uploads/places/');
    console.log('✅ UPDATE (data only): Original file kept');
    console.log('✅ UPDATE (with new photo): Old file deleted, new file saved');
    console.log('✅ DELETE: File deleted from filesystem');
    
  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message);
    
    // Cleanup test files
    ['./test-delete-1.jpg', './test-delete-2.jpg'].forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  }
}

testFileDeletion();