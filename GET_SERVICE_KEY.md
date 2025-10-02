# 🔑 Cara Mendapatkan Supabase Service Role Key

## 📋 Langkah-langkah:

### 1. Buka Supabase Dashboard
- Kunjungi: https://supabase.com/dashboard
- Login dengan akun Anda

### 2. Pilih Project
- Pilih project: **kfstxlcoegqanytvpbgp**
- Atau buka langsung: https://supabase.com/dashboard/project/kfstxlcoegqanytvpbgp

### 3. Buka Settings > API
- Di sidebar kiri, klik **Settings**
- Pilih **API**

### 4. Copy Service Role Key
- Scroll ke bagian **Project API keys**
- Cari bagian **service_role**
- Klik **Reveal** atau **Copy** pada service_role key
- **JANGAN** copy anon key (public)

### 5. Paste ke .env.local
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3R4bGNvZWdxYW55dHZwYmdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTM3ODMzNiwiZXhwIjoyMDc0OTU0MzM2fQ.YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE
```

## ⚠️ PENTING:

- **Service role key** berbeda dengan **anon key**
- Service role key memiliki akses penuh ke database
- **JANGAN** commit service role key ke Git
- Simpan dengan aman

## 🔍 Cara Membedakan:

### Anon Key (Public) ✅
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...role":"anon"...
```

### Service Role Key (Private) 🔒
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...role":"service_role"...
```

## 🚀 Setelah Mendapatkan Key:

1. Edit file `.env.local`
2. Ganti `SERVICE_ROLE_KEY_HERE` dengan key yang benar
3. Jalankan: `npm run full-setup`
4. Ikuti instruksi selanjutnya

## 🆘 Jika Tidak Bisa Akses:

Jika Anda tidak memiliki akses ke project Supabase:

1. Buat project Supabase baru
2. Update URL dan keys di konfigurasi
3. Atau minta akses dari pemilik project

