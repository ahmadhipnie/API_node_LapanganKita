const { executeQuery } = require('../config/database');

class PlaceModel {
  // Mendapatkan semua places
  static async getAll() {
    const query = `
      SELECT p.id, p.place_name, p.address, p.balance, p.place_photo, 
             p.id_users, u.name as owner_name, p.created_at, p.updated_at
      FROM places p
      LEFT JOIN users u ON p.id_users = u.id
      ORDER BY p.created_at DESC
    `;
    return await executeQuery(query);
  }

  // Mendapatkan place berdasarkan ID
  static async getById(id) {
    const query = `
      SELECT p.id, p.place_name, p.address, p.balance, p.place_photo, 
             p.id_users, u.name as owner_name, p.created_at, p.updated_at
      FROM places p
      LEFT JOIN users u ON p.id_users = u.id
      WHERE p.id = ?
    `;
    const results = await executeQuery(query, [id]);
    return results[0];
  }

  // Membuat place baru
  static async create(data) {
    const query = `
      INSERT INTO places (place_name, address, balance, place_photo, id_users)
      VALUES (?, ?, ?, ?, ?)
    `;
    const { place_name, address, balance, place_photo, id_users } = data;
    const result = await executeQuery(query, [
      place_name, address, balance || 0, place_photo, id_users
    ]);
    return result.insertId;
  }

  // Update place
  static async update(id, data) {
    const updateFields = [];
    const values = [];

    if (data.place_name !== undefined) {
      updateFields.push('place_name = ?');
      values.push(data.place_name);
    }
    if (data.address !== undefined) {
      updateFields.push('address = ?');
      values.push(data.address);
    }
    if (data.balance !== undefined) {
      updateFields.push('balance = ?');
      values.push(data.balance);
    }
    if (data.place_photo !== undefined) {
      updateFields.push('place_photo = ?');
      values.push(data.place_photo);
    }

    if (updateFields.length === 0) {
      return false;
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `UPDATE places SET ${updateFields.join(', ')} WHERE id = ?`;
    const result = await executeQuery(query, values);
    return result.affectedRows > 0;
  }

  // Hapus place
  static async delete(id) {
    const query = 'DELETE FROM places WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  // Mendapatkan places berdasarkan owner
  static async getByOwnerId(ownerId) {
    const query = `
      SELECT p.id, p.place_name, p.address, p.balance, p.place_photo, 
             p.id_users, u.name as owner_name, p.created_at, p.updated_at
      FROM places p
      LEFT JOIN users u ON p.id_users = u.id
      WHERE p.id_users = ?
      ORDER BY p.created_at DESC
    `;
    return await executeQuery(query, [ownerId]);
  }

  // Update balance
  static async updateBalance(id, newBalance) {
    const query = `
      UPDATE places 
      SET balance = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await executeQuery(query, [newBalance, id]);
    return result.affectedRows > 0;
  }

  // Increment balance
  static async incrementBalance(id, amount) {
    const query = `
      UPDATE places 
      SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await executeQuery(query, [amount, id]);
    return result.affectedRows > 0;
  }

  // Decrement balance
  static async decrementBalance(id, amount) {
    const query = `
      UPDATE places 
      SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND balance >= ?
    `;
    const result = await executeQuery(query, [amount, id, amount]);
    return result.affectedRows > 0;
  }

  // Cek apakah place milik user tertentu
  static async isOwnedByUser(placeId, userId) {
    const query = 'SELECT id FROM places WHERE id = ? AND id_users = ?';
    const results = await executeQuery(query, [placeId, userId]);
    return results.length > 0;
  }

  // Search places berdasarkan nama atau alamat
  static async search(keyword) {
    const query = `
      SELECT p.*, u.name as owner_name, u.email as owner_email
      FROM places p
      LEFT JOIN users u ON p.id_users = u.id
      WHERE p.place_name LIKE ? OR p.address LIKE ?
      ORDER BY p.created_at DESC
    `;
    const searchKeyword = `%${keyword}%`;
    return await executeQuery(query, [searchKeyword, searchKeyword]);
  }
}

module.exports = PlaceModel;