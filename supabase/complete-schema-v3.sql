-- =============================================
-- COMPLETE DATABASE SCHEMA V3 - QR CODE SYSTEM
-- =============================================
-- Sistem Absensi QR Code - XII TJKT 2
-- Menghapus semua tabel face recognition
-- Menambahkan sistem QR code yang lengkap

-- Drop existing tables and views if they exist (in correct order due to foreign keys)
-- Drop views first
DROP VIEW IF EXISTS attendance_summary CASCADE;
DROP VIEW IF EXISTS exam_results_summary CASCADE;

-- Drop tables (handle both table and view cases)
DROP TABLE IF EXISTS attendance_summary CASCADE;
DROP TABLE IF EXISTS exam_results_summary CASCADE;
DROP TABLE IF EXISTS system_logs CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS pengumuman CASCADE;
DROP TABLE IF EXISTS exam_results CASCADE;
DROP TABLE IF EXISTS exam_questions CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS grades CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS class_students CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop any existing face recognition tables (from old system)
DROP TABLE IF EXISTS faces CASCADE;
DROP TABLE IF EXISTS face_embeddings CASCADE;
DROP TABLE IF EXISTS face_registrations CASCADE;

-- =============================================
-- 1. USERS TABLE
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('siswa', 'guru', 'admin')),
    nisn VARCHAR(20) UNIQUE,
    identitas VARCHAR(50) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    class_name VARCHAR(100) DEFAULT 'XII TJKT 2',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. CLASSES TABLE
-- =============================================
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. CLASS_STUDENTS TABLE
-- =============================================
CREATE TABLE class_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(class_id, user_id)
);

-- =============================================
-- 4. ATTENDANCE TABLE
-- =============================================
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    waktu_masuk TIME,
    waktu_keluar TIME,
    status VARCHAR(20) DEFAULT 'hadir' CHECK (status IN ('hadir', 'terlambat', 'tidak_hadir', 'izin', 'sakit')),
    method VARCHAR(50) DEFAULT 'qr_code' CHECK (method IN ('qr_code', 'manual', 'api')),
    meta JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tanggal)
);

-- =============================================
-- 5. GRADES TABLE
-- =============================================
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    assignment_type VARCHAR(50) NOT NULL,
    score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    max_score DECIMAL(5,2) DEFAULT 100,
    semester VARCHAR(20) DEFAULT 'Ganjil',
    academic_year VARCHAR(10) DEFAULT '2024/2025',
    teacher_notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. EXAMS TABLE
-- =============================================
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(100) NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    total_questions INTEGER DEFAULT 0,
    max_score DECIMAL(5,2) DEFAULT 100,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 7. QUESTIONS TABLE
-- =============================================
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'essay', 'true_false')),
    options JSONB, -- For multiple choice: {"A": "option1", "B": "option2", ...}
    correct_answer VARCHAR(10), -- For multiple choice: "A", "B", etc.
    points DECIMAL(5,2) DEFAULT 1.0,
    subject VARCHAR(100),
    difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 8. EXAM_QUESTIONS TABLE
-- =============================================
CREATE TABLE exam_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0,
    points DECIMAL(5,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(exam_id, question_id)
);

-- =============================================
-- 9. EXAM_RESULTS TABLE
-- =============================================
CREATE TABLE exam_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score DECIMAL(5,2) DEFAULT 0,
    max_score DECIMAL(5,2) DEFAULT 100,
    answers JSONB DEFAULT '{}', -- Store student answers
    time_taken_minutes INTEGER DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE,
    graded_at TIMESTAMP WITH TIME ZONE,
    graded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(exam_id, user_id)
);

-- =============================================
-- 10. PENGUMUMAN TABLE
-- =============================================
CREATE TABLE pengumuman (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    judul VARCHAR(255) NOT NULL,
    isi TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'siswa', 'guru', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 11. NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 12. SYSTEM_LOGS TABLE
-- =============================================
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_nisn ON users(nisn);
CREATE INDEX idx_users_identitas ON users(identitas);
CREATE INDEX idx_users_class_name ON users(class_name);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Attendance indexes
CREATE INDEX idx_attendance_user_id ON attendance(user_id);
CREATE INDEX idx_attendance_tanggal ON attendance(tanggal);
CREATE INDEX idx_attendance_status ON attendance(status);
CREATE INDEX idx_attendance_method ON attendance(method);
CREATE INDEX idx_attendance_user_date ON attendance(user_id, tanggal);

-- Grades indexes
CREATE INDEX idx_grades_user_id ON grades(user_id);
CREATE INDEX idx_grades_subject ON grades(subject);
CREATE INDEX idx_grades_semester ON grades(semester);
CREATE INDEX idx_grades_academic_year ON grades(academic_year);

-- Exams indexes
CREATE INDEX idx_exams_created_by ON exams(created_by);
CREATE INDEX idx_exams_subject ON exams(subject);
CREATE INDEX idx_exams_is_active ON exams(is_active);
CREATE INDEX idx_exams_start_date ON exams(start_date);

-- Questions indexes
CREATE INDEX idx_questions_created_by ON questions(created_by);
CREATE INDEX idx_questions_subject ON questions(subject);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);

