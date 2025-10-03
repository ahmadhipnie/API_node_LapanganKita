// Test script untuk Add-Ons API
// Run dengan: node test-addons-api.js

const testAddOnsAPI = async () => {
  const baseURL = 'http://localhost:3000';
  
  console.log('🧪 Testing Add-Ons API...\n');

  try {
    // Test 1: Get all add-ons
    console.log('1️⃣ Testing GET /api/add-ons (get all add-ons)');
    const response1 = await fetch(`${baseURL}/api/add-ons`);
    const result1 = await response1.json();
    console.log('Status:', response1.status);
    console.log('Response:', result1);
    console.log('Total add-ons:', result1.data?.length || 0);
    console.log('---\n');

    // Test 2: Get add-on by ID (ID yang tidak ada)
    console.log('2️⃣ Testing GET /api/add-ons/999 (non-existent ID)');
    const response2 = await fetch(`${baseURL}/api/add-ons/999`);
    const result2 = await response2.json();
    console.log('Status:', response2.status);
    console.log('Response:', result2);
    console.log('---\n');

    // Test 3: Get add-ons by place ID
    console.log('3️⃣ Testing GET /api/add-ons/place/1');
    const response3 = await fetch(`${baseURL}/api/add-ons/place/1`);
    const result3 = await response3.json();
    console.log('Status:', response3.status);
    console.log('Response:', result3);
    console.log('---\n');

    // Test 4: Get available add-ons by place ID (stock > 0)
    console.log('4️⃣ Testing GET /api/add-ons/available/1');
    const response4 = await fetch(`${baseURL}/api/add-ons/available/1`);
    const result4 = await response4.json();
    console.log('Status:', response4.status);
    console.log('Response:', result4);
    console.log('---\n');

    // Test 5: Create add-on tanpa data (validation error)
    console.log('5️⃣ Testing POST /api/add-ons (missing data)');
    const response5 = await fetch(`${baseURL}/api/add-ons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    const result5 = await response5.json();
    console.log('Status:', response5.status);
    console.log('Response:', result5);
    console.log('---\n');

    // Test 6: Create add-on dengan place yang tidak ada
    console.log('6️⃣ Testing POST /api/add-ons (non-existent place)');
    const addOnData = {
      add_on_name: 'Test Add-On',
      price_per_hour: 50000,
      stock: 10,
      add_on_description: 'Test add-on description',
      place_id: 999,
      id_users: 1
    };
    
    const response6 = await fetch(`${baseURL}/api/add-ons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(addOnData)
    });
    const result6 = await response6.json();
    console.log('Status:', response6.status);
    console.log('Response:', result6);
    console.log('---\n');

    // Test 7: Update stock add-on (without valid ID)
    console.log('7️⃣ Testing PATCH /api/add-ons/999/stock (non-existent add-on)');
    const response7 = await fetch(`${baseURL}/api/add-ons/999/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        stock: 20,
        id_users: 1
      })
    });
    const result7 = await response7.json();
    console.log('Status:', response7.status);
    console.log('Response:', result7);
    console.log('---\n');

    console.log('✅ Add-Ons API test completed!');
    console.log('\n📝 Note: Untuk test lengkap dengan file upload, gunakan form-data atau tools seperti Postman');
    console.log('📝 Note: Untuk test dengan data valid, pastikan ada data users dan places di database');
    console.log('\n📋 Add-Ons API Features:');
    console.log('✅ Owner validation melalui place_id dan id_users');
    console.log('✅ Multipart/form-data photo upload (required untuk create)');
    console.log('✅ Auto delete foto lama saat update/delete');
    console.log('✅ Stock management dengan owner validation');
    console.log('✅ Relational data dengan place dan user info');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
};

// Run test
testAddOnsAPI();