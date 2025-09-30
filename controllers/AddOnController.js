const AddOnModel = require('../models/AddOnModel');

class AddOnController {
  // GET /api/add-ons - Mendapatkan semua add-on
  static async getAllAddOn(req, res) {
    try {
      const addOns = await AddOnModel.getAll();
      
      res.json({
        success: true,
        message: 'Data add-ons berhasil diambil',
        data: addOns,
        total: addOns.length
      });
    } catch (error) {
      console.error('Error getting all add-ons:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data add-ons',
        error: error.message
      });
    }
  }

  // GET /api/add-ons/:id - Mendapatkan add-on berdasarkan ID
  static async getAddOnById(req, res) {
    try {
      const { id } = req.params;
      const addOn = await AddOnModel.getById(id);
      
      if (!addOn) {
        return res.status(404).json({
          success: false,
          message: 'Add-on tidak ditemukan'
        });
      }

      res.json({
        success: true,
        message: 'Data add-on berhasil diambil',
        data: addOn
      });
    } catch (error) {
      console.error('Error getting add-on by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data add-on',
        error: error.message
      });
    }
  }

  // POST /api/add-ons - Membuat add-on baru
  static async createAddOn(req, res) {
    try {
      const { name, price, place_id, stock } = req.body;
      
      // Validasi field wajib
      if (!name || !price || !place_id) {
        return res.status(400).json({
          success: false,
          message: 'Field name, price, dan place_id wajib diisi'
        });
      }

      const addOnId = await AddOnModel.create(req.body);
      const newAddOn = await AddOnModel.getById(addOnId);

      res.status(201).json({
        success: true,
        message: 'Add-on berhasil dibuat',
        data: newAddOn
      });
    } catch (error) {
      console.error('Error creating add-on:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat add-on',
        error: error.message
      });
    }
  }

  // PUT /api/add-ons/:id - Update add-on
  static async updateAddOn(req, res) {
    try {
      const { id } = req.params;
      
      // Cek apakah add-on ada
      const existingAddOn = await AddOnModel.getById(id);
      if (!existingAddOn) {
        return res.status(404).json({
          success: false,
          message: 'Add-on tidak ditemukan'
        });
      }

      const updated = await AddOnModel.update(id, req.body);
      
      if (!updated) {
        return res.status(500).json({
          success: false,
          message: 'Gagal mengupdate add-on'
        });
      }

      const updatedAddOn = await AddOnModel.getById(id);

      res.json({
        success: true,
        message: 'Add-on berhasil diupdate',
        data: updatedAddOn
      });
    } catch (error) {
      console.error('Error updating add-on:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate add-on',
        error: error.message
      });
    }
  }

  // DELETE /api/add-ons/:id - Hapus add-on
  static async deleteAddOn(req, res) {
    try {
      const { id } = req.params;
      
      // Cek apakah add-on ada
      const existingAddOn = await AddOnModel.getById(id);
      if (!existingAddOn) {
        return res.status(404).json({
          success: false,
          message: 'Add-on tidak ditemukan'
        });
      }

      const deleted = await AddOnModel.delete(id);
      
      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: 'Gagal menghapus add-on'
        });
      }

      res.json({
        success: true,
        message: 'Add-on berhasil dihapus'
      });
    } catch (error) {
      console.error('Error deleting add-on:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus add-on',
        error: error.message
      });
    }
  }

  // GET /api/add-ons/place/:placeId - Mendapatkan add-on berdasarkan place ID
  static async getAddOnsByPlaceId(req, res) {
    try {
      const { placeId } = req.params;
      const addOns = await AddOnModel.getByPlaceId(placeId);
      
      res.json({
        success: true,
        message: 'Data add-ons berhasil diambil',
        data: addOns,
        total: addOns.length
      });
    } catch (error) {
      console.error('Error getting add-ons by place ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data add-ons',
        error: error.message
      });
    }
  }

  // GET /api/add-ons/available/:placeId - Mendapatkan add-on yang tersedia berdasarkan place ID
  static async getAvailableAddOnsByPlaceId(req, res) {
    try {
      const { placeId } = req.params;
      const addOns = await AddOnModel.getAvailableByPlaceId(placeId);
      
      res.json({
        success: true,
        message: 'Data add-ons yang tersedia berhasil diambil',
        data: addOns,
        total: addOns.length
      });
    } catch (error) {
      console.error('Error getting available add-ons by place ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data add-ons yang tersedia',
        error: error.message
      });
    }
  }

  // PATCH /api/add-ons/:id/stock - Update stock add-on
  static async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { stock } = req.body;
      
      if (stock === undefined || stock < 0) {
        return res.status(400).json({
          success: false,
          message: 'Stock harus berupa angka yang tidak negatif'
        });
      }

      // Cek apakah add-on ada
      const existingAddOn = await AddOnModel.getById(id);
      if (!existingAddOn) {
        return res.status(404).json({
          success: false,
          message: 'Add-on tidak ditemukan'
        });
      }

      const updated = await AddOnModel.updateStock(id, stock);
      
      if (!updated) {
        return res.status(500).json({
          success: false,
          message: 'Gagal mengupdate stock add-on'
        });
      }

      const updatedAddOn = await AddOnModel.getById(id);

      res.json({
        success: true,
        message: 'Stock add-on berhasil diupdate',
        data: updatedAddOn
      });
    } catch (error) {
      console.error('Error updating add-on stock:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate stock add-on',
        error: error.message
      });
    }
  }
}

module.exports = AddOnController;