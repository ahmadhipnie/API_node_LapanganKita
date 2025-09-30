const { executeQuery } = require('../config/database');

class AddOnModel {
  // Mendapatkan semua add-ons
  static async getAll() {
    const query = `
      SELECT a.id, a.add_on_name, a.price_per_hour, a.add_on_photo, a.stock,
             a.add_on_description, a.place_id, p.place_name, p.address as place_address,
             a.created_at, a.updated_at
      FROM add_ons a
      LEFT JOIN places p ON a.place_id = p.id
      ORDER BY a.created_at DESC
    `;
    return await executeQuery(query);
  }

  // Mendapatkan add-on berdasarkan ID
  static async getById(id) {
    const query = `
      SELECT a.id, a.add_on_name, a.price_per_hour, a.add_on_photo, a.stock,
             a.add_on_description, a.place_id, p.place_name, p.address as place_address,
             a.created_at, a.updated_at
      FROM add_ons a
      LEFT JOIN places p ON a.place_id = p.id
      WHERE a.id = ?
    `;
    const results = await executeQuery(query, [id]);
    return results[0];
  }

  // Membuat add-on baru
  static async create(data) {
    const query = `
      INSERT INTO add_ons (add_on_name, price_per_hour, add_on_photo, stock,
                          add_on_description, place_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const { add_on_name, price_per_hour, add_on_photo, stock, add_on_description, place_id } = data;
    const result = await executeQuery(query, [
      add_on_name, price_per_hour, add_on_photo, stock, add_on_description, place_id
    ]);
    return result.insertId;
  }

  // Update add-on
  static async update(id, data) {
    const query = `
      UPDATE add_ons 
      SET add_on_name = ?, price_per_hour = ?, add_on_photo = ?, stock = ?,
          add_on_description = ?, place_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const { add_on_name, price_per_hour, add_on_photo, stock, add_on_description, place_id } = data;
    const result = await executeQuery(query, [
      add_on_name, price_per_hour, add_on_photo, stock, add_on_description, place_id, id
    ]);
    return result.affectedRows > 0;
  }

  // Hapus add-on
  static async delete(id) {
    const query = 'DELETE FROM add_ons WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  // Mendapatkan add-ons berdasarkan place ID
  static async getByPlaceId(placeId) {
    const query = `
      SELECT a.id, a.add_on_name, a.price_per_hour, a.add_on_photo, a.stock,
             a.add_on_description, a.place_id, p.place_name, p.address as place_address,
             a.created_at, a.updated_at
      FROM add_ons a
      LEFT JOIN places p ON a.place_id = p.id
      WHERE a.place_id = ?
      ORDER BY a.created_at DESC
    `;
    return await executeQuery(query, [placeId]);
  }

  // Update stock add-on
  static async updateStock(id, newStock) {
    const query = `
      UPDATE add_ons 
      SET stock = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await executeQuery(query, [newStock, id]);
    return result.affectedRows > 0;
  }

  // Decrement stock add-on
  static async decrementStock(id, quantity) {
    const query = `
      UPDATE add_ons 
      SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND stock >= ?
    `;
    const result = await executeQuery(query, [quantity, id, quantity]);
    return result.affectedRows > 0;
  }

  // Increment stock add-on
  static async incrementStock(id, quantity) {
    const query = `
      UPDATE add_ons 
      SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await executeQuery(query, [quantity, id]);
    return result.affectedRows > 0;
  }

  // Cek stok tersedia
  static async checkStock(id, quantity) {
    const query = 'SELECT stock FROM add_ons WHERE id = ?';
    const results = await executeQuery(query, [id]);
    if (results.length === 0) return false;
    return results[0].stock >= quantity;
  }
}

module.exports = AddOnModel;