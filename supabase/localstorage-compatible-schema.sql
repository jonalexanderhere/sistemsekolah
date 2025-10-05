-- ============================================================================
-- SISFOTJKT2 - LocalStorage Compatible Database Schema
-- Optimized for applications using localStorage for session management
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS system_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS class_students CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS attendance_summary CASCADE;
DROP TABLE IF EXISTS holidays CASCADE;
DROP TABLE IF EXISTS attendance_periods CASCADE;
DROP TABLE IF EXISTS attendance_settings CASCADE;
DROP TABLE IF EXISTS exam_results CASCADE;
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS pengumuman CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS faces CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS grades CASCADE;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role TEXT NOT NULL CHECK (role IN ('siswa', 'guru', 'admin', 'staff')),
    nama TEXT NOT NULL,
    nisn TEXT UNIQUE,
    identitas TEXT UNIQUE,

    -- Personal Information
    email TEXT,
    phone TEXT,
    address TEXT,
    birth_date DATE,
    gender TEXT CHECK (gender IN ('L', 'P')),
    photo_url TEXT,

    -- Academic Information
    class_name TEXT,
    student_id TEXT,
    employee_id TEXT,

    -- Face Recognition
    face_embedding JSONB,
    face_registered_at TIMESTAMPTZ,

    -- Status and Settings
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Face embeddings table
CREATE TABLE faces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Face Data
    embedding JSONB NOT NULL,
    confidence DECIMAL(5,4) DEFAULT 0.0000,

    -- Image Information
    image_url TEXT,
    image_hash TEXT,
    capture_device TEXT,

    -- Status
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes table
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    code TEXT UNIQUE,
    grade_level TEXT,

    -- Class Information
    description TEXT,
    capacity INTEGER DEFAULT 40,
    academic_year TEXT NOT NULL,
    semester TEXT CHECK (semester IN ('1', '2')),

    -- Teachers
    homeroom_teacher_id UUID REFERENCES users(id),
    subject_teachers JSONB,

    -- Schedule
    schedule JSONB,
    room TEXT,

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Class enrollment
CREATE TABLE class_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Enrollment Information
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred', 'graduated')),
    student_number TEXT,

    -- Academic Information
    semester_enrolled TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(class_id, student_id)
);

-- Attendance settings
CREATE TABLE attendance_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Time Settings
    jam_masuk TIME NOT NULL,
    jam_terlambat TIME NOT NULL,
    jam_pulang TIME NOT NULL,
    toleransi_menit INTEGER DEFAULT 5,

    -- Days and Schedule
    working_days TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    school_year TEXT NOT NULL,
    semester TEXT CHECK (semester IN ('1', '2')),

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Attendance periods
CREATE TABLE attendance_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Period Information
    name TEXT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    -- Day Information
    day_of_week TEXT CHECK (day_of_week IN ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),

    -- Settings
    settings_id UUID REFERENCES attendance_settings(id),

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Holidays
CREATE TABLE holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Holiday Information
    name TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    type TEXT CHECK (type IN ('national', 'school', 'religious', 'other')),

    -- Settings
    settings_id UUID REFERENCES attendance_settings(id),

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(date, type)
);

-- Attendance records
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Date and Time
    tanggal DATE NOT NULL,
    waktu_masuk TIMESTAMPTZ,
    waktu_keluar TIMESTAMPTZ,

    -- Status Information
    status TEXT NOT NULL CHECK (status IN ('hadir', 'terlambat', 'tidak_hadir', 'alpha', 'izin', 'sakit')),
    method TEXT DEFAULT 'manual' CHECK (method IN ('manual', 'face_recognition', 'qr_code', 'card')),

    -- Location and Device
    location TEXT,
    device_info TEXT,
    ip_address INET,

    -- Notes and Verification
    notes TEXT,
    verified_by UUID REFERENCES users(id),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(user_id, tanggal)
);

