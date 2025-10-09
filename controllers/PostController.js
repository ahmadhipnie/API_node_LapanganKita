const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs').promises;

class PostController {
  // Get all posts with booking and user details - NO AUTH REQUIRED
  static async getAllPosts(req, res) {
    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [posts] = await connection.execute(`
        SELECT 
          p.*,
          b.booking_datetime_start,
          b.booking_datetime_end,
          b.status as booking_status,
          b.total_price,
          u.name as poster_name,
          u.email as poster_email,
          f.field_name,
          f.field_type,
          f.max_person,
          pl.place_name,
          pl.address as place_address,
          fo.name as field_owner_name,
          (SELECT COUNT(*) FROM joined j WHERE j.id_booking = b.id AND j.status = 'approved') as joined_count
        FROM post p
        LEFT JOIN bookings b ON p.id_booking = b.id
        LEFT JOIN users u ON b.id_users = u.id
        LEFT JOIN fields f ON b.field_id = f.id
        LEFT JOIN places pl ON f.id_place = pl.id
        LEFT JOIN users fo ON pl.id_users = fo.id
        WHERE b.status = 'approved'
        ORDER BY p.created_at DESC
      `);

      await connection.end();

      res.json({
        success: true,
        message: 'Data posts berhasil diambil',
        data: posts
      });

    } catch (error) {
      console.error('Error getting all posts:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data posts',
        error: error.message
      });
    }
  }

  // Get post by ID with details - NO AUTH REQUIRED
  static async getPostById(req, res) {
    try {
      const { id } = req.params;

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      const [posts] = await connection.execute(`
        SELECT 
          p.*,
          b.booking_datetime_start,
          b.booking_datetime_end,
          b.status as booking_status,
          b.total_price,
          b.id_users as poster_user_id,
          u.name as poster_name,
          u.email as poster_email,
          f.field_name,
          f.field_type,
          f.max_person,
          f.price_per_hour,
          pl.place_name,
          pl.address as place_address,
          fo.name as field_owner_name,
          (SELECT COUNT(*) FROM joined j WHERE j.id_booking = b.id AND j.status = 'approved') as joined_count,
          (SELECT COUNT(*) FROM joined j WHERE j.id_booking = b.id AND j.status = 'pending') as pending_count
        FROM post p
        LEFT JOIN bookings b ON p.id_booking = b.id
        LEFT JOIN users u ON b.id_users = u.id
        LEFT JOIN fields f ON b.field_id = f.id
        LEFT JOIN places pl ON f.id_place = pl.id
        LEFT JOIN users fo ON pl.id_users = fo.id
        WHERE p.id = ?
      `, [id]);

      if (posts.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Post tidak ditemukan'
        });
      }

      // Get joined users for this post
      const [joinedUsers] = await connection.execute(`
        SELECT 
          j.*,
          u.name as user_name,
          u.email as user_email
        FROM joined j
        LEFT JOIN users u ON j.id_users = u.id
        WHERE j.id_booking = ?
        ORDER BY j.created_at DESC
      `, [posts[0].id_booking]);

      posts[0].joined_users = joinedUsers;

      await connection.end();

      res.json({
        success: true,
        message: 'Data post berhasil diambil',
        data: posts[0]
      });

    } catch (error) {
      console.error('Error getting post by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data post',
        error: error.message
      });
    }
  }

  // Get posts by user ID - NO AUTH REQUIRED
  static async getPostsByUserId(req, res) {
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

      const [posts] = await connection.execute(`
        SELECT 
          p.*,
          b.booking_datetime_start,
          b.booking_datetime_end,
          b.status as booking_status,
          f.field_name,
          f.field_type,
          f.max_person,
          pl.place_name,
          (SELECT COUNT(*) FROM joined j WHERE j.id_booking = b.id AND j.status = 'approved') as joined_count,
          (SELECT COUNT(*) FROM joined j WHERE j.id_booking = b.id AND j.status = 'pending') as pending_count
        FROM post p
        LEFT JOIN bookings b ON p.id_booking = b.id
        LEFT JOIN fields f ON b.field_id = f.id
        LEFT JOIN places pl ON f.id_place = pl.id
        WHERE b.id_users = ?
        ORDER BY p.created_at DESC
      `, [user_id]);

      await connection.end();

      res.json({
        success: true,
        message: 'Data posts user berhasil diambil',
        data: posts
      });

    } catch (error) {
      console.error('Error getting posts by user ID:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data posts user',
        error: error.message
      });
    }
  }

  // Create new post with photo upload - NO AUTH REQUIRED
  static async createPost(req, res) {
    try {
      const { 
        id_booking,
        post_title,
        post_description
      } = req.body;

      // Validate required fields
      if (!id_booking || !post_title || !post_description) {
        return res.status(400).json({
          success: false,
          message: 'Field yang diperlukan: id_booking, post_title, post_description'
        });
      }

      // Check if file is uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'File photo post harus diupload'
        });
      }

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Check if booking exists and is approved
      const [bookings] = await connection.execute(`
        SELECT b.*, f.max_person, f.field_name 
        FROM bookings b
        LEFT JOIN fields f ON b.field_id = f.id
        WHERE b.id = ?
      `, [id_booking]);

      if (bookings.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Booking tidak ditemukan'
        });
      }

      const booking = bookings[0];

      if (booking.status !== 'approved') {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: 'Post hanya dapat dibuat untuk booking yang sudah disetujui'
        });
      }

      // Check if post already exists for this booking
      const [existingPosts] = await connection.execute(`
        SELECT id FROM post WHERE id_booking = ?
      `, [id_booking]);

      if (existingPosts.length > 0) {
        await connection.end();
        return res.status(400).json({
          success: false,
          message: 'Post untuk booking ini sudah ada'
        });
      }

      // Get file path (relative to uploads directory)
      const filePath = `posts/${req.file.filename}`;

      // Create post record
      const [postResult] = await connection.execute(`
        INSERT INTO post (
          id_booking,
          post_title,
          post_description,
          post_photo,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, NOW(), NOW())
      `, [id_booking, post_title, post_description, filePath]);

      await connection.end();

      res.status(201).json({
        success: true,
        message: 'Post berhasil dibuat',
        data: {
          post_id: postResult.insertId,
          id_booking: id_booking,
          post_title: post_title,
          post_description: post_description,
          post_photo: filePath,
          field_name: booking.field_name,
          max_person: booking.max_person,
          message: 'Post telah dipublikasi, user lain dapat bergabung'
        }
      });

    } catch (error) {
      console.error('Error creating post:', error);
      
      // Delete uploaded file if database operation fails
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting uploaded file:', unlinkError);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Gagal membuat post',
        error: error.message
      });
    }
  }

  // Update post - NO AUTH REQUIRED
  static async updatePost(req, res) {
    try {
      const { id } = req.params;
      const { post_title, post_description } = req.body;

      if (!post_title || !post_description) {
        return res.status(400).json({
          success: false,
          message: 'post_title dan post_description diperlukan'
        });
      }

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Check if post exists
      const [posts] = await connection.execute(`
        SELECT * FROM post WHERE id = ?
      `, [id]);

      if (posts.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Post tidak ditemukan'
        });
      }

      const post = posts[0];
      let filePath = post.post_photo;

      // If new file is uploaded, replace the old one
      if (req.file) {
        // Delete old file
        try {
          const oldFilePath = path.join(__dirname, '..', 'uploads', post.post_photo);
          await fs.unlink(oldFilePath);
        } catch (deleteError) {
          console.log('Old file not found or already deleted:', deleteError.message);
        }

        filePath = `posts/${req.file.filename}`;
      }

      // Update post
      await connection.execute(`
        UPDATE post 
        SET post_title = ?, post_description = ?, post_photo = ?, updated_at = NOW() 
        WHERE id = ?
      `, [post_title, post_description, filePath, id]);

      await connection.end();

      res.json({
        success: true,
        message: 'Post berhasil diupdate',
        data: {
          post_id: id,
          post_title: post_title,
          post_description: post_description,
          post_photo: filePath
        }
      });

    } catch (error) {
      console.error('Error updating post:', error);

      // Delete uploaded file if database operation fails
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting uploaded file:', unlinkError);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate post',
        error: error.message
      });
    }
  }

  // Delete post - NO AUTH REQUIRED
  static async deletePost(req, res) {
    try {
      const { id } = req.params;

      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
      });

      // Get post info before deleting
      const [posts] = await connection.execute(`
        SELECT * FROM post WHERE id = ?
      `, [id]);

      if (posts.length === 0) {
        await connection.end();
        return res.status(404).json({
          success: false,
          message: 'Post tidak ditemukan'
        });
      }

      const post = posts[0];

      // Delete post record
      await connection.execute(`
        DELETE FROM post WHERE id = ?
      `, [id]);

      await connection.end();

      // Delete photo file
      try {
        const filePath = path.join(__dirname, '..', 'uploads', post.post_photo);
        await fs.unlink(filePath);
      } catch (deleteError) {
        console.log('File not found or already deleted:', deleteError.message);
      }

      res.json({
        success: true,
        message: 'Post berhasil dihapus',
        data: {
          post_id: id,
          deleted_file: post.post_photo
        }
      });

    } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal menghapus post',
        error: error.message
      });
    }
  }
}

module.exports = PostController;