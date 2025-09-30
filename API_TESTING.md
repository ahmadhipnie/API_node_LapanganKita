# 🧪 Testing API Endpoints

## Test menggunakan curl (Git Bash/Linux/Mac):

### 1. Root endpoint
```bash
curl -X GET http://localhost:3000/
```

### 2. Health check
```bash
curl -X GET http://localhost:3000/health
```

### 3. Get all lapangan
```bash
curl -X GET http://localhost:3000/api/lapangan
```

### 4. Create lapangan baru
```bash
curl -X POST http://localhost:3000/api/lapangan \
  -H "Content-Type: application/json" \
  -d '{
    "nama_lapangan": "Lapangan Test",
    "jenis_olahraga": "Futsal",
    "lokasi": "Jakarta",
    "harga_per_jam": 150000,
    "deskripsi": "Lapangan test",
    "fasilitas": "AC, Toilet"
  }'
```

## Test menggunakan PowerShell (Windows):

### 1. Root endpoint
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/" -Method Get
```

### 2. Health check
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get
```

### 3. Get all lapangan
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/lapangan" -Method Get
```

### 4. Create lapangan baru
```powershell
$body = @{
    nama_lapangan = "Lapangan Test"
    jenis_olahraga = "Futsal" 
    lokasi = "Jakarta"
    harga_per_jam = 150000
    deskripsi = "Lapangan test"
    fasilitas = "AC, Toilet"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/lapangan" -Method Post -Body $body -ContentType "application/json"
```

## Test menggunakan Postman/Insomnia:

### GET Requests:
- `GET http://localhost:3000/`
- `GET http://localhost:3000/health`
- `GET http://localhost:3000/api/lapangan`
- `GET http://localhost:3000/api/booking`

### POST Request (Create Lapangan):
```
POST http://localhost:3000/api/lapangan
Content-Type: application/json

{
  "nama_lapangan": "Lapangan Futsal Premium",
  "jenis_olahraga": "Futsal",
  "lokasi": "Jl. Sudirman No. 123, Jakarta",
  "harga_per_jam": 200000,
  "deskripsi": "Lapangan futsal dengan fasilitas premium",
  "fasilitas": "Rumput sintetis, AC, Sound system, Toilet",
  "gambar_url": "https://example.com/lapangan.jpg",
  "status": "tersedia"
}
```

### POST Request (Create Booking):
```
POST http://localhost:3000/api/booking
Content-Type: application/json

{
  "lapangan_id": 1,
  "nama_pemesan": "John Doe",
  "email_pemesan": "john@email.com",
  "telepon_pemesan": "08123456789",
  "tanggal_booking": "2024-01-25",
  "jam_mulai": "09:00:00",
  "jam_selesai": "11:00:00",
  "total_harga": 400000,
  "catatan": "Booking untuk latihan tim"
}
```