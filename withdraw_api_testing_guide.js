// Withdraw API Testing Guide
// This file provides testing instructions for the withdraw API

console.log("=== WITHDRAW API TESTING GUIDE ===\n");

console.log("📋 PREREQUISITES:");
console.log("1. Pastikan table 'withdraw' sudah dibuat di database");
console.log("2. Pastikan ada user dengan places yang memiliki balance > 0");
console.log("3. Siapkan file foto untuk testing (JPG/PNG max 5MB)");
console.log("4. Server harus berjalan di port 3000\n");

console.log("🚀 START SERVER:");
console.log("   node index.js\n");

console.log("🧪 TEST ENDPOINTS:\n");

console.log("1. GET BALANCE SUMMARY (Test First):");
console.log('   curl "http://localhost:3000/api/withdraws/balance?user_id=1"');
console.log('   Expected: Balance summary with places detail\n');

console.log("2. GET ALL WITHDRAWS:");
console.log('   curl "http://localhost:3000/api/withdraws"');
console.log('   Expected: List of all withdraws (empty initially)\n');

console.log("3. CREATE WITHDRAW (Manual Test - Requires File):");
console.log('   # Using curl with actual file:');
console.log('   curl -X POST "http://localhost:3000/api/withdraws" \\');
console.log('     -F "id_users=1" \\');
console.log('     -F "amount=10000" \\');
console.log('     -F "file_photo=@C:/path/to/photo.jpg"');
console.log('   # Replace C:/path/to/photo.jpg with actual file path\n');

console.log("4. GET WITHDRAWS BY USER:");
console.log('   curl "http://localhost:3000/api/withdraws/user?user_id=1"\n');

console.log("5. TEST MAIN DOCUMENTATION:");
console.log('   curl "http://localhost:3000/"');
console.log('   Should show withdraws in endpoints list\n');

console.log("❌ VALIDATION TESTS:\n");

console.log("1. Insufficient Balance:");
console.log('   curl -X POST "http://localhost:3000/api/withdraws" \\');
console.log('     -F "id_users=1" \\');
console.log('     -F "amount=999999999" \\');
console.log('     -F "file_photo=@C:/path/to/photo.jpg"');
console.log('   Expected: "Balance tidak mencukupi"\n');

console.log("2. Missing File:");
console.log('   curl -X POST "http://localhost:3000/api/withdraws" \\');
console.log('     -H "Content-Type: application/json" \\');
console.log('     -d \'{"id_users":1,"amount":10000}\'');
console.log('   Expected: "File foto diperlukan untuk withdraw"\n');

console.log("3. Invalid Amount:");
console.log('   curl -X POST "http://localhost:3000/api/withdraws" \\');
console.log('     -F "id_users=1" \\');
console.log('     -F "amount=-5000" \\');
console.log('     -F "file_photo=@C:/path/to/photo.jpg"');
console.log('   Expected: "Amount harus berupa angka positif"\n');

console.log("4. User Without Places:");
console.log('   curl -X POST "http://localhost:3000/api/withdraws" \\');
console.log('     -F "id_users=999" \\');
console.log('     -F "amount=10000" \\');
console.log('     -F "file_photo=@C:/path/to/photo.jpg"');
console.log('   Expected: "User tidak memiliki place atau user tidak ditemukan"\n');

console.log("🗂️ POSTMAN TESTING:");
console.log("1. Create New Request → POST → http://localhost:3000/api/withdraws");
console.log("2. Body → form-data");
console.log("3. Add fields:");
console.log("   - id_users: 1 (text)");
console.log("   - amount: 10000 (text)");
console.log("   - file_photo: [Select File] (file)");
console.log("4. Send request\n");

console.log("📁 TESTING WITH SAMPLE DATA:");
console.log("-- Insert sample user with place and balance:");
console.log("INSERT INTO users (name, email, password, role) VALUES");
console.log("('Test User', 'test@example.com', 'password', 'field_owner');");
console.log("INSERT INTO places (place_name, address, balance, id_users) VALUES");
console.log("('Test Place', 'Test Address', 100000, 1);\n");

console.log("🔍 TESTING BALANCE DEDUCTION:");
console.log("1. Check initial balance → GET /api/withdraws/balance?user_id=1");
console.log("2. Create withdraw → POST /api/withdraws (amount=50000)");
console.log("3. Check balance again → should decrease by 50000");
console.log("4. Verify places table balance is reduced\n");

console.log("📸 FILE UPLOAD TESTING:");
console.log("- Test with JPG/PNG file < 5MB: Should work");
console.log("- Test with file > 5MB: Should fail");
console.log("- Test with non-image file: Should fail");
console.log("- Test without file: Should fail\n");

console.log("=== WITHDRAW API READY ===");
console.log("✅ WithdrawController.js - Complete with balance validation");
console.log("✅ uploadWithdraw.js - File upload middleware ready");
console.log("✅ withdrawRoutes.js - All endpoints configured");
console.log("✅ index.js - Withdraw routes integrated");
console.log("✅ withdraw_api_documentation.md - Complete documentation");
console.log("✅ Business logic: Balance validation, file upload, auto deduction");

console.log("\n🎯 NEXT STEPS:");
console.log("1. Create withdraw table in database");
console.log("2. Add sample data (users, places with balance)");
console.log("3. Test with real file uploads");
console.log("4. Integrate with frontend application");
console.log("5. Consider adding withdraw approval workflow");