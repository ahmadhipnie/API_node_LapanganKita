const mysql = require('mysql2/promise');

class JoinedController {
  // Get all join requests with details - NO AUTH REQUIRED
  static async getAllJoinRequests(req, res) {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [joinRequests] = await connection.execute(`
        SELECT 
          j.*,
          u.name as joiner_name,
          u.email as joiner_email,
          b.booking_datetime_start,
          b.booking_datetime_end,
          b.id_users as poster_user_id,
          pu.name as poster_name,
          f.field_name,
          f.field_type,
          f.max_person,
          pl.place_name,
          p.post_title,
          (SELECT COUNT(*) FROM joined jr WHERE jr.id_booking = b.id AND jr.status = 'approved') as current_joined_count
        FROM joined j
        LEFT JOIN users u ON j.id_users = u.id
        LEFT JOIN bookings b ON j.id_booking = b.id
        LEFT JOIN users pu ON b.id_users = pu.id
        LEFT JOIN fields f ON b.field_id = f.id
        LEFT JOIN places pl ON f.id_place = pl.id
        LEFT JOIN post p ON p.id_booking = b.id
        ORDER BY j.created_at DESC
      `);

      await connection.end();

      res.json({
        success: true,
        message: 'Data join requests berhasil diambil',
        data: joinRequests
      });

    } catch (error) {
      console.error('Error getting all join requests:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data join requests',
        error: error.message
      });
    }
  }

  // Get join requests by booking ID - NO AUTH REQUIRED
  static async getJoinRequestsByBookingId(req, res) {
    try {
      const { booking_id } = req.params;

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [joinRequests] = await connection.execute(`
        SELECT 
          j.*,
          u.name as joiner_name,
          u.email as joiner_email,
          u.gender,
          u.date_of_birth
        FROM joined j
        LEFT JOIN users u ON j.id_users = u.id
        WHERE j.id_booking = ?
        ORDER BY j.created_at DESC
      `, [booking_id]);

      await connection.end();

      res.json({
        success: true,
        message: 'Data join requests untuk booking berhasil diambil',
        data: joinRequests
      });

    } catch (error) {
      console.error('Error getting join requests by booking ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data join requests',
        error: error.message
      });
    }
  }

  // Get join requests by user ID - NO AUTH REQUIRED
  static async getJoinRequestsByUserId(req, res) {
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

      const [joinRequests] = await connection.execute(`
        SELECT 
          j.*,
          b.booking_datetime_start,
          b.booking_datetime_end,
          b.id_users as poster_user_id,
          pu.name as poster_name,
          f.field_name,
          f.field_type,
          f.max_person,
          pl.place_name,
          pl.address as place_address,
          p.post_title,
          p.post_description,
          (SELECT COUNT(*) FROM joined jr WHERE jr.id_booking = b.id AND jr.status = 'approved') as current_joined_count
        FROM joined j
        LEFT JOIN bookings b ON j.id_booking = b.id
        LEFT JOIN users pu ON b.id_users = pu.id
        LEFT JOIN fields f ON b.field_id = f.id
        LEFT JOIN places pl ON f.id_place = pl.id
        LEFT JOIN post p ON p.id_booking = b.id
        WHERE j.id_users = ?
        ORDER BY j.created_at DESC
      `, [user_id]);

      await connection.end();

      res.json({
        success: true,
        message: 'Data join requests user berhasil diambil',
        data: joinRequests
      });

    } catch (error) {
      console.error('Error getting join requests by user ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data join requests user',
        error: error.message
      });
    }
  }

  // Create join request - NO AUTH REQUIRED
  static async createJoinRequest(req, res) {
    try {
      const { 
        id_users,
        id_booking
      } = req.body;

      // Validate required fields
      if (!id_users || !id_booking) {
        return res.status(400).json({
          success: false,
          message: 'Field yang diperlukan: id_users, id_booking'
        });
      }

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Check if booking exists, is approved, and has a post
      const [bookings] = await connection.execute(`
        SELECT 
          b.*,
          f.max_person,
          f.field_name,
          p.id as post_id
        FROM bookings b
        LEFT JOIN fields f ON b.field_id = f.id
        LEFT JOIN post p ON p.id_booking = b.id
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

      if (booking.status !== 'approved') {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: 'Hanya dapat join booking yang sudah disetujui'
        });
      }

      if (!booking.post_id) {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: 'Booking belum memiliki post. Post harus dibuat terlebih dahulu'
        });
      }

      // Check if user is the poster (cannot join own booking)
      if (booking.id_users == id_users) {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: 'Tidak dapat join booking sendiri'
        });
      }

      // Check if user already has a join request for this booking
      const [existingJoins] = await connection.execute(`
        SELECT id FROM joined WHERE id_users = ? AND id_booking = ?
      `, [id_users, id_booking]);

      if (existingJoins.length > 0) {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: 'Anda sudah memiliki join request untuk booking ini'
        });
      }

      // Check current approved joins count vs max_person
      const [joinCount] = await connection.execute(`
        SELECT COUNT(*) as approved_count FROM joined 
        WHERE id_booking = ? AND status = 'approved'
      `, [id_booking]);

      const currentJoined = joinCount[0].approved_count;
      const maxPerson = booking.max_person;

      // max_person includes the original poster, so available slots = max_person - 1 - current_joined
      const availableSlots = maxPerson - 1 - currentJoined;

      if (availableSlots <= 0) {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: `Booking sudah penuh. Maksimal ${maxPerson} orang (termasuk poster)`
        });
      }

      // Check if booking date has passed
      const now = new Date();
      const bookingStart = new Date(booking.booking_datetime_start);

      if (bookingStart < now) {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: 'Tidak dapat join booking yang sudah dimulai'
        });
      }

      // Create join request
      const [joinResult] = await connection.execute(`
        INSERT INTO joined (
          id_users,
          id_booking,
          status,
          created_at,
          updated_at
        ) VALUES (?, ?, 'pending', NOW(), NOW())
      `, [id_users, id_booking]);

      await connection.end();

      res.status(201).json({
        success: true,
        message: 'Join request berhasil dibuat',
        data: {
          join_id: joinResult.insertId,
          id_users: id_users,
          id_booking: id_booking,
          status: 'pending',
          field_name: booking.field_name,
          available_slots: availableSlots - 1, // minus 1 because this request is pending
          max_person: maxPerson,
          current_joined: currentJoined,
          message: 'Join request menunggu approval dari poster'
        }
      });

    } catch (error) {
      console.error('Error creating join request:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat join request',
        error: error.message
      });
    }
  }

  // Update join request status (approve/reject) - NO AUTH REQUIRED
  static async updateJoinRequestStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status harus approved atau rejected'
        });
      }

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Get join request info with booking details
      const [joinRequests] = await connection.execute(`
        SELECT 
          j.*,
          b.id_users as poster_user_id,
          b.booking_datetime_start,
          f.max_person,
          f.field_name,
          u.name as joiner_name
        FROM joined j
        LEFT JOIN bookings b ON j.id_booking = b.id
        LEFT JOIN fields f ON b.field_id = f.id
        LEFT JOIN users u ON j.id_users = u.id
        WHERE j.id = ?
      `, [id]);

      if (joinRequests.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Join request tidak ditemukan'
        });
      }

      const joinRequest = joinRequests[0];

      // Check if join request is still pending
      if (joinRequest.status !== 'pending') {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: `Join request sudah ${joinRequest.status}`
        });
      }

      // If approving, check if there's still space
      if (status === 'approved') {
        const [joinCount] = await connection.execute(`
          SELECT COUNT(*) as approved_count FROM joined 
          WHERE id_booking = ? AND status = 'approved'
        `, [joinRequest.id_booking]);

        const currentJoined = joinCount[0].approved_count;
        const maxPerson = joinRequest.max_person;
        const availableSlots = maxPerson - 1 - currentJoined; // -1 for poster

        if (availableSlots <= 0) {
          await connection.end();
          return res.status(400).json({
            success: false,
            message: `Booking sudah penuh. Maksimal ${maxPerson} orang (termasuk poster)`
          });
        }

        // Check if booking date has passed
        const now = new Date();
        const bookingStart = new Date(joinRequest.booking_datetime_start);

        if (bookingStart < now) {
          await connection.end();
          return res.status(400).json({
            success: false,
            message: 'Tidak dapat approve join untuk booking yang sudah dimulai'
          });
        }
      }

      // Update join request status
      await connection.execute(`
        UPDATE joined 
        SET status = ?, updated_at = NOW() 
        WHERE id = ?
      `, [status, id]);

      await connection.end();

      const statusMessage = status === 'approved' 
        ? `Join request ${joinRequest.joiner_name} berhasil disetujui` 
        : `Join request ${joinRequest.joiner_name} berhasil ditolak`;

      res.json({
        success: true,
        message: statusMessage,
        data: {
          join_id: id,
          id_users: joinRequest.id_users,
          id_booking: joinRequest.id_booking,
          status: status,
          joiner_name: joinRequest.joiner_name,
          field_name: joinRequest.field_name
        }
      });

    } catch (error) {
      console.error('Error updating join request status:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate status join request',
        error: error.message
      });
    }
  }

  // Delete join request - NO AUTH REQUIRED
  static async deleteJoinRequest(req, res) {
    try {
      const { id } = req.params;

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Get join request info before deleting
      const [joinRequests] = await connection.execute(`
        SELECT j.*, u.name as joiner_name 
        FROM joined j
        LEFT JOIN users u ON j.id_users = u.id
        WHERE j.id = ?
      `, [id]);

      if (joinRequests.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Join request tidak ditemukan'
        });
      }

      const joinRequest = joinRequests[0];

      // Delete join request
      await connection.execute(`
        DELETE FROM joined WHERE id = ?
      `, [id]);

      await connection.end();

      res.json({
        success: true,
        message: 'Join request berhasil dihapus',
        data: {
          join_id: id,
          joiner_name: joinRequest.joiner_name,
          status: joinRequest.status
        }
      });

    } catch (error) {
      console.error('Error deleting join request:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus join request',
        error: error.message
      });
    }
  }

  // Get join requests for posts owned by user (for poster to manage) - NO AUTH REQUIRED
  static async getJoinRequestsForPoster(req, res) {
    try {
      const { poster_user_id } = req.query;

      if (!poster_user_id) {
        return res.status(400).json({
          success: false,
          message: 'poster_user_id parameter diperlukan'
        });
      }

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [joinRequests] = await connection.execute(`
        SELECT 
          j.*,
          u.name as joiner_name,
          u.email as joiner_email,
          u.gender,
          b.booking_datetime_start,
          b.booking_datetime_end,
          f.field_name,
          f.field_type,
          f.max_person,
          pl.place_name,
          p.post_title,
          (SELECT COUNT(*) FROM joined jr WHERE jr.id_booking = b.id AND jr.status = 'approved') as current_joined_count
        FROM joined j
        LEFT JOIN users u ON j.id_users = u.id
        LEFT JOIN bookings b ON j.id_booking = b.id
        LEFT JOIN fields f ON b.field_id = f.id
        LEFT JOIN places pl ON f.id_place = pl.id
        LEFT JOIN post p ON p.id_booking = b.id
        WHERE b.id_users = ? AND j.status = 'pending'
        ORDER BY j.created_at DESC
      `, [poster_user_id]);

      await connection.end();

      res.json({
        success: true,
        message: 'Data pending join requests berhasil diambil',
        data: joinRequests
      });

    } catch (error) {
      console.error('Error getting join requests for poster:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data join requests',
        error: error.message
      });
    }
  }
}

module.exports = JoinedController;