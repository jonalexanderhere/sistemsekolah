-- Enhanced Schema for SISFOTJKT2 Face Recognition System
-- This schema includes all necessary tables, indexes, and security policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS attendance_summary CASCADE;
DROP TABLE IF EXISTS holidays CASCADE;
DROP TABLE IF EXISTS attendance_periods CASCADE;
DROP TABLE IF EXISTS attendance_settings CASCADE;
DROP TABLE IF EXISTS pengumuman CASCADE;
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS faces CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with enhanced fields
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role TEXT NOT NULL CHECK (role IN ('siswa', 'guru', 'admin')),
    nama TEXT NOT NULL,
    nisn TEXT UNIQUE,
    identitas TEXT UNIQUE,
    external_auth_id TEXT UNIQUE,
    face_embedding JSONB,
    email TEXT,
    phone TEXT,
    address TEXT,
    birth_date DATE,
    gender TEXT CHECK (gender IN ('L', 'P')),
    class_name TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create faces table for storing multiple face embeddings per user
CREATE TABLE faces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    embedding JSONB NOT NULL,
    confidence DECIMAL(5,4) DEFAULT 0.0000,
    image_url TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create attendance table with enhanced tracking
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    waktu_masuk TIMESTAMPTZ,
    waktu_keluar TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('hadir', 'terlambat', 'tidak_hadir', 'izin', 'sakit')),
    method TEXT DEFAULT 'face_recognition' CHECK (method IN ('face_recognition', 'manual', 'card', 'qr_code')),
    confidence_score DECIMAL(5,4),
    location JSONB, -- Store GPS coordinates if needed
    device_info JSONB, -- Store device information
    notes TEXT,
    approved_by UUID REFERENCES users(id),
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, tanggal)
);

-- Create exams table with enhanced features
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judul TEXT NOT NULL,
    deskripsi TEXT,
    mata_pelajaran TEXT,
    kelas TEXT,
    tanggal_mulai TIMESTAMPTZ NOT NULL,
    tanggal_selesai TIMESTAMPTZ NOT NULL,
    durasi_menit INTEGER NOT NULL,
    max_attempts INTEGER DEFAULT 1,
    passing_score DECIMAL(5,2) DEFAULT 60.00,
    is_active BOOLEAN DEFAULT true,
    is_published BOOLEAN DEFAULT false,
    dibuat_oleh UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create questions table with enhanced question types
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'essay')),
    pertanyaan TEXT NOT NULL,
    pilihan_a TEXT,
    pilihan_b TEXT,
    pilihan_c TEXT,
    pilihan_d TEXT,
    jawaban_benar TEXT NOT NULL,
    explanation TEXT,
    points DECIMAL(5,2) DEFAULT 1.00,
    nomor_urut INTEGER NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_id, nomor_urut)
);

-- Create answers table with enhanced tracking
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    jawaban TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    points_earned DECIMAL(5,2) DEFAULT 0.00,
    time_spent INTEGER, -- in seconds
    attempt_number INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_id, question_id, user_id, attempt_number)
);

-- Create exam results table
CREATE TABLE exam_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER DEFAULT 0,
    total_points DECIMAL(8,2) DEFAULT 0.00,
    max_points DECIMAL(8,2) NOT NULL,
    percentage DECIMAL(5,2) DEFAULT 0.00,
    grade TEXT,
    is_passed BOOLEAN DEFAULT false,
    time_started TIMESTAMPTZ,
    time_finished TIMESTAMPTZ,
    duration_minutes INTEGER,
    attempt_number INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_id, user_id, attempt_number)
);

-- Create pengumuman table with enhanced features
CREATE TABLE pengumuman (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judul TEXT NOT NULL,
    isi TEXT NOT NULL,
    category TEXT DEFAULT 'general' CHECK (category IN ('general', 'academic', 'event', 'urgent')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'siswa', 'guru', 'admin')),
    is_published BOOLEAN DEFAULT true,
    publish_date TIMESTAMPTZ DEFAULT NOW(),
    expire_date TIMESTAMPTZ,
    image_url TEXT,
    attachments JSONB,
    dibuat_oleh UUID REFERENCES users(id),
    tanggal DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create attendance_settings table for configurable time settings
CREATE TABLE attendance_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    jam_masuk TIME NOT NULL DEFAULT '07:00:00',
    jam_terlambat TIME NOT NULL DEFAULT '07:30:00',
    jam_pulang TIME NOT NULL DEFAULT '15:00:00',
    jam_pulang_jumat TIME DEFAULT '11:30:00', -- Different time for Friday
    toleransi_menit INTEGER DEFAULT 5,
    auto_checkout BOOLEAN DEFAULT false,
    require_checkout BOOLEAN DEFAULT false,
    weekend_attendance BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create attendance_periods table for different periods
