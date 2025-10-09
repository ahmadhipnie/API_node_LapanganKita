const http = require('http');

console.log("🧪 Testing Promosi API Endpoints\n");

// Test function
function testEndpoint(path, method = 'GET') {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    data: data,
                    headers: res.headers
                });
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        req.end();
    });
}

// Run tests
async function runTests() {
    const tests = [
        { name: "GET All Promosi", path: "/api/promosi" },
        { name: "GET Promosi Count", path: "/api/promosi/count" },
        { name: "GET Promosi Slider (Android)", path: "/api/promosi/slider" },
        { name: "GET Main Documentation", path: "/" },
        { name: "GET Health Check", path: "/health" }
    ];

    for (const test of tests) {
        try {
            console.log(`📡 Testing: ${test.name}`);
            console.log(`🔗 Endpoint: ${test.path}`);
            
            const result = await testEndpoint(test.path);
            
            console.log(`✅ Status: ${result.statusCode}`);
            
            // Try to parse JSON response
            try {
                const jsonData = JSON.parse(result.data);
                console.log(`📋 Response:`, JSON.stringify(jsonData, null, 2));
            } catch (e) {
                // If not JSON, show first 200 chars
                const preview = result.data.length > 200 ? 
                    result.data.substring(0, 200) + "..." : 
                    result.data;
                console.log(`📋 Response: ${preview}`);
            }
            
            console.log("---");
        } catch (error) {
            console.log(`❌ Error testing ${test.name}:`, error.message);
            console.log("---");
        }
    }
    
    console.log("\n🎯 NEXT TESTING STEPS:");
    console.log("1. Use Postman to test file upload endpoints");
    console.log("2. Create promosi table in database if not exists");
    console.log("3. Test with actual image files");
    console.log("4. Verify file cleanup on update/delete");
    console.log("5. Test Android integration with slider endpoint");
}

runTests();