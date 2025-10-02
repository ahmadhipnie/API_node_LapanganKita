-- Database schema untuk LapanganKita API
-- File ini akan auto-import saat MySQL container pertama kali running

CREATE DATABASE IF NOT EXISTS lapangan_kita;
USE lapangan_kita;

-- Table: users
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  user_fullname VARCHAR(100) NOT NULL,
  user_email VARCHAR(100) UNIQUE NOT NULL,
  user_password VARCHAR(255) NOT NULL,
  user_phone VARCHAR(20),
  user_role ENUM('admin', 'owner', 'customer') DEFAULT 'customer',
  user_profile_picture LONGTEXT,
  email_verified TINYINT(1) DEFAULT 0,
  verification_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expires DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: places
CREATE TABLE IF NOT EXISTS places (
  place_id INT AUTO_INCREMENT PRIMARY KEY,
  place_name VARCHAR(100) NOT NULL,
  place_address TEXT NOT NULL,
  place_phone VARCHAR(20),
  place_price DECIMAL(10,0) NOT NULL,
  place_description TEXT,
  place_photo_filename VARCHAR(255),
  place_photo_path TEXT,
  place_photo_data LONGTEXT,
  place_balance DECIMAL(15,0) DEFAULT 0,
  owner_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Table: bookings
CREATE TABLE IF NOT EXISTS bookings (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_date DATE NOT NULL,
  booking_time_start TIME NOT NULL,
  booking_time_end TIME NOT NULL,
  booking_total_price DECIMAL(10,0) NOT NULL,
  booking_status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
  booking_notes TEXT,
  user_id INT NOT NULL,
  place_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (place_id) REFERENCES places(place_id) ON DELETE CASCADE
);

-- Table: payments
CREATE TABLE IF NOT EXISTS payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  payment_amount DECIMAL(10,0) NOT NULL,
  payment_method ENUM('cash', 'transfer', 'ewallet', 'card') NOT NULL,
  payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  payment_proof LONGTEXT,
  payment_notes TEXT,
  booking_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
);

-- Table: reviews
CREATE TABLE IF NOT EXISTS reviews (
  review_id INT AUTO_INCREMENT PRIMARY KEY,
  review_rating INT NOT NULL CHECK (review_rating >= 1 AND review_rating <= 5),
  review_comment TEXT,
  user_id INT NOT NULL,
  place_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (place_id) REFERENCES places(place_id) ON DELETE CASCADE
);

-- Insert sample admin user (password: admin123)
INSERT IGNORE INTO users (username, user_fullname, user_email, user_password, user_role, email_verified) 
VALUES ('admin', 'Administrator', 'admin@lapangankita.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1);

-- Insert sample data (opsional)
INSERT IGNORE INTO users (username, user_fullname, user_email, user_password, user_role, email_verified) 
VALUES 
('owner1', 'Owner Lapangan', 'owner1@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'owner', 1),
('customer1', 'Customer Test', 'customer1@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'customer', 1);

-- Grant permissions (run as root)
GRANT ALL PRIVILEGES ON lapangan_kita.* TO 'lapangan_user'@'%';
FLUSH PRIVILEGES;