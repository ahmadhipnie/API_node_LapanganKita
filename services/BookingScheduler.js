const mysql = require('mysql2/promise');
const cron = require('node-cron');

class BookingScheduler {
  static isRunning = false;
  
  // Start the auto complete scheduler
  static startScheduler() {
    if (this.isRunning) {
      console.log(' Booking scheduler already running');
      return;
    }

    // Run every 2 minutes to check for expired bookings
    cron.schedule('*/2 * * * *', async () => {
      await this.runAutoCompleteCheck();
    });

    // Run every hour to check for upcoming bookings (optional notification)
    cron.schedule('0 * * * *', async () => {
      await this.checkUpcomingBookings();
    });

    this.isRunning = true;
    console.log(' Booking auto-complete scheduler started!');
    console.log(' Checking expired bookings every 2 minutes');
    console.log(' Checking upcoming bookings every hour');
  }

  // Main auto complete logic - separated from controller
  static async runAutoCompleteCheck() {
    let connection;
    try {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const now = new Date();
      const isoNow = now.toISOString().slice(0, 19).replace('T', ' ');
      
      // Find approved bookings that have passed their end time
      const [expiredBookings] = await connection.execute(`
        SELECT b.id, b.booking_datetime_end, b.total_price, f.field_name, f.id_place, u.name as user_name
        FROM bookings b
        LEFT JOIN fields f ON b.field_id = f.id
        LEFT JOIN users u ON b.id_users = u.id
        WHERE b.status = 'approved' 
        AND b.booking_datetime_end < ?
      `, [isoNow]);

      if (expiredBookings.length > 0) {
        console.log(` [${new Date().toISOString()}] Found ${expiredBookings.length} expired booking(s)`);
        
        // Update expired bookings to completed and restore stock
        for (const booking of expiredBookings) {
          await this.completeExpiredBooking(connection, booking);
        }
        
        console.log(` Successfully auto-completed ${expiredBookings.length} booking(s)`);
      } else {
        console.log(` [${new Date().toISOString()}] No expired bookings found`);
      }

    } catch (error) {
      console.error(' Error in auto complete check:', error.message);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  // Complete individual expired booking
  static async completeExpiredBooking(connection, booking) {
    try {
      // Update booking status to completed
      await connection.execute(`
        UPDATE bookings 
        SET status = 'completed', updated_at = NOW() 
        WHERE id = ?
      `, [booking.id]);
      
      // Add balance to place owner (deposit)
      await this.addBalanceToPlace(connection, booking.id_place, booking.total_price);
      
      // Restore add-on stock
      const restoredCount = await this.restoreAddOnStock(connection, booking.id);
      
      console.log(` Booking #${booking.id} (${booking.user_name} - ${booking.field_name}) completed`);
      console.log(` Added balance ${booking.total_price} to place ${booking.id_place}`);
      console.log(` Restored ${restoredCount} add-on items`);
      
    } catch (error) {
      console.error(` Error completing booking #${booking.id}:`, error.message);
    }
  }

  // Add balance to place when booking is completed
  static async addBalanceToPlace(connection, placeId, amount) {
    try {
      // Update balance in places table
      await connection.execute(`
        UPDATE places 
        SET balance = COALESCE(balance, 0) + ?, updated_at = NOW() 
        WHERE id = ?
      `, [amount, placeId]);
      
      return true;
    } catch (error) {
      console.error(' Error adding balance to place:', error.message);
      return false;
    }
  }

  // Restore add-on stock for completed booking
  static async restoreAddOnStock(connection, bookingId) {
    try {
      // Get detail bookings for stock restoration
      const [detailBookings] = await connection.execute(`
        SELECT db.*, a.add_on_name 
        FROM detail_booking db
        LEFT JOIN add_ons a ON db.id_add_on = a.id
        WHERE db.id_booking = ?
      `, [bookingId]);

      // Restore stock for each add-on
      for (const detail of detailBookings) {
        await connection.execute(`
          UPDATE add_ons SET stock = stock + ?, updated_at = NOW() WHERE id = ?
        `, [detail.quantity, detail.id_add_on]);
        
        console.log(`   +${detail.quantity} ${detail.add_on_name}`);
      }
      
      return detailBookings.length;
    } catch (error) {
      console.error(' Error restoring add-on stock:', error.message);
      return 0;
    }
  }

  // Check upcoming bookings (optional feature)
  static async checkUpcomingBookings() {
    let connection;
    try {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const now = new Date();
      const oneHourLater = new Date(now.getTime() + (60 * 60 * 1000));
      const isoNow = now.toISOString().slice(0, 19).replace('T', ' ');
      const isoOneHour = oneHourLater.toISOString().slice(0, 19).replace('T', ' ');
      
      // Find approved bookings starting in the next hour
      const [upcomingBookings] = await connection.execute(`
        SELECT COUNT(*) as count
        FROM bookings 
        WHERE status = 'approved' 
        AND booking_datetime_start BETWEEN ? AND ?
      `, [isoNow, isoOneHour]);

      const count = upcomingBookings[0].count;
      if (count > 0) {
        console.log(` [${new Date().toISOString()}] ${count} booking(s) starting in the next hour`);
      }

    } catch (error) {
      console.error(' Error checking upcoming bookings:', error.message);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  // Stop the scheduler (for graceful shutdown)
  static stopScheduler() {
    this.isRunning = false;
    console.log(' Booking scheduler stopped');
  }

  // Manual trigger for testing
  static async runManualCheck() {
    console.log(' Running manual auto-complete check...');
    await this.runAutoCompleteCheck();
  }
}

module.exports = BookingScheduler;