-- Attendance summary (daily summary for performance)
CREATE TABLE attendance_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tanggal DATE NOT NULL,
    class_id UUID REFERENCES classes(id),

    -- Summary Statistics
    total_students INTEGER DEFAULT 0,
    present_count INTEGER DEFAULT 0,
    late_count INTEGER DEFAULT 0,
    absent_count INTEGER DEFAULT 0,
    excused_count INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(tanggal, class_id)
);

-- Exams table
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judul TEXT NOT NULL,
    deskripsi TEXT,
    mata_pelajaran TEXT NOT NULL,
    kelas TEXT,

    -- Exam Settings
    tanggal_mulai TIMESTAMPTZ NOT NULL,
    tanggal_selesai TIMESTAMPTZ NOT NULL,
    durasi_menit INTEGER NOT NULL,
    max_attempts INTEGER DEFAULT 1,
    passing_score DECIMAL(5,2) DEFAULT 70.00,

    -- Exam Configuration
    randomize_questions BOOLEAN DEFAULT false,
    show_results BOOLEAN DEFAULT true,
    allow_review BOOLEAN DEFAULT false,

    -- Proctoring
    proctoring_enabled BOOLEAN DEFAULT false,
    camera_required BOOLEAN DEFAULT false,
    screen_sharing BOOLEAN DEFAULT false,

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_published BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,

    -- Question Content
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay')),
    options JSONB,

    -- Question Settings
    points DECIMAL(5,2) DEFAULT 1.00,
    order_index INTEGER DEFAULT 0,
    time_limit_seconds INTEGER,

    -- Media
    image_url TEXT,
    audio_url TEXT,
    video_url TEXT,

    -- Answer Key
    correct_answer TEXT,
    explanation TEXT,

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answers table (student responses)
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Answer Content
    answer_text TEXT,
    selected_options JSONB,

    -- Timing
    time_started TIMESTAMPTZ,
    time_submitted TIMESTAMPTZ,

    -- Scoring
    points_earned DECIMAL(5,2) DEFAULT 0.00,
    is_correct BOOLEAN,
    auto_graded BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(exam_id, question_id, user_id)
);

-- Exam results
CREATE TABLE exam_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Score Information
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER DEFAULT 0,
    total_points DECIMAL(8,2) DEFAULT 0.00,
    max_points DECIMAL(8,2) NOT NULL,
    percentage DECIMAL(5,2) DEFAULT 0.00,

    -- Grading
    grade TEXT,
    letter_grade TEXT CHECK (letter_grade IN ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F')),
    is_passed BOOLEAN DEFAULT false,

    -- Timing
    time_started TIMESTAMPTZ,
    time_finished TIMESTAMPTZ,
    duration_minutes INTEGER,

    -- Attempt Information
    attempt_number INTEGER DEFAULT 1,

    -- Proctoring Data
    violations JSONB,
    screenshots JSONB,
    activity_log JSONB,

    -- Status
    status TEXT DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed', 'abandoned', 'disqualified')),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(exam_id, user_id, attempt_number)
);

-- Grades table for academic grading system
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Assignment Information
    assignment_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade DECIMAL(5,2) NOT NULL CHECK (grade >= 0 AND grade <= 100),
    max_grade DECIMAL(5,2) DEFAULT 100.00 CHECK (max_grade > 0),

    -- Date Information
    date DATE NOT NULL,
    semester TEXT CHECK (semester IN ('1', '2')),

    -- Additional Information
    notes TEXT,
    weight DECIMAL(3,2) DEFAULT 1.00,

    -- Status
    is_final BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),

    -- Constraints
    UNIQUE(student_id, assignment_name, subject, date)
);

-- Announcements
CREATE TABLE pengumuman (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judul TEXT NOT NULL,
    isi TEXT NOT NULL,
    tanggal DATE NOT NULL,

    -- Author Information
    author_id UUID REFERENCES users(id),

    -- Target Audience
    target_roles TEXT[] DEFAULT ARRAY['siswa', 'guru', 'admin'],
    target_classes TEXT[],

    -- Priority and Display
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_pinned BOOLEAN DEFAULT false,
    display_until DATE,

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_archived BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Read tracking
    read_by UUID[] DEFAULT ARRAY[]::UUID[]
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Notification Content
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'exam', 'attendance', 'grade')),

    -- Related Data
    related_id UUID,
    related_type TEXT,

    -- Status
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- System logs
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Log Information
    level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warning', 'error', 'critical')),
    message TEXT NOT NULL,
    details JSONB,

    -- Context
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    request_path TEXT,
    request_method TEXT,

    -- Technical Details
    error_stack TEXT,
    execution_time_ms INTEGER,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- Users indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_nisn ON users(nisn);
