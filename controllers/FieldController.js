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

  // GET /api/fields/:id - Mendapatkan field berdasarkan ID
  static async getFieldById(req, res) {
    try {
      const { id } = req.params;
      const field = await FieldModel.getById(id);
      
      if (!field) {
        return res.status(404).json({
          success: false,
          message: 'Field tidak ditemukan'
        });
      }

      res.json({
        success: true,
        message: 'Data field berhasil diambil',
        data: field
      });
    } catch (error) {
      console.error('Error getting field by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data field',
        error: error.message
      });
    }
  }

  // POST /api/fields - Membuat field baru
  static async createField(req, res) {
    try {
      const { field_name, opening_time, closing_time, price_per_hour, description, field_type, max_person, id_place } = req.body;
      
      // Validasi field wajib
      if (!field_name || !opening_time || !closing_time || !price_per_hour || !field_type || !max_person || !id_place) {
        return res.status(400).json({
          success: false,
          message: 'Field field_name, opening_time, closing_time, price_per_hour, field_type, max_person, dan id_place wajib diisi'
        });
      }

      const fieldId = await FieldModel.create(req.body);
      const newField = await FieldModel.getById(fieldId);

      res.status(201).json({
        success: true,
        message: 'Field berhasil dibuat',
        data: newField
      });
    } catch (error) {
      console.error('Error creating field:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat field',
        error: error.message
      });
    }
  }

  // PUT /api/fields/:id - Update field
  static async updateField(req, res) {
    try {
      const { id } = req.params;
      
      // Cek apakah field ada
      const existingField = await FieldModel.getById(id);
      if (!existingField) {
        return res.status(404).json({
          success: false,
          message: 'Field tidak ditemukan'
        });
      }

      const updated = await FieldModel.update(id, req.body);
      
      if (!updated) {
        return res.status(500).json({
          success: false,
          message: 'Gagal mengupdate field'
        });
      }

      const updatedField = await FieldModel.getById(id);

      res.json({
        success: true,
        message: 'Field berhasil diupdate',
        data: updatedField
      });
    } catch (error) {
      console.error('Error updating field:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate field',
        error: error.message
      });
    }
  }

  // DELETE /api/fields/:id - Hapus field
  static async deleteField(req, res) {
    try {
      const { id } = req.params;
      
      // Cek apakah field ada
      const existingField = await FieldModel.getById(id);
      if (!existingField) {
        return res.status(404).json({
          success: false,
          message: 'Field tidak ditemukan'
        });
      }

      const deleted = await FieldModel.delete(id);
      
      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: 'Gagal menghapus field'
        });
      }

      res.json({
        success: true,
        message: 'Field berhasil dihapus'
      });
    } catch (error) {
      console.error('Error deleting field:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus field',
        error: error.message
      });
    }
  }

  // GET /api/fields/search/:fieldType - Cari field berdasarkan jenis field
  static async searchByFieldType(req, res) {
    try {
      const { fieldType } = req.params;
      const fields = await FieldModel.getByFieldType(fieldType);
      
      res.json({
        success: true,
        message: `Data field ${fieldType} berhasil diambil`,
        data: fields,
        total: fields.length
      });
    } catch (error) {
      console.error('Error searching fields:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mencari fields',
        error: error.message
      });
    }
  }

  // GET /api/fields/place/:placeId - Mendapatkan fields berdasarkan place ID
  static async getFieldsByPlaceId(req, res) {
    try {
      const { placeId } = req.params;
      const fields = await FieldModel.getByPlaceId(placeId);
      
      res.json({
        success: true,
        message: 'Data fields berhasil diambil',
        data: fields,
        total: fields.length
      });
    } catch (error) {
      console.error('Error getting fields by place ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data fields',
        error: error.message
      });
    }
  }

  // PATCH /api/fields/:id/status - Update status field
  static async updateFieldStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Validasi status
      const validStatuses = ['available', 'not available'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status harus salah satu dari: available, not available'
        });
      }

      // Cek apakah field ada
      const existingField = await FieldModel.getById(id);
      if (!existingField) {
        return res.status(404).json({
          success: false,
          message: 'Field tidak ditemukan'
        });
      }

      const updated = await FieldModel.updateStatus(id, status);
      
      if (!updated) {
        return res.status(500).json({
          success: false,
          message: 'Gagal mengupdate status field'
        });
      }

      const updatedField = await FieldModel.getById(id);

      res.json({
        success: true,
        message: 'Status field berhasil diupdate',
        data: updatedField
      });
    } catch (error) {
      console.error('Error updating field status:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate status field',
        error: error.message
      });
    }
  }

  // POST /api/fields/search - Pencarian fields dengan filter
  static async searchFields(req, res) {
    try {
      const filters = req.body;
      const fields = await FieldModel.searchFields(filters);
      
      res.json({
        success: true,
        message: 'Data fields berhasil diambil',
        data: fields,
        total: fields.length,
        filters: filters
      });
    } catch (error) {
      console.error('Error searching fields with filters:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mencari fields',
        error: error.message
      });
    }
  }

  // GET /api/fields/available/:placeId - Mendapatkan fields yang tersedia berdasarkan place ID
  static async getAvailableFieldsByPlaceId(req, res) {
    try {
      const { placeId } = req.params;
      const fields = await FieldModel.getAvailableByPlaceId(placeId);
      
      res.json({
        success: true,
        message: 'Data fields yang tersedia berhasil diambil',
        data: fields,
        total: fields.length
      });
    } catch (error) {
      console.error('Error getting available fields by place ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data fields yang tersedia',
        error: error.message
      });
    }
  }
}

module.exports = FieldController;