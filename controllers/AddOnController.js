const mysql = require('mysql2/promise');
const { deleteFile, getFullPath } = require('../middleware/uploadAddOnPhoto');

class AddOnController {
  // Get all add-ons with place and owner info
  static async getAllAddOn(req, res) {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [addOns] = await connection.execute(`
        SELECT a.*, p.place_name, p.address as place_address, u.name as place_owner_name 
        FROM add_ons a 
        LEFT JOIN places p ON a.place_id = p.id 
        LEFT JOIN users u ON p.id_users = u.id 
        ORDER BY a.created_at DESC
      `);

      await connection.end();

      res.json({
        success: true,
        message: 'Data add-ons berhasil diambil',
        data: addOns
      });

    } catch (error) {
      console.error('Error getting add-ons:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data add-ons',
        error: error.message
      });
    }
  }

  // Get add-on by ID
  static async getAddOnById(req, res) {
    try {
      const { id } = req.params;
      
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [addOns] = await connection.execute(`
        SELECT a.*, p.place_name, p.address as place_address, u.name as place_owner_name 
        FROM add_ons a 
        LEFT JOIN places p ON a.place_id = p.id 
        LEFT JOIN users u ON p.id_users = u.id 
        WHERE a.id = ?
      `, [id]);

      await connection.end();

      if (addOns.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Add-on tidak ditemukan'
        });
      }

      res.json({
        success: true,
        message: 'Data add-on berhasil diambil',
        data: addOns[0]
      });

    } catch (error) {
      console.error('Error getting add-on by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data add-on',
        error: error.message
      });
    }
  }

  // Create new add-on with owner validation
  static async createAddOn(req, res) {
    try {
      const {
        add_on_name,
        price_per_hour,
        stock,
        add_on_description,
        place_id,
        id_users
      } = req.body;
      
      // Validation
      if (!add_on_name || !price_per_hour || !stock || !add_on_description || !place_id || !id_users) {
        return res.status(400).json({
          success: false,
          message: 'Semua field wajib diisi: add_on_name, price_per_hour, stock, add_on_description, place_id, id_users'
        });
      }

      // Validate photo upload
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Foto add-on wajib diupload'
        });
      }

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Validate place ownership
      const [places] = await connection.execute(
        'SELECT id, id_users FROM places WHERE id = ? AND id_users = ?',
        [place_id, id_users]
      );

      if (places.length === 0) {
        await connection.end();
        // Clean up uploaded file
        if (req.file) {
          deleteFile(req.file.path);
        }
        return res.status(400).json({
          success: false,
          message: 'Place tidak ditemukan atau Anda bukan pemilik place tersebut'
        });
      }

      const photoPath = `/uploads/add-ons/${req.file.filename}`;
      
      const [result] = await connection.execute(`
        INSERT INTO add_ons (
          add_on_name, price_per_hour, add_on_photo, stock, 
          add_on_description, place_id, created_at, updated_at
        ) 
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        add_on_name,
        price_per_hour,
        photoPath,
        stock,
        add_on_description,
        place_id
      ]);

      // Get the newly created add-on with related data
      const [newAddOn] = await connection.execute(`
        SELECT a.*, p.place_name, p.address as place_address, u.name as place_owner_name 
        FROM add_ons a 
        LEFT JOIN places p ON a.place_id = p.id 
        LEFT JOIN users u ON p.id_users = u.id 
        WHERE a.id = ?
      `, [result.insertId]);

      await connection.end();

      res.status(201).json({
        success: true,
        message: 'Add-on berhasil dibuat',
        data: newAddOn[0]
      });

    } catch (error) {
      console.error('Error creating add-on:', error);
      
      // Clean up uploaded file if error
      if (req.file) {
        deleteFile(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        message: 'Gagal membuat add-on',
        error: error.message
      });
    }
  }

  // Update add-on with owner validation
  static async updateAddOn(req, res) {
    try {
      const { id } = req.params;
      const { id_users } = req.body;

      if (!id_users) {
        return res.status(400).json({
          success: false,
          message: 'id_users (place owner) wajib disertakan untuk validasi'
        });
      }

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Get existing add-on and validate owner
      const [existingAddOn] = await connection.execute(`
        SELECT a.*, p.id_users as place_owner_id 
        FROM add_ons a 
        LEFT JOIN places p ON a.place_id = p.id 
        WHERE a.id = ?
      `, [id]);

      if (existingAddOn.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Add-on tidak ditemukan'
        });
      }

      if (existingAddOn[0].place_owner_id != id_users) {
        await connection.end();
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki izin untuk mengubah add-on ini'
        });
      }

      // Delete old photo if new photo uploaded
      if (req.file && existingAddOn[0].add_on_photo) {
        const oldFilePath = getFullPath(existingAddOn[0].add_on_photo);
        if (oldFilePath) {
          deleteFile(oldFilePath);
        }
      }

      // Build dynamic update query
      const updateFields = [];
      const updateValues = [];
      const { add_on_name, price_per_hour, stock, add_on_description } = req.body;

      if (add_on_name) {
        updateFields.push('add_on_name = ?');
        updateValues.push(add_on_name);
      }
      if (price_per_hour !== undefined) {
        updateFields.push('price_per_hour = ?');
        updateValues.push(price_per_hour);
      }
      if (stock !== undefined) {
        updateFields.push('stock = ?');
        updateValues.push(stock);
      }
      if (add_on_description) {
        updateFields.push('add_on_description = ?');
        updateValues.push(add_on_description);
      }
      if (req.file) {
        updateFields.push('add_on_photo = ?');
        updateValues.push(`/uploads/add-ons/${req.file.filename}`);
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(id);

      if (updateFields.length > 1) {
        const updateQuery = `UPDATE add_ons SET ${updateFields.join(', ')} WHERE id = ?`;
        await connection.execute(updateQuery, updateValues);
      }

      // Get updated add-on data
      const [updatedAddOn] = await connection.execute(`
        SELECT a.*, p.place_name, p.address as place_address, u.name as place_owner_name 
        FROM add_ons a 
        LEFT JOIN places p ON a.place_id = p.id 
        LEFT JOIN users u ON p.id_users = u.id 
        WHERE a.id = ?
      `, [id]);

      await connection.end();

      res.json({
        success: true,
        message: 'Add-on berhasil diupdate',
        data: updatedAddOn[0]
      });

    } catch (error) {
      console.error('Error updating add-on:', error);
      
      // Clean up uploaded file if error
      if (req.file) {
        deleteFile(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate add-on',
        error: error.message
      });
    }
  }

  // Delete add-on with owner validation
  static async deleteAddOn(req, res) {
    try {
      const { id } = req.params;
      const { id_users } = req.body;

      if (!id_users) {
        return res.status(400).json({
          success: false,
          message: 'id_users (place owner) wajib disertakan untuk validasi'
        });
      }

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Get add-on and validate owner
      const [addOn] = await connection.execute(`
        SELECT a.*, p.id_users as place_owner_id 
        FROM add_ons a 
        LEFT JOIN places p ON a.place_id = p.id 
        WHERE a.id = ?
      `, [id]);

      if (addOn.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Add-on tidak ditemukan'
        });
      }

      if (addOn[0].place_owner_id != id_users) {
        await connection.end();
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki izin untuk menghapus add-on ini'
        });
      }

      // Delete from database
      await connection.execute('DELETE FROM add_ons WHERE id = ?', [id]);
      await connection.end();

      // Delete photo file
      if (addOn[0].add_on_photo) {
        const filePath = getFullPath(addOn[0].add_on_photo);
        if (filePath) {
          deleteFile(filePath);
        }
      }

      res.json({
        success: true,
        message: 'Add-on berhasil dihapus'
      });

    } catch (error) {
      console.error('Error deleting add-on:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus add-on',
        error: error.message
      });
    }
  }

  // Get add-ons by place (maintain original method signature)
  static async getAddOnsByPlaceId(req, res) {
    try {
      const { placeId } = req.params;

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [addOns] = await connection.execute(`
        SELECT a.*, p.place_name, p.address as place_address, u.name as place_owner_name 
        FROM add_ons a 
        LEFT JOIN places p ON a.place_id = p.id 
        LEFT JOIN users u ON p.id_users = u.id 
        WHERE a.place_id = ? 
        ORDER BY a.created_at DESC
      `, [placeId]);

      await connection.end();

      res.json({
        success: true,
        message: 'Data add-ons berhasil diambil',
        data: addOns
      });

    } catch (error) {
      console.error('Error getting add-ons by place:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data add-ons',
        error: error.message
      });
    }
  }

  // Get available add-ons by place (maintain original method signature)
  static async getAvailableAddOnsByPlaceId(req, res) {
    try {
      const { placeId } = req.params;

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [addOns] = await connection.execute(`
        SELECT a.*, p.place_name, p.address as place_address, u.name as place_owner_name 
        FROM add_ons a 
        LEFT JOIN places p ON a.place_id = p.id 
        LEFT JOIN users u ON p.id_users = u.id 
        WHERE a.place_id = ? AND a.stock > 0 
        ORDER BY a.add_on_name ASC
      `, [placeId]);

      await connection.end();

      res.json({
        success: true,
        message: 'Data add-ons yang tersedia berhasil diambil',
        data: addOns
      });

    } catch (error) {
      console.error('Error getting available add-ons by place:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data add-ons yang tersedia',
        error: error.message
      });
    }
  }

  // Update stock add-on (maintain original method signature)
  static async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { stock, id_users } = req.body;

      if (stock === undefined || !id_users) {
        return res.status(400).json({
          success: false,
          message: 'stock dan id_users (place owner) wajib disertakan'
        });
      }

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Validate owner
      const [addOn] = await connection.execute(`
        SELECT a.*, p.id_users as place_owner_id 
        FROM add_ons a 
        LEFT JOIN places p ON a.place_id = p.id 
        WHERE a.id = ?
      `, [id]);

      if (addOn.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Add-on tidak ditemukan'
        });
      }

      if (addOn[0].place_owner_id != id_users) {
        await connection.end();
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki izin untuk mengubah stock add-on ini'
        });
      }

      // Update stock
      await connection.execute(
        'UPDATE add_ons SET stock = ?, updated_at = NOW() WHERE id = ?',
        [stock, id]
      );

      // Get updated data
      const [updatedAddOn] = await connection.execute(`
        SELECT a.*, p.place_name, p.address as place_address, u.name as place_owner_name 
        FROM add_ons a 
        LEFT JOIN places p ON a.place_id = p.id 
        LEFT JOIN users u ON p.id_users = u.id 
        WHERE a.id = ?
      `, [id]);

      await connection.end();

      res.json({
        success: true,
        message: 'Stock add-on berhasil diupdate',
        data: updatedAddOn[0]
      });

    } catch (error) {
      console.error('Error updating add-on stock:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate stock add-on',
        error: error.message
      });
    }
  }
}

module.exports = AddOnController;