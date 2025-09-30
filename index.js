const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/userRoutes');
const placeRoutes = require('./routes/placeRoutes');
const fieldRoutes = require('./routes/fieldRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const addOnRoutes = require('./routes/addOnRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware untuk logging request
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path}`);
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
      addOns: '/api/add-ons'
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
        'GET /api/fields': 'Mendapatkan semua fields',
        'GET /api/fields/:id': 'Mendapatkan field berdasarkan ID',
        'GET /api/fields/place/:placeId': 'Mendapatkan fields berdasarkan place ID',
        'GET /api/fields/available/:placeId': 'Mendapatkan fields yang tersedia berdasarkan place ID',
        'POST /api/fields': 'Membuat field baru',
        'PUT /api/fields/:id': 'Update field',
        'DELETE /api/fields/:id': 'Hapus field'
      },
      bookings: {
        'GET /api/bookings': 'Mendapatkan semua bookings',
        'GET /api/bookings/:id': 'Mendapatkan booking berdasarkan ID',
        'GET /api/bookings/user/:userId': 'Mendapatkan bookings berdasarkan user ID',
        'GET /api/bookings/field/:fieldId': 'Mendapatkan bookings berdasarkan field ID',
        'GET /api/bookings/status/:status': 'Mendapatkan bookings berdasarkan status',
        'GET /api/bookings/order/:orderId': 'Mendapatkan booking berdasarkan order ID',
        'POST /api/bookings': 'Membuat booking baru',
        'POST /api/bookings/check-availability': 'Cek ketersediaan field',
        'PUT /api/bookings/:id': 'Update booking',
        'PATCH /api/bookings/:id/status': 'Update status booking',
        'PATCH /api/bookings/:id/snap-token': 'Update snap token booking',
        'DELETE /api/bookings/:id': 'Hapus booking'
      },
      addOns: {
        'GET /api/add-ons': 'Mendapatkan semua add-ons',
        'GET /api/add-ons/:id': 'Mendapatkan add-on berdasarkan ID',
        'GET /api/add-ons/place/:placeId': 'Mendapatkan add-ons berdasarkan place ID',
        'GET /api/add-ons/available/:placeId': 'Mendapatkan add-ons yang tersedia berdasarkan place ID',
        'POST /api/add-ons': 'Membuat add-on baru',
        'PUT /api/add-ons/:id': 'Update add-on',
        'PATCH /api/add-ons/:id/stock': 'Update stock add-on',
        'DELETE /api/add-ons/:id': 'Hapus add-on'
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
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Only start server if this file is run directly (not imported)
if (require.main === module) {
  startServer();
}

module.exports = app;