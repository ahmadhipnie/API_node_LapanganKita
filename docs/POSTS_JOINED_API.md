# 🏟️ POSTS & JOINED API Documentation

## 📋 Overview
API untuk sistem postingan dan bergabung dalam booking lapangan. User dapat membuat post setelah booking approved, dan user lain dapat join dengan sistem approval.

## 🔗 Base URLs
```
Posts:  http://localhost:3000/api/posts
Joined: http://localhost:3000/api/joined
```

---

## 📝 POSTS API

### 1. GET All Posts
```http
GET /api/posts
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Data posts berhasil diambil",
  "data": [
    {
      "id": 1,
      "id_booking": 123,
      "post_title": "Main Futsal Bareng Yuk!",
      "post_description": "Cari 4 orang lagi untuk main futsal santai",
      "post_photo": "posts/post_1696320000000-123456789.jpg",
      "created_at": "2025-10-03T10:00:00.000Z",
      "updated_at": "2025-10-03T10:00:00.000Z",
      "booking_datetime_start": "2025-10-05T08:00:00.000Z",
      "booking_datetime_end": "2025-10-05T10:00:00.000Z",
      "booking_status": "approved",
      "total_price": 200000,
      "poster_name": "John Doe",
      "poster_email": "john@example.com",
      "field_name": "Lapangan Futsal A",
      "field_type": "futsal",
      "max_person": 8,
      "place_name": "Futsal Arena Jakarta",
      "place_address": "Jl. Sudirman No. 123",
      "field_owner_name": "Admin Futsal",
      "joined_count": 3
    }
  ]
}
```

### 2. GET Post by ID
```http
GET /api/posts/:id
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Data post berhasil diambil",
  "data": {
    "id": 1,
    "id_booking": 123,
    "post_title": "Main Futsal Bareng Yuk!",
    "post_description": "Cari 4 orang lagi untuk main futsal santai",
    "post_photo": "posts/post_1696320000000-123456789.jpg",
    "created_at": "2025-10-03T10:00:00.000Z",
    "poster_user_id": 456,
    "poster_name": "John Doe",
    "field_name": "Lapangan Futsal A",
    "max_person": 8,
    "joined_count": 3,
    "pending_count": 2,
    "joined_users": [
      {
        "id": 1,
        "id_users": 789,
        "id_booking": 123,
        "status": "approved",
        "created_at": "2025-10-03T11:00:00.000Z",
        "user_name": "Jane Smith",
        "user_email": "jane@example.com"
      },
      {
        "id": 2,
        "id_users": 101,
        "id_booking": 123,
        "status": "pending",
        "created_at": "2025-10-03T12:00:00.000Z",
        "user_name": "Bob Wilson",
        "user_email": "bob@example.com"
      }
    ]
  }
}
```

### 3. GET Posts by User ID
```http
GET /api/posts/user?user_id=456
```

### 4. POST Create Post
```http
POST /api/posts
Content-Type: multipart/form-data
```

**Form Data:**
- `id_booking` (required): ID booking yang sudah approved
- `post_title` (required): Judul postingan
- `post_description` (required): Deskripsi postingan
- `post_photo` (required): File foto postingan (image only, max 5MB)

**Validations:**
- ✅ Booking harus exist dan status = 'approved'
- ✅ Post belum pernah dibuat untuk booking ini
- ✅ File harus gambar (jpg, jpeg, png, gif)
- ✅ File maksimal 5MB

**Response Success (201):**
```json
{
  "success": true,
  "message": "Post berhasil dibuat",
  "data": {
    "post_id": 1,
    "id_booking": 123,
    "post_title": "Main Futsal Bareng Yuk!",
    "post_description": "Cari 4 orang lagi untuk main futsal santai",
    "post_photo": "posts/post_1696320000000-123456789.jpg",
    "field_name": "Lapangan Futsal A",
    "max_person": 8,
    "message": "Post telah dipublikasi, user lain dapat bergabung"
  }
}
```

### 5. PUT Update Post
```http
PUT /api/posts/:id
Content-Type: multipart/form-data
```

**Form Data:**
- `post_title` (required): Judul postingan baru
- `post_description` (required): Deskripsi postingan baru
- `post_photo` (optional): File foto baru

### 6. DELETE Post
```http
DELETE /api/posts/:id
```

---

## 🤝 JOINED API

### 1. GET All Join Requests
```http
GET /api/joined
```

