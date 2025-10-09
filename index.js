const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection } = require('./config/database');
const BookingScheduler = require('./services/BookingScheduler');
require('dotenv').config();

// Set timezone to Asia/Jakarta untuk konsistensi
process.env.TZ = process.env.TZ || 'Asia/Jakarta';

// Import routes
const userRoutes = require('./routes/userRoutes');
const placeRoutes = require('./routes/placeRoutes');
const fieldRoutes = require('./routes/fields');
const bookingRoutes = require('./routes/bookingRoutes');
const addOnRoutes = require('./routes/addOnRoutes');
const refundRoutes = require('./routes/refundRoutes');
const postRoutes = require('./routes/postRoutes');
const joinedRoutes = require('./routes/joinedRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const withdrawRoutes = require('./routes/withdrawRoutes');
const promosiRoutes = require('./routes/promosiRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files untuk uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware untuk logging request
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - Content-Type: ${req.get('Content-Type') || 'N/A'}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API LapanganKita berjalan dengan baik!',
    version: '2.0.0',
    endpoints: {
      users: '/api/users',
      places: '/api/places',
      fields: '/api/fields',
      bookings: '/api/bookings',
      addOns: '/api/add-ons',
      refunds: '/api/refunds',
      posts: '/api/posts',
      joined: '/api/joined',
      ratings: '/api/ratings',
      withdraws: '/api/withdraws',
      promosi: '/api/promosi'
    },
    documentation: {
      users: {
        'GET /api/users': 'Mendapatkan semua users',
        'GET /api/users/:id': 'Mendapatkan user berdasarkan ID',
        'GET /api/users/role/:role': 'Mendapatkan users berdasarkan role',
        'POST /api/users': 'Membuat user baru',
        'POST /api/users/login': 'Login user',
        'PUT /api/users/:id': 'Update user',
        'PATCH /api/users/:id/verify-email': 'Verifikasi email user',
        'PATCH /api/users/:id/change-password': 'Ganti password user',
        'DELETE /api/users/:id': 'Hapus user'
      },
      places: {
        'GET /api/places': 'Mendapatkan semua places',
        'GET /api/places/:id': 'Mendapatkan place berdasarkan ID',
        'GET /api/places/owner/:ownerId': 'Mendapatkan places berdasarkan owner ID',
        'POST /api/places': 'Membuat place baru',
        'PUT /api/places/:id': 'Update place',
        'PATCH /api/places/:id/balance': 'Update balance place',
        'DELETE /api/places/:id': 'Hapus place'
      },
      fields: {
        'GET /api/fields': 'Mendapatkan semua fields dengan info place dan owner',
        'GET /api/fields/:id': 'Mendapatkan field berdasarkan ID',
        'GET /api/fields/place/:id_place': 'Mendapatkan fields berdasarkan place ID',
        'GET /api/fields/search?q=': 'Mencari fields berdasarkan nama, deskripsi, atau tipe',
        'POST /api/fields': 'Membuat field baru (multipart/form-data, owner validation)',
        'PUT /api/fields/:id': 'Update field (multipart/form-data, owner validation)',
        'DELETE /api/fields/:id': 'Hapus field (owner validation, hapus foto otomatis)'
      },
      bookings: {
        'GET /api/bookings': 'Mendapatkan semua bookings (admin only)',
        'GET /api/bookings/:id': 'Mendapatkan booking berdasarkan ID',
        'GET /api/bookings/me/bookings': 'Mendapatkan booking user saat ini',
        'GET /api/bookings/owner/bookings': 'Mendapatkan booking field owner (field_owner only)',
        'POST /api/bookings': 'Membuat booking baru dengan add-ons (user only)',
        'PATCH /api/bookings/:id/status': 'Update status booking approve/cancel (field_owner only)',
        'PATCH /api/bookings/:id/complete': 'Selesaikan booking setelah payment'
      },
      addOns: {
        'GET /api/add-ons': 'Mendapatkan semua add-ons dengan info place dan owner',
        'GET /api/add-ons/:id': 'Mendapatkan add-on berdasarkan ID',
        'GET /api/add-ons/place/:placeId': 'Mendapatkan add-ons berdasarkan place ID',
        'GET /api/add-ons/available/:placeId': 'Mendapatkan add-ons yang tersedia (stock > 0) berdasarkan place ID',
        'POST /api/add-ons': 'Membuat add-on baru (multipart/form-data, owner validation, foto wajib)',
        'PUT /api/add-ons/:id': 'Update add-on (multipart/form-data, owner validation)',
        'PATCH /api/add-ons/:id/stock': 'Update stock add-on (owner validation)',
        'DELETE /api/add-ons/:id': 'Hapus add-on (owner validation, hapus foto otomatis)'
      },
      refunds: {
        'GET /api/refunds': 'Mendapatkan semua refunds dengan detail booking',
        'GET /api/refunds/:id': 'Mendapatkan refund berdasarkan ID',
        'GET /api/refunds/booking/:booking_id': 'Mendapatkan refunds berdasarkan booking ID',
        'POST /api/refunds': 'Membuat refund baru (multipart/form-data, foto bukti wajib, booking harus cancelled)',
        'PUT /api/refunds/:id': 'Update refund (multipart/form-data, foto bukti opsional)',
        'DELETE /api/refunds/:id': 'Hapus refund (hapus foto otomatis)'
      },
      posts: {
        'GET /api/posts': 'Mendapatkan semua posts dengan detail booking dan join info',
        'GET /api/posts/:id': 'Mendapatkan post berdasarkan ID dengan joined users',
        'GET /api/posts/user?user_id=': 'Mendapatkan posts berdasarkan user ID',
        'POST /api/posts': 'Membuat post baru (multipart/form-data, foto wajib, booking harus approved)',
        'PUT /api/posts/:id': 'Update post (multipart/form-data, foto opsional)',
        'DELETE /api/posts/:id': 'Hapus post (hapus foto otomatis)'
      },
      joined: {
        'GET /api/joined': 'Mendapatkan semua join requests dengan detail',
        'GET /api/joined/booking/:booking_id': 'Mendapatkan join requests berdasarkan booking ID',
        'GET /api/joined/user?user_id=': 'Mendapatkan join requests berdasarkan user ID',
        'GET /api/joined/poster?poster_user_id=': 'Mendapatkan pending joins untuk poster (approval)',
        'POST /api/joined': 'Membuat join request (validasi max_person, booking approved)',
        'PUT /api/joined/:id/status': 'Approve/reject join request (approved/rejected)',
        'DELETE /api/joined/:id': 'Hapus join request'
      },
      ratings: {
        'GET /api/ratings': 'Mendapatkan semua ratings dengan detail booking',
        'GET /api/ratings/:id': 'Mendapatkan rating berdasarkan ID',
        'GET /api/ratings/booking/:booking_id': 'Mendapatkan rating berdasarkan booking ID',
        'GET /api/ratings/user?user_id=': 'Mendapatkan ratings berdasarkan user ID',
        'GET /api/ratings/owner?owner_id=': 'Mendapatkan ratings berdasarkan field owner ID',
        'GET /api/ratings/stats/:place_id': 'Mendapatkan statistik rating berdasarkan place ID',
        'POST /api/ratings': 'Membuat rating baru (booking harus completed, 1 rating per booking)',
        'PUT /api/ratings/:id': 'Update rating (rating_value 1-5, review)',
        'DELETE /api/ratings/:id': 'Hapus rating'
      },
      withdraws: {
        'GET /api/withdraws': 'Mendapatkan semua withdraws dengan detail user',
        'GET /api/withdraws/:id': 'Mendapatkan withdraw berdasarkan ID',
        'GET /api/withdraws/user?user_id=': 'Mendapatkan withdraws berdasarkan user ID',
        'GET /api/withdraws/balance?user_id=': 'Mendapatkan balance summary user dari semua places',
        'POST /api/withdraws': 'Membuat withdraw baru (multipart/form-data, foto wajib, validasi balance)',
        'PUT /api/withdraws/:id': 'Update foto withdraw (multipart/form-data)',
        'DELETE /api/withdraws/:id': 'Hapus withdraw (tidak mengembalikan balance)'
      },
      promosi: {
        'GET /api/promosi': 'Mendapatkan semua promosi dengan full URL',
        'GET /api/promosi/slider': 'Mendapatkan promosi untuk Android image slider (optimized)',
        'GET /api/promosi/count': 'Mendapatkan jumlah total promosi',
        'GET /api/promosi/:id': 'Mendapatkan promosi berdasarkan ID',
        'POST /api/promosi': 'Membuat promosi baru (multipart/form-data, foto wajib)',
        'PUT /api/promosi/:id': 'Update promosi (replace foto, multipart/form-data)',
        'DELETE /api/promosi/:id': 'Hapus promosi (hapus foto otomatis)'
      }
    }
  });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/add-ons', addOnRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/joined', joinedRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/withdraws', withdrawRoutes);
app.use('/api/promosi', promosiRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({
      success: true,
      message: 'Server sehat',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'Connected' : 'Disconnected',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server tidak sehat',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan server',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan',
    path: req.originalUrl
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.log('⚠️  Warning: Database connection failed, but server will still start');
    } else {
      // Start the booking auto-complete scheduler only if DB is connected
      BookingScheduler.startScheduler();
    }

    app.listen(PORT, () => {
      console.log('🚀 Server running successfully!');
      console.log(`📡 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Local URL: http://localhost:${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
      console.log('====================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  BookingScheduler.stopScheduler();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  BookingScheduler.stopScheduler();
  process.exit(0);
});

// Only start server if this file is run directly (not imported)
if (require.main === module) {
  startServer();
}

module.exports = app;