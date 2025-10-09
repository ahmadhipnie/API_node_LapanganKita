# Rating API Documentation

## Deskripsi
API Rating memungkinkan user memberikan rating dan review untuk booking yang sudah selesai (status: completed). Setiap booking hanya dapat dirating sekali dengan nilai rating 1-5.

## Base URL
```
http://localhost:3000/api/ratings
```

## Business Rules
1. ✅ Rating hanya dapat ditambahkan untuk booking dengan status "completed"
2. ✅ Satu booking hanya dapat dirating sekali (unique constraint)
3. ✅ Rating value harus berupa integer antara 1-5
4. ✅ Review text adalah mandatory

## Endpoints

### 1. Create Rating
**POST** `/api/ratings`

Membuat rating baru untuk booking yang sudah completed.

**Request Body:**
```json
{
  "id_booking": 123,
  "rating_value": 5,
  "review": "Lapangan sangat bagus dan pelayanan memuaskan!"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/ratings \
  -H "Content-Type: application/json" \
  -d '{
    "id_booking": 123,
    "rating_value": 5,
    "review": "Lapangan sangat bagus dan pelayanan memuaskan!"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Rating berhasil ditambahkan",
  "data": {
    "rating_id": 1,
    "id_booking": 123,
    "rating_value": 5,
    "review": "Lapangan sangat bagus dan pelayanan memuaskan!",
    "booking_info": {
      "user_name": "John Doe",
      "field_name": "Lapangan Futsal A",
      "place_name": "GOR Senayan",
      "booking_date": "2025-10-04T10:00:00.000Z"
    }
  }
}
```

**Error Responses:**
```json
// Booking not found
{
  "success": false,
  "message": "Booking tidak ditemukan"
}

// Booking not completed
{
  "success": false,
  "message": "Rating hanya dapat ditambahkan untuk booking yang sudah completed"
}

// Already rated
{
  "success": false,
  "message": "Rating sudah pernah diberikan untuk booking ini. Satu booking hanya dapat dirating satu kali."
}

// Invalid rating value
{
  "success": false,
  "message": "rating_value harus berupa integer antara 1-5"
}
```

### 2. Get All Ratings
**GET** `/api/ratings`

Mendapatkan semua ratings dengan detail booking.

**Example cURL:**
```bash
curl http://localhost:3000/api/ratings
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data ratings berhasil diambil",
  "count": 2,
  "data": [
    {
      "id": 1,
      "id_booking": 123,
      "rating_value": 5,
      "review": "Lapangan sangat bagus!",
      "created_at": "2025-10-04T12:00:00.000Z",
      "updated_at": "2025-10-04T12:00:00.000Z",
      "booking_datetime_start": "2025-10-04T10:00:00.000Z",
      "booking_datetime_end": "2025-10-04T12:00:00.000Z",
      "total_price": "150000.00",
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "field_name": "Lapangan Futsal A",
      "field_type": "futsal",
      "place_name": "GOR Senayan",
      "place_address": "Jakarta Pusat",
      "field_owner_name": "Admin GOR"
    }
  ]
}
```

### 3. Get Rating by ID
**GET** `/api/ratings/:id`

**Example cURL:**
```bash
curl http://localhost:3000/api/ratings/1
```

### 4. Get Rating by Booking ID
**GET** `/api/ratings/booking/:booking_id`

**Example cURL:**
```bash
curl http://localhost:3000/api/ratings/booking/123
```

### 5. Get Ratings by User ID
**GET** `/api/ratings/user?user_id={user_id}`

Mendapatkan semua ratings yang dibuat oleh user tertentu.

**Example cURL:**
```bash
curl "http://localhost:3000/api/ratings/user?user_id=1"
```

### 6. Get Ratings by Field Owner ID
**GET** `/api/ratings/owner?owner_id={owner_id}`

Mendapatkan semua ratings untuk lapangan milik field owner tertentu.