CREATE TABLE attendance_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create holidays table for managing school holidays
CREATE TABLE holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    date DATE NOT NULL,
    type TEXT DEFAULT 'holiday' CHECK (type IN ('holiday', 'weekend', 'special', 'semester_break')),
    description TEXT,
    is_recurring BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, name)
);

-- Create attendance_summary table for daily summaries
CREATE TABLE attendance_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    total_students INTEGER DEFAULT 0,
    present_count INTEGER DEFAULT 0,
    late_count INTEGER DEFAULT 0,
    absent_count INTEGER DEFAULT 0,
    excused_count INTEGER DEFAULT 0,
    attendance_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date)
);

-- Create classes table for better organization
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    grade_level TEXT,
    homeroom_teacher UUID REFERENCES users(id),
    max_students INTEGER DEFAULT 40,
    academic_year TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create class_students table for many-to-many relationship
CREATE TABLE class_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, student_id)
);

-- Create system_logs table for audit trail
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create comprehensive indexes for better performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_nisn ON users(nisn) WHERE nisn IS NOT NULL;
CREATE INDEX idx_users_identitas ON users(identitas) WHERE identitas IS NOT NULL;
CREATE INDEX idx_users_external_auth_id ON users(external_auth_id) WHERE external_auth_id IS NOT NULL;
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_class_name ON users(class_name) WHERE class_name IS NOT NULL;

CREATE INDEX idx_faces_user_id ON faces(user_id);
CREATE INDEX idx_faces_is_primary ON faces(is_primary) WHERE is_primary = true;

CREATE INDEX idx_attendance_user_tanggal ON attendance(user_id, tanggal);
CREATE INDEX idx_attendance_tanggal ON attendance(tanggal);
CREATE INDEX idx_attendance_status ON attendance(status);
CREATE INDEX idx_attendance_method ON attendance(method);

CREATE INDEX idx_exams_dibuat_oleh ON exams(dibuat_oleh);
CREATE INDEX idx_exams_is_active ON exams(is_active);
CREATE INDEX idx_exams_tanggal_mulai ON exams(tanggal_mulai);

CREATE INDEX idx_questions_exam_id ON questions(exam_id);
CREATE INDEX idx_questions_exam_nomor ON questions(exam_id, nomor_urut);

CREATE INDEX idx_answers_exam_user ON answers(exam_id, user_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);

CREATE INDEX idx_exam_results_exam_user ON exam_results(exam_id, user_id);
CREATE INDEX idx_exam_results_user_id ON exam_results(user_id);

CREATE INDEX idx_pengumuman_category ON pengumuman(category);
CREATE INDEX idx_pengumuman_priority ON pengumuman(priority);
CREATE INDEX idx_pengumuman_target_audience ON pengumuman(target_audience);
CREATE INDEX idx_pengumuman_is_published ON pengumuman(is_published);
CREATE INDEX idx_pengumuman_publish_date ON pengumuman(publish_date);

CREATE INDEX idx_attendance_settings_active ON attendance_settings(is_active);
CREATE INDEX idx_attendance_periods_active ON attendance_periods(is_active);
CREATE INDEX idx_holidays_date ON holidays(date);
CREATE INDEX idx_attendance_summary_date ON attendance_summary(date);

CREATE INDEX idx_classes_is_active ON classes(is_active);
CREATE INDEX idx_class_students_class_id ON class_students(class_id);
CREATE INDEX idx_class_students_student_id ON class_students(student_id);
CREATE INDEX idx_class_students_active ON class_students(is_active);

CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_action ON system_logs(action);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE faces ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengumuman ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies

-- Users policies
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid()::text = external_auth_id);

CREATE POLICY "Teachers and admins can read all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE external_auth_id = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

CREATE POLICY "Admins can manage users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE external_auth_id = auth.uid()::text 
            AND role = 'admin'
        )
    );

-- Faces policies
CREATE POLICY "Users can manage own faces" ON faces
    FOR ALL USING (
        user_id IN (
            SELECT id FROM users WHERE external_auth_id = auth.uid()::text
        )
    );

CREATE POLICY "Teachers can read all faces" ON faces
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE external_auth_id = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

-- Attendance policies
CREATE POLICY "Teachers and admins can read all attendance" ON attendance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE external_auth_id = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

CREATE POLICY "Students can read own attendance" ON attendance
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE external_auth_id = auth.uid()::text
        )
    );

CREATE POLICY "System can insert attendance" ON attendance
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Teachers can manage attendance" ON attendance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE external_auth_id = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

-- Exam policies
CREATE POLICY "Teachers can manage exams" ON exams
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE external_auth_id = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

