# ✅ BOOKING API - UPDATED SESUAI DATABASE SCHEMA

## 🔄 **PERUBAHAN YANG DILAKUKAN:**

### **Table `bookings` - UPDATED:**
❌ **DIHAPUS:**
- `booking_date`, `start_time`, `end_time`, `total_hours`
- `payment_method` 
- `reason`

✅ **SESUAI DATABASE:**
- `booking_datetime_start` (date)
- `booking_datetime_end` (date) 
- `snap_token` (required, NOT NULL)
- `note` (nullable text)

### **Table `detail_booking` - UPDATED:**
❌ **DIHAPUS:**
- `qty` 
- `price_per_hour`

✅ **SESUAI DATABASE:**
- `quantity` (int)
- Hanya `total_price` (tanpa price_per_hour terpisah)

## 📋 **REQUEST BODY YANG BERUBAH:**

### **POST /api/bookings - CREATE BOOKING:**
```json
{
  "id_users": 1,
  "field_id": 2,
  "booking_datetime_start": "2024-01-15 08:00:00",
  "booking_datetime_end": "2024-01-15 10:00:00",
  "snap_token": "snap_abc123xyz789_required",
  "note": "Booking untuk acara perusahaan",
  "add_ons": [
    {
      "id_add_on": 1,
      "quantity": 2
    },
    {
      "id_add_on": 3,
      "quantity": 1
    }
  ]
}
```

### **PUT /api/bookings/:id/status - UPDATE STATUS:**
```json
{
  "status": "approved",
  "note": "Booking disetujui, silakan datang tepat waktu"
}
```

### **PUT /api/bookings/:id/complete - COMPLETE BOOKING:**
- **TIDAK ADA BODY** - snap_token sudah ada saat create
- Hanya ubah status ke 'completed'

## 📊 **RESPONSE STRUKTUR BARU:**

### **Detail Booking Array:**
```json
"detail_bookings": [
  {
    "id": 1,
    "id_booking": 1,
    "id_add_on": 1,
    "quantity": 2,           // ✅ Bukan "qty"
    "total_price": 100000,
    "created_at": "2024-01-15T07:30:00.000Z",
    "updated_at": "2024-01-15T07:30:00.000Z",
    "add_on_name": "Bola Futsal",
    "add_on_description": "Bola futsal berkualitas tinggi",
    "price_per_hour": 25000  // ✅ Dari join add_ons table
  }
]
```

### **Booking Data:**
```json
{
  "id": 1,
  "id_users": 2,
  "field_id": 3,
  "booking_datetime_start": "2024-01-15",      // ✅ Bukan booking_date
  "booking_datetime_end": "2024-01-15",        // ✅ Bukan terpisah time
  "order_id": "BOOKING-1704172800000-2",
  "snap_token": "snap_abc123xyz789",           // ✅ Required, NOT NULL
  "total_price": 250000,
  "note": "Booking untuk acara perusahaan",    // ✅ Bukan reason
  "status": "waiting_confirmation",
  "created_at": "2024-01-15T07:30:00.000Z",
  "updated_at": "2024-01-15T07:30:00.000Z"
}
```

## 🔧 **LOGIKA BISNIS YANG BERUBAH:**

### **1. Kalkulasi Waktu:**
```javascript
// ✅ AUTO CALCULATE dari datetime difference
const startDate = new Date(booking_datetime_start);
const endDate = new Date(booking_datetime_end);
const hoursDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60));
```

### **2. Conflict Detection:**
```sql
-- ✅ UPDATED conflict check
WHERE field_id = ? 
AND status IN ('waiting_confirmation', 'approved') 
AND (
  (booking_datetime_start <= ? AND booking_datetime_end > ?) OR
  (booking_datetime_start < ? AND booking_datetime_end >= ?) OR
  (booking_datetime_start >= ? AND booking_datetime_start < ?)
)
```

### **3. Stock Management:**
```javascript
// ✅ UPDATED - use quantity instead of qty
detail.quantity  // bukan detail.qty
addOn.quantity   // bukan addOn.qty
```

## 🎯 **FIELD VALIDATION BARU:**

### **Required Fields untuk CREATE:**
- ✅ `id_users`
- ✅ `field_id`
- ✅ `booking_datetime_start`
- ✅ `booking_datetime_end`
- ✅ `snap_token` (**WAJIB** - bukan optional)

### **Optional Fields:**
- ✅ `note` (nullable)
- ✅ `add_ons` (array, default [])

## 📝 **CONTOH PENGGUNAAN:**

### **1. Create Booking:**
```bash
POST /api/bookings
{
  "id_users": 1,
  "field_id": 2,
  "booking_datetime_start": "2024-01-15 08:00:00",
  "booking_datetime_end": "2024-01-15 10:00:00",
  "snap_token": "snap_abc123xyz789",
  "note": "Booking pagi",
  "add_ons": [{"id_add_on": 1, "quantity": 2}]
}
```

### **2. Update Status:**
```bash
PUT /api/bookings/1/status
{
  "status": "approved",
  "note": "Booking disetujui"
}
```

### **3. Complete Booking:**
```bash
PUT /api/bookings/1/complete
# No body needed - snap_token already provided at creation
```

## ✅ **SEKARANG 100% SESUAI DATABASE SCHEMA!**

**Tidak ada lagi field yang tidak ada di database.**
**Semua field menggunakan nama yang exact sama dengan schema.**