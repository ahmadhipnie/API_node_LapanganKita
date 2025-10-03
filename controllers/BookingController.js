const mysql = require('mysql2/promise');

class BookingController {
  // Get all bookings with detail bookings - NO AUTH REQUIRED
  static async getAllBooking(req, res) {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Auto update expired bookings to completed
      await BookingController.autoUpdateExpiredBookings(connection);

      const [bookings] = await connection.execute(`
        SELECT 
          b.*,
          u.name as user_name,
          u.email as user_email,
          f.field_name,
          f.field_type,
          p.place_name,
          p.address as place_address,
          fo.name as field_owner_name
        FROM bookings b
        LEFT JOIN users u ON b.id_users = u.id
        LEFT JOIN fields f ON b.field_id = f.id
        LEFT JOIN places p ON f.id_place = p.id
        LEFT JOIN users fo ON p.id_users = fo.id
        ORDER BY b.created_at DESC
      `);

      // Get detail bookings for each booking
      for (let i = 0; i < bookings.length; i++) {
        const [details] = await connection.execute(`
          SELECT 
            db.*,
            a.add_on_name,
            a.add_on_description,
            a.price_per_hour
          FROM detail_booking db
          LEFT JOIN add_ons a ON db.id_add_on = a.id
          WHERE db.id_booking = ?
        `, [bookings[i].id]);
        
        bookings[i].detail_bookings = details;
      }

      await connection.end();

      res.json({
        success: true,
        message: 'Data bookings berhasil diambil',
        data: bookings
      });

    } catch (error) {
      console.error('Error getting all bookings:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data bookings',
        error: error.message
      });
    }
  }

  // Get booking by ID with detail bookings - NO AUTH REQUIRED
  static async getBookingById(req, res) {
    try {
      const { id } = req.params;
      
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Auto update expired bookings to completed
      await BookingController.autoUpdateExpiredBookings(connection);

      const [bookings] = await connection.execute(`
        SELECT 
          b.*,
          u.name as user_name,
          u.email as user_email,
          f.field_name,
          f.field_type,
          f.price_per_hour as field_price_per_hour,
          p.place_name,
          p.address as place_address,
          fo.name as field_owner_name
        FROM bookings b
        LEFT JOIN users u ON b.id_users = u.id
        LEFT JOIN fields f ON b.field_id = f.id
        LEFT JOIN places p ON f.id_place = p.id
        LEFT JOIN users fo ON p.id_users = fo.id
        WHERE b.id = ?
      `, [id]);

      if (bookings.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Booking tidak ditemukan'
        });
      }

      // Get detail bookings
      const [details] = await connection.execute(`
        SELECT 
          db.*,
          a.add_on_name,
          a.add_on_description,
          a.price_per_hour
        FROM detail_booking db
        LEFT JOIN add_ons a ON db.id_add_on = a.id
        WHERE db.id_booking = ?
      `, [id]);

      bookings[0].detail_bookings = details;

      await connection.end();

      res.json({
        success: true,
        message: 'Data booking berhasil diambil',
        data: bookings[0]
      });

    } catch (error) {
      console.error('Error getting booking by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data booking',
        error: error.message
      });
    }
  }

  // Create new booking with add-ons - NO AUTH REQUIRED
  static async createBooking(req, res) {
    try {
      const { 
        id_users,
        field_id, 
        booking_datetime_start, 
        booking_datetime_end,
        snap_token,
        note = null,
        add_ons = [] // Array of {id_add_on, quantity}
      } = req.body;

      // Validate required fields
      if (!id_users || !field_id || !booking_datetime_start || !booking_datetime_end || !snap_token) {
        return res.status(400).json({
          success: false,
          message: 'Field yang diperlukan: id_users, field_id, booking_datetime_start, booking_datetime_end, snap_token'
        });
      }

      // Validate booking time restrictions
      const now = new Date();
      const startDate = new Date(booking_datetime_start);
      const endDate = new Date(booking_datetime_end);
      
      // Check if booking is for past date
      if (startDate < now) {
        return res.status(400).json({
          success: false,
          message: 'Tidak dapat booking untuk tanggal yang sudah terlewat'
        });
      }
      
      // Check minimum 1 day before booking
      const oneDayFromNow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
      if (startDate < oneDayFromNow) {
        return res.status(400).json({
          success: false,
          message: 'Booking harus dilakukan minimal 1 hari sebelum waktu mulai'
        });
      }
      
      // Validate end time is after start time
      if (endDate <= startDate) {
        return res.status(400).json({
          success: false,
          message: 'booking_datetime_end harus lebih besar dari booking_datetime_start'
        });
      }

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Check if field exists and get field info
      const [fields] = await connection.execute(`
        SELECT f.*, p.id_users as owner_id 
        FROM fields f 
        LEFT JOIN places p ON f.id_place = p.id 
        WHERE f.id = ?
      `, [field_id]);

      if (fields.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Lapangan tidak ditemukan'
        });
      }

      const field = fields[0];

      // Check for conflicting bookings
      const [conflicts] = await connection.execute(`
        SELECT id FROM bookings 
        WHERE field_id = ? 
        AND status IN ('waiting_confirmation', 'approved') 
        AND (
          (booking_datetime_start <= ? AND booking_datetime_end > ?) OR
          (booking_datetime_start < ? AND booking_datetime_end >= ?) OR
          (booking_datetime_start >= ? AND booking_datetime_start < ?)
        )
      `, [field_id, booking_datetime_start, booking_datetime_start, booking_datetime_end, booking_datetime_end, booking_datetime_start, booking_datetime_end]);

      if (conflicts.length > 0) {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: 'Waktu booking bentrok dengan booking lain'
        });
      }

      // Calculate hours from datetime difference
      const hoursDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60));

      // Validate and check stock for add-ons
      let calculatedTotalPrice = parseFloat(field.price_per_hour) * hoursDiff;
      const addOnValidations = [];

      for (const addOn of add_ons) {
        const [addOnData] = await connection.execute(`
          SELECT * FROM add_ons WHERE id = ? AND place_id = ?
        `, [addOn.id_add_on, field.id_place]);

        if (addOnData.length === 0) {
          await connection.end();
          return res.status(404).json({
            success: false,
            message: `Add-on dengan ID ${addOn.id_add_on} tidak ditemukan atau tidak tersedia untuk lapangan ini`
          });
        }

        const addOnItem = addOnData[0];
        
        if (addOnItem.stock < addOn.quantity) {
          await connection.end();
          return res.status(400).json({
            success: false,
            message: `Stok add-on ${addOnItem.add_on_name} tidak mencukupi. Tersedia: ${addOnItem.stock}, Diminta: ${addOn.quantity}`
          });
        }

        calculatedTotalPrice += parseFloat(addOnItem.price_per_hour) * parseInt(addOn.quantity) * hoursDiff;
        addOnValidations.push({
          ...addOn,
          addOnData: addOnItem
        });
      }

      // Generate order_id for payment
      const orderId = `BOOKING-${Date.now()}-${id_users}`;

      // Create booking
      const [bookingResult] = await connection.execute(`
        INSERT INTO bookings (
          id_users, 
          field_id, 
          booking_datetime_start, 
          booking_datetime_end, 
          total_price, 
          status, 
          order_id,
          snap_token,
          note,
          created_at, 
          updated_at
        ) VALUES (?, ?, ?, ?, ?, 'waiting_confirmation', ?, ?, ?, NOW(), NOW())
      `, [
        id_users, 
        field_id, 
        booking_datetime_start, 
        booking_datetime_end, 
        calculatedTotalPrice, 
        orderId,
        snap_token,
        note
      ]);

      const bookingId = bookingResult.insertId;

      // Create detail bookings and decrease stock
      for (const validation of addOnValidations) {
        // Insert detail booking
        await connection.execute(`
          INSERT INTO detail_booking (
            id_booking, 
            id_add_on, 
            quantity, 
            total_price,
            created_at, 
            updated_at
          ) VALUES (?, ?, ?, ?, NOW(), NOW())
        `, [
          bookingId,
          validation.id_add_on,
          validation.quantity,
          parseFloat(validation.addOnData.price_per_hour) * parseInt(validation.quantity) * hoursDiff
        ]);

        // Decrease add-on stock
        await connection.execute(`
          UPDATE add_ons SET stock = stock - ?, updated_at = NOW() WHERE id = ?
        `, [validation.quantity, validation.id_add_on]);
      }

      await connection.end();

      res.status(201).json({
        success: true,
        message: 'Booking berhasil dibuat',
        data: {
          booking_id: bookingId,
          order_id: orderId,
          total_price: calculatedTotalPrice,
          status: 'waiting_confirmation',
          message: 'Booking menunggu konfirmasi dari pemilik lapangan'
        }
      });

    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat booking',
        error: error.message
      });
    }
  }

  // Update booking status - NO AUTH REQUIRED
  static async updateBookingStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;

      // Validate status
      if (!['approved', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status harus approved atau cancelled'
        });
      }

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Get booking info
      const [bookings] = await connection.execute(`
        SELECT * FROM bookings WHERE id = ?
      `, [id]);

      if (bookings.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Booking tidak ditemukan'
        });
      }

      const booking = bookings[0];

      // Check if booking can be updated
      if (booking.status !== 'waiting_confirmation') {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: `Booking dengan status ${booking.status} tidak dapat diubah`
        });
      }

      // If cancelling, restore add-on stock
      if (status === 'cancelled') {
        await BookingController.restoreAddOnStock(connection, id);
      }

      // Update booking status
      await connection.execute(`
        UPDATE bookings 
        SET status = ?, note = ?, updated_at = NOW() 
        WHERE id = ?
      `, [status, note || null, id]);

      await connection.end();

      const statusMessage = status === 'approved' 
        ? 'Booking berhasil disetujui' 
        : 'Booking berhasil dibatalkan dan stok add-on dikembalikan';

      res.json({
        success: true,
        message: statusMessage,
        data: {
          booking_id: id,
          status: status,
          note: note || null
        }
      });

    } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengubah status booking',
        error: error.message
      });
    }
  }

  // Get bookings by user ID - NO AUTH REQUIRED
  static async getMyBookings(req, res) {
    try {
      const { user_id } = req.query; // Get from query parameter
      
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

      // Auto update expired bookings to completed
      await BookingController.autoUpdateExpiredBookings(connection);

      const [bookings] = await connection.execute(`
        SELECT 
          b.*,
          f.field_name,
          f.field_type,
          p.place_name,
          p.address as place_address
        FROM bookings b
        LEFT JOIN fields f ON b.field_id = f.id
        LEFT JOIN places p ON f.id_place = p.id
        WHERE b.id_users = ?
        ORDER BY b.created_at DESC
      `, [user_id]);

      // Get detail bookings for each booking
      for (let i = 0; i < bookings.length; i++) {
        const [details] = await connection.execute(`
          SELECT 
            db.*,
            a.add_on_name,
            a.add_on_description,
            a.price_per_hour
          FROM detail_booking db
          LEFT JOIN add_ons a ON db.id_add_on = a.id
          WHERE db.id_booking = ?
        `, [bookings[i].id]);
        
        bookings[i].detail_bookings = details;
      }

      await connection.end();

      res.json({
        success: true,
        message: 'Data booking user berhasil diambil',
        data: bookings
      });

    } catch (error) {
      console.error('Error getting user bookings:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data booking user',
        error: error.message
      });
    }
  }

  // Get bookings by field owner ID - NO AUTH REQUIRED
  static async getFieldOwnerBookings(req, res) {
    try {
      const { owner_id } = req.query; // Get from query parameter
      
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

      // Auto update expired bookings to completed
      await BookingController.autoUpdateExpiredBookings(connection);

      const [bookings] = await connection.execute(`
        SELECT 
          b.*,
          u.name as user_name,
          u.email as user_email,
          f.field_name,
          f.field_type,
          p.place_name,
          p.address as place_address
        FROM bookings b
        LEFT JOIN users u ON b.id_users = u.id
        LEFT JOIN fields f ON b.field_id = f.id
        LEFT JOIN places p ON f.id_place = p.id
        WHERE p.id_users = ?
        ORDER BY b.created_at DESC
      `, [owner_id]);

      // Get detail bookings for each booking
      for (let i = 0; i < bookings.length; i++) {
        const [details] = await connection.execute(`
          SELECT 
            db.*,
            a.add_on_name,
            a.add_on_description,
            a.price_per_hour
          FROM detail_booking db
          LEFT JOIN add_ons a ON db.id_add_on = a.id
          WHERE db.id_booking = ?
        `, [bookings[i].id]);
        
        bookings[i].detail_bookings = details;
      }

      await connection.end();

      res.json({
        success: true,
        message: 'Data booking field owner berhasil diambil',
        data: bookings
      });

    } catch (error) {
      console.error('Error getting field owner bookings:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data booking field owner',
        error: error.message
      });
    }
  }

  // Complete booking - NO AUTH REQUIRED
  static async completeBooking(req, res) {
    try {
      const { id } = req.params;

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Get booking info
      const [bookings] = await connection.execute(`
        SELECT * FROM bookings WHERE id = ?
      `, [id]);

      if (bookings.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Booking tidak ditemukan'
        });
      }

      const booking = bookings[0];

      // Check if booking can be completed
      if (booking.status !== 'approved') {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: 'Booking harus dalam status approved untuk bisa diselesaikan'
        });
      }

      // Update booking status to completed
      await connection.execute(`
        UPDATE bookings 
        SET status = 'completed', updated_at = NOW() 
        WHERE id = ?
      `, [id]);

      // Restore add-on stock when completed
      await BookingController.restoreAddOnStock(connection, id);

      await connection.end();

      res.json({
        success: true,
        message: 'Booking berhasil diselesaikan',
        data: {
          booking_id: id,
          status: 'completed'
        }
      });

    } catch (error) {
      console.error('Error completing booking:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menyelesaikan booking',
        error: error.message
      });
    }
  }

  // Helper method to auto update expired bookings
  static async autoUpdateExpiredBookings(connection) {
    try {
      const now = new Date();
      
      // Find approved bookings that have passed their end time
      const [expiredBookings] = await connection.execute(`
        SELECT id, booking_datetime_end 
        FROM bookings 
        WHERE status = 'approved' 
        AND booking_datetime_end < ?
      `, [now]);

      // Update expired bookings to completed
      for (const booking of expiredBookings) {
        await connection.execute(`
          UPDATE bookings 
          SET status = 'completed', updated_at = NOW() 
          WHERE id = ?
        `, [booking.id]);
        
        // Restore add-on stock when auto-completed
        await BookingController.restoreAddOnStock(connection, booking.id);
        
        console.log(`Auto updated booking ${booking.id} to completed (expired on ${booking.booking_datetime_end})`);
      }
      
      return expiredBookings.length;
    } catch (error) {
      console.error('Error in auto update expired bookings:', error);
      return 0;
    }
  }

  // Helper method to restore add-on stock when booking is completed or cancelled
  static async restoreAddOnStock(connection, bookingId) {
    try {
      // Get detail bookings for stock restoration
      const [detailBookings] = await connection.execute(`
        SELECT * FROM detail_booking WHERE id_booking = ?
      `, [bookingId]);

      // Restore stock for each add-on
      for (const detail of detailBookings) {
        await connection.execute(`
          UPDATE add_ons SET stock = stock + ?, updated_at = NOW() WHERE id = ?
        `, [detail.quantity, detail.id_add_on]);
      }
      
      console.log(`Restored stock for ${detailBookings.length} add-ons from booking ${bookingId}`);
      return detailBookings.length;
    } catch (error) {
      console.error('Error restoring add-on stock:', error);
      return 0;
    }
  }
}

module.exports = BookingController;
