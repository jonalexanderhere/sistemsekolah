# Deployment Guide - EduFace Cloud Pro

Panduan deployment ke Vercel dengan konfigurasi Supabase yang sudah disediakan.

## 🚀 Pre-requisites

- Akun [Vercel](https://vercel.com)
- Akun [GitHub](https://github.com) (untuk repository)
- Node.js 18+ terinstall

## 📋 Supabase Configuration

Project sudah dikonfigurasi dengan:
- **URL**: `https://kfstxlcoegqanytvpbgp.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Service Role Key**: *Perlu didapatkan dari Supabase Dashboard*

### Mendapatkan Service Role Key

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Login dan pilih project `kfstxlcoegqanytvpbgp`
3. Buka **Settings** → **API**
4. Copy **service_role** key (bukan anon key)
5. Simpan untuk step deployment

## 🛠️ Setup Database

### 1. Jalankan Schema SQL

1. Di Supabase Dashboard, buka **SQL Editor**
2. Copy seluruh isi file `supabase/schema.sql`
3. Paste dan klik **Run**
4. Tunggu hingga selesai (akan membuat semua tabel dan policies)

### 2. Seed Data (Opsional)

Jika ingin seed data lokal dulu:
```bash
# Setup environment
cp env.example .env.local
# Edit .env.local dengan service role key

# Seed database
npm run seed
```

## 🚀 Deploy ke Vercel

### Method 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login ke Vercel
vercel login

# Deploy dari root project
vercel

# Ikuti prompts:
# - Link to existing project? No
# - Project name: eduface-cloud-pro
# - Directory: ./
# - Override settings? No
```

### Method 2: GitHub Integration

1. Push code ke GitHub repository
2. Buka [Vercel Dashboard](https://vercel.com/dashboard)
3. Klik **New Project**
4. Import dari GitHub repository
5. Configure settings (lihat section Environment Variables)

## ⚙️ Environment Variables

Set di Vercel Dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://kfstxlcoegqanytvpbgp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3R4bGNvZWdxYW55dHZwYmdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNzgzMzYsImV4cCI6MjA3NDk1NDMzNn0.04Rsbu-9yqVB-nP3dfm2tCqtYJ5JrIMJFv7bTeLOln0
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_APP_NAME=SISFOTJKT2
JWT_SECRET=eduface-cloud-pro-jwt-secret-key-2024
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

**PENTING**: 
- Ganti `your_service_role_key_here` dengan service role key dari Supabase
- Ganti `your-domain.vercel.app` dengan domain Vercel yang didapat

## 📁 Face Recognition Models

### Problem: File Size Limit

Vercel memiliki limit 100MB per deployment. Model face-api.js total ~15MB.

### Solution 1: Include in Repository (Recommended)

```bash
# Download models lokal
npm run download-models

# Add ke git (jika belum)
git add public/models/
git commit -m "Add face recognition models"
git push
```

### Solution 2: CDN External

Jika tetap over limit, gunakan CDN:

1. Upload models ke CDN (Cloudinary, AWS S3, dll)
2. Update `lib/faceapi.ts`:

```typescript
// Ganti modelPath
const modelPath = 'https://your-cdn.com/models';
```

### Solution 3: Git LFS

```bash
# Install Git LFS
git lfs install

# Track large files
git lfs track "public/models/*.json"
git lfs track "public/models/*-shard*"

# Commit
git add .gitattributes
git add public/models/
git commit -m "Add models with LFS"
git push
```

## 🔧 Vercel Configuration

File `vercel.json` sudah dikonfigurasi dengan:

- **Functions timeout**: 30 detik
- **CORS headers** untuk API
- **Cache headers** untuk models
- **Rewrites** untuk model paths

## ✅ Post-Deployment Checklist

### 1. Test Database Connection
- Buka `https://your-domain.vercel.app`
- Coba login dengan data guru: `198103102010011012`

### 2. Test Face Recognition
- Buka developer tools → Network tab
- Akses halaman face registration
- Check apakah models ter-load (status 200)

### 3. Test API Endpoints
```bash
# Test dari terminal
curl https://your-domain.vercel.app/api/attendance/settings
curl https://your-domain.vercel.app/api/users/list
```

### 4. Test Face Registration
- Login sebagai siswa/guru
- Buka "Registrasi Wajah"
- Pastikan kamera berfungsi (HTTPS required)
- Test registrasi wajah

### 5. Test Attendance System
- Setelah registrasi wajah
- Buka "Absensi Wajah"  
- Test face recognition

## 🐛 Common Issues

### 1. Models tidak ter-load
```
Error: Failed to load model
```

**Solution**:
- Check file exists di `/public/models/`
- Verify CORS headers
- Check browser network tab untuk 404 errors

### 2. Database connection error
```
Error: Invalid API key
```

**Solution**:
- Verify environment variables di Vercel
- Check service role key benar
- Restart deployment

### 3. Camera tidak berfungsi
```
NotAllowedError: Permission denied
```

**Solution**:
- Pastikan menggunakan HTTPS (Vercel otomatis)
- Check browser permissions
- Test di browser berbeda

### 4. Face recognition tidak akurat
**Solution**:
- Adjust threshold di `lib/faceapi.ts`
- Improve lighting saat registrasi
- Re-register wajah dengan kualitas lebih baik

## 📊 Performance Optimization

### 1. Model Loading
```typescript
// Di lib/faceapi.ts
const FACE_API_CONFIG = {
  detectionOptions: new faceapi.TinyFaceDetectorOptions({
    inputSize: 416, // Smaller = faster
    scoreThreshold: 0.5
  })
};
```

### 2. Image Processing
- Resize video input sebelum processing
- Limit FPS detection (default 10 FPS)
- Cache model loading

### 3. Database Queries
- Use RLS policies untuk security
- Index pada kolom yang sering di-query
- Limit result dengan pagination

## 🔒 Security Considerations

### 1. Environment Variables
- Jangan commit `.env.local` ke git
- Use Vercel environment variables
- Rotate keys secara berkala

### 2. Face Data
- Hanya simpan embeddings, bukan gambar
- Encrypt sensitive data
- Implement proper RLS policies

### 3. API Security
- Rate limiting (Vercel otomatis)
- Input validation
- CORS configuration

## 📈 Monitoring

### 1. Vercel Analytics
- Enable di Vercel Dashboard
- Monitor performance metrics
- Track user engagement

### 2. Supabase Monitoring
- Check database performance
- Monitor API usage
- Set up alerts

### 3. Error Tracking
```typescript
// Add error tracking
console.error('Face recognition error:', error);
// Send to monitoring service
```

## 🔄 Updates & Maintenance

### 1. Code Updates
```bash
# Deploy updates
git push origin main
# Vercel auto-deploys
```

### 2. Database Updates
- Run migrations di Supabase SQL Editor
- Backup data sebelum major changes
- Test di staging environment

### 3. Model Updates
```bash
# Update models
npm run download-models
git add public/models/
git commit -m "Update face models"
git push
```

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Face-api.js**: https://github.com/justadudewhohacks/face-api.js

---

**Happy Deploying! 🚀**