-- Exam results indexes
CREATE INDEX idx_exam_results_exam_id ON exam_results(exam_id);
CREATE INDEX idx_exam_results_user_id ON exam_results(user_id);
CREATE INDEX idx_exam_results_submitted_at ON exam_results(submitted_at);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- System logs indexes
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_action ON system_logs(action);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengumuman ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

CREATE POLICY "Teachers can view students" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

-- Attendance policies
CREATE POLICY "Users can view their own attendance" ON attendance
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Teachers can view all attendance" ON attendance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

CREATE POLICY "Teachers can insert attendance" ON attendance
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

-- Grades policies
CREATE POLICY "Students can view their own grades" ON grades
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Teachers can manage grades" ON grades
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

-- Exams policies
CREATE POLICY "Teachers can manage exams" ON exams
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

CREATE POLICY "Students can view active exams" ON exams
    FOR SELECT USING (is_active = true);

-- Questions policies
CREATE POLICY "Teachers can manage questions" ON questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

-- Exam results policies
CREATE POLICY "Students can view their own results" ON exam_results
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Teachers can view all results" ON exam_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Pengumuman policies
CREATE POLICY "Everyone can view active announcements" ON pengumuman
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage announcements" ON pengumuman
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON grades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exam_results_updated_at BEFORE UPDATE ON exam_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pengumuman_updated_at BEFORE UPDATE ON pengumuman
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- INSERT DEFAULT DATA
-- =============================================

-- Insert default class
INSERT INTO classes (id, name, description) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'XII TJKT 2', 'Kelas XII Teknik Komputer dan Jaringan 2');

-- Insert admin user
INSERT INTO users (id, nama, role, identitas, email, password_hash, is_active, is_verified) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'Administrator', 'admin', 'ADMIN001', 'admin@sekolah.com', '$2a$10$rQZ8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K', true, true);

-- Insert sample teacher
INSERT INTO users (id, nama, role, identitas, email, password_hash, class_name, is_active, is_verified) VALUES 
('550e8400-e29b-41d4-a716-446655440002', 'Guru Matematika', 'guru', 'GURU001', 'guru@sekolah.com', '$2a$10$rQZ8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K', 'XII TJKT 2', true, true);

-- Insert sample students
INSERT INTO users (id, nama, role, nisn, class_name, is_active, is_verified) VALUES 
('550e8400-e29b-41d4-a716-446655440003', 'Ahmad Rizki', 'siswa', '2024001', 'XII TJKT 2', true, true),
('550e8400-e29b-41d4-a716-446655440004', 'Siti Nurhaliza', 'siswa', '2024002', 'XII TJKT 2', true, true),
('550e8400-e29b-41d4-a716-446655440005', 'Budi Santoso', 'siswa', '2024003', 'XII TJKT 2', true, true),
('550e8400-e29b-41d4-a716-446655440006', 'Dewi Kartika', 'siswa', '2024004', 'XII TJKT 2', true, true),
('550e8400-e29b-41d4-a716-446655440007', 'Eko Prasetyo', 'siswa', '2024005', 'XII TJKT 2', true, true);

-- Add students to class
INSERT INTO class_students (class_id, user_id) VALUES 
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440003'),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440004'),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440005'),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440006'),
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440007');

-- Insert sample announcement
INSERT INTO pengumuman (judul, isi, priority, target_audience, created_by) VALUES 
('Selamat Datang di Sistem Absensi QR Code', 'Sistem absensi baru menggunakan QR Code telah aktif. Silakan download QR code personal Anda untuk absensi.', 'high', 'all', '550e8400-e29b-41d4-a716-446655440001');

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- View for attendance summary
CREATE VIEW attendance_summary AS
SELECT 
    u.id,
    u.nama,
    u.nisn,
    u.class_name,
    COUNT(a.id) as total_attendance,
    COUNT(CASE WHEN a.status = 'hadir' THEN 1 END) as hadir_count,
    COUNT(CASE WHEN a.status = 'terlambat' THEN 1 END) as terlambat_count,
    COUNT(CASE WHEN a.status = 'tidak_hadir' THEN 1 END) as tidak_hadir_count,
    ROUND(
        (COUNT(CASE WHEN a.status = 'hadir' THEN 1 END)::decimal / 
         NULLIF(COUNT(a.id), 0)) * 100, 2
    ) as attendance_percentage
FROM users u
LEFT JOIN attendance a ON u.id = a.user_id
WHERE u.role = 'siswa'
GROUP BY u.id, u.nama, u.nisn, u.class_name;

-- View for exam results summary
CREATE VIEW exam_results_summary AS
SELECT 
    e.id as exam_id,
    e.title,
    e.subject,
    COUNT(er.id) as total_participants,
    AVG(er.score) as average_score,
    MAX(er.score) as highest_score,
    MIN(er.score) as lowest_score
FROM exams e
LEFT JOIN exam_results er ON e.id = er.exam_id
GROUP BY e.id, e.title, e.subject;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions to anon users (for public access)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON pengumuman TO anon;
GRANT SELECT ON classes TO anon;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

-- This schema is now complete and ready for use
-- All face recognition related tables have been removed
-- QR code system is fully integrated
-- Admin user is created with ID: 550e8400-e29b-41d4-a716-446655440001
-- Default class "XII TJKT 2" is created
-- Sample data is inserted for testing
