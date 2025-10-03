# Add-Ons API Documentation

## Overview
API lengkap untuk CRUD operasi add-ons dengan validasi owner dan upload foto wajib menggunakan multipart/form-data.

## Features
✅ **Owner Validation** - Hanya pemilik place yang bisa CRUD add-ons  
✅ **Photo Upload** - Multipart/form-data dengan foto wajib untuk create  
✅ **File Management** - Auto delete foto lama saat update/delete  
✅ **Stock Management** - Update stock dengan owner validation  
✅ **Relational Data** - Join dengan data place dan user owner  

## Database Schema
```sql
CREATE TABLE `add_ons` (
  `id` bigint UNSIGNED NOT NULL,
  `add_on_name` varchar(255) NOT NULL,
  `price_per_hour` int NOT NULL,
  `add_on_photo` varchar(255) NOT NULL,
  `stock` int NOT NULL,
  `add_on_description` varchar(255) NOT NULL,
  `place_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## Endpoints

### 1. Get All Add-Ons
**GET** `/api/add-ons`
```json
{
  "success": true,
  "message": "Data add-ons berhasil diambil",
  "data": [
    {
      "id": 1,
      "add_on_name": "Bola Futsal",
      "price_per_hour": 25000,
      "add_on_photo": "/uploads/add-ons/addon-1234567890-123456789.jpg",
      "stock": 10,
      "add_on_description": "Bola futsal berkualitas FIFA",
      "place_id": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "place_name": "SportCenter Jakarta",
      "place_address": "Jl. Sudirman No. 123",
      "place_owner_name": "John Doe"
    }
  ]
}
```

### 2. Get Add-On by ID
**GET** `/api/add-ons/:id`
```json
{
  "success": true,
  "message": "Data add-on berhasil diambil",
  "data": { /* add-on object */ }
}
```

### 3. Get Add-Ons by Place
**GET** `/api/add-ons/place/:placeId`
```json
{
  "success": true,
  "message": "Data add-ons berhasil diambil",
  "data": [ /* array of add-ons */ ]
}
```

### 4. Get Available Add-Ons by Place
**GET** `/api/add-ons/available/:placeId`
```json
{
  "success": true,
  "message": "Data add-ons yang tersedia berhasil diambil",
  "data": [ /* array of add-ons with stock > 0 */ ]
}
```

### 5. Create Add-On
**POST** `/api/add-ons`
**Content-Type**: `multipart/form-data`

**Form Data:**
```
add_on_name: "Bola Futsal"
price_per_hour: 25000
stock: 10
add_on_description: "Bola futsal berkualitas FIFA"
place_id: 1
id_users: 1 (owner validation)
add_on_photo: [FILE] (required, max 5MB, jpg/jpeg/png/webp)
```

**Response:**
```json
{
  "success": true,
  "message": "Add-on berhasil dibuat",
  "data": { /* new add-on object with relations */ }
}
```

**Validation:**
- Semua field wajib diisi
- Foto add-on wajib diupload
- Validasi bahwa `id_users` adalah pemilik `place_id`

### 6. Update Add-On
**PUT** `/api/add-ons/:id`
**Content-Type**: `multipart/form-data`

**Form Data:** (semua field optional kecuali id_users)
```
add_on_name: "Updated Add-On Name"
price_per_hour: 30000
stock: 15
add_on_description: "Updated description"
id_users: 1 (required for owner validation)
add_on_photo: [FILE] (optional, will replace old photo)
```

**Response:**
```json
{
  "success": true,
  "message": "Add-on berhasil diupdate",
  "data": { /* updated add-on object */ }
}
```

### 7. Update Stock Add-On
**PATCH** `/api/add-ons/:id/stock`
**Content-Type**: `application/json`

**Body:**
```json
{
  "stock": 20,
  "id_users": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stock add-on berhasil diupdate",
  "data": { /* updated add-on object */ }
}
```

### 8. Delete Add-On
**DELETE** `/api/add-ons/:id`
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
  "message": "Add-on berhasil dihapus"
}
```

## Owner Validation
- **Create**: Memvalidasi bahwa `id_users` adalah pemilik dari `place_id`
- **Update**: Memvalidasi bahwa `id_users` adalah pemilik place dari add-on yang akan diupdate
- **Update Stock**: Memvalidasi bahwa `id_users` adalah pemilik place dari add-on
- **Delete**: Memvalidasi bahwa `id_users` adalah pemilik place dari add-on yang akan dihapus

## File Upload
- **Location**: `uploads/add-ons/`
- **Naming**: `addon-{timestamp}-{random}.{ext}`
- **Max Size**: 5MB
- **Allowed Types**: jpg, jpeg, png, webp
- **Required**: Foto wajib untuk create add-on
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
- `400`: Bad Request (validation error, missing data, missing photo)
- `403`: Forbidden (not owner)
- `404`: Not Found (add-on/place not found)
- `500`: Internal Server Error

## Testing Examples

### Create Add-On with curl
```bash
curl -X POST http://localhost:3000/api/add-ons \
  -F "add_on_name=Bola Futsal" \
  -F "price_per_hour=25000" \
  -F "stock=10" \
  -F "add_on_description=Bola futsal berkualitas FIFA" \
  -F "place_id=1" \
  -F "id_users=1" \
  -F "add_on_photo=@/path/to/image.jpg"
```

### Update Stock with curl
```bash
curl -X PATCH http://localhost:3000/api/add-ons/1/stock \
  -H "Content-Type: application/json" \
  -d '{"stock": 20, "id_users": 1}'
```

### Get Add-Ons by Place
```bash
curl -X GET http://localhost:3000/api/add-ons/place/1
```

### Get Available Add-Ons (stock > 0)
```bash
curl -X GET http://localhost:3000/api/add-ons/available/1
```

## 🎉 Add-Ons API Features Summary
- ✅ Complete CRUD operations with owner validation
- ✅ Mandatory photo upload for create operations
- ✅ Automatic photo management (delete old photos)
- ✅ Stock management with owner validation
- ✅ Relational data queries (place and owner info)
- ✅ Error handling with cleanup
- ✅ File type and size validation
- ✅ Multipart/form-data support