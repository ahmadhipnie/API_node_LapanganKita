const { executeQuery } = require('../config/database');

class FieldModel {
  // Mendapatkan semua fields
  static async getAll() {
    const query = `
      SELECT f.id, f.field_name, f.opening_time, f.closing_time, f.price_per_hour,
             f.description, f.field_type, f.field_photo, f.status, f.max_person,
             f.id_place, p.place_name, p.address as place_address,
             f.created_at, f.updated_at
      FROM fields f
      LEFT JOIN places p ON f.id_place = p.id
      ORDER BY f.created_at DESC
    `;
    return await executeQuery(query);
  }

  // Mendapatkan field berdasarkan ID
  static async getById(id) {
    const query = `
      SELECT f.id, f.field_name, f.opening_time, f.closing_time, f.price_per_hour,
             f.description, f.field_type, f.field_photo, f.status, f.max_person,
             f.id_place, p.place_name, p.address as place_address,
             f.created_at, f.updated_at
      FROM fields f
      LEFT JOIN places p ON f.id_place = p.id
      WHERE f.id = ?
    `;
    const results = await executeQuery(query, [id]);
    return results[0];
  }

  // Membuat field baru
  static async create(data) {
    const query = `
      INSERT INTO fields (field_name, opening_time, closing_time, price_per_hour,
                         description, field_type, field_photo, status, max_person, id_place)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const { 
      field_name, opening_time, closing_time, price_per_hour,
      description, field_type, field_photo, status, max_person, id_place 
    } = data;
    const result = await executeQuery(query, [
      field_name, opening_time, closing_time, price_per_hour,
      description, field_type, field_photo, status || 'available', max_person, id_place
    ]);
    return result.insertId;
  }

  // Update field
  static async update(id, data) {
    const query = `
      UPDATE fields 
      SET field_name = ?, opening_time = ?, closing_time = ?, price_per_hour = ?,
          description = ?, field_type = ?, field_photo = ?, status = ?, 
          max_person = ?, id_place = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const { 
      field_name, opening_time, closing_time, price_per_hour,
      description, field_type, field_photo, status, max_person, id_place 
    } = data;
    const result = await executeQuery(query, [
      field_name, opening_time, closing_time, price_per_hour,
      description, field_type, field_photo, status, max_person, id_place, id
    ]);
    return result.affectedRows > 0;
  }

  // Hapus field
  static async delete(id) {
    const query = 'DELETE FROM fields WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  // Cari field berdasarkan jenis field
  static async getByFieldType(fieldType) {
    const query = `
      SELECT f.id, f.field_name, f.opening_time, f.closing_time, f.price_per_hour,
             f.description, f.field_type, f.field_photo, f.status, f.max_person,
             f.id_place, p.place_name, p.address as place_address,
             f.created_at, f.updated_at
      FROM fields f
      LEFT JOIN places p ON f.id_place = p.id
      WHERE f.field_type LIKE ? AND f.status = 'available'
      ORDER BY f.price_per_hour ASC
    `;
    return await executeQuery(query, [`%${fieldType}%`]);
  }

  // Mendapatkan fields berdasarkan place ID
  static async getByPlaceId(placeId) {
    const query = `
      SELECT f.id, f.field_name, f.opening_time, f.closing_time, f.price_per_hour,
             f.description, f.field_type, f.field_photo, f.status, f.max_person,
             f.id_place, p.place_name, p.address as place_address,
             f.created_at, f.updated_at
      FROM fields f
      LEFT JOIN places p ON f.id_place = p.id
      WHERE f.id_place = ?
      ORDER BY f.created_at DESC
    `;
    return await executeQuery(query, [placeId]);
  }

  // Update status field
  static async updateStatus(id, status) {
    const query = `
      UPDATE fields 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await executeQuery(query, [status, id]);
    return result.affectedRows > 0;
  }

  // Cari field berdasarkan filter
  static async searchFields(filters) {
    let query = `
      SELECT f.id, f.field_name, f.opening_time, f.closing_time, f.price_per_hour,
             f.description, f.field_type, f.field_photo, f.status, f.max_person,
             f.id_place, p.place_name, p.address as place_address,
             f.created_at, f.updated_at
      FROM fields f
      LEFT JOIN places p ON f.id_place = p.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.field_type) {
      query += ' AND f.field_type LIKE ?';
      params.push(`%${filters.field_type}%`);
    }
    
    if (filters.status) {
      query += ' AND f.status = ?';
      params.push(filters.status);
    }
    
    if (filters.min_price) {
      query += ' AND f.price_per_hour >= ?';
      params.push(filters.min_price);
    }
    
    if (filters.max_price) {
      query += ' AND f.price_per_hour <= ?';
      params.push(filters.max_price);
    }
    
    if (filters.place_name) {
      query += ' AND p.place_name LIKE ?';
      params.push(`%${filters.place_name}%`);
    }
    
    query += ' ORDER BY f.price_per_hour ASC';
    
    return await executeQuery(query, params);
  }
}

module.exports = FieldModel;