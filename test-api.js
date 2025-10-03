const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';

async function testHealth() {
  try {
    console.log('🔍 Testing Health Endpoint...');
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health Check Failed:', error.message);
    return false;
  }
}

async function testGetPlaces() {
  try {
    console.log('🔍 Testing GET Places...');
    const response = await axios.get(`${BASE_URL}/api/places`);
    console.log('✅ GET Places:', response.data);
    return true;
  } catch (error) {
    console.error('❌ GET Places Failed:', error.message);
    return false;
  }
}

async function testCreatePlace() {
  try {
    console.log('🔍 Testing CREATE Place with multipart/form-data...');
    
    const formData = new FormData();
    formData.append('place_name', 'Test Lapangan');
    formData.append('description', 'Test Description');
    formData.append('address', 'Test Address');
    formData.append('price', '50000');
    formData.append('id_users', '1');
    
    // Create a simple test image file
    const fs = require('fs');
    const testImagePath = './test-image.jpg';
    
    // Create a minimal JPEG file (1x1 pixel)
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
    
    fs.writeFileSync(testImagePath, jpegHeader);
    
    formData.append('place_photo', fs.createReadStream(testImagePath));
    
    const response = await axios.post(`${BASE_URL}/api/places`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    console.log('✅ CREATE Place:', response.data);
    
    // Cleanup test file
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    
    return response.data.data?.id;
  } catch (error) {
    console.error('❌ CREATE Place Failed:', error.response?.data || error.message);
    
    // Cleanup test file on error
    const fs = require('fs');
    const testImagePath = './test-image.jpg';
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
    
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  // Test Health
  const healthOk = await testHealth();
  if (!healthOk) return;
  
  console.log('\n');
  
  // Test GET Places
  const getOk = await testGetPlaces();
  
  console.log('\n');
  
  // Test CREATE Place
  const placeId = await testCreatePlace();
  
  console.log('\n🎉 Tests Completed!');
}

// Check if axios is available
if (typeof require !== 'undefined') {
  runTests().catch(console.error);
} else {
  console.log('Please install axios: npm install axios');
}