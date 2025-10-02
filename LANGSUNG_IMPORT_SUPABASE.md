# 🚀 Langsung Import ke Supabase - Panduan Lengkap

## 📋 Langkah-Langkah Import

### 1. Buka Supabase Dashboard
1. Buka browser dan pergi ke: https://supabase.com/dashboard
2. Login dengan akun Supabase Anda
3. Pilih project: **kmmdnlbbeezsweqsxqzv**

### 2. Buka SQL Editor
1. Di sidebar kiri, klik **"SQL Editor"**
2. Klik **"New query"** untuk membuat query baru

### 3. Copy dan Paste SQL Script
1. Buka file `supabase-direct-setup.sql` yang sudah saya buat
2. **Copy semua isi file** (Ctrl+A, lalu Ctrl+C)
3. **Paste di SQL Editor** Supabase (Ctrl+V)

### 4. Jalankan Script
1. Klik tombol **"Run"** (atau tekan Ctrl+Enter)
2. Tunggu hingga proses selesai (biasanya 10-30 detik)
3. Anda akan melihat pesan sukses jika berhasil

## 📊 Apa yang Akan Diimport

### 🗄️ Tabel yang Dibuat:
- **users** - Data pengguna (admin, guru, siswa)
- **faces** - Data wajah untuk face recognition
- **attendance** - Data absensi
- **exams** - Data ujian online
- **questions** - Data soal ujian
- **answers** - Data jawaban siswa
- **pengumuman** - Data pengumuman
- **attendance_settings** - Pengaturan absensi
- **classes** - Data kelas

### 👥 Data Pengguna yang Diimport:

#### 👑 Admin (1 orang):
- **Nama**: Administrator
- **NISN**: ADMIN001
- **Email**: admin@sisfotjkt2.com

#### 👨‍🏫 Guru (2 orang):
1. **DIDIK KURNIAWAN, S.Kom, M.TI**
   - NIP: 198103102010011012
   - Email: didik.kurniawan.s.kom.m.ti@sisfotjkt2.com

2. **ADE FIRMANSYAH, S.Kom**
   - NIP: 3855773674130022
   - Email: ade.firmansyah.s.kom@sisfotjkt2.com

#### 👥 Siswa (29 orang):
- ALLDOO SAPUTRA (NISN: 0089990908)
- ALYA ANGGITA MAHERA (NISN: 0071887022)
- AMELIA (NISN: 0071317242)
- AMELIA SEPTIA SARI (NISN: 0083627332)
- AULIA KENANGA SAFITRI (NISN: 0081278251)
- AYUNDA NAFISHA (NISN: 3102623580)
- BERLIAN ANUGRAH PRATAMA (NISN: 0088754753)
- DESTI RAHAYU (NISN: 0076775460)
- DESTIA (NISN: 0077986875)
- ERIC ERIANTO (NISN: 0069944236)
- FAIZAH AZ ZAHRA (NISN: 0084352502)
- FITRI ULANDARI (NISN: 0082539133)
- GHEA LITA ANASTASYA (NISN: 0074043979)
- JHOVANI WIJAYA (NISN: 0081353027)
- KEISYA AGUSTIN RASFA AULIA (NISN: 0082019386)
- MAHARANI (NISN: 0074731920)
- NAURA GHIFARI AZHAR (NISN: 0076724319)
- PATRA ADITTIA (NISN: 0083063479)
- PUTRI SAPARA (NISN: 0085480329)
- RAFI SEPTA WIRA TAMA (NISN: 0079319957)
- RAKA RAMADHANI PRATAMA (NISN: 0082901449)
- REGITA MAHARANI (NISN: 0081628824)
- REGITHA ANINDYA AZZAHRA (NISN: 0081133109)
- RENDI ARISNANDO (NISN: 0076040547)
- RIDHO ZAENAL MUSTAQIM (NISN: 0078327818)
- RISTY WIDIASIH (NISN: 0076113354)
- SIFA RISTIANA (NISN: 0084399894)
- **AMELIA DIANA** (NISN: 6672) ← Menggunakan ID sebagai NISN
- **DESTA AMELIA** (NISN: 6673) ← Menggunakan ID sebagai NISN

### 🏫 Data Kelas:
- X IPA 1, X IPA 2
- XI IPA 1, XI IPA 2  
- XII IPA 1, XII IPA 2

### ⚙️ Pengaturan Default:
- **Jam Masuk**: 07:00
- **Jam Terlambat**: 07:30
- **Jam Pulang**: 15:00 (Senin-Kamis)
- **Jam Pulang Jumat**: 11:30
- **Toleransi**: 5 menit

## 5. Verifikasi Import

Setelah menjalankan script, verifikasi dengan query ini:

```sql
-- Cek jumlah pengguna per role
SELECT role, COUNT(*) as jumlah 
FROM users 
GROUP BY role;

-- Lihat semua guru
SELECT nama, nisn, identitas 
FROM users 
WHERE role = 'guru';

-- Lihat beberapa siswa
SELECT nama, nisn, identitas, class_name 
FROM users 
WHERE role = 'siswa' 
LIMIT 10;
```

## 6. Hasil yang Diharapkan

Jika berhasil, Anda akan melihat:
- ✅ **1 Admin**
- ✅ **2 Guru** 
- ✅ **29 Siswa**
- ✅ **6 Kelas**
- ✅ **Pengaturan absensi default**

## 🚀 Langkah Selanjutnya

Setelah import berhasil:

1. **Jalankan aplikasi**:
   ```bash
   npm install
   npm run dev
   ```

2. **Akses sistem**: http://localhost:3000

3. **Login sebagai admin**:
   - Email: admin@sisfotjkt2.com
   - NISN: ADMIN001

4. **Test login guru**:
   - DIDIK: didik.kurniawan.s.kom.m.ti@sisfotjkt2.com
   - ADE: ade.firmansyah.s.kom@sisfotjkt2.com

5. **Test login siswa**:
   - ALLDOO: alldoo.saputra@sisfotjkt2.com
   - AMELIA DIANA: amelia.diana@sisfotjkt2.com

## ⚠️ Troubleshooting

### Jika Ada Error:
1. **"relation already exists"** → Normal, tabel sudah ada
2. **"duplicate key value"** → Normal, data sudah ada
3. **Permission denied** → Pastikan menggunakan Service Role Key

### Jika Data Tidak Muncul:
1. Refresh halaman Supabase
2. Cek di Table Editor → users
3. Jalankan query verifikasi di atas

## 📞 Bantuan

Jika mengalami kesulitan:
1. Screenshot error message
2. Cek di Supabase Dashboard → Settings → API
3. Pastikan RLS policies sudah aktif

---

**🎉 Selamat! Data Anda siap digunakan di SISFOTJKT2 Face Recognition System!**
