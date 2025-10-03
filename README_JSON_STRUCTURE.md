# 📋 CONTOH STRUKTUR JSON BOOKING API

## 🔍 **GET /api/bookings** - Semua Booking

**File**: `CONTOH_JSON_BOOKINGS.json`

### Key Structure:
```json
{
  "success": boolean,
  "message": string,
  "data": [
    {
      // BOOKING DATA UTAMA
      "id": number,
      "id_users": number,
      "field_id": number,
      "booking_date": "YYYY-MM-DD",
      "start_time": "HH:mm:ss",
      "end_time": "HH:mm:ss", 
      "total_hours": number,
      "total_price": number,
      "status": "waiting_confirmation|approved|cancelled|completed",
      "payment_method": "transfer_manual",
      "order_id": "BOOKING-timestamp-userid",
      "snap_token": string|null,
      "reason": string|null,
      "created_at": "ISO_DATE",
      "updated_at": "ISO_DATE",
      
      // JOINED DATA FROM OTHER TABLES
      "user_name": string,
      "user_email": string,
      "field_name": string,
      "field_type": "futsal|badminton|basket|tenis|volley",
      "place_name": string,
      "place_address": string,
      "field_owner_name": string,
      
      // DETAIL BOOKING ARRAY
      "detail_bookings": [
        {
          "id": number,
          "id_booking": number,
          "id_add_on": number,
          "qty": number,
          "price_per_hour": number,
          "total_price": number,
          "created_at": "ISO_DATE",
          "updated_at": "ISO_DATE",
          "add_on_name": string,
          "add_on_description": string,
          "add_on_price_per_hour": number
        }
      ]
    }
  ]
}
```

---

## 🎯 **GET /api/bookings/:id** - Booking by ID

**File**: `CONTOH_JSON_BOOKING_BY_ID.json`

### Additional Key:
- **`field_price_per_hour`**: Harga per jam lapangan

---

## ✅ **POST /api/bookings** - Response Create Booking

**File**: `CONTOH_JSON_CREATE_BOOKING_RESPONSE.json`

### Response Structure:
```json
{
  "success": true,
  "message": "Booking berhasil dibuat",
  "data": {
    "booking_id": number,
    "order_id": "BOOKING-timestamp-userid",
    "total_price": number,
    "status": "waiting_confirmation",
    "message": "Booking menunggu konfirmasi dari pemilik lapangan"
  }
}
```

---

## 📊 **STATUS BOOKING**

| Status | Deskripsi |
|--------|-----------|
| `waiting_confirmation` | Menunggu konfirmasi field owner |
| `approved` | Disetujui, siap bayar |
| `cancelled` | Dibatalkan |
| `completed` | Selesai, sudah bayar |

---

## 🔑 **KEY FIELDS EXPLANATION**

### **Booking Table Keys:**
- `id` - Primary key booking
- `id_users` - Foreign key ke tabel users (pemesan)
- `field_id` - Foreign key ke tabel fields (lapangan)
- `booking_date` - Tanggal booking (YYYY-MM-DD)
- `start_time` / `end_time` - Waktu mulai/selesai (HH:mm:ss)
- `total_hours` - Total jam booking
- `total_price` - Total harga (lapangan + add-ons)
- `order_id` - Unique identifier untuk payment
- `snap_token` - Token pembayaran dari user
- `payment_method` - Metode pembayaran

### **Detail Booking Keys:**
- `id` - Primary key detail_booking
- `id_booking` - Foreign key ke tabel bookings
- `id_add_on` - Foreign key ke tabel add_ons
- `qty` - Quantity add-on yang dipesan
- `price_per_hour` - Harga per jam add-on saat booking
- `total_price` - Total harga add-on (price_per_hour × qty × total_hours)

### **Joined Data Keys:**
- `user_name` / `user_email` - Data pemesan
- `field_name` / `field_type` - Data lapangan
- `place_name` / `place_address` - Data tempat
- `field_owner_name` - Data pemilik lapangan
- `add_on_name` / `add_on_description` - Data add-on

---

## 🎯 **CONTOH PERHITUNGAN HARGA**

```
Lapangan Futsal: Rp 75.000/jam × 2 jam = Rp 150.000
Add-on Bola: Rp 25.000/jam × 2 qty × 2 jam = Rp 100.000  
Add-on Rompi: Rp 50.000/jam × 1 qty × 2 jam = Rp 100.000
TOTAL: Rp 350.000
```

**Semua data otomatis ter-join dan ter-kalkulasi!**