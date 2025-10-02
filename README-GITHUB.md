# 🎓 EduFace Cloud Pro - SISFOTJKT2

Sistem Informasi Sekolah TJKT 2 dengan Face Recognition untuk absensi otomatis.

## ✨ Features

- 🤖 **Face Recognition** - Absensi otomatis dengan AI
- ⏰ **Dynamic Time Settings** - Guru dapat atur waktu absensi
- 📊 **Export Data** - Excel & PDF reports
- 👥 **Multi-user Support** - Siswa & Guru
- 📱 **Responsive Design** - Mobile-friendly
- ☁️ **Cloud Ready** - Deploy ke Vercel

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/eduface-cloud-pro.git
cd eduface-cloud-pro

# Install dependencies
npm install

# Setup environment
cp env.example .env.local
# Edit .env.local - add SUPABASE_SERVICE_ROLE_KEY

# Full setup
npm run full-setup

# Start development
npm run dev
```

## 🔑 Login Credentials

### Guru:
- **DIDIK KURNIAWAN**: `198103102010011012`
- **ADE FIRMANSYAH**: `3855773674130022`

### Siswa (29 total):
- **ALLDOO SAPUTRA**: `0089990908`
- **ALYA ANGGITA**: `0071887022`
- **AMELIA**: `0071317242`
- Dan 26 siswa lainnya...

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: TailwindCSS + shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Face AI**: face-api.js (TensorFlow.js)
- **Export**: Excel (xlsx) & PDF (jsPDF)
- **Deployment**: Vercel

## 📁 Project Structure

```
eduface-cloud-pro/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── face-register/     # Face registration
│   ├── face-attendance/   # Face attendance
│   ├── attendance/        # Attendance data
│   ├── settings/          # Time settings
│   └── users/            # User management
├── components/            # React components
├── lib/                  # Utilities
├── scripts/              # Setup scripts
├── supabase/            # Database schema
└── public/models/       # Face AI models
```

## 🔧 Configuration

### Environment Variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://kfstxlcoegqanytvpbgp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_NAME=SISFOTJKT2
JWT_SECRET=your_jwt_secret
```

### Database Schema:
- Run `supabase/schema.sql` in Supabase Dashboard
- Includes 11 tables with RLS policies
- Optimized indexes for performance

## 🚀 Deployment

### Vercel (Recommended):
```bash
npm i -g vercel
vercel
```

Set environment variables in Vercel Dashboard.

## 📚 Documentation

- `SETUP.md` - Detailed setup guide
- `DEPLOYMENT.md` - Deployment instructions
- `QUICK_START.md` - 5-minute setup
- `GET_SERVICE_KEY.md` - Supabase configuration

## 🎯 Usage

1. **Login** - Use NISN (siswa) or Identitas (guru)
2. **Register Face** - One-time face registration
3. **Attendance** - Automatic face recognition
4. **Settings** - Configure time schedules (guru only)
5. **Export** - Generate reports (Excel/PDF)

## 🔒 Security

- Row Level Security (RLS) policies
- Face embeddings only (no images stored)
- Role-based access control
- Environment variable protection

## 📊 Features Detail

### For Students:
- Face registration
- Automatic attendance
- View attendance history
- Export personal reports

### For Teachers:
- Configure attendance times
- Manage student data
- View all attendance records
- Export class reports
- System settings

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - See LICENSE file for details.

## 👥 Team

- **School**: TJKT 2
- **System**: EduFace Cloud Pro
- **Year**: 2024

---

**Made with ❤️ for TJKT 2 Students & Teachers**
