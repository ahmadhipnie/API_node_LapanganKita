const BookingModel = require('../models/BookingModel');

class BookingController {
  // GET /api/bookings - Mendapatkan semua booking
  static async getAllBooking(req, res) {
    try {
      const bookings = await BookingModel.getAll();
      
      res.json({
        success: true,
        message: 'Data bookings berhasil diambil',
        data: bookings,
        total: bookings.length
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

  // GET /api/bookings/:id - Mendapatkan booking berdasarkan ID
  static async getBookingById(req, res) {
    try {
      const { id } = req.params;
      const booking = await BookingModel.getById(id);
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking tidak ditemukan'
        });
      }

      res.json({
        success: true,
        message: 'Data booking berhasil diambil',
        data: booking
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

  // POST /api/bookings - Membuat booking baru
  static async createBooking(req, res) {
    try {
      const { 
        booking_datetime_start, booking_datetime_end, order_id,
        total_price, field_id, id_users 
      } = req.body;
      
      // Validasi field wajib
      if (!booking_datetime_start || !booking_datetime_end || !order_id || 
          !total_price || !field_id || !id_users) {
        return res.status(400).json({
          success: false,
          message: 'Field booking_datetime_start, booking_datetime_end, order_id, total_price, field_id, dan id_users wajib diisi'
        });
      }

      // Cek ketersediaan field
      const isAvailable = await BookingModel.checkAvailability(
        field_id, booking_datetime_start, booking_datetime_end
      );

      if (!isAvailable) {
        return res.status(409).json({
          success: false,
          message: 'Field tidak tersedia pada waktu yang dipilih'
        });
      }

      const bookingId = await BookingModel.create(req.body);
      const newBooking = await BookingModel.getById(bookingId);

      res.status(201).json({
        success: true,
        message: 'Booking berhasil dibuat',
        data: newBooking
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

  // PUT /api/booking/:id - Update booking
  static async updateBooking(req, res) {
    try {
      const { id } = req.params;
      
      // Cek apakah booking ada
      const existingBooking = await BookingModel.getById(id);
      if (!existingBooking) {
        return res.status(404).json({
          success: false,
          message: 'Booking tidak ditemukan'
        });
      }

      // Jika ada perubahan waktu, cek ketersediaan
      const { field_id, booking_datetime_start, booking_datetime_end } = req.body;
      if (field_id && booking_datetime_start && booking_datetime_end) {
        const isAvailable = await BookingModel.checkAvailability(
          field_id, booking_datetime_start, booking_datetime_end
        );

        if (!isAvailable) {
          return res.status(409).json({
            success: false,
            message: 'Field tidak tersedia pada waktu yang dipilih'
          });
        }
      }

      const updated = await BookingModel.update(id, req.body);
      
      if (!updated) {
        return res.status(500).json({
          success: false,
          message: 'Gagal mengupdate booking'
        });
      }

      const updatedBooking = await BookingModel.getById(id);

      res.json({
        success: true,
        message: 'Booking berhasil diupdate',
        data: updatedBooking
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate booking',
        error: error.message
      });
    }
  }

  // PATCH /api/bookings/:id/status - Update status booking
  static async updateBookingStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      // Validasi status
      const validStatuses = ['waiting_confirmation', 'approved', 'cancelled', 'completed'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status harus salah satu dari: waiting_confirmation, approved, cancelled, completed'
        });
      }

      // Cek apakah booking ada
      const existingBooking = await BookingModel.getById(id);
      if (!existingBooking) {
        return res.status(404).json({
          success: false,
          message: 'Booking tidak ditemukan'
        });
      }

      const updated = await BookingModel.updateStatus(id, status);
      
      if (!updated) {
        return res.status(500).json({
          success: false,
          message: 'Gagal mengupdate status booking'
        });
      }

      const updatedBooking = await BookingModel.getById(id);

      res.json({
        success: true,
        message: 'Status booking berhasil diupdate',
        data: updatedBooking
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate status booking',
        error: error.message
      });
    }
  }

  // DELETE /api/bookings/:id - Hapus booking
  static async deleteBooking(req, res) {
    try {
      const { id } = req.params;
      
      // Cek apakah booking ada
      const existingBooking = await BookingModel.getById(id);
      if (!existingBooking) {
        return res.status(404).json({
          success: false,
          message: 'Booking tidak ditemukan'
        });
      }

      const deleted = await BookingModel.delete(id);
      
      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: 'Gagal menghapus booking'
        });
      }

      res.json({
        success: true,
        message: 'Booking berhasil dihapus'
      });
    } catch (error) {
      console.error('Error deleting booking:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus booking',
        error: error.message
      });
    }
  }

  // POST /api/bookings/check-availability - Cek ketersediaan field
  static async checkAvailability(req, res) {
    try {
      const { field_id, booking_datetime_start, booking_datetime_end } = req.body;
      
      if (!field_id || !booking_datetime_start || !booking_datetime_end) {
        return res.status(400).json({
          success: false,
          message: 'field_id, booking_datetime_start, dan booking_datetime_end wajib diisi'
        });
      }

      const isAvailable = await BookingModel.checkAvailability(
        field_id, booking_datetime_start, booking_datetime_end
      );

      res.json({
        success: true,
        message: 'Cek ketersediaan berhasil',
        data: {
          field_id,
          booking_datetime_start,
          booking_datetime_end,
          tersedia: isAvailable
        }
      });
    } catch (error) {
      console.error('Error checking availability:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengecek ketersediaan',
        error: error.message
      });
    }
  }

