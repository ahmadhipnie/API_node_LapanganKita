const FieldModel = require('../models/FieldModel');

class FieldController {
  // GET /api/fields - Mendapatkan semua fields
  static async getAllFields(req, res) {
    try {
      const fields = await FieldModel.getAll();
      
      res.json({
        success: true,
        message: 'Data fields berhasil diambil',
        data: fields,
        total: fields.length
      });
    } catch (error) {
      console.error('Error getting all fields:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data fields',
        error: error.message
      });
    }
  }

  // GET /api/lapangan/:id - Mendapatkan lapangan berdasarkan ID
  static async getLapanganById(req, res) {
    try {
      const { id } = req.params;
      const lapangan = await LapanganModel.getById(id);
      
      if (!lapangan) {
        return res.status(404).json({
          success: false,
          message: 'Lapangan tidak ditemukan'
        });
      }

      res.json({
        success: true,
        message: 'Data lapangan berhasil diambil',
        data: lapangan
      });
    } catch (error) {
      console.error('Error getting lapangan by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data lapangan',
        error: error.message
      });
    }
  }

  // POST /api/lapangan - Membuat lapangan baru
  static async createLapangan(req, res) {
    try {
      const { nama_lapangan, jenis_olahraga, lokasi, harga_per_jam } = req.body;
      
      // Validasi field wajib
      if (!nama_lapangan || !jenis_olahraga || !lokasi || !harga_per_jam) {
        return res.status(400).json({
          success: false,
          message: 'Field nama_lapangan, jenis_olahraga, lokasi, dan harga_per_jam wajib diisi'
        });
      }

      const lapanganId = await LapanganModel.create(req.body);
      const newLapangan = await LapanganModel.getById(lapanganId);

      res.status(201).json({
        success: true,
        message: 'Lapangan berhasil dibuat',
        data: newLapangan
      });
    } catch (error) {
      console.error('Error creating lapangan:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat lapangan',
        error: error.message
      });
    }
  }

  // PUT /api/lapangan/:id - Update lapangan
  static async updateLapangan(req, res) {
    try {
      const { id } = req.params;
      
      // Cek apakah lapangan ada
      const existingLapangan = await LapanganModel.getById(id);
      if (!existingLapangan) {
        return res.status(404).json({
          success: false,
          message: 'Lapangan tidak ditemukan'
        });
      }

      const updated = await LapanganModel.update(id, req.body);
      
      if (!updated) {
        return res.status(500).json({
          success: false,
          message: 'Gagal mengupdate lapangan'
        });
      }

      const updatedLapangan = await LapanganModel.getById(id);

      res.json({
        success: true,
        message: 'Lapangan berhasil diupdate',
        data: updatedLapangan
      });
    } catch (error) {
      console.error('Error updating lapangan:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate lapangan',
        error: error.message
      });
    }
  }

  // DELETE /api/lapangan/:id - Hapus lapangan
  static async deleteLapangan(req, res) {
    try {
      const { id } = req.params;
      
      // Cek apakah lapangan ada
      const existingLapangan = await LapanganModel.getById(id);
      if (!existingLapangan) {
        return res.status(404).json({
          success: false,
          message: 'Lapangan tidak ditemukan'
        });
      }

      const deleted = await LapanganModel.delete(id);
      
      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: 'Gagal menghapus lapangan'
        });
      }

      res.json({
        success: true,
        message: 'Lapangan berhasil dihapus'
      });
    } catch (error) {
      console.error('Error deleting lapangan:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus lapangan',
        error: error.message
      });
    }
  }

  // GET /api/lapangan/search/:jenisOlahraga - Cari lapangan berdasarkan jenis olahraga
  static async searchByJenisOlahraga(req, res) {
    try {
      const { jenisOlahraga } = req.params;
      const lapangan = await LapanganModel.getByJenisOlahraga(jenisOlahraga);
      
      res.json({
        success: true,
        message: `Data lapangan ${jenisOlahraga} berhasil diambil`,
        data: lapangan,
        total: lapangan.length
      });
    } catch (error) {
      console.error('Error searching lapangan:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mencari lapangan',
        error: error.message
      });
    }
  }
}

module.exports = LapanganController;