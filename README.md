# EduFace Cloud Pro - SISFOTJKT2

Sistem Informasi Sekolah TJKT 2 dengan teknologi Face Recognition untuk absensi otomatis.

## 🚀 Fitur Utama

- **Face Recognition**: Absensi otomatis menggunakan teknologi pengenalan wajah
- **Real-time Detection**: Deteksi wajah real-time dengan model AI yang cepat
- **Multi-user Support**: Mendukung siswa dan guru dengan role-based access
- **Export Data**: Export laporan ke Excel dan PDF
- **Responsive Design**: UI modern dengan TailwindCSS dan shadcn/ui
- **Cloud Ready**: Siap deploy ke Vercel dengan Supabase backend

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **UI**: TailwindCSS, shadcn/ui, Lucide Icons
- **Backend**: Next.js API Routes, Supabase (PostgreSQL)
- **Authentication**: Custom auth dengan Supabase
- **Face Recognition**: face-api.js (TensorFlow.js)
- **Export**: SheetJS (Excel), jsPDF (PDF)
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- npm atau yarn
- Akun Supabase
- Akun Vercel (untuk deployment)

## 🏗️ Setup Development

### 1. Clone Repository

```bash
git clone <repository-url>
cd eduface-cloud-pro
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env.local` dan isi dengan:

```env
# Supabase Configuration (Pre-configured)
NEXT_PUBLIC_SUPABASE_URL=https://kfstxlcoegqanytvpbgp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3R4bGNvZWdxYW55dHZwYmdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNzgzMzYsImV4cCI6MjA3NDk1NDMzNn0.04Rsbu-9yqVB-nP3dfm2tCqtYJ5JrIMJFv7bTeLOln0
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_NAME=SISFOTJKT2
JWT_SECRET=eduface-cloud-pro-jwt-secret-key-2024

# Optional: For development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**PENTING**: Dapatkan `SUPABASE_SERVICE_ROLE_KEY` dari [Supabase Dashboard](https://supabase.com/dashboard) > Settings > API > service_role key

### 4. Setup Supabase Database

1. Buat project baru di [Supabase](https://supabase.com)
2. Jalankan SQL schema:

```bash
# Copy isi file supabase/schema.sql ke SQL Editor di Supabase Dashboard
```

3. Seed database dengan data awal:

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

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 📊 Data Seed

Project ini sudah menyertakan data seed untuk:

### Guru:
- **DIDIK KURNIAWAN, S.Kom, M.TI** (ID: 198103102010011012)
- **ADE FIRMANSYAH, S.Kom** (ID: 3855773674130022)

### Siswa TJKT 2:
29 siswa dengan NISN lengkap (lihat `scripts/seed.js` untuk detail)

## 🎯 Cara Penggunaan

### 1. Login
- **Siswa**: Gunakan NISN
- **Guru**: Gunakan nomor identitas

### 2. Registrasi Wajah
1. Login ke sistem
2. Klik "Registrasi Wajah"
3. Izinkan akses kamera
4. Posisikan wajah di depan kamera
5. Klik "Daftarkan Wajah" ketika wajah terdeteksi

### 3. Absensi dengan Face Recognition
1. Buka halaman "Absensi Wajah"
2. Sistem akan otomatis mengenali wajah terdaftar
3. Absensi tercatat otomatis dengan status:
   - **Hadir**: Sebelum 07:30
   - **Terlambat**: Setelah 07:30

### 4. Lihat Data Absensi
- Filter berdasarkan tanggal, status, atau role
- Export ke Excel atau PDF
- Lihat statistik kehadiran

## 🚀 Deployment ke Vercel

### 1. Persiapan

```bash
# Install Vercel CLI
npm i -g vercel

# Login ke Vercel
vercel login
```

### 2. Deploy

```bash
# Deploy ke Vercel
vercel

# Atau untuk production
vercel --prod
```

### 3. Environment Variables di Vercel

Set environment variables di Vercel Dashboard:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_NAME=SISFOTJKT2
JWT_SECRET=your_jwt_secret_key_here
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
```

### 4. Upload Face Models

Karena file model cukup besar, upload manual ke `/public/models/` atau gunakan CDN:

1. Download models dengan script: `npm run download-models`
2. Upload folder `public/models/` ke repository
3. Atau host di CDN dan update path di `lib/faceapi.ts`

## 📁 Struktur Project

```
eduface-cloud-pro/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication
│   │   ├── faces/                # Face recognition
│   │   ├── attendance/           # Attendance management
│   │   └── users/                # User management
│   ├── face-register/            # Face registration page
│   ├── face-attendance/          # Face attendance page
│   ├── attendance/               # Attendance data page
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   └── FaceRecognition.tsx       # Face recognition component
├── lib/                          # Utilities
│   ├── supabase.ts              # Supabase client
│   ├── faceapi.ts               # Face-api.js utilities
│   ├── export.ts                # Export utilities
│   └── utils.ts                 # General utilities
├── public/
│   └── models/                  # Face-api.js models
├── scripts/                     # Utility scripts
│   ├── download-models.js       # Download face models
│   └── seed.js                  # Database seeding
├── supabase/
│   └── schema.sql               # Database schema
└── README.md
```

## 🔧 Face Recognition Models

Project menggunakan model **tiny_face_detector** untuk performa optimal:

- **tiny_face_detector**: Deteksi wajah cepat dan ringan
- **face_landmark_68**: Deteksi landmark wajah
- **face_recognition**: Ekstraksi fitur wajah

### Model Files:
```
public/models/
├── tiny_face_detector_model-weights_manifest.json
├── tiny_face_detector_model-shard1
├── face_landmark_68_model-weights_manifest.json
├── face_landmark_68_model-shard1
├── face_recognition_model-weights_manifest.json
├── face_recognition_model-shard1
└── face_recognition_model-shard2
```

## 📱 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

**Catatan**: Memerlukan HTTPS untuk akses kamera di production.

## 🔒 Security

- Row Level Security (RLS) di Supabase
- Environment variables untuk sensitive data
- Face embeddings disimpan sebagai array numerik
- No face images stored, hanya embeddings

## 🐛 Troubleshooting

### Model tidak ter-load
```bash
# Re-download models
npm run download-models

# Check public/models/ folder
ls -la public/models/
```

### Kamera tidak berfungsi
- Pastikan HTTPS di production
- Check browser permissions
- Pastikan tidak ada aplikasi lain yang menggunakan kamera

### Database connection error
- Check Supabase URL dan keys
- Pastikan database schema sudah dijalankan
- Check network connectivity

## 📄 License

MIT License - Lihat file LICENSE untuk detail.

## 👥 Contributors

- **Developer**: EduFace Cloud Pro Team
- **School**: TJKT 2
- **Year**: 2024

## 📞 Support

Untuk bantuan teknis, silakan buat issue di repository ini atau hubungi tim development.

---

**EduFace Cloud Pro** - Modernizing education with AI-powered attendance system.
