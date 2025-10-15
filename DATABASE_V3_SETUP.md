# Database V3 Setup - QR Code System

## 🎯 Overview
Database V3 menghapus semua sistem face recognition dan menggantinya dengan sistem QR Code yang lengkap.

## 🗑️ Yang Dihapus
- ❌ Tabel `faces` (face recognition)
- ❌ Field `face_embedding` di tabel users
- ❌ Field `has_face` di interface User
- ❌ API routes `/api/faces/*`
- ❌ Halaman face registration dan attendance
- ❌ Komponen FaceRecognitionFixed

## ✅ Yang Ditambahkan
- ✅ Sistem QR Code lengkap
- ✅ Tabel attendance dengan method QR
- ✅ Admin user default
- ✅ Sample data XII TJKT 2
- ✅ RLS policies yang aman
- ✅ Indexes untuk performa

## 🚀 Setup Database Baru

### 1. Jalankan Script Setup
```bash
npm run setup-database-v3
```

### 2. Copy SQL ke Supabase
1. Buka Supabase Dashboard
2. Pergi ke SQL Editor
3. Copy isi file `supabase/complete-schema-v3.sql`
4. Paste dan jalankan

### 3. Update Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 👤 Admin User Default
- **Email**: admin@sekolah.com
- **Identitas**: ADMIN001
- **Role**: admin
- **Password**: (hashed di database)

## 🏫 Sample Data
- **Kelas**: XII TJKT 2
- **Guru**: 1 sample teacher
- **Siswa**: 5 sample students
- **Pengumuman**: 1 sample announcement

## 📊 Tabel Utama

### Users
- Menghapus field `face_embedding` dan `has_face`
- Menambahkan field `class_name` default 'XII TJKT 2'

### Attendance
- Method default: 'qr_code'
- Support multiple attendance per day
- JSONB meta field untuk data tambahan

### Grades
- Support multiple subjects
- Semester dan academic year
- Teacher notes

### Exams & Questions
- Full exam system
- Multiple choice, essay, true/false
- Auto-grading support

## 🔒 Security Features
- Row Level Security (RLS) enabled
- Role-based access control
- Secure admin access
- Data isolation per user

## 📈 Performance
- Optimized indexes
- Efficient queries
- JSONB for flexible data
- Proper foreign key constraints

## 🧪 Testing
```bash
# Test build
npm run build

# Test linting
npm run lint

# Test system
npm run test-system
```

## 🎉 Ready to Use
Database V3 siap digunakan dengan:
- ✅ QR Code attendance system
- ✅ Complete user management
- ✅ Grade and exam system
- ✅ Notification system
- ✅ Admin dashboard
- ✅ Secure access control

## 📝 Notes
- Semua data lama akan terhapus
- Backup data penting sebelum migrasi
- Test di environment development dulu
- Update aplikasi setelah migrasi database
