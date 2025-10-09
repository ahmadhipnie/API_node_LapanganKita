const mysql = require('mysql2/promise');
const { deleteWithdrawFile } = require('../middleware/uploadWithdraw');

class WithdrawController {
  // Create withdraw - NO AUTH REQUIRED
  static async createWithdraw(req, res) {
    try {
      const { id_users, amount } = req.body;
      const file_photo = req.body.file_photo; // Set by upload middleware

      // Validate required fields
      if (!id_users || !amount || !file_photo) {
        // Delete uploaded file if validation fails
        if (file_photo) {
          deleteWithdrawFile(file_photo);
        }
        return res.status(400).json({
          success: false,
          message: 'Field yang diperlukan: id_users, amount, file_photo'
        });
      }

      // Validate amount (must be positive integer)
      const withdrawAmount = parseInt(amount);
      if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
        deleteWithdrawFile(file_photo);
        return res.status(400).json({
          success: false,
          message: 'Amount harus berupa angka positif'
        });
      }

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Check if user exists and get their places
      const [userPlaces] = await connection.execute(`
        SELECT 
          p.id,
          p.place_name,
          p.balance,
          u.name as user_name,
          u.email as user_email
        FROM places p
        LEFT JOIN users u ON p.id_users = u.id
        WHERE p.id_users = ?
      `, [id_users]);

      if (userPlaces.length === 0) {
        await connection.end();
        deleteWithdrawFile(file_photo);
        return res.status(404).json({
          success: false,
          message: 'User tidak memiliki place atau user tidak ditemukan'
        });
      }

      // Calculate total balance from all user's places
      const totalBalance = userPlaces.reduce((sum, place) => {
        return sum + parseFloat(place.balance || 0);
      }, 0);

      // Check if total balance is sufficient
      if (totalBalance < withdrawAmount) {
        await connection.end();
        deleteWithdrawFile(file_photo);
        return res.status(400).json({
          success: false,
          message: `Balance tidak mencukupi. Total balance: ${totalBalance}, Amount withdraw: ${withdrawAmount}`
        });
      }

      // Start transaction
      await connection.beginTransaction();

      try {
        // Create withdraw record
        const [withdrawResult] = await connection.execute(`
          INSERT INTO withdraw (
            id_users,
            amount,
            file_photo,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, NOW(), NOW())
        `, [id_users, withdrawAmount, file_photo]);

        // Deduct balance from places (starting from the first place with sufficient balance)
        let remainingAmount = withdrawAmount;
        
        for (const place of userPlaces) {
          if (remainingAmount <= 0) break;
          
          const placeBalance = parseFloat(place.balance || 0);
          if (placeBalance > 0) {
            const deductAmount = Math.min(placeBalance, remainingAmount);
            
            await connection.execute(`
              UPDATE places 
              SET balance = balance - ?, updated_at = NOW() 
              WHERE id = ?
            `, [deductAmount, place.id]);
            
            remainingAmount -= deductAmount;
            
            console.log(`Deducted ${deductAmount} from place ${place.place_name} (ID: ${place.id})`);
          }
        }

        await connection.commit();
        await connection.end();

        res.status(201).json({
          success: true,
          message: 'Withdraw berhasil dibuat',
          data: {
            withdraw_id: withdrawResult.insertId,
            id_users: id_users,
            amount: withdrawAmount,
            file_photo: file_photo,
            user_info: {
              user_name: userPlaces[0].user_name,
              user_email: userPlaces[0].user_email
            },
            balance_info: {
              previous_total_balance: totalBalance,
              remaining_balance: totalBalance - withdrawAmount,
              places_affected: userPlaces.length
            }
          }
        });

      } catch (error) {
        await connection.rollback();
        await connection.end();
        deleteWithdrawFile(file_photo);
        throw error;
      }

    } catch (error) {
      console.error('Error creating withdraw:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat withdraw',
        error: error.message
      });
    }
  }

  // Get all withdraws with user details - NO AUTH REQUIRED
  static async getAllWithdraws(req, res) {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [withdraws] = await connection.execute(`
        SELECT 
          w.*,
          u.name as user_name,
          u.email as user_email
        FROM withdraw w
        LEFT JOIN users u ON w.id_users = u.id
        ORDER BY w.created_at DESC
      `);

      // Add full URL for file_photo
      const withdrawsWithFullUrl = withdraws.map(withdraw => ({
        ...withdraw,
        file_photo_url: `${req.protocol}://${req.get('host')}/${withdraw.file_photo}`
      }));

      await connection.end();

      res.json({
        success: true,
        message: 'Data withdraws berhasil diambil',
        count: withdraws.length,
        data: withdrawsWithFullUrl
      });

    } catch (error) {
      console.error('Error getting all withdraws:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data withdraws',
        error: error.message
      });
    }
  }

  // Get withdraw by ID - NO AUTH REQUIRED
  static async getWithdrawById(req, res) {
    try {
      const { id } = req.params;

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [withdraws] = await connection.execute(`
        SELECT 
          w.*,
          u.name as user_name,
          u.email as user_email
        FROM withdraw w
        LEFT JOIN users u ON w.id_users = u.id
        WHERE w.id = ?
      `, [id]);

      if (withdraws.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Withdraw tidak ditemukan'
        });
      }

      // Add full URL for file_photo
      const withdraw = {
        ...withdraws[0],
        file_photo_url: `${req.protocol}://${req.get('host')}/${withdraws[0].file_photo}`
      };

      await connection.end();

      res.json({
        success: true,
        message: 'Data withdraw berhasil diambil',
        data: withdraw
      });

    } catch (error) {
      console.error('Error getting withdraw by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data withdraw',
        error: error.message
      });
    }
  }

  // Get withdraws by user ID - NO AUTH REQUIRED
  static async getWithdrawsByUserId(req, res) {
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

      const [withdraws] = await connection.execute(`
        SELECT 
          w.*,
          u.name as user_name,
          u.email as user_email
        FROM withdraw w
        LEFT JOIN users u ON w.id_users = u.id
        WHERE w.id_users = ?
        ORDER BY w.created_at DESC
      `, [user_id]);

      // Add full URL for file_photo
      const withdrawsWithFullUrl = withdraws.map(withdraw => ({
        ...withdraw,
        file_photo_url: `${req.protocol}://${req.get('host')}/${withdraw.file_photo}`
      }));

      await connection.end();

      res.json({
        success: true,
        message: 'Data withdraws user berhasil diambil',
        count: withdraws.length,
        data: withdrawsWithFullUrl
      });

    } catch (error) {
      console.error('Error getting withdraws by user ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data withdraws user',
        error: error.message
      });
    }
  }

  // Update withdraw (only file_photo can be updated) - NO AUTH REQUIRED
  static async updateWithdraw(req, res) {
    try {
      const { id } = req.params;
      const file_photo = req.body.file_photo; // Set by upload middleware

      if (!file_photo) {
        return res.status(400).json({
          success: false,
          message: 'File foto diperlukan untuk update'
        });
      }

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Get existing withdraw data
      const [existingWithdraw] = await connection.execute(`
        SELECT * FROM withdraw WHERE id = ?
      `, [id]);

      if (existingWithdraw.length === 0) {
        await connection.end();
        deleteWithdrawFile(file_photo);
        return res.status(404).json({
          success: false,
          message: 'Withdraw tidak ditemukan'
        });
      }

      const oldFilePath = existingWithdraw[0].file_photo;

      // Update withdraw
      await connection.execute(`
        UPDATE withdraw 
        SET file_photo = ?, updated_at = NOW() 
        WHERE id = ?
      `, [file_photo, id]);

      // Get updated withdraw data with user info
      const [updatedWithdraw] = await connection.execute(`
        SELECT 
          w.*,
          u.name as user_name,
          u.email as user_email
        FROM withdraw w
        LEFT JOIN users u ON w.id_users = u.id
        WHERE w.id = ?
      `, [id]);

      await connection.end();

      // Delete old file
      deleteWithdrawFile(oldFilePath);

      // Add full URL for file_photo
      const withdraw = {
        ...updatedWithdraw[0],
        file_photo_url: `${req.protocol}://${req.get('host')}/${updatedWithdraw[0].file_photo}`
      };

      res.json({
        success: true,
        message: 'Withdraw berhasil diupdate',
        data: withdraw
      });

    } catch (error) {
      console.error('Error updating withdraw:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate withdraw',
        error: error.message
      });
    }
  }

  // Delete withdraw - NO AUTH REQUIRED
  static async deleteWithdraw(req, res) {
    try {
      const { id } = req.params;

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Get withdraw data before deletion
      const [existingWithdraw] = await connection.execute(`
        SELECT * FROM withdraw WHERE id = ?
      `, [id]);

      if (existingWithdraw.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Withdraw tidak ditemukan'
        });
      }

      const withdraw = existingWithdraw[0];

      // Note: Deleting withdraw does NOT restore balance to places
      // This is a business decision - once money is withdrawn, it should not be returned automatically

      // Delete withdraw record
      await connection.execute(`
        DELETE FROM withdraw WHERE id = ?
      `, [id]);

      await connection.end();

      // Delete associated file
      deleteWithdrawFile(withdraw.file_photo);

      res.json({
        success: true,
        message: 'Withdraw berhasil dihapus',
        data: {
          deleted_withdraw_id: id,
          deleted_amount: withdraw.amount,
          note: 'Balance tidak dikembalikan ke places (business policy)'
        }
      });

    } catch (error) {
      console.error('Error deleting withdraw:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus withdraw',
        error: error.message
      });
    }
  }

  // Get user balance summary - NO AUTH REQUIRED
  static async getUserBalanceSummary(req, res) {
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

      // Get user's places and their balances
      const [places] = await connection.execute(`
        SELECT 
          p.id,
          p.place_name,
          p.balance,
          u.name as user_name,
          u.email as user_email
        FROM places p
        LEFT JOIN users u ON p.id_users = u.id
        WHERE p.id_users = ?
      `, [user_id]);

      if (places.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'User tidak memiliki place atau user tidak ditemukan'
        });
      }

      // Get total withdraws
      const [withdraws] = await connection.execute(`
        SELECT 
          COUNT(*) as total_withdraws,
          COALESCE(SUM(amount), 0) as total_withdrawn
        FROM withdraw 
        WHERE id_users = ?
      `, [user_id]);

      // Calculate total balance
      const totalBalance = places.reduce((sum, place) => {
        return sum + parseFloat(place.balance || 0);
      }, 0);

      await connection.end();

      res.json({
        success: true,
        message: 'Balance summary berhasil diambil',
        data: {
          user_info: {
            user_name: places[0].user_name,
            user_email: places[0].user_email
          },
          balance_summary: {
            total_balance: totalBalance,
            total_places: places.length,
            can_withdraw: totalBalance > 0
          },
          places_detail: places.map(place => ({
            place_id: place.id,
            place_name: place.place_name,
            balance: parseFloat(place.balance || 0)
          })),
          withdraw_history: {
            total_withdraws: withdraws[0].total_withdraws,
            total_withdrawn: parseFloat(withdraws[0].total_withdrawn)
          }
        }
      });

    } catch (error) {
      console.error('Error getting user balance summary:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil balance summary',
        error: error.message
      });
    }
  }
}

module.exports = WithdrawController;