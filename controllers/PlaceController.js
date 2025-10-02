const PlaceModel = require('../models/PlaceModel');
const UserModel = require('../models/UserModel');

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

  // POST /api/places - Membuat place baru (hanya field_owner)
  static async createPlace(req, res) {
    try {
      const { place_name, address, balance, id_users, place_photo_data } = req.body;
      
      // Validasi field wajib
      if (!place_name || !address || !id_users) {
        return res.status(400).json({
          success: false,
          message: 'Data tidak lengkap. place_name, address, dan id_users wajib diisi'
        });
      }

      // Validasi file foto harus diupload
      if (!place_photo_data && !req.file) {
        return res.status(400).json({
          success: false,
          message: 'File foto place wajib diupload'
        });
      }

      // Cek apakah user ada dan memiliki role field_owner
      const user = await UserModel.getById(id_users);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      if (user.role !== 'field_owner') {
        return res.status(403).json({
          success: false,
          message: 'Hanya user dengan role field_owner yang dapat membuat place'
        });
      }

      // Validasi balance harus berupa angka
      const placeBalance = balance ? parseInt(balance) : 0;
      if (isNaN(placeBalance)) {
        return res.status(400).json({
          success: false,
          message: 'Balance harus berupa angka'
        });
      }

      // Gunakan base64 data yang sudah diprocess oleh middleware
      const photoData = place_photo_data || (req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : null);

      const placeData = {
        place_name,
        address,
        balance: placeBalance,
        place_photo: photoData, // Simpan base64 data ke database
        id_users: parseInt(id_users)
      };

      const placeId = await PlaceModel.create(placeData);
      const newPlace = await PlaceModel.getById(placeId);

      // Optional: Cleanup temporary file jika ada
      if (req.body.place_photo_path) {
        try {
          const fs = require('fs');
          if (fs.existsSync(req.body.place_photo_path)) {
            fs.unlinkSync(req.body.place_photo_path);
            console.log(`🧹 Cleaned up temp file: ${req.body.place_photo_filename}`);
          }
        } catch (cleanupError) {
          console.warn('Warning: Could not cleanup temp file:', cleanupError.message);
        }
      }

      res.status(201).json({
        success: true,
        message: 'Place berhasil dibuat',
        data: {
          ...newPlace,
          photo_url: `/uploads/places/place-${placeId}-${Date.now()}.jpg`, // Virtual URL untuk frontend
          photo_preview: photoData.substring(0, 100) + '...' // Preview base64 (first 100 chars)
        }
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

      // Jika ada file foto baru yang diupload, convert ke base64
      if (req.body.place_photo_data || req.file) {
        req.body.place_photo = req.body.place_photo_data || (req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : null);
        
        // Hapus field place_photo_data karena tidak ada di database
        delete req.body.place_photo_data;
        delete req.body.place_photo_filename;
        delete req.body.place_photo_mimetype;
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

  // GET /api/places/search?query=keyword - Search places
  static async searchPlaces(req, res) {
    try {
      const { query } = req.query;
      
      if (!query || query.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Query parameter diperlukan untuk pencarian'
        });
      }

      const places = await PlaceModel.search(query);

      res.json({
        success: true,
        message: 'Pencarian places berhasil',
        data: places,
        total: places.length,
        query: query
      });
    } catch (error) {
      console.error('Error searching places:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mencari places',
        error: error.message
      });
    }
  }

  // GET /api/places/user/:userId/ownership - Cek ownership places
  static async checkOwnership(req, res) {
    try {
      const { userId } = req.params;
      const { placeId } = req.query;
      
      if (!placeId) {
        return res.status(400).json({
          success: false,
          message: 'placeId query parameter diperlukan'
        });
      }

      const isOwned = await PlaceModel.isOwnedByUser(placeId, userId);

      res.json({
        success: true,
        message: 'Pengecekan ownership berhasil',
        data: {
          placeId: parseInt(placeId),
          userId: parseInt(userId),
          isOwned: isOwned
        }
      });
    } catch (error) {
      console.error('Error checking ownership:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengecek ownership',
        error: error.message
      });
    }
  }
}

module.exports = PlaceController;