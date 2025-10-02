# 🏠 Tutorial Deploy Node.js API ke CasaOS - Complete Guide

## 📱 Langkah-Langkah Deployment

### 🔧 STEP 1: Persiapan di CasaOS

1. **Akses CasaOS Dashboard**
   ```
   Buka browser → http://[IP-ARMBIAN]:8080
   Login dengan username/password CasaOS Anda
   ```

2. **Buka Terminal/SSH**
   - **Via CasaOS**: Dashboard → Settings → Terminal
   - **Via SSH**: `ssh username@[IP-ARMBIAN]`

3. **Install Docker (jika belum ada)**
   ```bash
   # Cek apakah Docker sudah terinstall
   docker --version
   
   # Jika belum, install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   
   # Install Docker Compose
   sudo apt update
   sudo apt install docker-compose -y
   ```

4. **Install Git**
   ```bash
   sudo apt install git -y
   ```

### 📁 STEP 2: Download Source Code

1. **Clone Repository**
   ```bash
   cd /home/[username]  # ganti dengan username Armbian Anda
   git clone https://github.com/ahmadhipnie/API_LapanganKita.git
   cd API_LapanganKita
   ```

2. **Copy File Docker yang Sudah Dibuat**
   - Copy semua file Docker dari project Windows ke folder ini
   - Atau download manual dari GitHub jika sudah di-push

### 🐳 STEP 3: Konfigurasi Docker

1. **Edit docker-compose.yml** (jika perlu)
   ```bash
   nano docker-compose.yml
   ```
   
   Pastikan konfigurasi ini sesuai:
   ```yaml
   # Port yang akan digunakan
   api:
     ports:
       - "3000:3000"  # API akan bisa diakses di port 3000
   
   mysql:
     ports:
       - "3306:3306"  # MySQL di port 3306
   
   phpmyadmin:
     ports:
       - "8080:80"    # phpMyAdmin di port 8080
   ```

2. **Buat Environment File**
   ```bash
   nano .env
   ```
   
   Isi dengan:
   ```env
   # Database
   DB_HOST=mysql
   DB_USER=lapangan_user
   DB_PASSWORD=lapangan_pass123
   DB_NAME=lapangan_kita
   DB_PORT=3306
   
   # App
   PORT=3000
   NODE_ENV=production
   
   # Email (opsional - ganti dengan email Anda)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

### 🚀 STEP 4: Deploy ke CasaOS

1. **Build dan Run Containers**
   ```bash
   # Build dan start semua services
   docker-compose up -d --build
   
   # Cek status containers
   docker-compose ps
   
   # Lihat logs jika ada error
   docker-compose logs api
   docker-compose logs mysql
   ```

2. **Tunggu Database Ready**
   ```bash
   # Cek apakah MySQL sudah ready
   docker-compose exec mysql mysql -u lapangan_user -p lapangan_kita -e "SHOW TABLES;"
   # Password: lapangan_pass123
   ```

### 🌐 STEP 5: Akses Aplikasi

Setelah semua container running, Anda bisa akses:

1. **API Lapangan Kita**
   ```
   http://[IP-ARMBIAN]:3000
   ```

2. **phpMyAdmin** (untuk manage database)
   ```
   http://[IP-ARMBIAN]:8080
   Username: lapangan_user
   Password: lapangan_pass123
   ```

3. **Test API Endpoints**
   ```bash
   # Health check
   curl http://[IP-ARMBIAN]:3000/health
   
   # Get all users
   curl http://[IP-ARMBIAN]:3000/api/users
   
   # Get all places
   curl http://[IP-ARMBIAN]:3000/api/places
   ```

### 🔧 STEP 6: Troubleshooting

#### Jika Container Tidak Bisa Start:

1. **Cek Logs Error**
   ```bash
   docker-compose logs api
   docker-compose logs mysql
   ```

2. **Restart Services**
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

3. **Cek Port Conflict**
   ```bash
   sudo netstat -tlnp | grep :3000
   sudo netstat -tlnp | grep :3306
   ```

#### Jika Database Connection Error:

1. **Reset Database**
   ```bash
   docker-compose down -v  # Hapus volumes
   docker-compose up -d --build
   ```

2. **Manual Database Setup**
   ```bash
   docker-compose exec mysql mysql -u root -p
   # Password: rootpassword123
   
   CREATE DATABASE lapangan_kita;
   CREATE USER 'lapangan_user'@'%' IDENTIFIED BY 'lapangan_pass123';
   GRANT ALL PRIVILEGES ON lapangan_kita.* TO 'lapangan_user'@'%';
   FLUSH PRIVILEGES;
   ```

### 📊 STEP 7: Monitor dengan CasaOS

1. **Via CasaOS Dashboard**
   - Buka CasaOS Dashboard
   - Klik "Apps" atau "Docker"
   - Lihat status containers yang running

2. **Via Command Line**
   ```bash
   # Lihat resource usage
   docker stats
   
   # Lihat container status
   docker ps
   
   # Restart specific container
   docker-compose restart api
   ```

### 🎯 URLs yang Penting

Setelah deployment sukses:

- **API Base URL**: `http://[IP-ARMBIAN]:3000`
- **API Documentation**: `http://[IP-ARMBIAN]:3000/`
- **Database Admin**: `http://[IP-ARMBIAN]:8080`
- **Health Check**: `http://[IP-ARMBIAN]:3000/health`

### 🔄 Update Aplikasi

Untuk update aplikasi di masa depan:

```bash
cd /path/to/API_LapanganKita
git pull origin main
docker-compose down
docker-compose up -d --build
```

### 🛡️ Security Tips

1. **Change Default Passwords**
   - Edit docker-compose.yml
   - Ganti semua password default

2. **Firewall Setup**
   ```bash
   sudo ufw allow 3000
   sudo ufw allow 8080
   sudo ufw enable
   ```

3. **Backup Database**
   ```bash
   docker-compose exec mysql mysqldump -u lapangan_user -p lapangan_kita > backup.sql
   ```

## 🎉 Selesai!

Aplikasi Node.js API Anda sekarang sudah running di CasaOS dan bisa diakses melalui jaringan lokal!