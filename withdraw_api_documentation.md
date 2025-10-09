# Withdraw API Documentation

## Deskripsi
API Withdraw memungkinkan user menarik balance dari places yang mereka miliki. Withdraw hanya dapat dilakukan jika balance mencukupi dan harus disertai dengan foto bukti. Setelah withdraw berhasil, balance di places akan otomatis berkurang.

## Base URL
```
http://localhost:3000/api/withdraws
```

## Business Rules
1. ✅ Withdraw hanya dapat dilakukan oleh user yang memiliki places
2. ✅ Amount withdraw tidak boleh melebihi total balance dari semua places user
3. ✅ File foto adalah mandatory untuk setiap withdraw
4. ✅ Balance di places akan otomatis berkurang setelah withdraw berhasil
5. ✅ Deduction balance dimulai dari place dengan balance terbesar
6. ❌ Delete withdraw TIDAK mengembalikan balance (business policy)

## Endpoints

### 1. Create Withdraw
**POST** `/api/withdraws`

Membuat withdraw baru dengan validasi balance dan upload foto.

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `id_users` (number): ID user yang melakukan withdraw
- `amount` (number): Jumlah withdraw (integer positif)
- `file_photo` (file): File foto bukti (JPG, PNG, GIF max 5MB)

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/withdraws \
  -F "id_users=1" \
  -F "amount=50000" \
  -F "file_photo=@/path/to/photo.jpg"
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Withdraw berhasil dibuat",
  "data": {
    "withdraw_id": 1,
    "id_users": 1,
    "amount": 50000,
    "file_photo": "uploads/withdraws/withdraw_1728123456789_1_bukti.jpg",
    "user_info": {
      "user_name": "John Doe",
      "user_email": "john@example.com"
    },
    "balance_info": {
      "previous_total_balance": 150000,
      "remaining_balance": 100000,
      "places_affected": 2
    }
  }
}
```

**Error Responses:**
```json
// Insufficient balance
{
  "success": false,
  "message": "Balance tidak mencukupi. Total balance: 30000, Amount withdraw: 50000"
}

// User has no places
{
  "success": false,
  "message": "User tidak memiliki place atau user tidak ditemukan"
}

// Invalid amount
{
  "success": false,
  "message": "Amount harus berupa angka positif"
}

// File too large
{
  "success": false,
  "message": "File terlalu besar. Maksimal 5MB"
}

// No file uploaded
{
  "success": false,
  "message": "File foto diperlukan untuk withdraw"
}
```

### 2. Get All Withdraws
**GET** `/api/withdraws`

Mendapatkan semua withdraws dengan detail user.

**Example cURL:**
```bash
curl http://localhost:3000/api/withdraws
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Data withdraws berhasil diambil",
  "count": 2,
  "data": [
    {
      "id": 1,
      "id_users": 1,
      "amount": 50000,
      "file_photo": "uploads/withdraws/withdraw_1728123456789_1_bukti.jpg",
      "file_photo_url": "http://localhost:3000/uploads/withdraws/withdraw_1728123456789_1_bukti.jpg",
      "created_at": "2025-10-04T12:00:00.000Z",
      "updated_at": "2025-10-04T12:00:00.000Z",
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "user_phone": "08123456789"
    }
  ]
}
```

### 3. Get Withdraw by ID
**GET** `/api/withdraws/:id`

**Example cURL:**
```bash
curl http://localhost:3000/api/withdraws/1
```

### 4. Get Withdraws by User ID
**GET** `/api/withdraws/user?user_id={user_id}`

Mendapatkan semua withdraws yang dibuat oleh user tertentu.

**Example cURL:**
```bash
curl "http://localhost:3000/api/withdraws/user?user_id=1"
```

### 5. Get User Balance Summary
**GET** `/api/withdraws/balance?user_id={user_id}`

Mendapatkan ringkasan balance user dari semua places dan history withdraw.

**Example cURL:**
```bash
curl "http://localhost:3000/api/withdraws/balance?user_id=1"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Balance summary berhasil diambil",
  "data": {
    "user_info": {
      "user_name": "John Doe",
      "user_email": "john@example.com"
    },
    "balance_summary": {
      "total_balance": 150000,
      "total_places": 2,
      "can_withdraw": true
    },
    "places_detail": [
      {
        "place_id": 1,
        "place_name": "GOR Senayan",
        "balance": 100000
      },
      {
        "place_id": 2,
        "place_name": "Lapangan ABC",
        "balance": 50000
      }
    ],
    "withdraw_history": {
      "total_withdraws": 3,
      "total_withdrawn": 200000
    }
  }
}
```

### 6. Update Withdraw
**PUT** `/api/withdraws/:id`

Update foto withdraw (hanya file_photo yang bisa diupdate).

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `file_photo` (file): File foto bukti baru

**Example cURL:**
```bash
curl -X PUT http://localhost:3000/api/withdraws/1 \
  -F "file_photo=@/path/to/new_photo.jpg"
