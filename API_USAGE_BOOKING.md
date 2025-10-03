# BOOKING API DOCUMENTATION

## 🚀 BOOKING API - TANPA AUTHORIZATION

**Semua endpoint TIDAK memerlukan bearer token atau authorization apapun!**

## 📋 ENDPOINTS

### 1. **GET /api/bookings** - Semua Booking
- **Deskripsi**: Mengambil semua data booking dengan detail booking
- **Method**: GET
- **Authorization**: NONE
- **Response**: Semua booking + detail_booking dengan add-ons

### 2. **GET /api/bookings/:id** - Booking by ID  
- **Deskripsi**: Mengambil booking berdasarkan ID dengan detail booking
- **Method**: GET
- **Authorization**: NONE
- **URL**: `/api/bookings/123`
- **Response**: Data booking lengkap + detail_booking

### 3. **POST /api/bookings** - Buat Booking Baru
- **Deskripsi**: Membuat booking baru dengan add-ons
- **Method**: POST
- **Authorization**: NONE
- **Body**:
```json
{
  "id_users": 1,
  "field_id": 2,
  "booking_date": "2024-01-15",
  "start_time": "08:00:00",
  "end_time": "10:00:00", 
  "total_hours": 2,
  "payment_method": "transfer_manual",
  "add_ons": [
    {
      "id_add_on": 1,
      "qty": 2
    },
    {
      "id_add_on": 3,
      "qty": 1
    }
  ]
}
```

### 4. **PUT /api/bookings/:id/status** - Update Status Booking
- **Deskripsi**: Update status booking (approve/cancel) oleh pemilik lapangan
- **Method**: PUT
- **Authorization**: NONE
- **URL**: `/api/bookings/123/status`
- **Body**:
```json
{
  "status": "approved",
  "reason": "Booking disetujui"
}
```
**Status**: `approved` atau `cancelled`

### 5. **GET /api/bookings/me** - Booking User
- **Deskripsi**: Mengambil booking berdasarkan user ID
- **Method**: GET
- **Authorization**: NONE
- **Query Parameter**: `?user_id=123`
- **URL**: `/api/bookings/me?user_id=123`

### 6. **GET /api/bookings/owner** - Booking Field Owner
- **Deskripsi**: Mengambil booking berdasarkan field owner ID
- **Method**: GET  
- **Authorization**: NONE
- **Query Parameter**: `?owner_id=456`
- **URL**: `/api/bookings/owner?owner_id=456`

### 7. **PUT /api/bookings/:id/complete** - Selesaikan Booking
- **Deskripsi**: Menyelesaikan booking dengan snap_token dari user
- **Method**: PUT
- **Authorization**: NONE
- **URL**: `/api/bookings/123/complete`
- **Body**:
```json
{
  "snap_token": "user_provided_snap_token_here"
}
```

## 🔄 BUSINESS FLOW

1. **User buat booking** → Status: `waiting_confirmation`
2. **Field Owner approve/cancel** → Status: `approved` atau `cancelled`  
3. **User bayar dengan snap_token** → Status: `completed`

## 📊 DETAIL BOOKING

Setiap booking otomatis include:
- **Data booking utama**
- **Data field & place**
- **Data user & field owner**
- **Detail booking** (add-ons yang dipesan)
- **Kalkulasi harga otomatis**
- **Stock management** untuk add-ons

## ✅ FITUR UTOMATIS

- ✅ **Conflict detection** - Cek jadwal bentrok
- ✅ **Stock validation** - Cek stok add-ons 
- ✅ **Price calculation** - Hitung total harga otomatis
- ✅ **Stock management** - Kurangi/kembalikan stok add-ons
- ✅ **Detail booking** - Relasi dengan add-ons
- ✅ **No authorization** - Tidak perlu token apapun

## 🎯 SNAP TOKEN

**snap_token diisi oleh user yang menggunakan API, BUKAN dari auth token!**

User harus menyediakan snap_token sendiri saat complete booking.

## 📝 CATATAN PENTING

- **TIDAK ADA AUTHORIZATION** - Semua endpoint bisa diakses langsung
- **User ID manual** - Kirim user_id/owner_id sebagai parameter
- **File tunggal** - Hanya gunakan `BookingController.js` (bukan `_new`)
- **Detail booking otomatis** - Setiap response include detail add-ons
- **Stock management** - Otomatis kurangi/kembalikan stok add-ons