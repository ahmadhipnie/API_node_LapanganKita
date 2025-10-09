# 💰 REFUNDS API Documentation

## 📋 Overview
API untuk mengelola refunds ketika booking dibatalkan. Admin dapat menambahkan refund dengan upload foto bukti transfer.

## 🔗 Base URL
```
http://localhost:3000/api/refunds
```

## 📁 Endpoints

### 1. GET All Refunds
```http
GET /api/refunds
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Data refunds berhasil diambil",
  "data": [
    {
      "id": 1,
      "id_booking": 123,
      "total_refund": 150000,
      "file_photo": "refunds/refund_1696320000000-123456789.jpg",
      "created_at": "2025-10-03T10:00:00.000Z",
      "updated_at": "2025-10-03T10:00:00.000Z",
      "booking_total_price": 200000,
      "booking_status": "cancelled",
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "field_name": "Lapangan Futsal A",
      "place_name": "Futsal Arena Jakarta",
      "field_owner_name": "Admin Futsal"
    }
  ]
}
```

### 2. GET Refund by ID
```http
GET /api/refunds/:id
```

**Parameters:**
- `id` (path): Refund ID

**Response Success (200):**
```json
{
  "success": true,
  "message": "Data refund berhasil diambil",
  "data": {
    "id": 1,
    "id_booking": 123,
    "total_refund": 150000,
    "file_photo": "refunds/refund_1696320000000-123456789.jpg",
    "created_at": "2025-10-03T10:00:00.000Z",
    "updated_at": "2025-10-03T10:00:00.000Z",
    "booking_total_price": 200000,
    "booking_status": "cancelled",
    "booking_datetime_start": "2025-10-05T08:00:00.000Z",
    "booking_datetime_end": "2025-10-05T10:00:00.000Z",
    "order_id": "BOOKING-1696320000000-123",
    "user_name": "John Doe",
    "user_email": "john@example.com",
    "field_name": "Lapangan Futsal A",
    "field_type": "futsal",
    "price_per_hour": 100000,
    "place_name": "Futsal Arena Jakarta",
    "place_address": "Jl. Sudirman No. 123",
    "field_owner_name": "Admin Futsal"
  }
}
```

### 3. GET Refunds by Booking ID
```http
GET /api/refunds/booking/:booking_id
```

**Parameters:**
- `booking_id` (path): Booking ID

**Response Success (200):**
```json
{
  "success": true,
  "message": "Data refunds untuk booking berhasil diambil",
  "data": [
    {
      "id": 1,
      "id_booking": 123,
      "total_refund": 150000,
      "file_photo": "refunds/refund_1696320000000-123456789.jpg",
      "created_at": "2025-10-03T10:00:00.000Z",
      "updated_at": "2025-10-03T10:00:00.000Z",
      "booking_total_price": 200000,
      "booking_status": "cancelled",
      "order_id": "BOOKING-1696320000000-123",
      "user_name": "John Doe",
      "user_email": "john@example.com"
    }
  ]
}
```

### 4. POST Create Refund
```http
POST /api/refunds
Content-Type: multipart/form-data
```

**Form Data:**
- `id_booking` (required): ID booking yang dibatalkan
- `total_refund` (required): Jumlah refund (number)
- `file_photo` (required): File foto bukti transfer (image only, max 5MB)

**Validations:**
- ✅ Booking harus exist dan status = 'cancelled'
- ✅ total_refund > 0 dan <= booking.total_price
- ✅ Refund belum pernah dibuat untuk booking ini
- ✅ File harus gambar (jpg, jpeg, png, gif)
- ✅ File maksimal 5MB

**Response Success (201):**
```json
{
  "success": true,
  "message": "Refund berhasil dibuat",
  "data": {
    "refund_id": 1,
    "id_booking": 123,
    "total_refund": 150000,
    "file_photo": "refunds/refund_1696320000000-123456789.jpg",
    "message": "Refund telah diproses, bukti transfer telah diupload"
  }
}
```

**Response Error (400) - Validation:**
```json
{
  "success": false,
  "message": "Refund hanya dapat dibuat untuk booking yang dibatalkan"
}
```

**Response Error (400) - File:**
```json
{
  "success": false,
  "message": "File terlalu besar. Maksimal 5MB"
}
```

### 5. PUT Update Refund
```http
PUT /api/refunds/:id
Content-Type: multipart/form-data
```

**Parameters:**
- `id` (path): Refund ID

**Form Data:**
- `total_refund` (required): Jumlah refund baru
- `file_photo` (optional): File foto bukti baru

**Response Success (200):**
```json
{
  "success": true,
  "message": "Refund berhasil diupdate",
  "data": {
    "refund_id": 1,
    "total_refund": 175000,
    "file_photo": "refunds/refund_1696320000000-987654321.jpg"
  }
}
```

### 6. DELETE Refund
```http
DELETE /api/refunds/:id
```

**Parameters:**
- `id` (path): Refund ID

**Response Success (200):**
```json
{
  "success": true,
  "message": "Refund berhasil dihapus",
  "data": {
    "refund_id": 1,
    "deleted_file": "refunds/refund_1696320000000-123456789.jpg"
  }
}
```

## 📂 File Storage
- **Directory**: `/uploads/refunds/`
- **Naming**: `refund_{timestamp}-{random}.{ext}`
- **Allowed**: jpg, jpeg, png, gif
- **Max Size**: 5MB

## 🔄 Integration with Booking
1. **Booking Cancel** → Status = 'cancelled'
2. **Admin Create Refund** → Upload bukti transfer
3. **User Gets Notification** → Refund processed

## 🧪 Testing Example

### Test Create Refund (using curl):
```bash
curl -X POST http://localhost:3000/api/refunds \
  -F "id_booking=123" \
  -F "total_refund=150000" \
  -F "file_photo=@path/to/bukti-transfer.jpg"
```

### Test Get All Refunds:
```bash
curl http://localhost:3000/api/refunds
```

## ⚠️ Error Codes
- **400**: Validation error (missing fields, invalid file, etc.)
- **404**: Refund/Booking not found
- **500**: Server error

## 🎯 Use Cases
1. **Admin Process Refund**: Upload bukti setelah transfer
2. **Track Refunds**: Monitor semua refund yang telah diproses  
3. **User Inquiry**: Cek status refund berdasarkan booking
4. **Audit Trail**: History refund dengan bukti foto

---
**Note**: File foto otomatis terhapus ketika refund didelete atau diupdate dengan foto baru.