# ✅ API LapanganKita - Kembali ke Struktur Asli

## 📋 Perubahan yang Telah Dilakukan

### 1. **Database Schema** ✅
- Update ke struktur `lapangan_kita_db.sql`
- Table `places` dengan kolom: `id`, `place_name`, `address`, `balance`, `place_photo`, `id_users`
- Table `users` dengan kolom: `id`, `name`, `email`, `password`, dst.
- Foreign key: `places.id_users` → `users.id`

### 2. **Upload System** ✅
- Foto disimpan di folder `uploads/places/`
- Format filename: `place-timestamp-random.ext`
- Path disimpan di database: `/uploads/places/filename.ext`
- Max file size: 5MB
- Support: JPEG, JPG, PNG, WEBP

### 3. **PlaceController** ✅
- CRUD operations sesuai struktur database baru
- File management (upload, delete)
- Join dengan table users untuk get owner info

### 4. **Routes** ✅
```
GET    /api/places              - Get all places
GET    /api/places/:id          - Get place by ID
GET    /api/places/search?q=    - Search places
GET    /api/places/owner/:id_users - Get places by owner
POST   /api/places              - Create new place (dengan upload foto)
PUT    /api/places/:id          - Update place (dengan upload foto)
DELETE /api/places/:id          - Delete place (hapus foto juga)
```

### 5. **Environment** ✅
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=lapangan_kita
DB_PORT=3306
```

## 🚀 Cara Menjalankan

### 1. Setup Database
```sql
-- Import database schema
mysql -u root -p < database/schema.sql

-- Atau manual:
CREATE DATABASE lapangan_kita;
USE lapangan_kita;
-- Copy paste isi dari schema.sql
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment
Edit file `.env` sesuai konfigurasi MySQL Anda

### 4. Jalankan Server
```bash
npm start
```

## 📝 Testing Endpoints

### 1. **Create Place dengan Upload Foto**
```bash
curl -X POST http://localhost:3000/api/places \
  -F "place_name=Lapangan Budi" \
  -F "address=Jl. Sudirman No. 123" \
  -F "balance=50000" \
  -F "id_users=1" \
  -F "place_photo=@/path/to/image.jpg"
```

### 2. **Get All Places**
```bash
curl http://localhost:3000/api/places
```

### 3. **Search Places**
```bash
curl "http://localhost:3000/api/places/search?q=Lapangan"
```

### 4. **Update Place dengan Foto Baru**
```bash
curl -X PUT http://localhost:3000/api/places/1 \
  -F "place_name=Lapangan Budi Updated" \
  -F "place_photo=@/path/to/new-image.jpg"
```

### 5. **Delete Place**
```bash
curl -X DELETE http://localhost:3000/api/places/1
```

## 📁 Struktur Folder

```
api_node_lapangan_kita/
├── uploads/
│   └── places/              # Foto places disimpan di sini
├── controllers/
│   └── PlaceControllerNew.js # Controller baru
├── middleware/
│   └── uploadPlacePhotoNew.js # Middleware upload baru
├── routes/
│   └── placeRoutes.js       # Routes updated
├── database/
│   └── schema.sql           # Database schema updated
└── .env                     # Environment variables
```

## 🔧 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Place berhasil dibuat",
  "data": {
    "id": 1,
    "place_name": "Lapangan Budi",
    "address": "Jl. Sudirman No. 123",
    "balance": 50000,
    "place_photo": "/uploads/places/place-1696345678901-123456789.jpg",
    "id_users": 1,
    "owner_name": "User Name",
    "owner_email": "user@email.com",
    "created_at": "2025-10-03T10:30:00.000Z",
    "updated_at": "2025-10-03T10:30:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error info"
}
```

## ✅ Status: Ready to Use!

API sudah kembali ke struktur asli dan siap digunakan dengan:
- ✅ Database sesuai `lapangan_kita_db.sql`
- ✅ Upload foto ke folder `uploads/places`
- ✅ CRUD operations lengkap
- ✅ File management otomatis
- ✅ Join dengan table users

**Tinggal setup database MySQL dan jalankan `npm start`!**