# 🚀 BOOKING API - FITUR VALIDASI & AUTO UPDATE

## ✅ **FITUR BARU YANG DITAMBAHKAN:**

### 1. **📅 VALIDASI WAKTU BOOKING**

#### **Minimal 1 Hari Sebelum:**
- Booking harus dilakukan **minimal 24 jam sebelum** waktu mulai
- Mencegah booking mendadak yang tidak realistis

#### **Tidak Bisa Booking Tanggal Lalu:**
- Sistem otomatis tolak booking untuk tanggal yang sudah terlewat
- Validasi real-time berdasarkan waktu server

### 2. **⏰ AUTO UPDATE STATUS**

#### **Auto Complete After End Time:**
- Status `approved` otomatis berubah ke `completed` setelah `booking_datetime_end`
- Dijalankan setiap kali ada request ke endpoint booking
- Background process yang efisien

### 3. **📦 AUTO STOCK RESTORATION**

#### **Stock Kembali Saat Complete/Cancel:**
- Stock add-on otomatis dikembalikan saat status `completed` atau `cancelled`
- Berlaku untuk manual update maupun auto update
- Konsisten di semua scenario

## 🔍 **VALIDASI REQUEST:**

### **POST /api/bookings - Validasi Baru:**
```json
{
  "id_users": 1,
  "field_id": 2,
  "booking_datetime_start": "2024-01-16 08:00:00",  // ✅ Min 1 hari dari sekarang
  "booking_datetime_end": "2024-01-16 10:00:00",    // ✅ Tidak boleh masa lalu
  "snap_token": "snap_token_123",
  "note": "Booking untuk acara"
}
```

### **Error Responses:**
```json
// ❌ Booking tanggal lalu
{
  "success": false,
  "message": "Tidak dapat booking untuk tanggal yang sudah terlewat"
}

// ❌ Booking kurang dari 1 hari
{
  "success": false,
  "message": "Booking harus dilakukan minimal 1 hari sebelum waktu mulai"
}

// ❌ End time salah
{
  "success": false,
  "message": "booking_datetime_end harus lebih besar dari booking_datetime_start"
}
```

## ⚡ **AUTO UPDATE LOGIC:**

### **Kapan Auto Update Dijalankan:**
- ✅ `GET /api/bookings` - Semua booking
- ✅ `GET /api/bookings/:id` - Booking by ID
- ✅ `GET /api/bookings/me` - User bookings
- ✅ `GET /api/bookings/owner` - Owner bookings

### **Proses Auto Update:**
1. **Check Expired:** Cari booking dengan status `approved` yang sudah lewat `booking_datetime_end`
2. **Update Status:** Ubah status ke `completed`
3. **Restore Stock:** Kembalikan stock add-on ke jumlah semula
4. **Log Activity:** Catat aktivitas auto update

## 🔄 **STOCK MANAGEMENT LOGIC:**

### **Kapan Stock Dikembalikan:**
- ✅ Manual cancel booking (`cancelled`)
- ✅ Manual complete booking (`completed`)
- ✅ Auto complete after end time (`completed`)

### **Helper Methods:**
```javascript
// Auto update expired bookings
BookingController.autoUpdateExpiredBookings(connection)

// Restore add-on stock
BookingController.restoreAddOnStock(connection, bookingId)
```

## 📊 **FLOW DIAGRAM:**

```
CREATE BOOKING
├─ Validate time (min 1 day, not past)
├─ Check conflicts
├─ Decrease stock
└─ Status: waiting_confirmation

APPROVE/CANCEL
├─ Update status
├─ If cancelled: restore stock
└─ Response

AUTO UPDATE (on any GET request)
├─ Find expired approved bookings
├─ Update status to completed
├─ Restore stock for each
└─ Continue with original request

MANUAL COMPLETE
├─ Update status to completed
├─ Restore stock
└─ Response
```

## 🎯 **CONTOH SKENARIO:**

### **Scenario 1: Normal Flow**
1. User booking 2 hari dari sekarang ✅
2. Owner approve ✅  
3. Waktu booking berlalu
4. Auto update ke completed ✅
5. Stock add-on dikembalikan ✅

### **Scenario 2: Cancelled**
1. User booking ✅
2. Owner cancel ✅
3. Stock add-on dikembalikan ✅

### **Scenario 3: Error Cases**
1. Booking kemarin ❌ "tanggal sudah terlewat"
2. Booking 12 jam lagi ❌ "minimal 1 hari sebelum"
3. End time < start time ❌ "end harus lebih besar"

## 🔧 **TECHNICAL IMPLEMENTATION:**

### **Auto Update Trigger:**
- Setiap GET request ke endpoint booking
- Lightweight check dengan query efisien
- Non-blocking untuk response user

### **Stock Restoration:**
- Helper method terpisah untuk reusability
- Atomic operation per add-on
- Error handling untuk konsistensi data

### **Logging:**
- Console log untuk tracking auto updates
- Informasi booking ID dan timestamp
- Debug friendly untuk monitoring

## ✅ **BENEFITS:**

1. **User Experience:** Validasi yang jelas dan masuk akal
2. **Business Logic:** Stock management yang akurat
3. **Automation:** Reduce manual intervention
4. **Data Consistency:** Reliable stock tracking
5. **System Reliability:** Self-healing expired bookings

**Semua fitur terintegrasi seamlessly dengan existing API!** 🚀