**Response Success (200):**
```json
{
  "success": true,
  "message": "Data join requests berhasil diambil",
  "data": [
    {
      "id": 1,
      "id_users": 789,
      "id_booking": 123,
      "status": "pending",
      "created_at": "2025-10-03T11:00:00.000Z",
      "updated_at": "2025-10-03T11:00:00.000Z",
      "joiner_name": "Jane Smith",
      "joiner_email": "jane@example.com",
      "booking_datetime_start": "2025-10-05T08:00:00.000Z",
      "booking_datetime_end": "2025-10-05T10:00:00.000Z",
      "poster_user_id": 456,
      "poster_name": "John Doe",
      "field_name": "Lapangan Futsal A",
      "field_type": "futsal",
      "max_person": 8,
      "place_name": "Futsal Arena Jakarta",
      "post_title": "Main Futsal Bareng Yuk!",
      "current_joined_count": 2
    }
  ]
}
```

### 2. GET Join Requests by Booking ID
```http
GET /api/joined/booking/:booking_id
```

### 3. GET Join Requests by User ID
```http
GET /api/joined/user?user_id=789
```

### 4. GET Pending Joins for Poster (Management)
```http
GET /api/joined/poster?poster_user_id=456
```

### 5. POST Create Join Request
```http
POST /api/joined
Content-Type: application/json
```

**Body:**
```json
{
  "id_users": 789,
  "id_booking": 123
}
```

**Validations:**
- ✅ Booking harus exist, approved, dan punya post
- ✅ User tidak bisa join booking sendiri
- ✅ User belum pernah join booking ini
- ✅ Masih ada slot available (max_person - 1 - current_joined > 0)
- ✅ Booking belum dimulai

**Response Success (201):**
```json
{
  "success": true,
  "message": "Join request berhasil dibuat",
  "data": {
    "join_id": 1,
    "id_users": 789,
    "id_booking": 123,
    "status": "pending",
    "field_name": "Lapangan Futsal A",
    "available_slots": 4,
    "max_person": 8,
    "current_joined": 2,
    "message": "Join request menunggu approval dari poster"
  }
}
```

### 6. PUT Update Join Request Status
```http
PUT /api/joined/:id/status
Content-Type: application/json
```

**Body:**
```json
{
  "status": "approved"  // atau "rejected"
}
```

**Validations untuk Approval:**
- ✅ Join request masih pending
- ✅ Masih ada slot available
- ✅ Booking belum dimulai

**Response Success (200):**
```json
{
  "success": true,
  "message": "Join request Jane Smith berhasil disetujui",
  "data": {
    "join_id": 1,
    "id_users": 789,
    "id_booking": 123,
    "status": "approved",
    "joiner_name": "Jane Smith",
    "field_name": "Lapangan Futsal A"
  }
}
```

### 7. DELETE Join Request
```http
DELETE /api/joined/:id
```

---

## 🎯 Business Logic & Validations

### **Post Creation Rules:**
1. **Booking Status**: Harus 'approved'
2. **One Post Per Booking**: Tidak boleh duplikat
3. **Photo Required**: Foto wajib diupload
4. **Owner Only**: Hanya poster booking yang bisa buat post

### **Join Request Rules:**
1. **Post Existence**: Booking harus punya post
2. **No Self-Join**: Tidak bisa join booking sendiri
3. **Capacity Check**: max_person - 1 (poster) - current_joined > 0
4. **Time Check**: Booking belum dimulai
5. **No Duplicate**: User hanya bisa join sekali per booking

### **Approval Rules:**
1. **Poster Authority**: Hanya poster yang bisa approve/reject
2. **Capacity Recheck**: Validasi ulang saat approve
3. **Time Recheck**: Booking masih belum dimulai

---

## 🧪 Testing Examples

### Test Create Post:
```bash
curl -X POST http://localhost:3000/api/posts \
  -F "id_booking=123" \
  -F "post_title=Main Futsal Bareng Yuk!" \
  -F "post_description=Cari 4 orang lagi untuk main futsal santai" \
  -F "post_photo=@path/to/foto-lapangan.jpg"
```

### Test Join Request:
```bash
curl -X POST http://localhost:3000/api/joined \
  -H "Content-Type: application/json" \
  -d '{"id_users": 789, "id_booking": 123}'
```

### Test Approve Join:
```bash
curl -X PUT http://localhost:3000/api/joined/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'
```

---

## 📊 Use Cases

### **1. Post Creation Flow:**
Booking Approved → User Creates Post → Post Published → Others Can Join

### **2. Join Request Flow:**
User Sees Post → Checks Available Slots → Creates Join Request → Waits for Approval

### **3. Approval Management:**
Poster Sees Pending Joins → Reviews Profiles → Approves/Rejects → Team Formation

### **4. Capacity Management:**
System Tracks: Poster (1) + Approved Joins = Total ≤ max_person

---

## ⚠️ Error Scenarios

- **400**: Validation errors (capacity full, already joined, etc.)
- **404**: Post/Join request not found
- **500**: Server errors

---

**Note**: File foto posts otomatis terhapus ketika post didelete atau diupdate dengan foto baru.