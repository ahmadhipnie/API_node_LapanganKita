const mysql = require('mysql2/promise');
const { deleteFile, getFullPath } = require('../middleware/uploadFieldPhoto');

class FieldController {
  // Get all fields with place and owner info
  static async getAllFields(req, res) {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [fields] = await connection.execute(`
        SELECT f.*, p.place_name, p.address as place_address, u.name as place_owner_name 
        FROM fields f 
        LEFT JOIN places p ON f.id_place = p.id 
        LEFT JOIN users u ON p.id_users = u.id 
        ORDER BY f.created_at DESC
      `);

      await connection.end();

      res.json({
        success: true,
        message: 'Data fields berhasil diambil',
        data: fields
      });

    } catch (error) {
      console.error('Error getting fields:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data fields',
        error: error.message
      });
    }
  }

  // Get field by ID
  static async getFieldById(req, res) {
    try {
      const { id } = req.params;
      
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [fields] = await connection.execute(`
        SELECT f.*, p.place_name, p.address as place_address, u.name as place_owner_name 
        FROM fields f 
        LEFT JOIN places p ON f.id_place = p.id 
        LEFT JOIN users u ON p.id_users = u.id 
        WHERE f.id = ?
      `, [id]);

      await connection.end();

      if (fields.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Field tidak ditemukan'
        });
      }

      res.json({
        success: true,
        message: 'Data field berhasil diambil',
        data: fields[0]
      });

    } catch (error) {
      console.error('Error getting field by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data field',
        error: error.message
      });
    }
  }

  // Create new field with owner validation
  static async createField(req, res) {
    try {
      const {
        field_name,
        opening_time,
        closing_time,
        price_per_hour,
        description,
        field_type,
        status = 'available',
        max_person,
        id_place,
        id_users
      } = req.body;
      
      // Validation
      if (!field_name || !opening_time || !closing_time || !price_per_hour || !description || !field_type || !max_person || !id_place || !id_users) {
        return res.status(400).json({
          success: false,
          message: 'Semua field wajib diisi: field_name, opening_time, closing_time, price_per_hour, description, field_type, max_person, id_place, id_users'
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
        [id_place, id_users]
      );

      if (places.length === 0) {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: 'Place tidak ditemukan atau Anda bukan pemilik place tersebut'
        });
      }

      const photoPath = req.file ? `/uploads/fields/${req.file.filename}` : '';
      
      const [result] = await connection.execute(`
        INSERT INTO fields (
          field_name, opening_time, closing_time, price_per_hour, 
          description, field_type, field_photo, status, max_person, 
          id_place, created_at, updated_at
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        field_name,
        opening_time,
        closing_time,
        price_per_hour,
        description,
        field_type,
        photoPath,
        status,
        max_person,
        id_place
      ]);

      // Get the newly created field with related data
      const [newField] = await connection.execute(`
        SELECT f.*, p.place_name, p.address as place_address, u.name as place_owner_name 
        FROM fields f 
        LEFT JOIN places p ON f.id_place = p.id 
        LEFT JOIN users u ON p.id_users = u.id 
        WHERE f.id = ?
      `, [result.insertId]);

      await connection.end();

      res.status(201).json({
        success: true,
        message: 'Field berhasil dibuat',
        data: newField[0]
      });

    } catch (error) {
      console.error('Error creating field:', error);
      
      // Clean up uploaded file if error
      if (req.file) {
        deleteFile(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        message: 'Gagal membuat field',
        error: error.message
      });
    }
  }

  // Update field with owner validation
  static async updateField(req, res) {
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

      // Get existing field and validate owner
      const [existingField] = await connection.execute(`
        SELECT f.*, p.id_users as place_owner_id 
        FROM fields f 
        LEFT JOIN places p ON f.id_place = p.id 
        WHERE f.id = ?
      `, [id]);

      if (existingField.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Field tidak ditemukan'
        });
      }

      if (existingField[0].place_owner_id != id_users) {
        await connection.end();
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki izin untuk mengubah field ini'
        });
      }

      // Delete old photo if new photo uploaded
      if (req.file && existingField[0].field_photo) {
        const oldFilePath = getFullPath(existingField[0].field_photo);
        if (oldFilePath) {
          deleteFile(oldFilePath);
        }
      }

      // Build dynamic update query
      const updateFields = [];
      const updateValues = [];
      const { field_name, opening_time, closing_time, price_per_hour, description, field_type, status, max_person } = req.body;

      if (field_name) {
        updateFields.push('field_name = ?');
        updateValues.push(field_name);
      }
      if (opening_time) {
        updateFields.push('opening_time = ?');
        updateValues.push(opening_time);
      }
      if (closing_time) {
        updateFields.push('closing_time = ?');
        updateValues.push(closing_time);
      }
      if (price_per_hour !== undefined) {
        updateFields.push('price_per_hour = ?');
        updateValues.push(price_per_hour);
      }
      if (description) {
        updateFields.push('description = ?');
        updateValues.push(description);
      }
      if (field_type) {
        updateFields.push('field_type = ?');
        updateValues.push(field_type);
      }
      if (status) {
        updateFields.push('status = ?');
        updateValues.push(status);
      }
      if (max_person !== undefined) {
        updateFields.push('max_person = ?');
        updateValues.push(max_person);
      }
      if (req.file) {
        updateFields.push('field_photo = ?');
        updateValues.push(`/uploads/fields/${req.file.filename}`);
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(id);

      if (updateFields.length > 1) {
        const updateQuery = `UPDATE fields SET ${updateFields.join(', ')} WHERE id = ?`;
        await connection.execute(updateQuery, updateValues);
      }

      // Get updated field data
      const [updatedField] = await connection.execute(`
        SELECT f.*, p.place_name, p.address as place_address, u.name as place_owner_name 
        FROM fields f 
        LEFT JOIN places p ON f.id_place = p.id 
        LEFT JOIN users u ON p.id_users = u.id 
        WHERE f.id = ?
      `, [id]);

      await connection.end();

      res.json({
        success: true,
        message: 'Field berhasil diupdate',
        data: updatedField[0]
      });

    } catch (error) {
      console.error('Error updating field:', error);
      
      // Clean up uploaded file if error
      if (req.file) {
        deleteFile(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate field',
        error: error.message
      });
    }
  }

  // Delete field with owner validation
  static async deleteField(req, res) {
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

      // Get field and validate owner
      const [field] = await connection.execute(`
        SELECT f.*, p.id_users as place_owner_id 
        FROM fields f 
        LEFT JOIN places p ON f.id_place = p.id 
        WHERE f.id = ?
      `, [id]);

      if (field.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Field tidak ditemukan'
        });
      }

      if (field[0].place_owner_id != id_users) {
        await connection.end();
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki izin untuk menghapus field ini'
        });
      }

      // Delete from database
      await connection.execute('DELETE FROM fields WHERE id = ?', [id]);
      await connection.end();

      // Delete photo file
      if (field[0].field_photo) {
        const filePath = getFullPath(field[0].field_photo);
        if (filePath) {
          deleteFile(filePath);
        }
      }

      res.json({
        success: true,
        message: 'Field berhasil dihapus'
      });

    } catch (error) {
      console.error('Error deleting field:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus field',
        error: error.message
      });
    }
  }

  // Get fields by place
  static async getFieldsByPlace(req, res) {
    try {
      const { id_place } = req.params;

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [fields] = await connection.execute(`
        SELECT f.*, p.place_name, p.address as place_address, u.name as place_owner_name 
        FROM fields f 
        LEFT JOIN places p ON f.id_place = p.id 
        LEFT JOIN users u ON p.id_users = u.id 
        WHERE f.id_place = ? 
        ORDER BY f.created_at DESC
      `, [id_place]);

      await connection.end();

      res.json({
        success: true,
        message: 'Data fields berhasil diambil',
        data: fields
      });

    } catch (error) {
      console.error('Error getting fields by place:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data fields',
        error: error.message
      });
    }
  }

  // Search fields
  static async searchFields(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Parameter pencarian (q) diperlukan'
        });
      }

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [fields] = await connection.execute(`
        SELECT f.*, p.place_name, p.address as place_address, u.name as place_owner_name 
        FROM fields f 
        LEFT JOIN places p ON f.id_place = p.id 
        LEFT JOIN users u ON p.id_users = u.id 
        WHERE f.field_name LIKE ? OR f.description LIKE ? OR f.field_type LIKE ?
        ORDER BY f.created_at DESC
      `, [`%${q}%`, `%${q}%`, `%${q}%`]);

      await connection.end();

      res.json({
        success: true,
        message: 'Pencarian berhasil',
        data: fields,
        query: q
      });

    } catch (error) {
      console.error('Error searching fields:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal melakukan pencarian',
        error: error.message
      });
    }
  }
}

module.exports = FieldController;