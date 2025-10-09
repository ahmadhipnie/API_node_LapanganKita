const mysql = require('mysql2/promise');
const { deletePromosiFile } = require('../middleware/uploadPromosi');

class PromosiController {
  // Create promosi - NO AUTH REQUIRED
  static async createPromosi(req, res) {
    try {
      const file_photo = req.body.file_photo; // Set by upload middleware

      // Validate required fields
      if (!file_photo) {
        return res.status(400).json({
          success: false,
          message: 'File foto diperlukan untuk promosi'
        });
      }

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Create promosi record
      const [result] = await connection.execute(`
        INSERT INTO promosi (
          file_photo,
          created_at,
          updated_at
        ) VALUES (?, NOW(), NOW())
      `, [file_photo]);

      await connection.end();

      res.status(201).json({
        success: true,
        message: 'Promosi berhasil dibuat',
        data: {
          promosi_id: result.insertId,
          file_photo: file_photo,
          file_photo_url: `${req.protocol}://${req.get('host')}/${file_photo}`,
          created_at: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error creating promosi:', error);
      // Delete uploaded file if database operation fails
      if (req.body.file_photo) {
        deletePromosiFile(req.body.file_photo);
      }
      res.status(500).json({
        success: false,
        message: 'Gagal membuat promosi',
        error: error.message
      });
    }
  }

  // Get all promosi for image slider - NO AUTH REQUIRED
  static async getAllPromosi(req, res) {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [promosi] = await connection.execute(`
        SELECT 
          id,
          file_photo,
          created_at,
          updated_at
        FROM promosi
        ORDER BY created_at DESC
      `);

      // Add full URL for each image
      const promosiWithFullUrl = promosi.map(item => ({
        ...item,
        file_photo_url: `${req.protocol}://${req.get('host')}/${item.file_photo}`
      }));

      await connection.end();

      res.json({
        success: true,
        message: 'Data promosi berhasil diambil',
        count: promosi.length,
        data: promosiWithFullUrl
      });

    } catch (error) {
      console.error('Error getting all promosi:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data promosi',
        error: error.message
      });
    }
  }

  // Get promosi by ID - NO AUTH REQUIRED
  static async getPromosiById(req, res) {
    try {
      const { id } = req.params;

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [promosi] = await connection.execute(`
        SELECT 
          id,
          file_photo,
          created_at,
          updated_at
        FROM promosi
        WHERE id = ?
      `, [id]);

      if (promosi.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Promosi tidak ditemukan'
        });
      }

      // Add full URL for file_photo
      const promosiItem = {
        ...promosi[0],
        file_photo_url: `${req.protocol}://${req.get('host')}/${promosi[0].file_photo}`
      };

      await connection.end();

      res.json({
        success: true,
        message: 'Data promosi berhasil diambil',
        data: promosiItem
      });

    } catch (error) {
      console.error('Error getting promosi by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data promosi',
        error: error.message
      });
    }
  }

  // Update promosi (replace image) - NO AUTH REQUIRED
  static async updatePromosi(req, res) {
    try {
      const { id } = req.params;
      const new_file_photo = req.body.file_photo; // Set by upload middleware

      if (!new_file_photo) {
        return res.status(400).json({
          success: false,
          message: 'File foto baru diperlukan untuk update promosi'
        });
      }

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Get existing promosi data
      const [existingPromosi] = await connection.execute(`
        SELECT * FROM promosi WHERE id = ?
      `, [id]);

      if (existingPromosi.length === 0) {
        await connection.end();
        deletePromosiFile(new_file_photo); // Delete newly uploaded file
        return res.status(404).json({
          success: false,
          message: 'Promosi tidak ditemukan'
        });
      }

      const old_file_photo = existingPromosi[0].file_photo;

      // Update promosi with new image
      await connection.execute(`
        UPDATE promosi 
        SET file_photo = ?, updated_at = NOW() 
        WHERE id = ?
      `, [new_file_photo, id]);

      // Get updated promosi data
      const [updatedPromosi] = await connection.execute(`
        SELECT * FROM promosi WHERE id = ?
      `, [id]);

      await connection.end();

      // Delete old file after successful database update
      deletePromosiFile(old_file_photo);

      // Add full URL for file_photo
      const promosiItem = {
        ...updatedPromosi[0],
        file_photo_url: `${req.protocol}://${req.get('host')}/${updatedPromosi[0].file_photo}`
      };

      res.json({
        success: true,
        message: 'Promosi berhasil diupdate',
        data: promosiItem
      });

    } catch (error) {
      console.error('Error updating promosi:', error);
      // Delete newly uploaded file if database operation fails
      if (req.body.file_photo) {
        deletePromosiFile(req.body.file_photo);
      }
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate promosi',
        error: error.message
      });
    }
  }

  // Delete promosi - NO AUTH REQUIRED
  static async deletePromosi(req, res) {
    try {
      const { id } = req.params;

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Get promosi data before deletion
      const [existingPromosi] = await connection.execute(`
        SELECT * FROM promosi WHERE id = ?
      `, [id]);

      if (existingPromosi.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Promosi tidak ditemukan'
        });
      }

      const promosi = existingPromosi[0];

      // Delete promosi record
      await connection.execute(`
        DELETE FROM promosi WHERE id = ?
      `, [id]);

      await connection.end();

      // Delete associated file
      deletePromosiFile(promosi.file_photo);

      res.json({
        success: true,
        message: 'Promosi berhasil dihapus',
        data: {
          deleted_promosi_id: id,
          deleted_file: promosi.file_photo
        }
      });

    } catch (error) {
      console.error('Error deleting promosi:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus promosi',
        error: error.message
      });
    }
  }

  // Get promosi images for Android slider (optimized endpoint) - NO AUTH REQUIRED
  static async getPromosiForSlider(req, res) {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [promosi] = await connection.execute(`
        SELECT 
          id,
          file_photo,
          created_at
        FROM promosi
        ORDER BY created_at DESC
      `);

      // Optimized response for mobile app - only essential data
      const sliderImages = promosi.map(item => ({
        id: item.id,
        image_url: `${req.protocol}://${req.get('host')}/${item.file_photo}`,
        created_at: item.created_at
      }));

      await connection.end();

      res.json({
        success: true,
        message: 'Slider images berhasil diambil',
        count: sliderImages.length,
        images: sliderImages
      });

    } catch (error) {
      console.error('Error getting slider images:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil slider images',
        error: error.message
      });
    }
  }

  // Bulk upload promosi (for admin) - NO AUTH REQUIRED
  static async bulkUploadPromosi(req, res) {
    try {
      // This endpoint expects multiple files to be uploaded via multiple requests
      // It's a placeholder for future bulk upload functionality
      res.status(501).json({
        success: false,
        message: 'Bulk upload belum diimplementasikan. Gunakan create promosi satu per satu.',
        suggestion: 'POST /api/promosi untuk setiap gambar promosi'
      });
    } catch (error) {
      console.error('Error bulk upload promosi:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal bulk upload promosi',
        error: error.message
      });
    }
  }

  // Get promosi count - NO AUTH REQUIRED
  static async getPromosiCount(req, res) {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [result] = await connection.execute(`
        SELECT COUNT(*) as total_promosi FROM promosi
      `);

      await connection.end();

      res.json({
        success: true,
        message: 'Jumlah promosi berhasil diambil',
        data: {
          total_promosi: result[0].total_promosi
        }
      });

    } catch (error) {
      console.error('Error getting promosi count:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil jumlah promosi',
        error: error.message
      });
    }
  }
}

module.exports = PromosiController;