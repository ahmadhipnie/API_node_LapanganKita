const UserModel = require('../models/UserModel');

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
      const { name, email, password, gender, address, date_of_birth, account_number, bank_type } = req.body;
      
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

      res.status(201).json({
        success: true,
        message: 'User berhasil dibuat',
        data: newUser
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
}

module.exports = UserController;