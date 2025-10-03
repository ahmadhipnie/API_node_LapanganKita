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

async function testCompleteWorkflow() {
  try {
    console.log('🚀 Testing Complete Photo Upload Workflow...\n');

    // 1. Create place dengan foto
    console.log('📤 1. CREATE Place with Photo...');
    const createImagePath = './create-test.jpg';
    createTestImage(createImagePath);
    
    const createFormData = new FormData();
    createFormData.append('place_name', 'Lapangan Test Upload');
    createFormData.append('address', 'Jl. Test Upload No. 123');
    createFormData.append('description', 'Test lapangan dengan foto');
    createFormData.append('price', '100000');
    createFormData.append('id_users', '1');
    createFormData.append('place_photo', fs.createReadStream(createImagePath));
    
    const createResponse = await axios.post(`${BASE_URL}/api/places`, createFormData, {
      headers: { ...createFormData.getHeaders() }
    });
    
    console.log('✅ CREATE Success:', {
      id: createResponse.data.data.id,
      place_name: createResponse.data.data.place_name,
      place_photo: createResponse.data.data.place_photo
    });
    
    const placeId = createResponse.data.data.id;
    
    // Cleanup create test file
    fs.unlinkSync(createImagePath);
    
    // 2. Update place dengan foto baru
    console.log('\n📝 2. UPDATE Place with New Photo...');
    const updateImagePath = './update-test.jpg';
    createTestImage(updateImagePath);
    
    const updateFormData = new FormData();
    updateFormData.append('place_name', 'Lapangan Test Upload UPDATED');
    updateFormData.append('address', 'Jl. Test Upload No. 123 UPDATED');
    updateFormData.append('description', 'Test lapangan dengan foto UPDATED');
    updateFormData.append('price', '120000');
    updateFormData.append('place_photo', fs.createReadStream(updateImagePath));
    
    const updateResponse = await axios.put(`${BASE_URL}/api/places/${placeId}`, updateFormData, {
      headers: { ...updateFormData.getHeaders() }
    });
    
    console.log('✅ UPDATE Success:', {
      id: updateResponse.data.data.id,
      place_name: updateResponse.data.data.place_name,
      place_photo: updateResponse.data.data.place_photo
    });
    
    // Cleanup update test file
    fs.unlinkSync(updateImagePath);
    
    // 3. Update place tanpa foto (hanya data)
    console.log('\n📝 3. UPDATE Place without Photo (data only)...');
    const updateDataFormData = new FormData();
    updateDataFormData.append('place_name', 'Lapangan Test Upload FINAL');
    updateDataFormData.append('price', '150000');
    
    const updateDataResponse = await axios.put(`${BASE_URL}/api/places/${placeId}`, updateDataFormData, {
      headers: { ...updateDataFormData.getHeaders() }
    });
    
    console.log('✅ UPDATE Data Only Success:', {
      id: updateDataResponse.data.data.id,
      place_name: updateDataResponse.data.data.place_name,
      price: updateDataResponse.data.data.price,
      place_photo: updateDataResponse.data.data.place_photo // Should still have old photo
    });
    
    // 4. Get place by ID untuk verifikasi
    console.log('\n🔍 4. GET Place by ID for verification...');
    const getResponse = await axios.get(`${BASE_URL}/api/places/${placeId}`);
    
    console.log('✅ GET Success:', {
      id: getResponse.data.data.id,
      place_name: getResponse.data.data.place_name,
      place_photo: getResponse.data.data.place_photo,
      owner_name: getResponse.data.data.owner_name
    });
    
    console.log('\n🎉 Complete Workflow Test PASSED!');
    console.log('📸 Photo upload and update working correctly!');
    
  } catch (error) {
    console.error('❌ Workflow Test Failed:', error.response?.data || error.message);
    
    // Cleanup test files on error
    ['./create-test.jpg', './update-test.jpg'].forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  }
}

// Manual test commands
console.log('📋 Manual Test Commands:');
console.log('========================');
console.log('CREATE with photo:');
console.log('curl -X POST http://localhost:3000/api/places -F "place_name=Test Place" -F "address=Test Address" -F "id_users=1" -F "place_photo=@your_image.jpg"');
console.log('\nUPDATE with photo:');
console.log('curl -X PUT http://localhost:3000/api/places/1 -F "place_name=Updated Place" -F "place_photo=@new_image.jpg"');
console.log('\nUPDATE without photo:');
console.log('curl -X PUT http://localhost:3000/api/places/1 -F "place_name=Updated Place" -F "price=200000"');
console.log('========================\n');

// Run the test
testCompleteWorkflow();