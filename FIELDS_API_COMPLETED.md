# Fields API Documentation

## Overview
API lengkap untuk CRUD operasi lapangan dengan validasi owner dan upload foto menggunakan multipart/form-data.

## Features
✅ **Owner Validation** - Hanya pemilik place yang bisa CRUD fields  
✅ **Photo Upload** - Multipart/form-data dengan auto-generated filename  
✅ **File Management** - Auto delete foto lama saat update/delete  
✅ **Search Function** - Search berdasarkan nama, deskripsi, tipe lapangan  
✅ **Relational Data** - Join dengan data place dan user owner  

## Endpoints

### 1. Get All Fields
**GET** `/api/fields`
```json
{
  "success": true,
  "message": "Data fields berhasil diambil",
  "data": [
    {
      "id": 1,
      "field_name": "Lapangan Futsal A",
      "opening_time": "08:00",
      "closing_time": "22:00",
      "price_per_hour": 100000,
      "description": "Lapangan futsal standar FIFA",
      "field_type": "futsal",
      "field_photo": "/uploads/fields/field-1234567890-123456789.jpg",
      "status": "available",
      "max_person": 10,
      "id_place": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "place_name": "SportCenter Jakarta",
      "place_address": "Jl. Sudirman No. 123",
      "place_owner_name": "John Doe"
    }
  ]
}
```

### 2. Get Field by ID
**GET** `/api/fields/:id`
```json
{
  "success": true,
  "message": "Data field berhasil diambil",
  "data": { /* field object */ }
}
```

### 3. Get Fields by Place
**GET** `/api/fields/place/:id_place`
```json
{
  "success": true,
  "message": "Data fields berhasil diambil",
  "data": [ /* array of fields */ ]
}
```

### 4. Search Fields
**GET** `/api/fields/search?q=futsal`
```json
{
  "success": true,
  "message": "Pencarian berhasil",
  "data": [ /* matching fields */ ],
  "query": "futsal"
}
```

### 5. Create Field
**POST** `/api/fields`
**Content-Type**: `multipart/form-data`

**Form Data:**
```
field_name: "Lapangan Futsal A"
opening_time: "08:00"
closing_time: "22:00"
price_per_hour: 100000
description: "Lapangan futsal standar FIFA"
field_type: "futsal"
status: "available" (optional, default: "available")
max_person: 10
id_place: 1
id_users: 1 (owner validation)
field_photo: [FILE] (optional, max 5MB, jpg/jpeg/png/webp)
```

**Response:**
```json
{
  "success": true,
  "message": "Field berhasil dibuat",
  "data": { /* new field object with relations */ }
}
```

### 6. Update Field
**PUT** `/api/fields/:id`
**Content-Type**: `multipart/form-data`

**Form Data:** (semua field optional kecuali id_users)
```
field_name: "Updated Field Name"
opening_time: "09:00"
closing_time: "23:00"
price_per_hour: 120000
description: "Updated description"
field_type: "basketball"
status: "maintenance"
max_person: 12
id_users: 1 (required for owner validation)
field_photo: [FILE] (optional, will replace old photo)
```

**Response:**
```json
{
  "success": true,
  "message": "Field berhasil diupdate",
  "data": { /* updated field object */ }
}
```

### 7. Delete Field
**DELETE** `/api/fields/:id`
**Content-Type**: `application/json`

**Body:**
```json
{
  "id_users": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Field berhasil dihapus"
}
```

## Field Schema
```sql
CREATE TABLE fields (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  field_name VARCHAR(255) NOT NULL,
  opening_time TIME NOT NULL,
  closing_time TIME NOT NULL,
  price_per_hour DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  field_type VARCHAR(100) NOT NULL,
  field_photo VARCHAR(255),
  status ENUM('available', 'maintenance', 'booked') DEFAULT 'available',
  max_person INT NOT NULL,
  id_place BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_place) REFERENCES places(id)
);
```

## Owner Validation
- **Create**: Memvalidasi bahwa `id_users` adalah pemilik dari `id_place`
- **Update**: Memvalidasi bahwa `id_users` adalah pemilik place dari field yang akan diupdate
- **Delete**: Memvalidasi bahwa `id_users` adalah pemilik place dari field yang akan dihapus

## File Upload
- **Location**: `uploads/fields/`
- **Naming**: `field-{timestamp}-{random}.{ext}`
- **Max Size**: 5MB
- **Allowed Types**: jpg, jpeg, png, webp
- **Auto Cleanup**: Foto lama dihapus otomatis saat update/delete

## Error Responses
```json
{
  "success": false,
  "message": "Error description",
  "error": "Technical error details"
}
```

**Common Status Codes:**
- `400`: Bad Request (validation error, missing data)
- `403`: Forbidden (not owner)
- `404`: Not Found (field/place not found)
- `500`: Internal Server Error

## Testing
```bash
# Test with curl
curl -X GET http://localhost:3000/api/fields
curl -X GET "http://localhost:3000/api/fields/search?q=futsal"
curl -X GET http://localhost:3000/api/fields/1
curl -X GET http://localhost:3000/api/fields/place/1

# Test with form-data (create)
curl -X POST http://localhost:3000/api/fields \
  -F "field_name=Test Field" \
  -F "opening_time=08:00" \
  -F "closing_time=22:00" \
  -F "price_per_hour=100000" \
  -F "description=Test description" \
  -F "field_type=futsal" \
  -F "max_person=10" \
  -F "id_place=1" \
  -F "id_users=1" \
  -F "field_photo=@/path/to/image.jpg"
```

## 🎉 Fields API Ready!
API Fields sudah siap dengan:
- ✅ Complete CRUD operations
- ✅ Owner validation
- ✅ Photo upload & management
- ✅ Search functionality
- ✅ Relational data (place, owner info)
- ✅ Error handling
- ✅ File cleanup