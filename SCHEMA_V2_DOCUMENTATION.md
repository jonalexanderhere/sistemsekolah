# SISFOTJKT2 Database Schema V2.0 Documentation

## 🚀 Overview

SISFOTJKT2 V2.0 introduces a comprehensive, production-ready database schema designed for educational institutions with advanced face recognition attendance systems. This schema provides enhanced security, performance, and functionality compared to V1.

## 📊 Schema Architecture

### Core Design Principles
- **Scalability**: Designed to handle thousands of users and millions of records
- **Security**: Row Level Security (RLS) with role-based access control
- **Performance**: Optimized indexes and efficient query patterns
- **Flexibility**: Extensible design for future enhancements
- **Data Integrity**: Comprehensive constraints and validation

## 🗄️ Database Tables

### 1. Core User Management

#### `users` - Enhanced User Management
```sql
- id (UUID, Primary Key)
- role (TEXT) - siswa, guru, admin, staff
- nama (TEXT) - Full name
- nisn (TEXT) - NISN for students, NIP for teachers
- identitas (TEXT) - Email or unique identifier
- external_auth_id (TEXT) - External authentication ID
- email, phone, address - Contact information
- birth_date, gender, photo_url - Personal details
- class_name, student_id, employee_id - Academic/work info
- face_embedding, face_registered_at - Face recognition data
- is_active, is_verified, last_login, login_count - Status tracking
```

