# Booking API Documentation

## Endpoints

### 1. Get All Bookings (Admin only)
```
GET /api/bookings
Headers: Authorization: Bearer [admin_token]
```

### 2. Get Booking by ID
```
GET /api/bookings/:id
Headers: Authorization: Bearer [user_token]
```

### 3. Create New Booking (User only)
```
POST /api/bookings
Headers: 
  Authorization: Bearer [user_token]
  Content-Type: application/json

Body:
{
  "field_id": 1,
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
      "id_add_on": 2,
      "qty": 1
    }
  ]
}
```

### 4. Update Booking Status (Field Owner only)
```
PATCH /api/bookings/:id/status
Headers: 
  Authorization: Bearer [field_owner_token]
  Content-Type: application/json

Body:
{
  "status": "approved", // or "cancelled"
  "reason": "Alasan jika dibatalkan"
}
```

### 5. Complete Booking (After Payment) - User mengisi snap_token
```
PATCH /api/bookings/:id/complete
Headers: 
  Content-Type: application/json

Body:
{
  "snap_token": "midtrans_snap_token_dari_user"
}
```
**Note: `snap_token` harus diisi oleh user yang menggunakan API, bukan dari auth token**

### 6. Get My Bookings (Current User)
```
GET /api/bookings/me/bookings
Headers: Authorization: Bearer [user_token]
```

### 7. Get Field Owner Bookings (Field Owner only)
```
GET /api/bookings/owner/bookings
Headers: Authorization: Bearer [field_owner_token]
```

## Business Flow

1. **User Creates Booking**
   - User sends POST /api/bookings
   - System validates field availability
   - System checks add-on stock
   - System automatically decreases add-on stock
   - System creates booking with status "waiting_confirmation"
   - System generates order_id for payment

2. **Field Owner Responds**
   - Field owner sends PATCH /api/bookings/:id/status
   - If approved: booking ready for payment
   - If cancelled: add-on stock automatically restored

3. **Payment Process**
   - User completes payment through Midtrans
   - User sends PATCH /api/bookings/:id/complete with snap_token
   - System updates booking status to "completed"

## Features

- **Stock Management**: Add-on stock automatically decreased on booking creation, restored on cancellation
- **Role Validation**: Only field owners can approve/cancel bookings for their fields
- **Conflict Detection**: Prevents double booking for same field and time
- **Payment Integration**: Supports order_id and snap_token for Midtrans integration
- **Detailed Responses**: All booking responses include field, place, and add-on details

## Status Flow

```
waiting_confirmation → approved → completed
                   ↘ cancelled
```

## Error Handling

- 400: Bad request (missing fields, validation errors)
- 401: Unauthorized (invalid token)
- 403: Forbidden (wrong role or not owner)
- 404: Not found (booking, field, add-on not found)
- 500: Server error