CREATE INDEX idx_users_identitas ON users(identitas);
CREATE INDEX idx_users_class_name ON users(class_name);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Faces indexes
CREATE INDEX idx_faces_user_id ON faces(user_id);
CREATE INDEX idx_faces_is_primary ON faces(is_primary);

-- Classes indexes
CREATE INDEX idx_classes_name ON classes(name);
CREATE INDEX idx_classes_grade_level ON classes(grade_level);
CREATE INDEX idx_classes_is_active ON classes(is_active);

-- Class students indexes
CREATE INDEX idx_class_students_class_id ON class_students(class_id);
CREATE INDEX idx_class_students_student_id ON class_students(student_id);
CREATE INDEX idx_class_students_status ON class_students(status);

-- Attendance indexes
CREATE INDEX idx_attendance_user_id ON attendance(user_id);
CREATE INDEX idx_attendance_tanggal ON attendance(tanggal);
CREATE INDEX idx_attendance_status ON attendance(status);

-- Exams indexes
CREATE INDEX idx_exams_mata_pelajaran ON exams(mata_pelajaran);
CREATE INDEX idx_exams_kelas ON exams(kelas);
CREATE INDEX idx_exams_is_active ON exams(is_active);
CREATE INDEX idx_exams_tanggal_mulai ON exams(tanggal_mulai);

-- Exam results indexes
CREATE INDEX idx_exam_results_exam_id ON exam_results(exam_id);
CREATE INDEX idx_exam_results_user_id ON exam_results(user_id);
CREATE INDEX idx_exam_results_is_passed ON exam_results(is_passed);

-- Grades indexes
CREATE INDEX idx_grades_student_id ON grades(student_id);
CREATE INDEX idx_grades_teacher_id ON grades(teacher_id);
CREATE INDEX idx_grades_subject ON grades(subject);
CREATE INDEX idx_grades_date ON grades(date);
CREATE INDEX idx_grades_semester ON grades(semester);

-- Pengumuman indexes
CREATE INDEX idx_pengumuman_created_at ON pengumuman(created_at);

-- System logs indexes
CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);

-- Composite indexes for common queries
CREATE INDEX idx_attendance_user_date ON attendance(user_id, tanggal);
CREATE INDEX idx_exam_results_exam_user ON exam_results(exam_id, user_id);
CREATE INDEX idx_grades_student_subject_date ON grades(student_id, subject, date);

-- Partial indexes for active records
CREATE INDEX idx_users_active_role ON users(is_active, role) WHERE is_active = true;
CREATE INDEX idx_exams_active_published ON exams(is_active, is_published) WHERE is_active = true AND is_published = true;

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View for class enrollment with student details
CREATE OR REPLACE VIEW class_enrollment AS
SELECT
    cs.id as enrollment_id,
    c.id as class_id,
    c.name as class_name,
    c.grade_level,
    u.id as student_id,
    u.nama as student_name,
    u.nisn,
    u.class_name as student_class_name,
    cs.status as enrollment_status,
    cs.enrollment_date
FROM class_students cs
JOIN classes c ON cs.class_id = c.id
JOIN users u ON cs.student_id = u.id
WHERE u.role = 'siswa' AND u.is_active = true;

-- View for attendance statistics
CREATE OR REPLACE VIEW attendance_stats AS
SELECT
    u.id as user_id,
    u.nama,
    u.role,
    u.class_name,
    COUNT(a.id) as total_attendance,
    COUNT(CASE WHEN a.status = 'hadir' THEN 1 END) as present_count,
    COUNT(CASE WHEN a.status = 'terlambat' THEN 1 END) as late_count,
    COUNT(CASE WHEN a.status IN ('tidak_hadir', 'alpha') THEN 1 END) as absent_count,
    ROUND(
        (COUNT(CASE WHEN a.status IN ('hadir', 'terlambat') THEN 1 END)::DECIMAL /
         NULLIF(COUNT(a.id), 0)) * 100, 2
    ) as attendance_rate