  // GET /api/bookings/user/:userId - Mendapatkan booking berdasarkan user ID
  static async getBookingsByUserId(req, res) {
    try {
      const { userId } = req.params;
      const bookings = await BookingModel.getByUserId(userId);
      
      res.json({
        success: true,
        message: 'Data bookings berhasil diambil',
        data: bookings,
        total: bookings.length
      });
    } catch (error) {
      console.error('Error getting bookings by user ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data bookings',
        error: error.message
      });
    }
  }

  // GET /api/bookings/field/:fieldId - Mendapatkan booking berdasarkan field ID
  static async getBookingsByFieldId(req, res) {
    try {
      const { fieldId } = req.params;
      const bookings = await BookingModel.getByFieldId(fieldId);
      
      res.json({
        success: true,
        message: 'Data bookings berhasil diambil',
        data: bookings,
        total: bookings.length
      });
    } catch (error) {
      console.error('Error getting bookings by field ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data bookings',
        error: error.message
      });
    }
  }

  // GET /api/bookings/status/:status - Mendapatkan booking berdasarkan status
  static async getBookingsByStatus(req, res) {
    try {
      const { status } = req.params;
      const bookings = await BookingModel.getByStatus(status);
      
      res.json({
        success: true,
        message: `Data bookings dengan status ${status} berhasil diambil`,
        data: bookings,
        total: bookings.length
      });
    } catch (error) {
      console.error('Error getting bookings by status:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data bookings',
        error: error.message
      });
    }
  }

  // GET /api/bookings/order/:orderId - Mendapatkan booking berdasarkan order ID
  static async getBookingByOrderId(req, res) {
    try {
      const { orderId } = req.params;
      const booking = await BookingModel.getByOrderId(orderId);
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking tidak ditemukan'
        });
      }

      res.json({
        success: true,
        message: 'Data booking berhasil diambil',
        data: booking
      });
    } catch (error) {
      console.error('Error getting booking by order ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data booking',
        error: error.message
      });
    }
  }

  // PATCH /api/bookings/:id/snap-token - Update snap token
  static async updateSnapToken(req, res) {
    try {
      const { id } = req.params;
      const { snap_token } = req.body;
      
      if (!snap_token) {
        return res.status(400).json({
          success: false,
          message: 'snap_token wajib diisi'
        });
      }

      // Cek apakah booking ada
      const existingBooking = await BookingModel.getById(id);
      if (!existingBooking) {
        return res.status(404).json({
          success: false,
          message: 'Booking tidak ditemukan'
        });
      }

      const updated = await BookingModel.updateSnapToken(id, snap_token);
      
      if (!updated) {
        return res.status(500).json({
          success: false,
          message: 'Gagal mengupdate snap token'
        });
      }

      const updatedBooking = await BookingModel.getById(id);

      res.json({
        success: true,
        message: 'Snap token berhasil diupdate',
        data: updatedBooking
      });
    } catch (error) {
      console.error('Error updating snap token:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate snap token',
        error: error.message
      });
    }
  }
}

module.exports = BookingController;