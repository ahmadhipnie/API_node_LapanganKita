const mysql = require('mysql2/promise');

class RatingController {
  // Create rating - NO AUTH REQUIRED
  static async createRating(req, res) {
    try {
      const { id_booking, rating_value, review } = req.body;

      // Validate required fields
      if (!id_booking || !rating_value || !review) {
        return res.status(400).json({
          success: false,
          message: 'Field yang diperlukan: id_booking, rating_value, review'
        });
      }

      // Validate rating value (1-5)
      if (rating_value < 1 || rating_value > 5 || !Number.isInteger(rating_value)) {
        return res.status(400).json({
          success: false,
          message: 'rating_value harus berupa integer antara 1-5'
        });
      }

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Check if booking exists and is completed
      const [bookings] = await connection.execute(`
        SELECT 
          b.*,
          u.name as user_name,
          f.field_name,
          p.place_name
        FROM bookings b
        LEFT JOIN users u ON b.id_users = u.id
        LEFT JOIN fields f ON b.field_id = f.id
        LEFT JOIN places p ON f.id_place = p.id
        WHERE b.id = ?
      `, [id_booking]);

      if (bookings.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Booking tidak ditemukan'
        });
      }

      const booking = bookings[0];

      // Check if booking status is completed
      if (booking.status !== 'completed') {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: 'Rating hanya dapat ditambahkan untuk booking yang sudah completed'
        });
      }

      // Check if rating already exists for this booking
      const [existingRating] = await connection.execute(`
        SELECT id FROM rating WHERE id_booking = ?
      `, [id_booking]);

      if (existingRating.length > 0) {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: 'Rating sudah pernah diberikan untuk booking ini. Satu booking hanya dapat dirating satu kali.'
        });
      }

      // Create rating
      const [result] = await connection.execute(`
        INSERT INTO rating (
          id_booking,
          rating_value,
          review,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, NOW(), NOW())
      `, [id_booking, rating_value, review]);

      await connection.end();

      res.status(201).json({
        success: true,
        message: 'Rating berhasil ditambahkan',
        data: {
          rating_id: result.insertId,
          id_booking: id_booking,
          rating_value: rating_value,
          review: review,
          booking_info: {
            user_name: booking.user_name,
            field_name: booking.field_name,
            place_name: booking.place_name,
            booking_date: booking.booking_datetime_start
          }
        }
      });

    } catch (error) {
      console.error('Error creating rating:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menambahkan rating',
        error: error.message
      });
    }
  }

  // Get all ratings with booking details - NO AUTH REQUIRED
  static async getAllRatings(req, res) {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [ratings] = await connection.execute(`
        SELECT 
          r.*,
          b.booking_datetime_start,
          b.booking_datetime_end,
          b.total_price,
          u.name as user_name,
          u.email as user_email,
          f.field_name,
          f.field_type,
          p.place_name,
          p.address as place_address,
          fo.name as field_owner_name
        FROM rating r
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
        message: 'Data ratings berhasil diambil',
        count: ratings.length,
        data: ratings
      });

    } catch (error) {
      console.error('Error getting all ratings:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data ratings',
        error: error.message
      });
    }
  }

  // Get rating by ID with booking details - NO AUTH REQUIRED
  static async getRatingById(req, res) {
    try {
      const { id } = req.params;

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [ratings] = await connection.execute(`
        SELECT 
          r.*,
          b.booking_datetime_start,
          b.booking_datetime_end,
          b.total_price,
          u.name as user_name,
          u.email as user_email,
          f.field_name,
          f.field_type,
          p.place_name,
          p.address as place_address,
          fo.name as field_owner_name
        FROM rating r
        LEFT JOIN bookings b ON r.id_booking = b.id
        LEFT JOIN users u ON b.id_users = u.id
        LEFT JOIN fields f ON b.field_id = f.id
        LEFT JOIN places p ON f.id_place = p.id
        LEFT JOIN users fo ON p.id_users = fo.id
        WHERE r.id = ?
      `, [id]);

      if (ratings.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Rating tidak ditemukan'
        });
      }

      await connection.end();

      res.json({
        success: true,
        message: 'Data rating berhasil diambil',
        data: ratings[0]
      });

    } catch (error) {
      console.error('Error getting rating by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data rating',
        error: error.message
      });
    }
  }

  // Get ratings by booking ID - NO AUTH REQUIRED
  static async getRatingByBookingId(req, res) {
    try {
      const { booking_id } = req.params;

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [ratings] = await connection.execute(`
        SELECT 
          r.*,
          b.booking_datetime_start,
          b.booking_datetime_end,
          b.total_price,
          u.name as user_name,
          u.email as user_email,
          f.field_name,
          f.field_type,
          p.place_name,
          p.address as place_address,
          fo.name as field_owner_name
        FROM rating r
        LEFT JOIN bookings b ON r.id_booking = b.id
        LEFT JOIN users u ON b.id_users = u.id
        LEFT JOIN fields f ON b.field_id = f.id
        LEFT JOIN places p ON f.id_place = p.id
        LEFT JOIN users fo ON p.id_users = fo.id
        WHERE r.id_booking = ?
      `, [booking_id]);

      await connection.end();

      res.json({
        success: true,
        message: 'Data rating berhasil diambil',
        data: ratings.length > 0 ? ratings[0] : null
      });

    } catch (error) {
      console.error('Error getting rating by booking ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data rating',
        error: error.message
      });
    }
  }

  // Get ratings by user ID - NO AUTH REQUIRED
  static async getRatingsByUserId(req, res) {
    try {
      const { user_id } = req.query;

      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'user_id parameter diperlukan'
        });
      }

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [ratings] = await connection.execute(`
        SELECT 
          r.*,
          b.booking_datetime_start,
          b.booking_datetime_end,
          b.total_price,
          f.field_name,
          f.field_type,
          p.place_name,
          p.address as place_address,
          fo.name as field_owner_name
        FROM rating r
        LEFT JOIN bookings b ON r.id_booking = b.id
        LEFT JOIN fields f ON b.field_id = f.id
        LEFT JOIN places p ON f.id_place = p.id
        LEFT JOIN users fo ON p.id_users = fo.id
        WHERE b.id_users = ?
        ORDER BY r.created_at DESC
      `, [user_id]);

      await connection.end();

      res.json({
        success: true,
        message: 'Data ratings user berhasil diambil',
        count: ratings.length,
        data: ratings
      });

    } catch (error) {
      console.error('Error getting ratings by user ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data ratings user',
        error: error.message
      });
    }
  }

  // Get ratings by field owner ID - NO AUTH REQUIRED
  static async getRatingsByFieldOwnerId(req, res) {
    try {
      const { owner_id } = req.query;

      if (!owner_id) {
        return res.status(400).json({
          success: false,
          message: 'owner_id parameter diperlukan'
        });
      }

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [ratings] = await connection.execute(`
        SELECT 
          r.*,
          b.booking_datetime_start,
          b.booking_datetime_end,
          b.total_price,
          u.name as user_name,
          u.email as user_email,
          f.field_name,
          f.field_type,
          p.place_name,
          p.address as place_address
        FROM rating r
        LEFT JOIN bookings b ON r.id_booking = b.id
        LEFT JOIN users u ON b.id_users = u.id
        LEFT JOIN fields f ON b.field_id = f.id
        LEFT JOIN places p ON f.id_place = p.id
        WHERE p.id_users = ?
        ORDER BY r.created_at DESC
      `, [owner_id]);

      await connection.end();

      res.json({
        success: true,
        message: 'Data ratings field owner berhasil diambil',
        count: ratings.length,
        data: ratings
      });

    } catch (error) {
      console.error('Error getting ratings by field owner ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data ratings field owner',
        error: error.message
      });
    }
  }

  // Update rating - NO AUTH REQUIRED
  static async updateRating(req, res) {
    try {
      const { id } = req.params;
      const { rating_value, review } = req.body;

      // Validate rating value if provided
      if (rating_value !== undefined && (rating_value < 1 || rating_value > 5 || !Number.isInteger(rating_value))) {
        return res.status(400).json({
          success: false,
          message: 'rating_value harus berupa integer antara 1-5'
        });
      }

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Check if rating exists
      const [existingRating] = await connection.execute(`
        SELECT id FROM rating WHERE id = ?
      `, [id]);

      if (existingRating.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Rating tidak ditemukan'
        });
      }

      // Build update query dynamically
      let updateFields = [];
      let updateValues = [];

      if (rating_value !== undefined) {
        updateFields.push('rating_value = ?');
        updateValues.push(rating_value);
      }

      if (review !== undefined) {
        updateFields.push('review = ?');
        updateValues.push(review);
      }

      if (updateFields.length === 0) {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: 'Tidak ada field yang akan diupdate'
        });
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(id);

      // Update rating
      await connection.execute(`
        UPDATE rating 
        SET ${updateFields.join(', ')} 
        WHERE id = ?
      `, updateValues);

      // Get updated rating data
      const [updatedRating] = await connection.execute(`
        SELECT 
          r.*,
          b.booking_datetime_start,
          u.name as user_name,
          f.field_name,
          p.place_name
        FROM rating r
        LEFT JOIN bookings b ON r.id_booking = b.id
        LEFT JOIN users u ON b.id_users = u.id
        LEFT JOIN fields f ON b.field_id = f.id
        LEFT JOIN places p ON f.id_place = p.id
        WHERE r.id = ?
      `, [id]);

      await connection.end();

      res.json({
        success: true,
        message: 'Rating berhasil diupdate',
        data: updatedRating[0]
      });

    } catch (error) {
      console.error('Error updating rating:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate rating',
        error: error.message
      });
    }
  }

  // Delete rating - NO AUTH REQUIRED
  static async deleteRating(req, res) {
    try {
      const { id } = req.params;

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Check if rating exists
      const [existingRating] = await connection.execute(`
        SELECT r.*, b.id as booking_id FROM rating r
        LEFT JOIN bookings b ON r.id_booking = b.id
        WHERE r.id = ?
      `, [id]);

      if (existingRating.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Rating tidak ditemukan'
        });
      }

      // Delete rating
      await connection.execute(`
        DELETE FROM rating WHERE id = ?
      `, [id]);

      await connection.end();

      res.json({
        success: true,
        message: 'Rating berhasil dihapus',
        data: {
          deleted_rating_id: id,
          id_booking: existingRating[0].id_booking
        }
      });

    } catch (error) {
      console.error('Error deleting rating:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus rating',
        error: error.message
      });
    }
  }

  // Get rating statistics by place - NO AUTH REQUIRED
  static async getRatingStatsByPlace(req, res) {
    try {
      const { place_id } = req.params;

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Get rating statistics
      const [stats] = await connection.execute(`
        SELECT 
          COUNT(*) as total_ratings,
          AVG(r.rating_value) as average_rating,
          MIN(r.rating_value) as min_rating,
          MAX(r.rating_value) as max_rating,
          p.place_name,
          p.address
        FROM rating r
        LEFT JOIN bookings b ON r.id_booking = b.id
        LEFT JOIN fields f ON b.field_id = f.id
        LEFT JOIN places p ON f.id_place = p.id
        WHERE p.id = ?
        GROUP BY p.id, p.place_name, p.address
      `, [place_id]);

      // Get rating distribution
      const [distribution] = await connection.execute(`
        SELECT 
          r.rating_value,
          COUNT(*) as count
        FROM rating r
        LEFT JOIN bookings b ON r.id_booking = b.id
        LEFT JOIN fields f ON b.field_id = f.id
        LEFT JOIN places p ON f.id_place = p.id
        WHERE p.id = ?
        GROUP BY r.rating_value
        ORDER BY r.rating_value DESC
      `, [place_id]);

      await connection.end();

      if (stats.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Place tidak ditemukan atau belum ada rating'
        });
      }

      res.json({
        success: true,
        message: 'Statistik rating berhasil diambil',
        data: {
          place_info: {
            place_name: stats[0].place_name,
            address: stats[0].address
          },
          statistics: {
            total_ratings: stats[0].total_ratings,
            average_rating: parseFloat(stats[0].average_rating).toFixed(2),
            min_rating: stats[0].min_rating,
            max_rating: stats[0].max_rating
          },
          distribution: distribution
        }
      });

    } catch (error) {
      console.error('Error getting rating statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil statistik rating',
        error: error.message
      });
    }
  }
}

module.exports = RatingController;