```

### 7. Delete Withdraw
**DELETE** `/api/withdraws/:id`

**❗ Important:** Delete withdraw TIDAK mengembalikan balance ke places (business policy).

**Example cURL:**
```bash
curl -X DELETE http://localhost:3000/api/withdraws/1
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Withdraw berhasil dihapus",
  "data": {
    "deleted_withdraw_id": "1",
    "deleted_amount": 50000,
    "note": "Balance tidak dikembalikan ke places (business policy)"
  }
}
```

## JavaScript Fetch Examples

### Create Withdraw with File Upload
```javascript
const createWithdraw = async () => {
  const formData = new FormData();
  formData.append('id_users', '1');
  formData.append('amount', '50000');
  formData.append('file_photo', fileInput.files[0]); // from input type="file"

  try {
    const response = await fetch('http://localhost:3000/api/withdraws', {
      method: 'POST',
      body: formData // Don't set Content-Type header, let browser set it
    });
    
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Get User Balance Summary
```javascript
const getUserBalance = async (userId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/withdraws/balance?user_id=${userId}`);
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Check if User Can Withdraw
```javascript
const checkWithdrawEligibility = async (userId, amount) => {
  try {
    const response = await fetch(`http://localhost:3000/api/withdraws/balance?user_id=${userId}`);
    const data = await response.json();
    
    if (data.success && data.data.balance_summary.total_balance >= amount) {
      console.log('User can withdraw');
      return true;
    } else {
      console.log('Insufficient balance');
      return false;
    }
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
};
```

## Postman Collection

### Create Withdraw
- **Method**: POST
- **URL**: `http://localhost:3000/api/withdraws`
- **Body Type**: form-data
- **Form Fields**:
  - id_users: 1 (text)
  - amount: 50000 (text)
  - file_photo: [select file] (file)

### Get Balance Summary
- **Method**: GET
- **URL**: `http://localhost:3000/api/withdraws/balance`
- **Params**:
  - user_id: 1

## Balance Deduction Logic

1. **Multi-Place Balance**: User dapat memiliki multiple places dengan balance berbeda
2. **Smart Deduction**: System akan mengurangi balance dari places secara berurutan
3. **Transaction Safety**: Menggunakan database transaction untuk memastikan konsistensi
4. **Rollback**: Jika terjadi error, semua perubahan akan di-rollback

**Example Deduction:**
```
User memiliki:
- Place A: Balance 30,000
- Place B: Balance 50,000
- Place C: Balance 20,000
Total: 100,000

Withdraw 70,000:
1. Deduct 30,000 dari Place A (balance jadi 0)
2. Deduct 40,000 dari Place B (balance jadi 10,000)
3. Place C tidak terpengaruh (balance tetap 20,000)
```

## File Upload Specifications

- **Allowed Types**: JPG, JPEG, PNG, GIF
- **Max Size**: 5MB
- **Storage**: `uploads/withdraws/`
- **Naming**: `withdraw_{timestamp}_{userId}_{originalname}`
- **Validation**: File type, size, and existence checks

## Validation Rules

1. **id_users**: Required, must have associated places
2. **amount**: Required, positive integer, cannot exceed total balance
3. **file_photo**: Required, image file, max 5MB
4. **Business Logic**: Only users with places can withdraw

## Error Codes

- **400**: Bad Request (validation error, insufficient balance, file issues)
- **404**: Not Found (user/withdraw not found, no places)
- **500**: Internal Server Error

## Database Schema

```sql
CREATE TABLE `withdraw` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_users` bigint UNSIGNED NOT NULL,
  `amount` int NOT NULL,
  `file_photo` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`id_users`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Usage Flow

1. User memiliki places dengan balance
2. User mengecek balance summary via GET /api/withdraws/balance
3. User melakukan withdraw via POST /api/withdraws dengan foto bukti
4. System validasi balance mencukupi
5. System mengurangi balance dari places user
6. Withdraw record dibuat dengan foto tersimpan
7. Admin dapat melihat semua withdraw dan memproses

## Tips & Best Practices

1. Selalu cek balance sebelum melakukan withdraw
2. Gunakan transaction untuk memastikan data consistency
3. Implement proper file validation dan cleanup
4. Log semua withdraw activity untuk audit
5. Consider implementing withdraw approval workflow
6. Monitor file storage usage untuk cleanup periodic
7. Implement rate limiting untuk prevent abuse

## Security Considerations

1. Validate file types strictly
2. Limit file upload size
3. Sanitize file names
4. Implement user authorization (coming soon)
5. Log all withdraw activities
6. Monitor suspicious withdraw patterns