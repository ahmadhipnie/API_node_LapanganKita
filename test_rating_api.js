const http = require('http');

function testRatingAPI() {
  console.log('🧪 Testing Rating API Endpoints...\n');

  // Test 1: Get all ratings
  console.log('1. Testing GET /api/ratings');
  testGetRequest('/api/ratings');

  // Test 2: Test create rating (will fail due to validation - expected)
  setTimeout(() => {
    console.log('\n2. Testing POST /api/ratings (with validation)');
    testCreateRating();
  }, 1000);

  // Test 3: Test rating by user
  setTimeout(() => {
    console.log('\n3. Testing GET /api/ratings/user?user_id=1');
    testGetRequest('/api/ratings/user?user_id=1');
  }, 2000);

  // Test 4: Test rating statistics
  setTimeout(() => {
    console.log('\n4. Testing GET /api/ratings/stats/1');
    testGetRequest('/api/ratings/stats/1');
  }, 3000);
}

function testGetRequest(path) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`   Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log(`   Response: ${JSON.stringify(jsonData, null, 2)}`);
      } catch (e) {
        console.log(`   Response: ${data}`);
      }
    });
  });

  req.on('error', (err) => {
    console.error(`   Request error: ${err.message}`);
  });

  req.end();
}

function testCreateRating() {
  const postData = JSON.stringify({
    id_booking: 999, // Non-existent booking for testing
    rating_value: 5,
    review: "Test rating review"
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/ratings',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    console.log(`   Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log(`   Response: ${JSON.stringify(jsonData, null, 2)}`);
      } catch (e) {
        console.log(`   Response: ${data}`);
      }
    });
  });

  req.on('error', (err) => {
    console.error(`   Request error: ${err.message}`);
  });

  req.write(postData);
  req.end();
}

testRatingAPI();