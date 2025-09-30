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
    const query = `
      UPDATE places 
      SET place_name = ?, address = ?, balance = ?, place_photo = ?, 
          id_users = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const { place_name, address, balance, place_photo, id_users } = data;
    const result = await executeQuery(query, [
      place_name, address, balance, place_photo, id_users, id
    ]);
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
}

module.exports = PlaceModel;