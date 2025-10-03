const mysql = require('mysql2/promise');
const { deleteFile, getFullPath } = require('../middleware/uploadPlacePhoto');
const path = require('path');

class PlaceController {
  // Get all places
  static async getAllPlaces(req, res) {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [places] = await connection.execute(`
        SELECT p.*, u.name as owner_name, u.email as owner_email 
        FROM places p 
        LEFT JOIN users u ON p.id_users = u.id 
        ORDER BY p.created_at DESC
      `);

      await connection.end();

      res.json({
        success: true,
        message: 'Data places berhasil diambil',
        data: places
      });

    } catch (error) {
      console.error('Error getting places:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data places',
        error: error.message
      });
    }
  }

  // Get place by ID
  static async getPlaceById(req, res) {
    try {
      const { id } = req.params;
      
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [places] = await connection.execute(`
        SELECT p.*, u.name as owner_name, u.email as owner_email 
        FROM places p 
        LEFT JOIN users u ON p.id_users = u.id 
        WHERE p.id = ?
      `, [id]);

      await connection.end();

      if (places.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Place tidak ditemukan'
        });
      }

      res.json({
        success: true,
        message: 'Data place berhasil diambil',
        data: places[0]
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

  // Create new place
  static async createPlace(req, res) {
    try {
      const { place_name, address, balance, id_users } = req.body;
      
      // Validasi required fields
      if (!place_name || !address || !id_users) {
        return res.status(400).json({
          success: false,
          message: 'place_name, address, dan id_users wajib diisi'
        });
      }

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Cek apakah user exists
      const [users] = await connection.execute(
        'SELECT id FROM users WHERE id = ?',
        [id_users]
      );

      if (users.length === 0) {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      // Insert place baru
      const photoPath = req.file ? `/uploads/places/${req.file.filename}` : null;
      
      const [result] = await connection.execute(`
        INSERT INTO places (place_name, address, balance, place_photo, id_users, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        place_name,
        address,
        balance || 0,
        photoPath,
        id_users
      ]);

      // Get data place yang baru dibuat
      const [newPlace] = await connection.execute(`
        SELECT p.*, u.name as owner_name, u.email as owner_email 
        FROM places p 
        LEFT JOIN users u ON p.id_users = u.id 
        WHERE p.id = ?
      `, [result.insertId]);

      await connection.end();

      res.status(201).json({
        success: true,
        message: 'Place berhasil dibuat',
        data: newPlace[0]
      });

    } catch (error) {
      console.error('Error creating place:', error);
      
      // Delete uploaded file jika ada error
      if (req.file) {
        deleteFile(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        message: 'Gagal membuat place',
        error: error.message
      });
    }
  }

  // Update place
  static async updatePlace(req, res) {
    try {
      const { id } = req.params;
      const { place_name, address, balance, id_users } = req.body;

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Cek apakah place exists
      const [existingPlace] = await connection.execute(
        'SELECT * FROM places WHERE id = ?',
        [id]
      );

      if (existingPlace.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Place tidak ditemukan'
        });
      }

      // Jika ada file baru yang diupload, hapus file lama
      if (req.file && existingPlace[0].place_photo) {
        const oldFilePath = getFullPath(existingPlace[0].place_photo);
        if (oldFilePath) {
          deleteFile(oldFilePath);
        }
      }

      // Update place
      const updateFields = [];
      const updateValues = [];

      if (place_name) {
        updateFields.push('place_name = ?');
        updateValues.push(place_name);
      }
      if (address) {
        updateFields.push('address = ?');
        updateValues.push(address);
      }
      if (balance !== undefined) {
        updateFields.push('balance = ?');
        updateValues.push(balance);
      }
      if (id_users) {
        updateFields.push('id_users = ?');
        updateValues.push(id_users);
      }
      if (req.file) {
        updateFields.push('place_photo = ?');
        updateValues.push(`/uploads/places/${req.file.filename}`);
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(id);

      if (updateFields.length > 1) { // > 1 karena updated_at selalu ada
        const updateQuery = `UPDATE places SET ${updateFields.join(', ')} WHERE id = ?`;
        await connection.execute(updateQuery, updateValues);
      }

      // Get updated place data
      const [updatedPlace] = await connection.execute(`
        SELECT p.*, u.name as owner_name, u.email as owner_email 
        FROM places p 
        LEFT JOIN users u ON p.id_users = u.id 
        WHERE p.id = ?
      `, [id]);

      await connection.end();

      res.json({
        success: true,
        message: 'Place berhasil diupdate',
        data: updatedPlace[0]
      });

    } catch (error) {
      console.error('Error updating place:', error);
      
      // Delete uploaded file jika ada error
      if (req.file) {
        deleteFile(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate place',
        error: error.message
      });
    }
  }

  // Delete place
  static async deletePlace(req, res) {
    try {
      const { id } = req.params;

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Get place data untuk hapus file foto
      const [place] = await connection.execute(
        'SELECT * FROM places WHERE id = ?',
        [id]
      );

      if (place.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Place tidak ditemukan'
        });
      }

      // Delete place
      await connection.execute('DELETE FROM places WHERE id = ?', [id]);

      await connection.end();

      // Hapus file foto jika ada
      if (place[0].place_photo) {
        const filePath = getFullPath(place[0].place_photo);
        if (filePath) {
          deleteFile(filePath);
        }
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

  // Get places by owner (user_id)
  static async getPlacesByOwner(req, res) {
    try {
      const { id_users } = req.params;

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [places] = await connection.execute(`
        SELECT p.*, u.name as owner_name, u.email as owner_email 
        FROM places p 
        LEFT JOIN users u ON p.id_users = u.id 
        WHERE p.id_users = ? 
        ORDER BY p.created_at DESC
      `, [id_users]);

      await connection.end();

      res.json({
        success: true,
        message: 'Data places berhasil diambil',
        data: places
      });

    } catch (error) {
      console.error('Error getting places by owner:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data places',
        error: error.message
      });
    }
  }

  // Search places
  static async searchPlaces(req, res) {
    try {
      const { q } = req.query; // query parameter
      
      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Parameter pencarian (q) diperlukan'
        });
      }

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [places] = await connection.execute(`
        SELECT p.*, u.name as owner_name, u.email as owner_email 
        FROM places p 
        LEFT JOIN users u ON p.id_users = u.id 
        WHERE p.place_name LIKE ? OR p.address LIKE ?
        ORDER BY p.created_at DESC
      `, [`%${q}%`, `%${q}%`]);

      await connection.end();

      res.json({
        success: true,
        message: 'Pencarian berhasil',
        data: places,
        query: q
      });

    } catch (error) {
      console.error('Error searching places:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal melakukan pencarian',
        error: error.message
      });
    }
  }
}

module.exports = PlaceController;