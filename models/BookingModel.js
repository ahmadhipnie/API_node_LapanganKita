const { executeQuery } = require('../config/database');

class BookingModel {
  // Mendapatkan semua booking
  static async getAll() {
    const query = `
      SELECT b.id, b.booking_datetime_start, b.booking_datetime_end, b.order_id,
             b.snap_token, b.total_price, b.note, b.status, b.field_id, b.id_users,
             f.field_name, f.field_type, f.price_per_hour,
             p.place_name, p.address as place_address,
             u.name as user_name, u.email as user_email,
             b.created_at, b.updated_at
      FROM bookings b
      LEFT JOIN fields f ON b.field_id = f.id
      LEFT JOIN places p ON f.id_place = p.id
      LEFT JOIN users u ON b.id_users = u.id
      ORDER BY b.created_at DESC
    `;
    return await executeQuery(query);
  }

  // Mendapatkan booking berdasarkan ID
  static async getById(id) {
    const query = `
      SELECT b.id, b.booking_datetime_start, b.booking_datetime_end, b.order_id,
             b.snap_token, b.total_price, b.note, b.status, b.field_id, b.id_users,
             f.field_name, f.field_type, f.price_per_hour,
             p.place_name, p.address as place_address,
             u.name as user_name, u.email as user_email,
             b.created_at, b.updated_at
      FROM bookings b
      LEFT JOIN fields f ON b.field_id = f.id
      LEFT JOIN places p ON f.id_place = p.id
      LEFT JOIN users u ON b.id_users = u.id
      WHERE b.id = ?
    `;
    const results = await executeQuery(query, [id]);
    return results[0];
  }

  // Membuat booking baru
  static async create(data) {
    const query = `
      INSERT INTO bookings (booking_datetime_start, booking_datetime_end, order_id,
                           snap_token, total_price, note, status, field_id, id_users)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const { 
      booking_datetime_start, booking_datetime_end, order_id,
      snap_token, total_price, note, status, field_id, id_users 
    } = data;
    
    const result = await executeQuery(query, [
      booking_datetime_start, booking_datetime_end, order_id,
      snap_token, total_price, note, status || 'waiting_confirmation', 
      field_id, id_users
    ]);
    return result.insertId;
  }

  // Update status booking
  static async updateStatus(id, status) {
    const query = `
      UPDATE bookings 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await executeQuery(query, [status, id]);
    return result.affectedRows > 0;
  }

  // Update booking
  static async update(id, data) {
    const query = `
      UPDATE bookings 
      SET booking_datetime_start = ?, booking_datetime_end = ?, order_id = ?,
          snap_token = ?, total_price = ?, note = ?, status = ?, 
          field_id = ?, id_users = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const { 
      booking_datetime_start, booking_datetime_end, order_id,
      snap_token, total_price, note, status, field_id, id_users 
    } = data;
    
    const result = await executeQuery(query, [
      booking_datetime_start, booking_datetime_end, order_id,
      snap_token, total_price, note, status, field_id, id_users, id
    ]);
    return result.affectedRows > 0;
  }

  // Hapus booking
  static async delete(id) {
    const query = 'DELETE FROM bookings WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  // Cek ketersediaan field
  static async checkAvailability(field_id, booking_datetime_start, booking_datetime_end) {
    const query = `
      SELECT id FROM bookings 
      WHERE field_id = ? 
        AND status IN ('waiting_confirmation', 'approved')
        AND ((booking_datetime_start <= ? AND booking_datetime_end > ?) 
             OR (booking_datetime_start < ? AND booking_datetime_end >= ?)
             OR (booking_datetime_start >= ? AND booking_datetime_end <= ?))
    `;
    const results = await executeQuery(query, [
      field_id, booking_datetime_start, booking_datetime_start,
      booking_datetime_end, booking_datetime_end, 
      booking_datetime_start, booking_datetime_end
    ]);
    return results.length === 0;
  }

  // Mendapatkan booking berdasarkan user ID
  static async getByUserId(userId) {
    const query = `
      SELECT b.id, b.booking_datetime_start, b.booking_datetime_end, b.order_id,
             b.snap_token, b.total_price, b.note, b.status, b.field_id, b.id_users,
             f.field_name, f.field_type, f.price_per_hour,
             p.place_name, p.address as place_address,
             u.name as user_name, u.email as user_email,
             b.created_at, b.updated_at
      FROM bookings b
      LEFT JOIN fields f ON b.field_id = f.id
      LEFT JOIN places p ON f.id_place = p.id
      LEFT JOIN users u ON b.id_users = u.id
      WHERE b.id_users = ?
      ORDER BY b.created_at DESC
    `;
    return await executeQuery(query, [userId]);
  }

  // Mendapatkan booking berdasarkan field ID
  static async getByFieldId(fieldId) {
    const query = `
      SELECT b.id, b.booking_datetime_start, b.booking_datetime_end, b.order_id,
             b.snap_token, b.total_price, b.note, b.status, b.field_id, b.id_users,
             f.field_name, f.field_type, f.price_per_hour,
             p.place_name, p.address as place_address,
             u.name as user_name, u.email as user_email,
             b.created_at, b.updated_at
      FROM bookings b
      LEFT JOIN fields f ON b.field_id = f.id
      LEFT JOIN places p ON f.id_place = p.id
      LEFT JOIN users u ON b.id_users = u.id
      WHERE b.field_id = ?
      ORDER BY b.created_at DESC
    `;
    return await executeQuery(query, [fieldId]);
  }

  // Mendapatkan booking berdasarkan status
  static async getByStatus(status) {
    const query = `
      SELECT b.id, b.booking_datetime_start, b.booking_datetime_end, b.order_id,
             b.snap_token, b.total_price, b.note, b.status, b.field_id, b.id_users,
             f.field_name, f.field_type, f.price_per_hour,
             p.place_name, p.address as place_address,
             u.name as user_name, u.email as user_email,
             b.created_at, b.updated_at
      FROM bookings b
      LEFT JOIN fields f ON b.field_id = f.id
      LEFT JOIN places p ON f.id_place = p.id
      LEFT JOIN users u ON b.id_users = u.id
      WHERE b.status = ?
      ORDER BY b.created_at DESC
    `;
    return await executeQuery(query, [status]);
  }

  // Mendapatkan booking berdasarkan order ID
  static async getByOrderId(orderId) {
    const query = `
      SELECT b.id, b.booking_datetime_start, b.booking_datetime_end, b.order_id,
             b.snap_token, b.total_price, b.note, b.status, b.field_id, b.id_users,
             f.field_name, f.field_type, f.price_per_hour,
             p.place_name, p.address as place_address,
             u.name as user_name, u.email as user_email,
             b.created_at, b.updated_at
      FROM bookings b
      LEFT JOIN fields f ON b.field_id = f.id
      LEFT JOIN places p ON f.id_place = p.id
      LEFT JOIN users u ON b.id_users = u.id
      WHERE b.order_id = ?
    `;
    const results = await executeQuery(query, [orderId]);
    return results[0];
  }

  // Update snap token
  static async updateSnapToken(id, snapToken) {
    const query = `
      UPDATE bookings 
      SET snap_token = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await executeQuery(query, [snapToken, id]);
    return result.affectedRows > 0;
  }
}

module.exports = BookingModel;