FROM users u
LEFT JOIN attendance a ON u.id = a.user_id
WHERE u.role = 'siswa' AND u.is_active = true
GROUP BY u.id, u.nama, u.role, u.class_name;

-- View for exam statistics
CREATE OR REPLACE VIEW exam_stats AS
SELECT
    e.id as exam_id,
    e.judul,
    e.mata_pelajaran,
    e.kelas,
    COUNT(er.id) as total_participants,
    COUNT(CASE WHEN er.is_passed = true THEN 1 END) as passed_count,
    ROUND(AVG(er.percentage), 2) as average_score,
    ROUND(
        (COUNT(CASE WHEN er.is_passed = true THEN 1 END)::DECIMAL /
         NULLIF(COUNT(er.id), 0)) * 100, 2
    ) as pass_rate
FROM exams e
LEFT JOIN exam_results er ON e.id = er.exam_id
WHERE e.is_active = true
GROUP BY e.id, e.judul, e.mata_pelajaran, e.kelas;

-- View for grades statistics
CREATE OR REPLACE VIEW grades_stats AS
SELECT
    g.student_id,
    u.nama as student_name,
    u.class_name,
    g.subject,
    g.semester,
    COUNT(g.id) as total_grades,
    ROUND(AVG(g.grade), 2) as average_grade,
    MAX(g.grade) as highest_grade,
    MIN(g.grade) as lowest_grade
FROM grades g
JOIN users u ON g.student_id = u.id
WHERE u.role = 'siswa' AND u.is_active = true
GROUP BY g.student_id, u.nama, u.class_name, g.subject, g.semester;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) - DISABLED FOR LOCALSTORAGE AUTH
-- ============================================================================

-- For applications using localStorage for session management,
-- we disable RLS to allow direct database access through API routes
-- Security is handled at the application level through role-based access

