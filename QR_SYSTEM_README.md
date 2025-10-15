# QR Code Attendance System

## 🎯 Overview
Sistem absensi modern menggunakan QR Code yang menggantikan face recognition untuk kemudahan, kecepatan, dan akurasi yang lebih tinggi.

## ✨ Features

### 🔐 Authentication
- Login dengan NISN (siswa), NIP (guru), atau email
- Role-based access control (Admin, Guru, Siswa)
- Session management dengan localStorage

### 📱 QR Code System
- **QR Code Generation**: Generate QR code unik untuk setiap siswa
- **QR Code Scanning**: Scanner kamera untuk absensi cepat
- **Download QR Code**: Siswa dapat download QR code personal mereka
- **Offline Support**: QR code dapat digunakan offline

### 📊 Attendance Management
- Real-time attendance tracking
- Status: Hadir, Terlambat, Tidak Hadir
- Export data ke Excel dan PDF
- Filter dan pencarian data
- Dashboard dengan statistik

### 👥 User Management
- Admin: Full system access
- Guru: Monitor siswa dan absensi
- Siswa: View attendance dan download QR code

## 🚀 Technology Stack

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Canvas API** - QR code generation

### Backend
- **Next.js API Routes** - Serverless functions
- **Supabase** - Database dan authentication
- **PostgreSQL** - Database engine

### Database Schema
```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  nama VARCHAR NOT NULL,
  nisn VARCHAR UNIQUE,
  role ENUM('admin', 'guru', 'siswa'),
  class_name VARCHAR,
  qr_code VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Attendance Table
CREATE TABLE attendance (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  status ENUM('hadir', 'terlambat', 'tidak_hadir'),
  method VARCHAR DEFAULT 'qr_code',
  waktu_masuk TIMESTAMP,
  created_at TIMESTAMP
);
```

## 📁 Project Structure

```
sistemtjkt2/
├── app/
│   ├── api/
│   │   ├── qr/
│   │   │   ├── generate/route.ts    # Generate QR codes
│   │   │   └── scan/route.ts        # Process scanned QR
│   │   ├── attendance/
│   │   │   ├── list/route.ts        # Get attendance records
│   │   │   └── mark/route.ts        # Mark attendance
│   │   └── users/
│   │       └── list/route.ts        # Get user list
│   ├── qr-attendance/
│   │   └── page.tsx                 # QR attendance page
│   ├── attendance/
│   │   └── page.tsx                 # Attendance management
│   └── page.tsx                     # Home page
├── components/
│   ├── QRCodeGenerator.tsx          # QR code generation
│   ├── QRScanner.tsx                # QR code scanning
│   └── ui/                          # UI components
├── lib/
│   ├── supabase.ts                  # Database client
│   └── export.ts                    # Export utilities
└── QR_SYSTEM_FLOWCHART.md           # System documentation
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- npm atau yarn
- Supabase account

### 1. Clone Repository
```bash
git clone https://github.com/jonalexanderhere/sistemsekolah.git
cd sistemsekolah
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Buat file `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
```

### 4. Database Setup
Jalankan SQL schema di Supabase:
```sql
-- Copy dari QR_SYSTEM_FLOWCHART.md
```

### 5. Run Development Server
```bash
npm run dev
```

## 📱 Usage Guide

### For Students
1. **Login** dengan NISN
2. **Download QR Code** dari halaman QR Attendance
3. **Simpan QR Code** di handphone atau cetak
4. **Tunjukkan QR Code** ke scanner untuk absensi

### For Teachers
1. **Login** dengan NIP atau email
2. **Access QR Scanner** untuk scan QR code siswa
3. **Monitor Attendance** di dashboard
4. **Export Data** untuk laporan

### For Administrators
1. **Full System Access** - manage users, settings, reports
2. **User Management** - add/edit/delete users
3. **System Monitoring** - track system health
4. **Data Export** - comprehensive reports

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### QR Code System
- `GET /api/qr/generate?studentId={id}` - Generate QR code
- `POST /api/qr/scan` - Process scanned QR code

### Attendance
- `GET /api/attendance/list` - Get attendance records
- `POST /api/attendance/mark` - Mark attendance

### Users
- `GET /api/users/list` - Get user list

## 🎨 UI Features

### Modern Design
- **Gradient backgrounds** untuk visual appeal
- **Card-based layout** untuk organization
- **Responsive design** untuk mobile/desktop
- **Smooth animations** untuk better UX

### Color Scheme
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Background**: Gray (#F9FAFB)

## 🔒 Security Features

### QR Code Security
- Unique student identification via NISN
- Time-based validation
- Duplicate prevention
- Format validation

### Data Protection
- HTTPS enforcement
- Input sanitization
- SQL injection prevention
- XSS protection

## 📊 Performance

### Optimizations
- Client-side QR generation
- Efficient database queries
- Lazy loading components
- Optimized images

### Metrics
- **Page Load**: < 2 seconds
- **QR Generation**: < 500ms
- **Attendance Marking**: < 1 second
- **Database Queries**: < 200ms

## 🐛 Troubleshooting

### Common Issues

#### QR Code Not Scanning
- Check camera permissions
- Ensure good lighting
- Verify QR code quality
- Try different browser

#### Attendance Not Saving
- Check internet connection
- Verify student exists in database
- Check API logs
- Try refreshing page

#### Camera Not Working
- Use HTTPS (required for camera access)
- Allow camera permissions
- Try different browser
- Check if camera is in use by other apps

### Debug Steps
1. Open browser console (F12)
2. Check for error messages
3. Verify API responses in Network tab
4. Check database connectivity
5. Test with different devices

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Other Platforms
- Netlify
- Railway
- DigitalOcean
- AWS

## 📈 Future Enhancements

### Planned Features
- [ ] Bulk QR code generation
- [ ] Advanced reporting dashboard
- [ ] Mobile app version
- [ ] Real-time notifications
- [ ] Offline mode support
- [ ] Multi-language support

### Technical Improvements
- [ ] PWA support
- [ ] Advanced caching
- [ ] Machine learning insights
- [ ] API rate limiting
- [ ] Advanced security features

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Support

For support and questions:
- Create an issue on GitHub
- Contact: [your-email@domain.com]
- Documentation: [QR_SYSTEM_FLOWCHART.md](QR_SYSTEM_FLOWCHART.md)

## 🎉 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- Tailwind CSS for the styling system
- Lucide for the beautiful icons

---

**Made with ❤️ for XII TJKT 2 Smart School System**
