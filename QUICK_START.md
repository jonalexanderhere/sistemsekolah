# 🚀 Quick Start - EduFace Cloud Pro

Panduan cepat untuk menjalankan sistem dalam 5 menit.

## ⚡ Super Quick Setup

```bash
# 1. Clone & Install
git clone <repository-url>
cd eduface-cloud-pro
npm install

# 2. Setup Environment
cp env.example .env.local
# Edit .env.local - tambahkan SUPABASE_SERVICE_ROLE_KEY

# 3. One-command setup
npm run setup
```

## 🔑 Environment Variables

Edit `.env.local`:

```env
# Sudah dikonfigurasi - tinggal tambahkan service role key
NEXT_PUBLIC_SUPABASE_URL=https://kfstxlcoegqanytvpbgp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3R4bGNvZWdxYW55dHZwYmdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNzgzMzYsImV4cCI6MjA3NDk1NDMzNn0.04Rsbu-9yqVB-nP3dfm2tCqtYJ5JrIMJFv7bTeLOln0

# WAJIB: Dapatkan dari Supabase Dashboard > Settings > API
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Sudah dikonfigurasi
NEXT_PUBLIC_APP_NAME=SISFOTJKT2
JWT_SECRET=eduface-cloud-pro-jwt-secret-key-2024
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🗄️ Database Setup

### Otomatis (Recommended)
```bash
# Jalankan schema SQL di Supabase Dashboard
# Copy isi supabase/schema.sql ke SQL Editor > Run

# Seed data
npm run seed
```

### Manual
1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project `kfstxlcoegqanytvpbgp`
3. SQL Editor > New Query
4. Copy-paste isi `supabase/schema.sql`
5. Click **Run**

## 🤖 Face Models

```bash
# Download model AI (15MB)
npm run download-models

# Atau manual download dari:
# https://github.com/justadudewhohacks/face-api.js/tree/master/weights
```

## 🏃‍♂️ Run Development

```bash
npm run dev
```

Buka: http://localhost:3000

## 🧪 Test System

```bash
npm run test-system
```

## 📱 Login Credentials

### Guru:
- **DIDIK KURNIAWAN**: `198103102010011012`
- **ADE FIRMANSYAH**: `3855773674130022`

### Siswa (contoh):
- **ALLDOO SAPUTRA**: `0089990908`
- **ALYA ANGGITA**: `0071887022`

## 🎯 Quick Test Flow

1. **Login** dengan identitas guru: `198103102010011012`
2. **Pengaturan** → Atur waktu absensi
3. **Registrasi Wajah** → Daftarkan wajah
4. **Absensi Wajah** → Test face recognition
5. **Data Absensi** → Lihat hasil & export

## 🚀 Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables di Vercel Dashboard
```

Lihat `DEPLOYMENT.md` untuk panduan lengkap.

## 🐛 Troubleshooting

### Models tidak ter-load
```bash
npm run download-models
ls -la public/models/
```

### Database error
- Check service role key di `.env.local`
- Pastikan schema SQL sudah dijalankan

### Kamera tidak berfungsi
- Gunakan HTTPS di production
- Check browser permissions

## 📞 Need Help?

- **Setup Issues**: Lihat `SETUP.md`
- **Deployment**: Lihat `DEPLOYMENT.md`
- **Full Docs**: Lihat `README.md`

---

**Ready to go! 🎉**