-- Enable RLS on all tables but with permissive policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE faces ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengumuman ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Permissive policies for localStorage-based authentication
CREATE POLICY "Allow all operations for localStorage auth" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations for localStorage auth" ON faces FOR ALL USING (true);
CREATE POLICY "Allow all operations for localStorage auth" ON classes FOR ALL USING (true);
CREATE POLICY "Allow all operations for localStorage auth" ON class_students FOR ALL USING (true);
CREATE POLICY "Allow all operations for localStorage auth" ON attendance FOR ALL USING (true);
CREATE POLICY "Allow all operations for localStorage auth" ON attendance_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations for localStorage auth" ON attendance_periods FOR ALL USING (true);
CREATE POLICY "Allow all operations for localStorage auth" ON holidays FOR ALL USING (true);
CREATE POLICY "Allow all operations for localStorage auth" ON attendance_summary FOR ALL USING (true);
CREATE POLICY "Allow all operations for localStorage auth" ON exams FOR ALL USING (true);
CREATE POLICY "Allow all operations for localStorage auth" ON questions FOR ALL USING (true);
CREATE POLICY "Allow all operations for localStorage auth" ON answers FOR ALL USING (true);
CREATE POLICY "Allow all operations for localStorage auth" ON exam_results FOR ALL USING (true);
CREATE POLICY "Allow all operations for localStorage auth" ON grades FOR ALL USING (true);
CREATE POLICY "Allow all operations for localStorage auth" ON pengumuman FOR ALL USING (true);
CREATE POLICY "Allow all operations for localStorage auth" ON notifications FOR ALL USING (true);
CREATE POLICY "Allow all operations for localStorage auth" ON system_logs FOR ALL USING (true);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faces_updated_at BEFORE UPDATE ON faces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_class_students_updated_at BEFORE UPDATE ON class_students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_settings_updated_at BEFORE UPDATE ON attendance_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_periods_updated_at BEFORE UPDATE ON attendance_periods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_holidays_updated_at BEFORE UPDATE ON holidays FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_summary_updated_at BEFORE UPDATE ON attendance_summary FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON answers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exam_results_updated_at BEFORE UPDATE ON exam_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON grades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pengumuman_updated_at BEFORE UPDATE ON pengumuman FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log system activities
CREATE OR REPLACE FUNCTION log_system_activity(
    activity_level TEXT,
    activity_message TEXT,
    activity_details JSONB DEFAULT NULL,
    activity_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO system_logs (level, message, details, user_id)
    VALUES (activity_level, activity_message, activity_details, activity_user_id)
    RETURNING id INTO log_id;

    RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update attendance summary
CREATE OR REPLACE FUNCTION update_attendance_summary()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert summary for the date
    INSERT INTO attendance_summary (tanggal, class_id, total_students, present_count, late_count, absent_count)
    SELECT
        NEW.tanggal,
        c.id,
        COUNT(DISTINCT u.id),
        COUNT(DISTINCT CASE WHEN a.status IN ('hadir', 'terlambat') THEN u.id END),
        COUNT(DISTINCT CASE WHEN a.status = 'terlambat' THEN u.id END),
        COUNT(DISTINCT CASE WHEN a.status IN ('tidak_hadir', 'alpha') THEN u.id END)
    FROM users u
    LEFT JOIN attendance a ON u.id = a.user_id AND a.tanggal = NEW.tanggal
    LEFT JOIN class_students cs ON u.id = cs.student_id
    LEFT JOIN classes c ON cs.class_id = c.id
    WHERE u.role = 'siswa' AND u.is_active = true
    GROUP BY NEW.tanggal, c.id
    ON CONFLICT (tanggal, class_id)
    DO UPDATE SET
        total_students = EXCLUDED.total_students,
        present_count = EXCLUDED.present_count,
        late_count = EXCLUDED.late_count,
        absent_count = EXCLUDED.absent_count,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update attendance summary
CREATE TRIGGER trigger_update_attendance_summary
    AFTER INSERT OR UPDATE ON attendance
    FOR EACH ROW EXECUTE FUNCTION update_attendance_summary();

-- ============================================================================
-- INITIAL DATA SETUP
-- ============================================================================

-- Insert default admin user
INSERT INTO users (role, nama, identitas, email, is_active, is_verified)
VALUES (
    'admin',
    'Administrator',
    'admin@sisfotjkt2.com',
    'admin@sisfotjkt2.com',
    true,
    true
) ON CONFLICT (identitas) DO NOTHING;

-- Insert default attendance settings
INSERT INTO attendance_settings (jam_masuk, jam_terlambat, jam_pulang, school_year, semester)
VALUES (
    '07:00:00',
    '07:15:00',
    '15:00:00',
    '2024-2025',
    '1'
) ON CONFLICT DO NOTHING;

-- Insert TJKT 2 class only (all students are in XII TJKT 2)
INSERT INTO classes (name, grade_level, academic_year, semester, description)
VALUES
    ('XII TJKT 2', 'XII', '2024-2025', '1', 'Kelas XII Teknik Jaringan Komputer dan Telekomunikasi 2 - Sekolah TJKT 2')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'SISFOTJKT2 LocalStorage-Compatible Database Schema Setup Complete!';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Schema Features:';
    RAISE NOTICE '• Complete user management with role-based access';
    RAISE NOTICE '• Face recognition system with multiple faces per user';
    RAISE NOTICE '• Class management and student enrollment';
    RAISE NOTICE '• Comprehensive attendance tracking';
    RAISE NOTICE '• Academic grading system';
    RAISE NOTICE '• Exam management with online testing';
    RAISE NOTICE '• Announcement and notification system';
    RAISE NOTICE '• System logging and audit trails';
    RAISE NOTICE '• Performance optimized with proper indexing';
    RAISE NOTICE '• RLS policies configured for localStorage authentication';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Ready for localStorage-based authentication!';
    RAISE NOTICE '============================================================================';
END $$;
