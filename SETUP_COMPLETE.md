# SISFOTJKT2 - Complete Setup Guide

## 🎯 Overview
SISFOTJKT2 is a comprehensive Face Recognition Attendance System with enhanced features for educational institutions. This guide will help you set up the complete system with your Supabase credentials.

## 📋 Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Supabase account with project created
- Modern web browser with camera support

## 🚀 Quick Setup

### Option 1: Complete Automated Setup (Recommended)
```bash
# Run the complete setup script
npm run complete-setup
```

This single command will:
- ✅ Configure environment variables
- ✅ Install all dependencies
- ✅ Download face recognition models
- ✅ Setup database schema
- ✅ Seed initial data
- ✅ Test all connections

### Option 2: Step-by-Step Setup

#### Step 1: Environment Configuration
```bash
npm run setup-env
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Download Face Recognition Models
```bash
npm run download-models
```

#### Step 4: Setup Database
```bash
npm run setup-database
```

## 🗄️ Database Schema Features

### Core Tables
- **users** - Enhanced user management with roles, classes, and profiles
- **faces** - Multiple face embeddings per user with confidence scores
- **attendance** - Comprehensive attendance tracking with multiple methods
- **classes** - Class management and student enrollment
- **exams** - Online examination system
- **questions** - Question bank with multiple types
- **answers** - Student responses and scoring
- **exam_results** - Comprehensive result tracking
- **pengumuman** - Announcement system with categories and priorities

### Advanced Features
- **attendance_settings** - Configurable time schedules
- **attendance_periods** - Academic year management
- **holidays** - Holiday and weekend management
- **attendance_summary** - Daily attendance statistics
- **system_logs** - Complete audit trail

### Security Features
- Row Level Security (RLS) enabled on all tables
- Role-based access control (Admin, Teacher, Student)
- Comprehensive security policies
- Audit logging for all actions

## 👥 Default Users Created

After setup, the following default users are available:

### Administrator
- **Email**: admin@sisfotjkt2.com
- **NISN**: ADMIN001
- **Role**: Admin
- **Permissions**: Full system access

### Teacher
- **Email**: guru@sisfotjkt2.com
- **NISN**: GURU001
- **Role**: Teacher
- **Permissions**: Manage students, attendance, exams

### Students
- **Student 1**: siswa1@sisfotjkt2.com (NISN: 2024001)
- **Student 2**: siswa2@sisfotjkt2.com (NISN: 2024002)
- **Student 3**: siswa3@sisfotjkt2.com (NISN: 2024003)
- **Role**: Student
- **Permissions**: View own data, take attendance, exams

## 🎛️ Configuration Details

### Environment Variables
The setup creates a comprehensive `.env.local` file with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://kmmdnlbbeezsweqsxqzv.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[your-anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[your-service-role-key]"

# Database Configuration
POSTGRES_URL="[your-postgres-url]"
POSTGRES_PRISMA_URL="[your-prisma-url]"

# App Configuration
NEXT_PUBLIC_APP_NAME="SISFOTJKT2"
JWT_SECRET="[your-jwt-secret]"
```

### Default Settings
- **School Hours**: 07:00 - 15:00 (Monday-Thursday)
- **Friday Hours**: 07:00 - 11:30
- **Late Threshold**: 07:30
- **Tolerance**: 5 minutes
- **Academic Year**: 2024/2025

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
Access the application at: http://localhost:3000

### Production Build
```bash
npm run build
npm start
```

## 📱 Features Overview

### 🎭 Face Recognition Attendance
- Real-time face detection and recognition
- Multiple face embeddings per user
- Confidence score tracking
- Automatic attendance marking

### 👥 User Management
- Role-based access control
- Class assignment and management
- Profile management with photos
- Bulk user import/export

### 📊 Attendance System
- Multiple attendance methods (Face, Manual, QR Code)
- Flexible time schedules
- Holiday management
- Comprehensive reporting

### 📝 Examination System
- Online exam creation and management
- Multiple question types
- Automatic scoring
- Result analytics

### 📢 Announcement System
- Categorized announcements
- Priority levels
- Target audience selection
- Rich media support

### 📈 Analytics & Reports
- Daily attendance summaries
- Student performance analytics
- Exam result statistics
- Export capabilities (PDF, Excel)

## 🔧 Troubleshooting

### Common Issues

#### 1. Environment Variables Not Loading
```bash
# Manually create .env.local file
npm run setup-env
```

#### 2. Database Connection Failed
- Verify Supabase credentials are correct
- Check network connectivity
- Ensure Supabase project is active

#### 3. Face Recognition Models Missing
```bash
# Download models manually
npm run download-models
```

#### 4. Permission Denied Errors
- Check RLS policies in Supabase dashboard
- Verify user roles are correctly assigned
- Ensure service role key has proper permissions

### Database Reset
If you need to reset the database:
```bash
# This will drop and recreate all tables
npm run setup-database
```

## 🔒 Security Considerations

### Production Deployment
1. **Change Default Passwords**: Update all default user credentials
2. **Environment Security**: Never commit `.env` files to version control
3. **HTTPS Only**: Always use HTTPS in production
4. **Regular Backups**: Set up automated database backups
5. **Monitor Logs**: Review system logs regularly

### RLS Policies
The system includes comprehensive Row Level Security policies:
- Students can only access their own data
- Teachers can manage their assigned classes
- Admins have full system access
- All actions are logged for audit

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

### Attendance Endpoints
- `GET /api/attendance/list` - Get attendance records
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/settings` - Get attendance settings

### User Management
- `GET /api/users` - List users (admin/teacher only)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

## 🆘 Support

### Getting Help
1. Check this documentation first
2. Review the troubleshooting section
3. Check system logs for error details
4. Verify all prerequisites are met

### System Requirements
- **Browser**: Chrome 80+, Firefox 75+, Safari 13+
- **Camera**: Required for face recognition
- **Network**: Stable internet connection
- **Storage**: 100MB+ free space

## 🎉 Success!

If you see this message after running the setup:
```
🎉 COMPLETE SETUP FINISHED SUCCESSFULLY!
```

Your SISFOTJKT2 system is ready to use! 

Access your application at http://localhost:3000 and start using the face recognition attendance system.

---

**Note**: Keep your Supabase credentials secure and never share them publicly. For production deployment, ensure all security best practices are followed.
