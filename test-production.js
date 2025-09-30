// Test file untuk production API
const FormData = require('form-data');
const axios = require('axios');

const BASE_URL = 'https://api-node-lapangan-kita-mkjvjte4p-ahmadhipnies-projects.vercel.app/api';

async function testProductionAPI() {
    console.log('🚀 Testing production API...');
    console.log('Base URL:', BASE_URL);
    
    try {
        // Test health endpoint
        console.log('\n1. Testing health endpoint...');
        const healthResponse = await axios.get('https://api-node-lapangan-kita-mkjvjte4p-ahmadhipnies-projects.vercel.app/health');
        console.log('✅ Health check:', healthResponse.data);
        
        // Test GET users
        console.log('\n2. Testing GET users...');
        const usersResponse = await axios.get(`${BASE_URL}/users`);
        console.log('✅ GET users:', usersResponse.data);
        
        // Test POST user dengan JSON
        console.log('\n3. Testing POST user with JSON...');
        const jsonUser = {
            username: 'testuser_' + Date.now(),
            email: 'test_' + Date.now() + '@example.com',
            password: 'password123',
            full_name: 'Test User JSON',
            phone_number: '081234567890',
            role: 'user'
        };
        
        const jsonResponse = await axios.post(`${BASE_URL}/users`, jsonUser, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log('✅ JSON POST:', jsonResponse.data);
        
        // Test POST user dengan form-data
        console.log('\n4. Testing POST user with form-data...');
        const formData = new FormData();
        formData.append('username', 'testuser_form_' + Date.now());
        formData.append('email', 'test_form_' + Date.now() + '@example.com');
        formData.append('password', 'password123');
        formData.append('full_name', 'Test User Form Data');
        formData.append('phone_number', '081234567891');
        formData.append('role', 'user');
        
        const formResponse = await axios.post(`${BASE_URL}/users`, formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });
        console.log('✅ Form-data POST:', formResponse.data);
        
        // Test PUT dengan form-data
        if (formResponse.data.data && formResponse.data.data.id) {
            console.log('\n5. Testing PUT user with form-data...');
            const updateFormData = new FormData();
            updateFormData.append('full_name', 'Updated Test User Form Data');
            updateFormData.append('phone_number', '081234567999');
            
            const updateResponse = await axios.put(`${BASE_URL}/users/${formResponse.data.data.id}`, updateFormData, {
                headers: {
                    ...updateFormData.getHeaders(),
                },
            });
            console.log('✅ Form-data PUT:', updateResponse.data);
        }
        
        console.log('\n🎉 All tests passed! Form-data functionality is working!');
        
    } catch (error) {
        console.log('\n❌ Test failed!');
        console.log('Error:', error.response?.data || error.message);
        console.log('Status:', error.response?.status);
        console.log('URL:', error.config?.url);
    }
}

testProductionAPI();