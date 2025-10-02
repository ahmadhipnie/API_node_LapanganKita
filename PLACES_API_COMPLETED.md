# Places API Test Documentation 

## 🚀 Places API sudah berhasil dibuat dengan fitur-fitur berikut:

### ✅ Fitur yang telah diimplementasi:

1. **CRUD Operations (GET, POST, PUT, DELETE)**
2. **Role-based Access Control** - hanya `field_owner` yang bisa membuat places
3. **Search functionality** - mencari places berdasarkan nama/alamat
4. **Ownership validation** - check apakah user adalah owner place
5. **Balance management** - update balance place
6. **Form-data support** - untuk upload photo

### 🔒 Security Features:

#### POST Places - Role Validation
- ✅ **HANYA user dengan role `field_owner` yang dapat membuat places**
- ❌ User dengan role `user` atau `admin` akan mendapat error 403
- ✅ Validasi user existence sebelum create
- ✅ Validasi field wajib (place_name, address, place_photo, id_users)

### 📊 Database Schema yang digunakan:

```sql
-- Table users dengan role field_owner
users:
- id (PK)
- name
- email  
- role ('user', 'admin', 'field_owner')

-- Table places dengan foreign key ke users
places:
- id (PK)
- place_name
- address
- balance
- place_photo
- id_users (FK to users.id)
- created_at
- updated_at
```

### 🛠 Endpoint Summary:

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/places` | Ambil semua places | No |
| GET | `/api/places/:id` | Ambil place by ID | No |
| POST | `/api/places` | **Buat place baru** | **field_owner only** |
| PUT | `/api/places/:id` | Update place | No |
| DELETE | `/api/places/:id` | Hapus place | No |
| GET | `/api/places/search?query=keyword` | Search places | No |
| GET | `/api/places/owner/:ownerId` | Places by owner | No |
| GET | `/api/places/user/:userId/ownership?placeId=1` | Check ownership | No |
| PATCH | `/api/places/:id/balance` | Update balance | No |

### 🎯 Key Implementation Points:

#### 1. PlaceController.js - Role Validation
```javascript
// Cek apakah user ada dan memiliki role field_owner
const user = await UserModel.getById(id_users);
if (!user) {
  return res.status(404).json({
    success: false,
    message: 'User tidak ditemukan'
  });
}

if (user.role !== 'field_owner') {
  return res.status(403).json({
    success: false,
    message: 'Hanya user dengan role field_owner yang dapat membuat place'
  });
}
```

#### 2. PlaceModel.js - Enhanced Methods
- ✅ `search(query)` - JOIN dengan users table
- ✅ `isOwnedByUser(placeId, userId)` - ownership validation
- ✅ `update(id, data)` - flexible field updates

#### 3. Routes - Proper Ordering
```javascript
// Urutan routing yang benar untuk mencegah konflik
router.get('/search', PlaceController.searchPlaces);
router.get('/owner/:ownerId', PlaceController.getPlacesByOwnerId);
router.get('/user/:userId/ownership', PlaceController.checkOwnership);
router.get('/:id', PlaceController.getPlaceById);
```

### 🧪 Test Scenarios:

#### Scenario 1: field_owner membuat place ✅
```bash
POST /api/places
{
  "place_name": "Lapangan Futsal ABC",
  "address": "Jl. Sudirman No. 123",
  "place_photo": "photo.jpg",
  "id_users": 2  // user dengan role field_owner
}

Response: 201 Created
{
  "success": true,
  "message": "Place berhasil dibuat",
  "data": { ... }
}
```

#### Scenario 2: user biasa coba buat place ❌
```bash
POST /api/places
{
  "place_name": "Lapangan Test",
  "address": "Test Address",
  "place_photo": "test.jpg", 
  "id_users": 1  // user dengan role 'user'
}

Response: 403 Forbidden
{
  "success": false,
  "message": "Hanya user dengan role field_owner yang dapat membuat place"
}
```

### 🔧 Additional Features:

1. **Search dengan JOIN**:
   ```sql
   SELECT p.*, u.name as owner_name, u.email as owner_email 
   FROM places p 
   JOIN users u ON p.id_users = u.id 
   WHERE p.place_name LIKE ? OR p.address LIKE ?
   ```

2. **Ownership Check**:
   ```javascript
   const isOwned = await PlaceModel.isOwnedByUser(placeId, userId);
   ```

3. **Balance Management**:
   ```javascript
   PATCH /api/places/:id/balance
   { "balance": 750000 }
   ```

### 🎉 Deployment Status:

✅ **API berhasil di-deploy ke Vercel**: 
- URL: `https://api-node-lapangan-kita-lyilww4f9-ahmadhipnies-projects.vercel.app`
- Status: Production Ready
- Environment Variables: Configured

### 📝 Summary:

**API Places telah berhasil dibuat sesuai permintaan:**

1. ✅ **CRUD operations** untuk places (GET, POST, PUT, DELETE)
2. ✅ **Role-based validation** - khusus POST lapangan berdasarkan `id_users` di table user
3. ✅ **Role restriction** - hanya `id_users` dengan role `field_owner` yang dapat POST/menambahkan places baru
4. ✅ **Comprehensive error handling** dan validation
5. ✅ **Search dan filtering capabilities**
6. ✅ **Form-data support** untuk upload photo
7. ✅ **Production deployment** ke Vercel

**Sistem sekarang sudah siap untuk digunakan!** 🚀