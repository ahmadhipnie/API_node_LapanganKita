// Promosi API Testing Guide
// This file provides testing instructions for the promosi API

console.log("=== PROMOSI API TESTING GUIDE ===\n");

console.log("📋 PREREQUISITES:");
console.log("1. Pastikan table 'promosi' sudah dibuat di database");
console.log("2. Siapkan file gambar untuk testing (JPG/PNG max 10MB)");
console.log("3. Server harus berjalan di port 3000");
console.log("4. Folder uploads/promosi akan dibuat otomatis\n");

console.log("🚀 START SERVER:");
console.log("   node index.js\n");

console.log("🧪 TEST ENDPOINTS:\n");

console.log("1. GET ALL PROMOSI:");
console.log('   curl "http://localhost:3000/api/promosi"');
console.log('   Expected: List of all promosi (empty initially)\n');

console.log("2. GET PROMOSI FOR ANDROID SLIDER (OPTIMIZED):");
console.log('   curl "http://localhost:3000/api/promosi/slider"');
console.log('   Expected: Optimized response for mobile app\n');

console.log("3. GET PROMOSI COUNT:");
console.log('   curl "http://localhost:3000/api/promosi/count"');
console.log('   Expected: Total count of promosi\n');

console.log("4. CREATE PROMOSI (Manual Test - Requires Image File):");
console.log('   # Using curl with actual image file:');
console.log('   curl -X POST "http://localhost:3000/api/promosi" \\');
console.log('     -F "file_photo=@C:/path/to/promo_image.jpg"');
console.log('   # Replace C:/path/to/promo_image.jpg with actual file path\n');

console.log("5. GET PROMOSI BY ID:");
console.log('   curl "http://localhost:3000/api/promosi/1"\n');

console.log("6. UPDATE PROMOSI (Replace Image):");
console.log('   curl -X PUT "http://localhost:3000/api/promosi/1" \\');
console.log('     -F "file_photo=@C:/path/to/new_promo_image.jpg"');
console.log('   Expected: Old image deleted, new image saved\n');

console.log("7. DELETE PROMOSI:");
console.log('   curl -X DELETE "http://localhost:3000/api/promosi/1"');
console.log('   Expected: Promosi deleted, image file removed\n');

console.log("8. TEST MAIN DOCUMENTATION:");
console.log('   curl "http://localhost:3000/"');
console.log('   Should show promosi in endpoints list\n');

console.log("❌ VALIDATION TESTS:\n");

console.log("1. Missing File:");
console.log('   curl -X POST "http://localhost:3000/api/promosi" \\');
console.log('     -H "Content-Type: application/json" \\');
console.log('     -d \'{}\'');
console.log('   Expected: "File foto diperlukan untuk promosi"\n');

console.log("2. File Too Large (if you have >10MB file):");
console.log('   curl -X POST "http://localhost:3000/api/promosi" \\');
console.log('     -F "file_photo=@C:/path/to/large_file.jpg"');
console.log('   Expected: "File terlalu besar. Maksimal 10MB"\n');

console.log("3. Invalid File Type:");
console.log('   curl -X POST "http://localhost:3000/api/promosi" \\');
console.log('     -F "file_photo=@C:/path/to/document.pdf"');
console.log('   Expected: "File harus berupa gambar (JPG, PNG, GIF, dll)"\n');

console.log("4. Update Non-existent Promosi:");
console.log('   curl -X PUT "http://localhost:3000/api/promosi/999" \\');
console.log('     -F "file_photo=@C:/path/to/image.jpg"');
console.log('   Expected: "Promosi tidak ditemukan"\n');

console.log("🗂️ POSTMAN TESTING:\n");

console.log("CREATE PROMOSI:");
console.log("1. Create New Request → POST → http://localhost:3000/api/promosi");
console.log("2. Body → form-data");
console.log("3. Add field: file_photo: [Select File] (file)");
console.log("4. Send request\n");

console.log("ANDROID SLIDER TEST:");
console.log("1. Create New Request → GET → http://localhost:3000/api/promosi/slider");
console.log("2. Send request");
console.log("3. Response should be optimized for mobile app\n");

console.log("📱 ANDROID INTEGRATION TESTING:\n");

console.log("1. SLIDER ENDPOINT for Android:");
console.log('   GET /api/promosi/slider');
console.log('   Response format optimized for image slider\n');

console.log("2. KOTLIN/JAVA INTEGRATION:");
console.log('   - Use Retrofit to call /api/promosi/slider');
console.log('   - Parse response to get image URLs');
console.log('   - Load images with Glide/Picasso in ViewPager2\n');

console.log("3. FLUTTER INTEGRATION:");
console.log('   - Use http package to call /api/promosi/slider');
console.log('   - Use PageView widget for slider');
console.log('   - Load images with Image.network widget\n');

console.log("🔍 TESTING FILE MANAGEMENT:\n");

console.log("1. CREATE PROMOSI:");
console.log("   - Upload image → check uploads/promosi/ folder");
console.log("   - Verify file is saved with correct naming\n");

console.log("2. UPDATE PROMOSI:");
console.log("   - Update with new image");
console.log("   - Verify old file is deleted");
console.log("   - Verify new file is saved\n");

console.log("3. DELETE PROMOSI:");
console.log("   - Delete promosi");
console.log("   - Verify database record is removed");
console.log("   - Verify image file is deleted from storage\n");

console.log("📸 IMAGE QUALITY TESTING:\n");

console.log("Recommended test images:");
console.log("- Small JPG (< 1MB): Should work perfectly");
console.log("- Medium PNG (1-5MB): Should work well");
console.log("- Large JPG (5-10MB): Should work but slower");
console.log("- High resolution images: Test for mobile compatibility\n");

console.log("📊 PERFORMANCE TESTING:\n");

console.log("1. Test with multiple images (5-10 promosi)");
console.log("2. Check slider loading speed");
console.log("3. Test mobile data usage with high-res images");
console.log("4. Verify image caching behavior\n");

console.log("📁 TESTING WITH SAMPLE DATA:\n");

console.log("-- Create promosi table in database:");
console.log("CREATE TABLE `promosi` (");
console.log("  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,");
console.log("  `file_photo` text COLLATE utf8mb4_unicode_ci NOT NULL,");
console.log("  `created_at` timestamp NULL DEFAULT NULL,");
console.log("  `updated_at` timestamp NULL DEFAULT NULL,");
console.log("  PRIMARY KEY (`id`)");
console.log(") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n");

console.log("=== PROMOSI API READY ===");
console.log("✅ PromosiController.js - Complete CRUD with file management");
console.log("✅ uploadPromosi.js - File upload middleware with 10MB limit");
console.log("✅ promosiRoutes.js - All endpoints configured");
console.log("✅ index.js - Promosi routes integrated");
console.log("✅ promosi_api_documentation.md - Complete docs with Android examples");
console.log("✅ Optimized endpoint for Android image slider");
console.log("✅ Automatic file cleanup on edit/delete");

console.log("\n🎯 NEXT STEPS:");
console.log("1. Create promosi table in database");
console.log("2. Upload sample promotional images");
console.log("3. Test Android integration with slider endpoint");
console.log("4. Implement image optimization if needed");
console.log("5. Consider adding admin authentication for CRUD operations");
console.log("6. Monitor storage usage and implement cleanup strategy");