**Example cURL:**
```bash
curl "http://localhost:3000/api/ratings/owner?owner_id=1"
```

### 7. Get Rating Statistics by Place
**GET** `/api/ratings/stats/:place_id`

Mendapatkan statistik rating untuk place tertentu.

**Example cURL:**
```bash
curl http://localhost:3000/api/ratings/stats/1
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Statistik rating berhasil diambil",
  "data": {
    "place_info": {
      "place_name": "GOR Senayan",
      "address": "Jakarta Pusat"
    },
    "statistics": {
      "total_ratings": 15,
      "average_rating": "4.33",
      "min_rating": 3,
      "max_rating": 5
    },
    "distribution": [
      {
        "rating_value": 5,
        "count": 8
      },
      {
        "rating_value": 4,
        "count": 5
      },
      {
        "rating_value": 3,
        "count": 2
      }
    ]
  }
}
```

### 8. Update Rating
**PUT** `/api/ratings/:id`

**Request Body:**
```json
{
  "rating_value": 4,
  "review": "Review yang sudah diupdate"
}
```

**Example cURL:**
```bash
curl -X PUT http://localhost:3000/api/ratings/1 \
  -H "Content-Type: application/json" \
  -d '{
    "rating_value": 4,
    "review": "Review yang sudah diupdate"
  }'
```

### 9. Delete Rating
**DELETE** `/api/ratings/:id`

**Example cURL:**
```bash
curl -X DELETE http://localhost:3000/api/ratings/1
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Rating berhasil dihapus",
  "data": {
    "deleted_rating_id": "1",
    "id_booking": 123
  }
}
```

## JavaScript Fetch Examples

### Create Rating
```javascript
const createRating = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/ratings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_booking: 123,
        rating_value: 5,
        review: "Excellent service and facility!"
      })
    });
    
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Get User Ratings
```javascript
const getUserRatings = async (userId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/ratings/user?user_id=${userId}`);
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Get Place Statistics
```javascript
const getPlaceStats = async (placeId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/ratings/stats/${placeId}`);
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Postman Collection

### Create Rating
- **Method**: POST
- **URL**: `http://localhost:3000/api/ratings`
- **Headers**: 
  - Content-Type: application/json
- **Body** (raw JSON):
```json
{
  "id_booking": 123,
  "rating_value": 5,
  "review": "Great experience!"
}
```

### Get Ratings by Owner
- **Method**: GET
- **URL**: `http://localhost:3000/api/ratings/owner`
- **Params**:
  - owner_id: 1

## Validation Rules

1. **id_booking**: Required, must exist in bookings table, booking status must be 'completed'
2. **rating_value**: Required, integer between 1-5
3. **review**: Required, text field
4. **Uniqueness**: One rating per booking (database constraint)

## Error Codes

- **400**: Bad Request (validation error, invalid data)
- **404**: Not Found (booking/rating not found)
- **500**: Internal Server Error

## Database Schema

```sql
CREATE TABLE `rating` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_booking` bigint UNSIGNED NOT NULL,
  `rating_value` int NOT NULL,
  `review` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_booking_rating` (`id_booking`),
  FOREIGN KEY (`id_booking`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Usage Flow

1. User melakukan booking
2. Booking diapprove oleh field owner
3. Booking selesai (status: completed) baik manual maupun otomatis
4. User dapat memberikan rating dengan memanggil POST /api/ratings
5. Rating hanya bisa diberikan sekali per booking
6. Field owner dapat melihat semua rating untuk lapangannya
7. System dapat menampilkan statistik rating per place

## Tips & Best Practices

1. Selalu validasi booking status sebelum membuat rating
2. Implementasikan unique constraint di database level
3. Gunakan endpoint statistics untuk menampilkan summary rating
4. Cache hasil statistics jika diperlukan untuk performa
5. Pertimbangkan soft delete untuk rating (status field) jika diperlukan