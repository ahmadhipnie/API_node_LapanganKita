// Test file untuk menguji form-data functionality
const FormData = require('form-data');
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testFormDataPost() {
    console.log('🧪 Testing form-data POST request...');
    
    try {
        // Test POST user dengan form-data
        const formData = new FormData();
        formData.append('username', 'testuser123');
        formData.append('email', 'test@example.com');
        formData.append('password', 'password123');
        formData.append('full_name', 'Test User');
        formData.append('phone_number', '081234567890');
        formData.append('role', 'user');
        
        const response = await axios.post(`${BASE_URL}/users`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });
        
        console.log('✅ Form-data POST test passed!');
        console.log('Response:', response.data);
        return response.data;
        
    } catch (error) {
        console.log('❌ Form-data POST test failed!');
        console.log('Error:', error.response?.data || error.message);
        console.log('Full error:', error.code || error);
        return null;
    }
}

async function testJsonPost() {
    console.log('🧪 Testing JSON POST request...');
    
    try {
        const response = await axios.post(`${BASE_URL}/users`, {
            username: 'jsonuser123',
            email: 'json@example.com',
            password: 'password123',
            full_name: 'JSON User',
            phone_number: '081234567891',
            role: 'user'
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        console.log('✅ JSON POST test passed!');
        console.log('Response:', response.data);
        return response.data;
        
    } catch (error) {
        console.log('❌ JSON POST test failed!');
        console.log('Error:', error.response?.data || error.message);
        console.log('Full error:', error.code || error);
        return null;
    }
}

async function testFormDataPut(userId) {
    if (!userId) return;
    
    console.log('🧪 Testing form-data PUT request...');
    
    try {
        const formData = new FormData();
        formData.append('full_name', 'Updated Test User');
        formData.append('phone_number', '081234567999');
        
        const response = await axios.put(`${BASE_URL}/users/${userId}`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });
        
        console.log('✅ Form-data PUT test passed!');
        console.log('Response:', response.data);
        
    } catch (error) {
        console.log('❌ Form-data PUT test failed!');
        console.log('Error:', error.response?.data || error.message);
    }
}

async function runTests() {
    console.log('🚀 Starting form-data API tests...\n');
    
    // Test POST dengan form-data
    const formDataUser = await testFormDataPost();
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test POST dengan JSON
    const jsonUser = await testJsonPost();
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test PUT dengan form-data jika user berhasil dibuat
    if (formDataUser && formDataUser.data && formDataUser.data.id) {
        await testFormDataPut(formDataUser.data.id);
    }
    
    console.log('\n🏁 All tests completed!');
}

// Install form-data jika belum ada
async function checkDependencies() {
    try {
        require('form-data');
        console.log('✅ form-data package available');
        return true;
    } catch (error) {
        console.log('❌ form-data package not found. Installing...');
        return false;
    }
}

if (require.main === module) {
    checkDependencies().then((hasFormData) => {
        if (hasFormData) {
            runTests();
        } else {
            console.log('Please run: npm install form-data');
            console.log('Then run this test again');
        }
    });
}

module.exports = { testFormDataPost, testJsonPost, testFormDataPut };