CREATE POLICY "Students can read published exams" ON exams
    FOR SELECT USING (is_published = true);

-- Questions policies
CREATE POLICY "Teachers can manage questions" ON questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE external_auth_id = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

CREATE POLICY "Students can read questions for published exams" ON questions
    FOR SELECT USING (
        exam_id IN (
            SELECT id FROM exams WHERE is_published = true
        )
    );

-- Answers policies
CREATE POLICY "Students can manage own answers" ON answers
    FOR ALL USING (
        user_id IN (
            SELECT id FROM users WHERE external_auth_id = auth.uid()::text
        )
    );

CREATE POLICY "Teachers can read all answers" ON answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE external_auth_id = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

-- Exam results policies
CREATE POLICY "Students can read own results" ON exam_results
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE external_auth_id = auth.uid()::text
        )
    );

CREATE POLICY "Teachers can manage all results" ON exam_results
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE external_auth_id = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

-- Pengumuman policies
CREATE POLICY "Teachers can manage pengumuman" ON pengumuman
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE external_auth_id = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

CREATE POLICY "Everyone can read published pengumuman" ON pengumuman
    FOR SELECT USING (is_published = true);

-- Settings and configuration policies
CREATE POLICY "Teachers can manage attendance settings" ON attendance_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE external_auth_id = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

CREATE POLICY "Everyone can read active settings" ON attendance_settings
    FOR SELECT USING (is_active = true);

CREATE POLICY "Teachers can manage periods" ON attendance_periods
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE external_auth_id = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

CREATE POLICY "Everyone can read periods" ON attendance_periods
    FOR SELECT USING (true);

CREATE POLICY "Teachers can manage holidays" ON holidays
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE external_auth_id = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

CREATE POLICY "Everyone can read holidays" ON holidays
    FOR SELECT USING (true);

CREATE POLICY "Teachers can manage summary" ON attendance_summary
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE external_auth_id = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

CREATE POLICY "Everyone can read summary" ON attendance_summary
    FOR SELECT USING (true);

-- Classes policies
CREATE POLICY "Teachers can manage classes" ON classes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE external_auth_id = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

CREATE POLICY "Everyone can read active classes" ON classes
    FOR SELECT USING (is_active = true);

CREATE POLICY "Teachers can manage class students" ON class_students
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE external_auth_id = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

CREATE POLICY "Students can read own class enrollment" ON class_students
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM users WHERE external_auth_id = auth.uid()::text
        )
    );

-- System logs policies
CREATE POLICY "Admins can read all logs" ON system_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE external_auth_id = auth.uid()::text 
            AND role = 'admin'
        )
    );

CREATE POLICY "System can insert logs" ON system_logs
    FOR INSERT WITH CHECK (true);

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pengumuman_updated_at BEFORE UPDATE ON pengumuman
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_settings_updated_at BEFORE UPDATE ON attendance_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_periods_updated_at BEFORE UPDATE ON attendance_periods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_summary_updated_at BEFORE UPDATE ON attendance_summary
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default data
INSERT INTO attendance_settings (name, jam_masuk, jam_terlambat, jam_pulang, jam_pulang_jumat, toleransi_menit, is_active) 
VALUES ('Default Schedule', '07:00:00', '07:30:00', '15:00:00', '11:30:00', 5, true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO attendance_periods (name, description, start_date, end_date, is_active) 
VALUES (
    'Tahun Ajaran 2024/2025', 
    'Periode tahun ajaran 2024-2025',
    '2024-07-01', 
    '2025-06-30', 
    true
) ON CONFLICT DO NOTHING;

-- Insert default classes
INSERT INTO classes (name, grade_level, academic_year, is_active) VALUES
('X IPA 1', '10', '2024/2025', true),
('X IPA 2', '10', '2024/2025', true),
('XI IPA 1', '11', '2024/2025', true),
('XI IPA 2', '11', '2024/2025', true),
('XII IPA 1', '12', '2024/2025', true),
('XII IPA 2', '12', '2024/2025', true)
ON CONFLICT (name) DO NOTHING;

-- Insert common holidays
INSERT INTO holidays (name, date, type, description) VALUES
('Tahun Baru', '2025-01-01', 'holiday', 'Hari Tahun Baru Masehi'),
('Hari Raya Idul Fitri', '2025-03-31', 'holiday', 'Hari Raya Idul Fitri 1446 H'),
('Hari Kemerdekaan RI', '2025-08-17', 'holiday', 'Hari Kemerdekaan Republik Indonesia'),
('Hari Raya Idul Adha', '2025-06-07', 'holiday', 'Hari Raya Idul Adha 1446 H')
ON CONFLICT (date, name) DO NOTHING;
