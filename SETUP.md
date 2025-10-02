# Setup Guide - EduFace Cloud Pro

Panduan lengkap untuk setup dan deployment sistem EduFace Cloud Pro.

## 🚀 Quick Start

### 1. Clone dan Install

```bash
# Clone repository
git clone <repository-url>
cd eduface-cloud-pro

# Install dependencies
npm install
```

### 2. Setup Environment Variables

Buat file `.env.local` di root project:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://kfstxlcoegqanytvpbgp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3R4bGNvZWdxYW55dHZwYmdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNzgzMzYsImV4cCI6MjA3NDk1NDMzNn0.04Rsbu-9yqVB-nP3dfm2tCqtYJ5JrIMJFv7bTeLOln0
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_NAME=SISFOTJKT2
JWT_SECRET=eduface-cloud-pro-jwt-secret-key-2024

# Optional: For development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**PENTING**: Dapatkan `SUPABASE_SERVICE_ROLE_KEY` dari Supabase Dashboard > Settings > API > service_role key

### 3. Setup Database

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project: `kfstxlcoegqanytvpbgp`
3. Buka SQL Editor
4. Copy dan jalankan isi file `supabase/schema.sql`

### 4. Seed Database

```bash
npm run seed
```

### 5. Download Face Recognition Models

```bash
npm run download-models
```

### 6. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 📊 Data Login Default

### Guru:
- **DIDIK KURNIAWAN, S.Kom, M.TI**
  - Identitas: `198103102010011012`
  
- **ADE FIRMANSYAH, S.Kom**
  - Identitas: `3855773674130022`

### Siswa (contoh):
- **ALLDOO SAPUTRA**
  - NISN: `0089990908`
  
- **ALYA ANGGITA MAHERA**
  - NISN: `0071887022`

*Lihat `scripts/seed.js` untuk daftar lengkap 29 siswa*

## 🔧 Konfigurasi Sistem

### Pengaturan Waktu Absensi

1. Login sebagai guru
2. Buka menu "Pengaturan"
3. Atur waktu:
   - **Jam Masuk**: Waktu mulai absensi (default: 07:00)
   - **Batas Terlambat**: Setelah jam ini = terlambat (default: 07:30)
   - **Jam Pulang**: Waktu pulang sekolah (default: 15:00)
   - **Toleransi**: Toleransi dalam menit (default: 5)

### Registrasi Wajah

1. Login ke sistem (siswa/guru)
2. Klik "Registrasi Wajah"
3. Izinkan akses kamera
4. Posisikan wajah di depan kamera
5. Klik "Daftarkan Wajah" ketika terdeteksi

### Absensi Face Recognition

1. Buka "Absensi Wajah"
2. Sistem otomatis mengenali wajah terdaftar
3. Absensi tercatat otomatis

## 🚀 Deployment ke Vercel

### 1. Persiapan

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login
```

### 2. Deploy

```bash
# Deploy
vercel

# Atau untuk production
vercel --prod
```

### 3. Environment Variables di Vercel

Set di Vercel Dashboard > Settings > Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://kfstxlcoegqanytvpbgp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3R4bGNvZWdxYW55dHZwYmdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNzgzMzYsImV4cCI6MjA3NDk1NDMzNn0.04Rsbu-9yqVB-nP3dfm2tCqtYJ5JrIMJFv7bTeLOln0
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_NAME=SISFOTJKT2
JWT_SECRET=eduface-cloud-pro-jwt-secret-key-2024
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### 4. Upload Face Models

Karena file model besar (>100MB), ada beberapa opsi:

**Opsi 1: Git LFS**
```bash
# Install Git LFS
git lfs install

# Track model files
git lfs track "public/models/*.json"
git lfs track "public/models/*-shard*"

# Commit dan push
git add .gitattributes
git add public/models/
git commit -m "Add face recognition models"
git push
```

**Opsi 2: CDN External**
- Upload models ke CDN (Cloudinary, AWS S3, dll)
- Update path di `lib/faceapi.ts`

**Opsi 3: Manual Upload**
- Download models lokal: `npm run download-models`
- Upload manual ke hosting

## 📁 Struktur Database

### Tabel Utama:

1. **users** - Data pengguna (siswa/guru)
2. **faces** - Face embeddings
3. **attendance** - Data absensi
4. **attendance_settings** - Pengaturan waktu absensi
5. **attendance_periods** - Periode absensi (semester)
6. **holidays** - Data libur
7. **attendance_summary** - Ringkasan harian
8. **exams** - Data ujian
9. **questions** - Soal ujian
10. **answers** - Jawaban ujian
11. **pengumuman** - Pengumuman

### Fitur Database:

- **Row Level Security (RLS)** - Keamanan data
- **Real-time subscriptions** - Update real-time
- **Automatic backups** - Backup otomatis
- **Performance indexes** - Optimasi query

## 🔒 Keamanan

### Face Recognition:
- Hanya menyimpan embeddings (bukan gambar)
- Embeddings di-encrypt dalam database
- Threshold confidence untuk akurasi

### Authentication:
- Custom auth dengan Supabase
- Role-based access control
- Session management

### Database:
- Row Level Security (RLS)
- Prepared statements
- Input validation

## 🐛 Troubleshooting

### Model tidak ter-load
```bash
# Re-download models
npm run download-models

# Check files
ls -la public/models/

# Check browser console untuk error
```

### Kamera tidak berfungsi
- Pastikan HTTPS di production
- Check browser permissions
- Pastikan tidak ada app lain menggunakan kamera

### Database error
- Check Supabase connection
- Verify environment variables
- Check RLS policies

### Face recognition tidak akurat
- Pastikan pencahayaan cukup
- Registrasi ulang wajah
- Adjust threshold di `lib/faceapi.ts`

## 📱 Browser Support

- **Chrome 60+** ✅
- **Firefox 55+** ✅  
- **Safari 11+** ✅
- **Edge 79+** ✅

**Catatan**: Memerlukan HTTPS untuk akses kamera di production.

## 🔄 Update System

### Update Dependencies
```bash
npm update
```

### Update Database Schema
```bash
# Backup data dulu
# Jalankan migration SQL di Supabase
```

### Update Face Models
```bash
npm run download-models
```

## 📞 Support

- **GitHub Issues**: Untuk bug reports
- **Documentation**: README.md
- **Email**: support@eduface.com

---

**EduFace Cloud Pro** - AI-powered attendance system for modern education.

