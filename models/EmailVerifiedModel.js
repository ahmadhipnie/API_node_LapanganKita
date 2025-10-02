const { executeQuery } = require('../config/database');

class EmailVerifiedModel {
  // Membuat record OTP baru
  static async create(data) {
    const query = `
      INSERT INTO email_verified (email, id_user, otp, created_at, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `;
    const { email, id_user, otp } = data;
    const result = await executeQuery(query, [email, id_user, otp]);
    return result.insertId;
  }

  // Mendapatkan OTP berdasarkan email dan user ID
  static async getByEmailAndUser(email, id_user) {
    const query = `
      SELECT id, email, id_user, otp, created_at, updated_at
      FROM email_verified 
      WHERE email = ? AND id_user = ?
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const results = await executeQuery(query, [email, id_user]);
    return results[0];
  }

  // Mendapatkan OTP berdasarkan email saja
  static async getByEmail(email) {
    const query = `
      SELECT id, email, id_user, otp, created_at, updated_at
      FROM email_verified 
      WHERE email = ?
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const results = await executeQuery(query, [email]);
    return results[0];
  }

  // Verifikasi OTP - cek apakah OTP masih valid (dalam 15 menit)
  static async verifyOTP(email, otp) {
    const query = `
      SELECT id, email, id_user, otp, created_at, updated_at
      FROM email_verified 
      WHERE email = ? AND otp = ? 
      AND created_at >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const results = await executeQuery(query, [email, otp]);
    return results[0];
  }

  // Hapus OTP setelah berhasil diverifikasi atau expired
  static async delete(id) {
    const query = 'DELETE FROM email_verified WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  // Hapus semua OTP untuk user tertentu
  static async deleteByUser(id_user) {
    const query = 'DELETE FROM email_verified WHERE id_user = ?';
    const result = await executeQuery(query, [id_user]);
    return result.affectedRows > 0;
  }

  // Hapus semua OTP untuk email tertentu
  static async deleteByEmail(email) {
    const query = 'DELETE FROM email_verified WHERE email = ?';
    const result = await executeQuery(query, [email]);
    return result.affectedRows > 0;
  }

  // Update OTP (untuk resend)
  static async updateOTP(email, id_user, newOTP) {
    const query = `
      UPDATE email_verified 
      SET otp = ?, updated_at = CURRENT_TIMESTAMP
      WHERE email = ? AND id_user = ?
    `;
    const result = await executeQuery(query, [newOTP, email, id_user]);
    return result.affectedRows > 0;
  }

  // Cek apakah ada OTP yang masih aktif untuk email
  static async hasActiveOTP(email) {
    const query = `
      SELECT COUNT(*) as count
      FROM email_verified 
      WHERE email = ? 
      AND created_at >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)
    `;
    const results = await executeQuery(query, [email]);
    return results[0].count > 0;
  }

  // Hapus OTP yang sudah expired (lebih dari 15 menit)
  static async deleteExpiredOTP() {
    const query = `
      DELETE FROM email_verified 
      WHERE created_at < DATE_SUB(NOW(), INTERVAL 15 MINUTE)
    `;
    const result = await executeQuery(query);
    return result.affectedRows;
  }

  // Generate OTP 6 digit
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
  }
}

module.exports = EmailVerifiedModel;