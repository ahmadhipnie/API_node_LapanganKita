# 🚀 API LapanganKita - Clean Multipart Upload

## ✅ Status Pembersihan
Semua file yang tidak digunakan telah dihapus dan API sekarang hanya menggunakan **multipart/form-data** untuk upload gambar.

### File yang Telah Dihapus:
- ❌ `middleware/uploadPlacePhoto.js` (base64)
- ❌ `middleware/uploadPlacePhotoFiless.js` (base64)
- ❌ `middleware/uploadPlacePhotoSimple.js` (base64)
- ❌ `middleware/uploadPlacePhotoTmp.js` (base64)
- ❌ `middleware/uploadPlacePhotoVercel.js` (base64)
- ❌ `controllers/PlaceController.js` (old version)
- ❌ `routes/uploadRoutes.js` (base64 serving)

### File yang Digunakan:
- ✅ `middleware/uploadPlacePhoto.js` (multipart/form-data)
- ✅ `controllers/PlaceController.js` (clean version)
- ✅ `routes/placeRoutes.js` (multipart routes)

## 🔧 Konfigurasi Database
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=lapangan_kita_db
DB_PORT=3306
```

## 📋 API Endpoints - Places

### 1. GET All Places
```bash
curl -X GET http://localhost:3000/api/places
```

### 2. GET Place by ID
```bash
curl -X GET http://localhost:3000/api/places/1
```

### 3. GET Places by Owner
```bash
curl -X GET http://localhost:3000/api/places/owner/1
```

### 4. Search Places
```bash
curl -X GET "http://localhost:3000/api/places/search?query=lapangan"
```

### 5. CREATE Place (dengan foto)
```bash
curl -X POST http://localhost:3000/api/places \
  -F "place_name=Lapangan Futsal ABC" \
  -F "address=Jl. Sudirman No. 123" \
  -F "description=Lapangan futsal dengan fasilitas lengkap" \
  -F "price=100000" \
  -F "id_users=1" \
  -F "place_photo=@/path/to/your/image.jpg"
```

### 6. CREATE Place (tanpa foto)
```bash
curl -X POST http://localhost:3000/api/places \
  -F "place_name=Lapangan Futsal XYZ" \
  -F "address=Jl. Thamrin No. 456" \
  -F "description=Lapangan futsal outdoor" \
  -F "price=75000" \
  -F "id_users=1"
```

### 7. UPDATE Place (dengan foto baru)
```bash
curl -X PUT http://localhost:3000/api/places/1 \
  -F "place_name=Lapangan Futsal ABC Updated" \
  -F "address=Jl. Sudirman No. 123 Updated" \
  -F "description=Lapangan futsal dengan fasilitas lengkap dan AC" \
  -F "price=120000" \
  -F "place_photo=@/path/to/new/image.jpg"
```

### 8. UPDATE Place (tanpa foto)
```bash
curl -X PUT http://localhost:3000/api/places/1 \
  -F "place_name=Lapangan Futsal ABC Updated" \
  -F "address=Jl. Sudirman No. 123 Updated" \
  -F "description=Lapangan futsal dengan fasilitas lengkap dan AC" \
  -F "price=120000"
```

### 9. DELETE Place
```bash
curl -X DELETE http://localhost:3000/api/places/1
```

## 📤 Upload Specifications

### File Upload Limits:
- **Max Size**: 5MB
- **Allowed Types**: JPEG, PNG, WEBP
- **Storage**: `uploads/places/` folder
- **Naming**: `place-{timestamp}-{random}.{ext}`

### Required Fields:
- `place_name` (string) - Nama lapangan
- `address` (string) - Alamat lapangan  
- `id_users` (integer) - ID pemilik lapangan

### Optional Fields:
- `description` (string) - Deskripsi lapangan
- `price` (decimal) - Harga sewa
- `balance` (decimal) - Saldo
- `place_photo` (file) - Foto lapangan

## 🎯 Response Format

### Success Response:
```json
{
  "success": true,
  "message": "Data berhasil disimpan",
  "data": {
    "id": 1,
    "place_name": "Lapangan Futsal ABC",
    "address": "Jl. Sudirman No. 123",
    "description": "Lapangan futsal dengan fasilitas lengkap",
    "price": "100000.00",
    "place_photo": "/uploads/places/place-1696320000000-abc123.jpg",
    "id_users": 1,
    "owner_name": "John Doe",
    "owner_email": "john@example.com"
  }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "place_name, address, dan id_users wajib diisi"
}
```

## 🚀 Cara Menjalankan

1. **Start Server:**
   ```bash
   npm start
   ```

2. **Test API:**
   ```bash
   node test-api.js
   ```

3. **Manual Test:**
   ```bash
   # Windows PowerShell
   .\test_multipart_api.ps1
   ```

## ✨ Fitur

- ✅ **Pure Multipart/Form-Data** - Tidak menggunakan base64
- ✅ **File Upload** - Langsung ke folder `uploads/places/`
- ✅ **File Validation** - Size limit dan type checking
- ✅ **Auto Cleanup** - File lama dihapus saat update/delete
- ✅ **Database Storage** - Path file disimpan di database
- ✅ **User Validation** - Cek keberadaan user sebelum create
- ✅ **Full CRUD** - Create, Read, Update, Delete
- ✅ **Search** - Search berdasarkan nama dan deskripsi
- ✅ **Owner Filter** - Filter berdasarkan pemilik

API sudah siap digunakan! 🎉