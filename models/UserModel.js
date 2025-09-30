const { executeQuery } = require('../config/database');

class UserModel {
  // Mendapatkan semua users
  static async getAll() {
    const query = `
      SELECT id, name, email, gender, address, date_of_birth, 
             account_number, bank_type, role, is_verified, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC
    `;
    return await executeQuery(query);
  }

  // Mendapatkan user berdasarkan ID
  static async getById(id) {
    const query = `
      SELECT id, name, email, gender, address, date_of_birth, 
             account_number, bank_type, role, is_verified, created_at, updated_at
      FROM users 
      WHERE id = ?
    `;
    const results = await executeQuery(query, [id]);
    return results[0];
  }

  // Mendapatkan user berdasarkan email
  static async getByEmail(email) {
    const query = `
      SELECT id, name, email, password, gender, address, date_of_birth, 
             account_number, bank_type, role, is_verified, created_at, updated_at
      FROM users 
      WHERE email = ?
    `;
    const results = await executeQuery(query, [email]);
    return results[0];
  }

  // Membuat user baru
  static async create(data) {
    const query = `
      INSERT INTO users (name, email, password, gender, address, date_of_birth, 
                        account_number, bank_type, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const { name, email, password, gender, address, date_of_birth, account_number, bank_type, role } = data;
    const result = await executeQuery(query, [
      name, email, password, gender, address, date_of_birth, 
      account_number, bank_type, role || 'user'
    ]);
    return result.insertId;
  }

  // Update user
  static async update(id, data) {
    const query = `
      UPDATE users 
      SET name = ?, email = ?, gender = ?, address = ?, date_of_birth = ?,
          account_number = ?, bank_type = ?, role = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const { name, email, gender, address, date_of_birth, account_number, bank_type, role } = data;
    const result = await executeQuery(query, [
      name, email, gender, address, date_of_birth,
      account_number, bank_type, role, id
    ]);
    return result.affectedRows > 0;
  }

  // Hapus user
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  // Verifikasi email user
  static async verifyEmail(id) {
    const query = `
      UPDATE users 
      SET is_verified = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  // Mendapatkan users berdasarkan role
  static async getByRole(role) {
    const query = `
      SELECT id, name, email, gender, address, date_of_birth, 
             account_number, bank_type, role, is_verified, created_at, updated_at
      FROM users 
      WHERE role = ?
      ORDER BY created_at DESC
    `;
    return await executeQuery(query, [role]);
  }

  // Login user dengan email dan password
  static async login(email, password) {
    const query = `
      SELECT id, name, email, gender, address, date_of_birth, 
             account_number, bank_type, role, is_verified, created_at, updated_at
      FROM users 
      WHERE email = ? AND password = ?
    `;
    const users = await executeQuery(query, [email, password]);
    return users.length > 0 ? users[0] : null;
  }

  // Ganti password user
  static async changePassword(id, oldPassword, newPassword) {
    // Cek password lama
    const checkQuery = `SELECT id FROM users WHERE id = ? AND password = ?`;
    const checkResult = await executeQuery(checkQuery, [id, oldPassword]);
    
    if (checkResult.length === 0) {
      return false; // Password lama tidak sesuai
    }

    // Update password baru
    const updateQuery = `
      UPDATE users 
      SET password = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const result = await executeQuery(updateQuery, [newPassword, id]);
    return result.affectedRows > 0;
  }
}

module.exports = UserModel;