const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs').promises;

class RefundController {
  // Get all refunds with booking details - NO AUTH REQUIRED
  static async getAllRefunds(req, res) {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [refunds] = await connection.execute(`
        SELECT 
          r.*,
          b.id_users,
          b.field_id,
          b.total_price as booking_total_price,
          b.status as booking_status,
          b.created_at as booking_created_at,
          u.name as user_name,
          u.email as user_email,
          f.field_name,
          f.field_type,
          p.place_name,
          p.address as place_address,
          fo.name as field_owner_name
        FROM refunds r
        LEFT JOIN bookings b ON r.id_booking = b.id
        LEFT JOIN users u ON b.id_users = u.id
        LEFT JOIN fields f ON b.field_id = f.id
        LEFT JOIN places p ON f.id_place = p.id
        LEFT JOIN users fo ON p.id_users = fo.id
        ORDER BY r.created_at DESC
      `);

      await connection.end();

      res.json({
        success: true,
        message: 'Data refunds berhasil diambil',
        data: refunds
      });

    } catch (error) {
      console.error('Error getting all refunds:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data refunds',
        error: error.message
      });
    }
  }

  // Get refund by ID - NO AUTH REQUIRED
  static async getRefundById(req, res) {
    try {
      const { id } = req.params;

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [refunds] = await connection.execute(`
        SELECT 
          r.*,
          b.id_users,
          b.field_id,
          b.total_price as booking_total_price,
          b.status as booking_status,
          b.booking_datetime_start,
          b.booking_datetime_end,
          b.order_id,
          u.name as user_name,
          u.email as user_email,
          f.field_name,
          f.field_type,
          f.price_per_hour,
          p.place_name,
          p.address as place_address,
          fo.name as field_owner_name
        FROM refunds r
        LEFT JOIN bookings b ON r.id_booking = b.id
        LEFT JOIN users u ON b.id_users = u.id
        LEFT JOIN fields f ON b.field_id = f.id
        LEFT JOIN places p ON f.id_place = p.id
        LEFT JOIN users fo ON p.id_users = fo.id
        WHERE r.id = ?
      `, [id]);

      if (refunds.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Refund tidak ditemukan'
        });
      }

      await connection.end();

      res.json({
        success: true,
        message: 'Data refund berhasil diambil',
        data: refunds[0]
      });

    } catch (error) {
      console.error('Error getting refund by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data refund',
        error: error.message
      });
    }
  }

  // Get refunds by booking ID - NO AUTH REQUIRED
  static async getRefundsByBookingId(req, res) {
    try {
      const { booking_id } = req.params;

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [refunds] = await connection.execute(`
        SELECT 
          r.*,
          b.total_price as booking_total_price,
          b.status as booking_status,
          b.order_id,
          u.name as user_name,
          u.email as user_email
        FROM refunds r
        LEFT JOIN bookings b ON r.id_booking = b.id
        LEFT JOIN users u ON b.id_users = u.id
        WHERE r.id_booking = ?
        ORDER BY r.created_at DESC
      `, [booking_id]);

      await connection.end();

      res.json({
        success: true,
        message: 'Data refunds untuk booking berhasil diambil',
        data: refunds
      });

    } catch (error) {
      console.error('Error getting refunds by booking ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data refunds',
        error: error.message
      });
    }
  }

  // Create new refund with photo upload - NO AUTH REQUIRED
  static async createRefund(req, res) {
    try {
      const { 
        id_booking,
        total_refund
      } = req.body;

      // Validate required fields
      if (!id_booking || !total_refund) {
        return res.status(400).json({
          success: false,
          message: 'Field yang diperlukan: id_booking, total_refund'
        });
      }

      // Check if file is uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'File photo bukti refund harus diupload'
        });
      }

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Check if booking exists and is cancelled
      const [bookings] = await connection.execute(`
        SELECT * FROM bookings WHERE id = ?
      `, [id_booking]);

      if (bookings.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Booking tidak ditemukan'
        });
      }

      const booking = bookings[0];

      if (booking.status !== 'cancelled') {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: 'Refund hanya dapat dibuat untuk booking yang dibatalkan'
        });
      }

      // Check if refund already exists for this booking
      const [existingRefunds] = await connection.execute(`
        SELECT id FROM refunds WHERE id_booking = ?
      `, [id_booking]);

      if (existingRefunds.length > 0) {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: 'Refund untuk booking ini sudah ada'
        });
      }

      // Validate refund amount
      const refundAmount = parseFloat(total_refund);
      const bookingAmount = parseFloat(booking.total_price);

      if (refundAmount <= 0) {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: 'Total refund harus lebih besar dari 0'
        });
      }

      if (refundAmount > bookingAmount) {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: `Total refund tidak boleh lebih besar dari total booking (${bookingAmount})`
        });
      }

      // Get file path (relative to uploads directory)
      const filePath = `refunds/${req.file.filename}`;

      // Create refund record
      const [refundResult] = await connection.execute(`
        INSERT INTO refunds (
          id_booking,
          total_refund,
          file_photo,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, NOW(), NOW())
      `, [id_booking, refundAmount, filePath]);

      await connection.end();

      res.status(201).json({
        success: true,
        message: 'Refund berhasil dibuat',
        data: {
          refund_id: refundResult.insertId,
          id_booking: id_booking,
          total_refund: refundAmount,
          file_photo: filePath,
          message: 'Refund telah diproses, bukti transfer telah diupload'
        }
      });

    } catch (error) {
      console.error('Error creating refund:', error);
      
      // Delete uploaded file if database operation fails
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting uploaded file:', unlinkError);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Gagal membuat refund',
        error: error.message
      });
    }
  }

  // Update refund (optional - for editing refund details) - NO AUTH REQUIRED
  static async updateRefund(req, res) {
    try {
      const { id } = req.params;
      const { total_refund } = req.body;

      if (!total_refund) {
        return res.status(400).json({
          success: false,
          message: 'total_refund diperlukan'
        });
      }

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Check if refund exists
      const [refunds] = await connection.execute(`
        SELECT r.*, b.total_price as booking_total_price 
        FROM refunds r
        LEFT JOIN bookings b ON r.id_booking = b.id
        WHERE r.id = ?
      `, [id]);

      if (refunds.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Refund tidak ditemukan'
        });
      }

      const refund = refunds[0];
      const refundAmount = parseFloat(total_refund);
      const bookingAmount = parseFloat(refund.booking_total_price);

      // Validate refund amount
      if (refundAmount <= 0) {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: 'Total refund harus lebih besar dari 0'
        });
      }

      if (refundAmount > bookingAmount) {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: `Total refund tidak boleh lebih besar dari total booking (${bookingAmount})`
        });
      }

      let filePath = refund.file_photo;

      // If new file is uploaded, replace the old one
      if (req.file) {
        // Delete old file
        try {
          const oldFilePath = path.join(__dirname, '..', 'uploads', refund.file_photo);
          await fs.unlink(oldFilePath);
        } catch (deleteError) {
          console.log('Old file not found or already deleted:', deleteError.message);
        }

        filePath = `refunds/${req.file.filename}`;
      }

      // Update refund
      await connection.execute(`
        UPDATE refunds 
        SET total_refund = ?, file_photo = ?, updated_at = NOW() 
        WHERE id = ?
      `, [refundAmount, filePath, id]);

      await connection.end();

      res.json({
        success: true,
        message: 'Refund berhasil diupdate',
        data: {
          refund_id: id,
          total_refund: refundAmount,
          file_photo: filePath
        }
      });

    } catch (error) {
      console.error('Error updating refund:', error);

      // Delete uploaded file if database operation fails
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting uploaded file:', unlinkError);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate refund',
        error: error.message
      });
    }
  }

  // Delete refund - NO AUTH REQUIRED
  static async deleteRefund(req, res) {
    try {
      const { id } = req.params;

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Get refund info before deleting
      const [refunds] = await connection.execute(`
        SELECT * FROM refunds WHERE id = ?
      `, [id]);

      if (refunds.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Refund tidak ditemukan'
        });
      }

      const refund = refunds[0];

      // Delete refund record
      await connection.execute(`
        DELETE FROM refunds WHERE id = ?
      `, [id]);

      await connection.end();

      // Delete photo file
      try {
        const filePath = path.join(__dirname, '..', 'uploads', refund.file_photo);
        await fs.unlink(filePath);
      } catch (deleteError) {
        console.log('File not found or already deleted:', deleteError.message);
      }

      res.json({
        success: true,
        message: 'Refund berhasil dihapus',
        data: {
          refund_id: id,
          deleted_file: refund.file_photo
        }
      });

    } catch (error) {
      console.error('Error deleting refund:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus refund',
        error: error.message
      });
    }
  }
}

module.exports = RefundController;