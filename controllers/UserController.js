const UserModel = require('../models/UserModel');
const EmailVerifiedModel = require('../models/EmailVerifiedModel');
const EmailService = require('../services/EmailService');

class UserController {
  // GET /api/users - Mendapatkan semua users
  static async getAllUsers(req, res) {
    try {
      const users = await UserModel.getAll();
      
      res.json({
        success: true,
        message: 'Data users berhasil diambil',
        data: users,
        total: users.length
      });
    } catch (error) {
      console.error('Error getting all users:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data users',
        error: error.message
      });
    }
  }

  // GET /api/users/:id - Mendapatkan user berdasarkan ID
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await UserModel.getById(id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      res.json({
        success: true,
        message: 'Data user berhasil diambil',
        data: user
      });
    } catch (error) {
      console.error('Error getting user by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data user',
        error: error.message
      });
    }
  }

  // POST /api/users - Membuat user baru
  static async createUser(req, res) {
    try {
      const { name, email, password, gender, address, date_of_birth, account_number, bank_type, role } = req.body;
      
      // Validasi field wajib
      if (!name || !email || !password || !gender || !address || !date_of_birth || !account_number || !bank_type) {
        return res.status(400).json({
          success: false,
          message: 'Semua field wajib diisi (name, email, password, gender, address, date_of_birth, account_number, bank_type)'
        });
      }

      // Cek apakah email sudah ada
      const existingUser = await UserModel.getByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email sudah terdaftar'
        });
      }

      const userId = await UserModel.create(req.body);
      const newUser = await UserModel.getById(userId);

      // Generate dan kirim OTP untuk verifikasi email
      const otp = EmailVerifiedModel.generateOTP();
      await EmailVerifiedModel.create({
        email: email,
        id_user: userId,
        otp: otp
      });

      // Kirim email OTP
      const emailResult = await EmailService.sendOTPEmail(email, otp, name);
      
      res.status(201).json({
        success: true,
        message: 'User berhasil dibuat. Silakan cek email untuk verifikasi OTP.',
        data: newUser,
        emailSent: emailResult.success,
        note: 'Email verification diperlukan untuk aktivasi akun'
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat user',
        error: error.message
      });
    }
  }

  // PUT /api/users/:id - Update user
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      
      // Cek apakah user ada
      const existingUser = await UserModel.getById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      const updated = await UserModel.update(id, req.body);
      
      if (!updated) {
        return res.status(500).json({
          success: false,
          message: 'Gagal mengupdate user'
        });
      }

      const updatedUser = await UserModel.getById(id);

      res.json({
        success: true,
        message: 'User berhasil diupdate',
        data: updatedUser
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate user',
        error: error.message
      });
    }
  }

  // DELETE /api/users/:id - Hapus user
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      // Cek apakah user ada
      const existingUser = await UserModel.getById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      const deleted = await UserModel.delete(id);
      
      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: 'Gagal menghapus user'
        });
      }

      res.json({
        success: true,
        message: 'User berhasil dihapus'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus user',
        error: error.message
      });
    }
  }

  // GET /api/users/role/:role - Mendapatkan users berdasarkan role
  static async getUsersByRole(req, res) {
    try {
      const { role } = req.params;
      const users = await UserModel.getByRole(role);
      
      res.json({
        success: true,
        message: `Data users dengan role ${role} berhasil diambil`,
        data: users,
        total: users.length
      });
    } catch (error) {
      console.error('Error getting users by role:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data users',
        error: error.message
      });
    }
  }

  // PATCH /api/users/:id/verify - Verifikasi email user
  static async verifyUser(req, res) {
    try {
      const { id } = req.params;
      
      // Cek apakah user ada
      const existingUser = await UserModel.getById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      const verified = await UserModel.verifyEmail(id);
      
      if (!verified) {
        return res.status(500).json({
          success: false,
          message: 'Gagal memverifikasi user'
        });
      }

      const updatedUser = await UserModel.getById(id);

      res.json({
        success: true,
        message: 'User berhasil diverifikasi',
        data: updatedUser
      });
    } catch (error) {
      console.error('Error verifying user:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memverifikasi user',
        error: error.message
      });
    }
  }

  // POST /api/users/login - Login user
  static async loginUser(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email dan password wajib diisi'
        });
      }

      const user = await UserModel.login(email, password);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah'
        });
      }

      res.json({
        success: true,
        message: 'Login berhasil',
        data: user
      });
    } catch (error) {
      console.error('Error login user:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal login',
        error: error.message
      });
    }
  }

  // PATCH /api/users/:id/change-password - Ganti password user
  static async changePassword(req, res) {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword } = req.body;
      
      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Old password dan new password wajib diisi'
        });
      }

      // Cek apakah user ada
      const existingUser = await UserModel.getById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      const changed = await UserModel.changePassword(id, oldPassword, newPassword);
      
      if (!changed) {
        return res.status(400).json({
          success: false,
          message: 'Password lama tidak sesuai'
        });
      }

      res.json({
        success: true,
        message: 'Password berhasil diubah'
      });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengubah password',
        error: error.message
      });
    }
  }

  // POST /api/users/verify-otp - Verifikasi OTP email
  static async verifyOTP(req, res) {
    try {
      const { email, otp } = req.body;
      
      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Email dan OTP wajib diisi'
        });
      }

      // Verifikasi OTP
      const otpRecord = await EmailVerifiedModel.verifyOTP(email, otp);
      
      if (!otpRecord) {
        return res.status(400).json({
          success: false,
          message: 'OTP tidak valid atau sudah expired. OTP berlaku 15 menit.'
        });
      }

      // Update status verifikasi user
      const verified = await UserModel.verifyEmail(otpRecord.id_user);
      
      if (!verified) {
        return res.status(500).json({
          success: false,
          message: 'Gagal memverifikasi user'
        });
      }

      // Hapus OTP record setelah berhasil diverifikasi
      await EmailVerifiedModel.delete(otpRecord.id);

      // Ambil data user yang sudah diverifikasi
      const verifiedUser = await UserModel.getById(otpRecord.id_user);

      // Kirim email welcome
      await EmailService.sendWelcomeEmail(email, verifiedUser.name);

      res.json({
        success: true,
        message: 'Email berhasil diverifikasi! Akun Anda sudah aktif.',
        data: verifiedUser
      });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memverifikasi OTP',
        error: error.message
      });
    }
  }

  // POST /api/users/resend-otp - Kirim ulang OTP
  static async resendOTP(req, res) {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email wajib diisi'
        });
      }

      // Cek apakah user dengan email tersebut ada
      const user = await UserModel.getByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Email tidak terdaftar'
        });
      }

      // Cek apakah user sudah diverifikasi
      if (user.is_verified) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah diverifikasi sebelumnya'
        });
      }

      // Hapus OTP lama jika ada
      await EmailVerifiedModel.deleteByEmail(email);

      // Generate OTP baru
      const otp = EmailVerifiedModel.generateOTP();
      await EmailVerifiedModel.create({
        email: email,
        id_user: user.id,
        otp: otp
      });

      // Kirim email OTP baru
      const emailResult = await EmailService.sendOTPEmail(email, otp, user.name);

      res.json({
        success: true,
        message: 'OTP baru berhasil dikirim ke email Anda',
        emailSent: emailResult.success
      });
    } catch (error) {
      console.error('Error resending OTP:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengirim ulang OTP',
        error: error.message
      });
    }
  }

  // GET /api/users/check-verification/:email - Cek status verifikasi email
  static async checkVerificationStatus(req, res) {
    try {
      const { email } = req.params;
      
      const user = await UserModel.getByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Email tidak terdaftar'
        });
      }

      // Cek apakah ada OTP aktif
      const hasActiveOTP = await EmailVerifiedModel.hasActiveOTP(email);

      res.json({
        success: true,
        data: {
          email: email,
          isVerified: !!user.is_verified,
          hasActiveOTP: hasActiveOTP,
          verifiedAt: user.is_verified
        }
      });
    } catch (error) {
      console.error('Error checking verification status:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengecek status verifikasi',
        error: error.message
      });
    }
  }
}

module.exports = UserController;