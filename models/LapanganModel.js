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

  // Mendapatkan lapangan berdasarkan ID
  static async getById(id) {
    const query = `
      SELECT id, nama_lapangan, jenis_olahraga, lokasi, harga_per_jam, 
             deskripsi, fasilitas, gambar_url, status, created_at, updated_at
      FROM lapangan 
      WHERE id = ?
    `;
    const results = await executeQuery(query, [id]);
    return results[0];
  }

  // Membuat lapangan baru
  static async create(data) {
    const query = `
      INSERT INTO lapangan (nama_lapangan, jenis_olahraga, lokasi, harga_per_jam, 
                           deskripsi, fasilitas, gambar_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const { nama_lapangan, jenis_olahraga, lokasi, harga_per_jam, deskripsi, fasilitas, gambar_url, status } = data;
    const result = await executeQuery(query, [
      nama_lapangan, jenis_olahraga, lokasi, harga_per_jam, 
      deskripsi, fasilitas, gambar_url, status || 'tersedia'
    ]);
    return result.insertId;
  }

  // Update lapangan
  static async update(id, data) {
    const query = `
      UPDATE lapangan 
      SET nama_lapangan = ?, jenis_olahraga = ?, lokasi = ?, harga_per_jam = ?,
          deskripsi = ?, fasilitas = ?, gambar_url = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const { nama_lapangan, jenis_olahraga, lokasi, harga_per_jam, deskripsi, fasilitas, gambar_url, status } = data;
    const result = await executeQuery(query, [
      nama_lapangan, jenis_olahraga, lokasi, harga_per_jam,
      deskripsi, fasilitas, gambar_url, status, id
    ]);
    return result.affectedRows > 0;
  }

  // Hapus lapangan
  static async delete(id) {
    const query = 'DELETE FROM lapangan WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result.affectedRows > 0;
  }

  // Cari lapangan berdasarkan jenis olahraga
  static async getByJenisOlahraga(jenisOlahraga) {
    const query = `
      SELECT id, nama_lapangan, jenis_olahraga, lokasi, harga_per_jam, 
             deskripsi, fasilitas, gambar_url, status, created_at, updated_at
      FROM lapangan 
      WHERE jenis_olahraga LIKE ? AND status = 'tersedia'
      ORDER BY harga_per_jam ASC
    `;
    return await executeQuery(query, [`%${jenisOlahraga}%`]);
  }
}

module.exports = LapanganModel;