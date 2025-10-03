// Test script untuk Fields API
// Run dengan: node test-fields-api.js

const testFieldsAPI = async () => {
  const baseURL = 'http://localhost:3000';
  
  console.log('🧪 Testing Fields API...\n');

  try {
    // Test 1: Get all fields (seharusnya kosong di awal)
    console.log('1️⃣ Testing GET /api/fields (get all fields)');
    const response1 = await fetch(`${baseURL}/api/fields`);
    const result1 = await response1.json();
    console.log('Status:', response1.status);
    console.log('Response:', result1);
    console.log('Total fields:', result1.data?.length || 0);
    console.log('---\n');

    // Test 2: Search fields (query kosong)
    console.log('2️⃣ Testing GET /api/fields/search (no query)');
    const response2 = await fetch(`${baseURL}/api/fields/search`);
    const result2 = await response2.json();
    console.log('Status:', response2.status);
    console.log('Response:', result2);
    console.log('---\n');

    // Test 3: Search fields dengan query
    console.log('3️⃣ Testing GET /api/fields/search?q=futsal');
    const response3 = await fetch(`${baseURL}/api/fields/search?q=futsal`);
    const result3 = await response3.json();
    console.log('Status:', response3.status);
    console.log('Response:', result3);
    console.log('---\n');

    // Test 4: Get field by ID (ID yang tidak ada)
    console.log('4️⃣ Testing GET /api/fields/999 (non-existent ID)');
    const response4 = await fetch(`${baseURL}/api/fields/999`);
    const result4 = await response4.json();
    console.log('Status:', response4.status);
    console.log('Response:', result4);
    console.log('---\n');

    // Test 5: Get fields by place ID
    console.log('5️⃣ Testing GET /api/fields/place/1');
    const response5 = await fetch(`${baseURL}/api/fields/place/1`);
    const result5 = await response5.json();
    console.log('Status:', response5.status);
    console.log('Response:', result5);
    console.log('---\n');

    // Test 6: Create field tanpa data (validation error)
    console.log('6️⃣ Testing POST /api/fields (missing data)');
    const response6 = await fetch(`${baseURL}/api/fields`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    const result6 = await response6.json();
    console.log('Status:', response6.status);
    console.log('Response:', result6);
    console.log('---\n');

    // Test 7: Create field dengan place yang tidak ada
    console.log('7️⃣ Testing POST /api/fields (non-existent place)');
    const fieldData = {
      field_name: 'Test Field',
      opening_time: '08:00',
      closing_time: '22:00',
      price_per_hour: 100000,
      description: 'Test field description',
      field_type: 'futsal',
      max_person: 10,
      id_place: 999,
      id_users: 1
    };
    
    const response7 = await fetch(`${baseURL}/api/fields`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(fieldData)
    });
    const result7 = await response7.json();
    console.log('Status:', response7.status);
    console.log('Response:', result7);
    console.log('---\n');

    console.log('✅ Fields API test completed!');
    console.log('\n📝 Note: Untuk test lengkap dengan file upload, gunakan form-data atau tools seperti Postman');
    console.log('📝 Note: Untuk test dengan data valid, pastikan ada data users dan places di database');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
};

// Run test
testFieldsAPI();