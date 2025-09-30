# 🚀 Panduan Deployment API LapanganKita ke Vercel

## Langkah-langkah Deployment

### 1. ✅ Setup Project (SELESAI)
- ✅ Project structure sudah dibuat
- ✅ Dependencies sudah terinstall
- ✅ REST API endpoints sudah berfungsi
- ✅ Database configuration sudah siap
- ✅ vercel.json sudah dikonfigurasi

### 2. 🔧 Setup Database Production

Untuk deployment production, Anda perlu database MySQL online. Beberapa pilihan:

#### A. PlanetScale (Recommended - Free tier tersedia)
1. Daftar di [planetscale.com](https://planetscale.com)
2. Buat database baru
3. Import schema dari file `sql/lapangan_kita.sql`
4. Dapatkan connection string

#### B. Railway
1. Daftar di [railway.app](https://railway.app)
2. Buat MySQL database
3. Import schema dan data
4. Dapatkan kredensial database

#### C. Hosting MySQL lainnya
- AWS RDS
- Google Cloud SQL
- DigitalOcean Managed Database

### 3. 📁 Push ke GitHub

```bash
# Initialize git repository
cd "c:\Erik\tugas erik\jokian\api_node_lapangan_kita"
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: API LapanganKita"

# Add remote (ganti dengan repository Anda)
git remote add origin https://github.com/yourusername/api-lapangan-kita.git

# Push to GitHub
git push -u origin main
```

### 4. 🌐 Deploy ke Vercel

#### Cara 1: Vercel Dashboard (Mudah)
1. Login ke [vercel.com](https://vercel.com)
2. Klik "New Project"
3. Connect dengan GitHub
4. Pilih repository `api-lapangan-kita`
5. Vercel otomatis deteksi Node.js project
6. Klik "Deploy"

#### Cara 2: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Setup and deploy? [Y/n] y
# - Which scope? (pilih account Anda)
# - Link to existing project? [y/N] n
# - What's your project's name? api-lapangan-kita
# - In which directory is your code located? ./
```

### 5. 🔐 Environment Variables di Vercel

Setelah deployment pertama:

1. Buka Vercel Dashboard
2. Pilih project Anda
3. Klik "Settings"
4. Klik "Environment Variables"
5. Tambahkan variables berikut:

```
Name: DB_HOST
Value: your_production_database_host

Name: DB_USER  
Value: your_production_database_user

Name: DB_PASSWORD
Value: your_production_database_password

Name: DB_NAME
Value: your_production_database_name

Name: DB_PORT
Value: 3306

Name: NODE_ENV
Value: production
```

### 6. 🔄 Redeploy

Setelah menambahkan environment variables:
1. Klik tab "Deployments"
2. Klik menu (⋯) di deployment terakhir
3. Pilih "Redeploy"

### 7. ✅ Test Production API

Setelah deployment sukses, test API Anda:

```bash
# Health check
curl https://your-project-name.vercel.app/health

# API documentation
curl https://your-project-name.vercel.app/

# Test lapangan endpoint
curl https://your-project-name.vercel.app/api/lapangan
```

## 🐛 Troubleshooting

### Error: Database Connection Failed
- Pastikan environment variables sudah benar
- Cek apakah database online dapat diakses dari luar
- Pastikan kredensial database benar

### Error: Module not found
- Pastikan semua dependencies ada di package.json
- Run `npm install` di local untuk memastikan

### Error: Function timeout
- Vercel free tier memiliki timeout 10 detik
- Pastikan query database tidak terlalu lambat

## 📝 Checklist Deployment

- [ ] Database production sudah siap
- [ ] GitHub repository sudah dibuat
- [ ] Code sudah di-push ke GitHub
- [ ] Project sudah di-deploy ke Vercel
- [ ] Environment variables sudah dikonfigurasi
- [ ] API sudah di-test dan berfungsi

## 🎉 Setelah Deployment Sukses

1. **Custom Domain (Opsional)**
   - Di Vercel Dashboard → Settings → Domains
   - Tambahkan custom domain Anda

2. **Monitoring**
   - Monitor logs di Vercel Dashboard
   - Setup alerts untuk error

3. **Documentation**
   - Share URL API Anda
   - Update README dengan production URL

## 📞 Bantuan

Jika ada masalah selama deployment:
1. Cek Vercel logs di Dashboard
2. Cek GitHub Actions (jika ada)
3. Test API endpoints satu per satu
4. Pastikan database connection string benar

---

**URL API setelah deployment:**
`https://your-project-name.vercel.app`

**Contoh endpoints:**
- `GET https://your-project-name.vercel.app/api/lapangan`
- `POST https://your-project-name.vercel.app/api/booking`
- `GET https://your-project-name.vercel.app/health`