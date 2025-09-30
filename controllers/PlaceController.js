const PlaceModel = require('../models/PlaceModel');

class PlaceController {
  // GET /api/places - Mendapatkan semua places
  static async getAllPlaces(req, res) {
    try {
      const places = await PlaceModel.getAll();
      
      res.json({
        success: true,
        message: 'Data places berhasil diambil',
        data: places,
        total: places.length
      });
    } catch (error) {
      console.error('Error getting all places:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data places',
        error: error.message
      });
    }
  }

  // GET /api/places/:id - Mendapatkan place berdasarkan ID
  static async getPlaceById(req, res) {
    try {
      const { id } = req.params;
      const place = await PlaceModel.getById(id);
      
      if (!place) {
        return res.status(404).json({
          success: false,
          message: 'Place tidak ditemukan'
        });
      }

      res.json({
        success: true,
        message: 'Data place berhasil diambil',
        data: place
      });
    } catch (error) {
      console.error('Error getting place by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data place',
        error: error.message
      });
    }
  }

  // POST /api/places - Membuat place baru
  static async createPlace(req, res) {
    try {
      const { place_name, address, place_photo, id_users } = req.body;
      
      // Validasi field wajib
      if (!place_name || !address || !place_photo || !id_users) {
        return res.status(400).json({
          success: false,
          message: 'Field place_name, address, place_photo, dan id_users wajib diisi'
        });
      }

      const placeId = await PlaceModel.create(req.body);
      const newPlace = await PlaceModel.getById(placeId);

      res.status(201).json({
        success: true,
        message: 'Place berhasil dibuat',
        data: newPlace
      });
    } catch (error) {
      console.error('Error creating place:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat place',
        error: error.message
      });
    }
  }

  // PUT /api/places/:id - Update place
  static async updatePlace(req, res) {
    try {
      const { id } = req.params;
      
      // Cek apakah place ada
      const existingPlace = await PlaceModel.getById(id);
      if (!existingPlace) {
        return res.status(404).json({
          success: false,
          message: 'Place tidak ditemukan'
        });
      }

      const updated = await PlaceModel.update(id, req.body);
      
      if (!updated) {
        return res.status(500).json({
          success: false,
          message: 'Gagal mengupdate place'
        });
      }

      const updatedPlace = await PlaceModel.getById(id);

      res.json({
        success: true,
        message: 'Place berhasil diupdate',
        data: updatedPlace
      });
    } catch (error) {
      console.error('Error updating place:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate place',
        error: error.message
      });
    }
  }

  // DELETE /api/places/:id - Hapus place
  static async deletePlace(req, res) {
    try {
      const { id } = req.params;
      
      // Cek apakah place ada
      const existingPlace = await PlaceModel.getById(id);
      if (!existingPlace) {
        return res.status(404).json({
          success: false,
          message: 'Place tidak ditemukan'
        });
      }

      const deleted = await PlaceModel.delete(id);
      
      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: 'Gagal menghapus place'
        });
      }

      res.json({
        success: true,
        message: 'Place berhasil dihapus'
      });
    } catch (error) {
      console.error('Error deleting place:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus place',
        error: error.message
      });
    }
  }

  // GET /api/places/owner/:ownerId - Mendapatkan places berdasarkan owner ID
  static async getPlacesByOwnerId(req, res) {
    try {
      const { ownerId } = req.params;
      const places = await PlaceModel.getByOwnerId(ownerId);
      
      res.json({
        success: true,
        message: 'Data places berhasil diambil',
        data: places,
        total: places.length
      });
    } catch (error) {
      console.error('Error getting places by owner ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data places',
        error: error.message
      });
    }
  }

  // PATCH /api/places/:id/balance - Update balance place
  static async updateBalance(req, res) {
    try {
      const { id } = req.params;
      const { balance } = req.body;
      
      if (balance === undefined || balance < 0) {
        return res.status(400).json({
          success: false,
          message: 'Balance harus diisi dan tidak boleh negatif'
        });
      }

      // Cek apakah place ada
      const existingPlace = await PlaceModel.getById(id);
      if (!existingPlace) {
        return res.status(404).json({
          success: false,
          message: 'Place tidak ditemukan'
        });
      }

      const updated = await PlaceModel.updateBalance(id, balance);
      
      if (!updated) {
        return res.status(500).json({
          success: false,
          message: 'Gagal mengupdate balance'
        });
      }

      const updatedPlace = await PlaceModel.getById(id);

      res.json({
        success: true,
        message: 'Balance berhasil diupdate',
        data: updatedPlace
      });
    } catch (error) {
      console.error('Error updating balance:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate balance',
        error: error.message
      });
    }
  }
}

module.exports = PlaceController;