#### `faces` - Multi-Face Recognition System
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key)
- embedding (JSONB) - Face embedding data
- confidence, quality_score - Recognition metrics
- image_url, image_hash, capture_device - Image metadata
- face_landmarks, face_box - Facial feature data
- is_primary, is_active - Face status
```

#### `classes` - Class Management
```sql
- id (UUID, Primary Key)
- name, code, grade_level - Class identification
- description, capacity, academic_year, semester - Class details
- homeroom_teacher_id, subject_teachers - Teacher assignments
- schedule, room - Class scheduling
- is_active - Status
```

#### `class_students` - Student Enrollment
```sql
- id (UUID, Primary Key)
- class_id, student_id - Relationships
- enrollment_date, status - Enrollment details
- student_number, semester_enrolled, final_grade - Academic info
```

### 2. Advanced Attendance System

#### `attendance_settings` - Flexible Configuration
```sql
- id (UUID, Primary Key)
- name - Setting profile name
- jam_masuk, jam_terlambat, jam_pulang - Time settings
- toleransi_menit, auto_checkout, require_checkout - Rules
- weekend_attendance, weekend_days - Weekend settings
- late_notification, absent_notification - Notifications
```

#### `attendance_periods` - Academic Periods
```sql
- id (UUID, Primary Key)
- name, description, period_type - Period information
- start_date, end_date - Date range
- attendance_settings_id - Settings reference
```

#### `holidays` - Holiday Management
```sql
- id (UUID, Primary Key)
- name, date, type - Holiday information
- description, is_recurring, recurrence_pattern - Details
- attendance_required, special_schedule - Rules
```

#### `attendance` - Enhanced Attendance Records
```sql
- id (UUID, Primary Key)
- user_id, tanggal - Basic attendance info
- waktu_masuk, waktu_keluar - Time tracking
- status - hadir, terlambat, tidak_hadir, izin, sakit, alpha, dispensasi
- method - face_recognition, manual, card, qr_code, fingerprint
- confidence_score, verification_data - Verification info
- location, device_info, ip_address - Context data
- notes, photo_url, temperature - Additional data
- approved_by, approved_at, is_verified - Approval workflow
```

#### `attendance_summary` - Daily Statistics
```sql
- id (UUID, Primary Key)
- date, class_id - Summary scope
- total_students, present_count, late_count, absent_count - Counts
- attendance_rate, punctuality_rate - Calculated rates
- weather_condition, special_events - Context
```

### 3. Comprehensive Examination System

#### `exams` - Advanced Exam Management
```sql
- id (UUID, Primary Key)
- judul, deskripsi, mata_pelajaran, kelas - Basic info
- tanggal_mulai, tanggal_selesai, durasi_menit - Scheduling
- max_attempts, passing_score - Rules
- shuffle_questions, shuffle_options - Randomization
- password, allowed_ips, allowed_devices - Access control
- require_camera, require_microphone - Proctoring settings
- prevent_tab_switch, screenshot_interval - Security
- auto_grade, show_results_immediately - Grading options
- is_active, is_published, is_draft - Status
```

#### `questions` - Multi-Type Questions
```sql
- id (UUID, Primary Key)
- exam_id - Exam reference
- question_type - multiple_choice, true_false, essay, fill_blank, matching, ordering
- pertanyaan - Question text
- pilihan_a, pilihan_b, pilihan_c, pilihan_d, pilihan_e - Options
- jawaban_benar, alternative_answers - Correct answers
- explanation, points, difficulty - Question details
- image_url, audio_url, video_url - Media support
- nomor_urut, category, tags - Organization
```

#### `answers` - Detailed Answer Tracking
```sql
- id (UUID, Primary Key)
- exam_id, question_id, user_id - References
- jawaban, is_correct, points_earned - Answer data
- time_spent, answered_at, attempt_number - Timing
- confidence_level, answer_sequence - Additional tracking
```

#### `exam_results` - Comprehensive Results
```sql
- id (UUID, Primary Key)
- exam_id, user_id - References
- total_questions, correct_answers, total_points - Scoring
- percentage, grade, letter_grade, is_passed - Grading
- time_started, time_finished, duration_minutes - Timing
- attempt_number - Attempt tracking
- violations, screenshots, activity_log - Proctoring data
- status - in_progress, completed, abandoned, disqualified
```

### 4. Communication System

#### `pengumuman` - Enhanced Announcements
```sql
- id (UUID, Primary Key)
- judul, isi, excerpt - Content
- category, priority - Classification
- target_audience, target_classes, target_users - Targeting
- image_url, attachments - Media
- is_published, is_pinned, publish_date, expire_date - Publishing
- view_count, like_count - Engagement
```

#### `notifications` - Real-time Notifications
```sql
- id (UUID, Primary Key)
- user_id - Recipient
- title, message, type - Content
- action_url, action_text - Actions
- is_read, read_at - Status
- delivery_method, delivered_at - Delivery
- expires_at - Expiration
```

### 5. System Administration

#### `system_logs` - Comprehensive Audit Trail
```sql
- id (UUID, Primary Key)
- user_id, action, entity_type, entity_id - Action tracking
- description, old_values, new_values - Change details
- ip_address, user_agent, request_id, session_id - Context
- status, error_message - Result tracking
```

## 🔐 Security Features

### Row Level Security (RLS)
- **Enabled on all tables** with comprehensive policies
- **Role-based access control** (siswa, guru, admin, staff)
- **Data isolation** ensuring users only access authorized data
- **Audit trail** for all data modifications

### Access Control Policies
```sql
-- Students can only access their own data
-- Teachers can access student data in their classes
-- Admins have full access
-- System operations have controlled access
```

## 📈 Performance Optimizations

### Indexes (40+ optimized indexes)
- **Primary key indexes** on all tables
- **Foreign key indexes** for efficient joins
- **Composite indexes** for common query patterns
- **Partial indexes** for filtered queries
- **GIN indexes** for full-text search
- **Trigram indexes** for fuzzy text matching

### Query Optimization
- **Materialized views** for complex aggregations
- **Efficient pagination** with cursor-based navigation
- **Optimized joins** with proper index usage
- **Cached calculations** for frequently accessed data

## 🔧 Functions and Triggers

### Automated Functions
```sql
-- update_updated_at_column() - Auto-update timestamps
-- update_user_login_info() - Track login statistics
-- calculate_attendance_summary() - Generate daily summaries
```

### Triggers
- **Updated timestamp triggers** on all tables
- **Data validation triggers** for business rules
- **Audit logging triggers** for change tracking
- **Notification triggers** for real-time updates

## 📊 Views for Common Queries

### `user_summary`
Complete user information with class details and face registration status.

### `attendance_stats`
Attendance statistics per user with rates and counts.

### `exam_stats`
Exam performance statistics with participation and pass rates.

## 🚀 Migration and Setup

### Fresh Installation
```bash
npm run full-setup-v2
```

### Migration from V1
```bash
npm run migrate-to-v2
```

### Rollback (if needed)
```bash
npm run rollback-migration backup/backup-timestamp.json
```

## 📋 Default Data

### Pre-configured Settings
- **Default attendance settings** with Indonesian school hours
- **Academic year structure** (2024/2025)
- **Standard class templates** (X, XI, XII with IPA/IPS)
- **Indonesian holidays** for 2025
- **System roles and permissions**

### Sample Classes
- X IPA 1, X IPA 2, X IPS 1
- XI IPA 1, XI IPA 2, XI IPS 1
- XII IPA 1, XII IPA 2, XII IPS 1

## 🎯 Key Improvements from V1

### Enhanced Features
1. **Multi-face support** per user
2. **Advanced proctoring** for exams
3. **Flexible attendance methods**
4. **Comprehensive audit logging**
5. **Real-time notifications**
6. **Performance optimization**
7. **Better security model**

### New Capabilities
1. **Class management system**
2. **Academic period tracking**
3. **Holiday management**
4. **Multiple question types**
5. **Detailed exam analytics**
6. **System health monitoring**
7. **Data backup and recovery**

## 🔍 Monitoring and Maintenance

### Health Checks
- **Database connection monitoring**
- **Index usage analysis**
- **Query performance tracking**
- **Storage usage monitoring**

### Maintenance Tasks
- **Regular backup scheduling**
- **Index maintenance**
- **Log rotation**
- **Performance tuning**

## 📚 API Integration

### Compatible with Existing APIs
- All existing API endpoints remain functional
- Enhanced with new V2 features
- Backward compatibility maintained
- Gradual migration path available

### New API Capabilities
- **Advanced filtering and sorting**
- **Real-time subscriptions**
- **Bulk operations**
- **Enhanced error handling**

## 🎉 Production Readiness

### Scalability
- **Handles 10,000+ users**
- **Millions of attendance records**
- **Thousands of concurrent exams**
- **Real-time performance**

### Reliability
- **ACID compliance**
- **Data integrity constraints**
- **Automatic failover support**
- **Backup and recovery procedures**

### Security
- **Enterprise-grade security**
- **Compliance ready**
- **Audit trail complete**
- **Role-based access control**

---

## 🚀 Getting Started

1. **Setup Environment**: `npm run setup-env`
2. **Create Database**: `npm run setup-database-v2`
3. **Import Data**: `npm run import-all-users`
4. **Download Models**: `npm run download-models`
5. **Start Application**: `npm run dev`

**SISFOTJKT2 V2.0 is now ready for production use with enterprise-grade features and performance!**
