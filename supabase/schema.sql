-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role TEXT NOT NULL CHECK (role IN ('siswa', 'guru', 'admin')),
    nama TEXT NOT NULL,
    nisn TEXT,
    identitas TEXT,
    external_auth_id TEXT,
    face_embedding JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create faces table for storing face embeddings
CREATE TABLE IF NOT EXISTS faces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    embedding JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    waktu TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('hadir', 'terlambat', 'tidak_hadir')),
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create exams table
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judul TEXT NOT NULL,
    deskripsi TEXT,
    tanggal_mulai TIMESTAMPTZ NOT NULL,
    tanggal_selesai TIMESTAMPTZ NOT NULL,
    durasi_menit INTEGER NOT NULL,
    dibuat_oleh UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    pertanyaan TEXT NOT NULL,
    pilihan_a TEXT NOT NULL,
    pilihan_b TEXT NOT NULL,
    pilihan_c TEXT NOT NULL,
    pilihan_d TEXT NOT NULL,
    jawaban_benar TEXT NOT NULL CHECK (jawaban_benar IN ('a', 'b', 'c', 'd')),
    nomor_urut INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    jawaban TEXT NOT NULL CHECK (jawaban IN ('a', 'b', 'c', 'd')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_id, question_id, user_id)
);

-- Create pengumuman table
CREATE TABLE IF NOT EXISTS pengumuman (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    judul TEXT NOT NULL,
    isi TEXT NOT NULL,
    dibuat_oleh UUID REFERENCES users(id),
    tanggal DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create attendance_settings table for configurable time settings
CREATE TABLE IF NOT EXISTS attendance_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    jam_masuk TIME NOT NULL DEFAULT '07:00:00',
    jam_terlambat TIME NOT NULL DEFAULT '07:30:00',
    jam_pulang TIME NOT NULL DEFAULT '15:00:00',
    toleransi_menit INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create attendance_periods table for different periods (e.g., semester, caturwulan)
CREATE TABLE IF NOT EXISTS attendance_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create holidays table for managing school holidays
CREATE TABLE IF NOT EXISTS holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    date DATE NOT NULL,
    type TEXT DEFAULT 'holiday' CHECK (type IN ('holiday', 'weekend', 'special')),
    description TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create attendance_summary table for daily summaries
CREATE TABLE IF NOT EXISTS attendance_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    total_students INTEGER DEFAULT 0,
    present_count INTEGER DEFAULT 0,
    late_count INTEGER DEFAULT 0,
    absent_count INTEGER DEFAULT 0,
    attendance_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_nisn ON users(nisn);
CREATE INDEX IF NOT EXISTS idx_attendance_user_tanggal ON attendance(user_id, tanggal);
CREATE INDEX IF NOT EXISTS idx_attendance_tanggal ON attendance(tanggal);
CREATE INDEX IF NOT EXISTS idx_faces_user_id ON faces(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_answers_exam_user ON answers(exam_id, user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_settings_active ON attendance_settings(is_active);
CREATE INDEX IF NOT EXISTS idx_attendance_periods_active ON attendance_periods(is_active);
CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays(date);
CREATE INDEX IF NOT EXISTS idx_attendance_summary_date ON attendance_summary(date);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE faces ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengumuman ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_summary ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid()::text = external_auth_id);

-- Teachers and admins can read all users
CREATE POLICY "Teachers and admins can read all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE external_auth_id = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

-- Users can read their own faces
CREATE POLICY "Users can read own faces" ON faces
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE external_auth_id = auth.uid()::text
        )
    );

-- Users can insert their own faces
CREATE POLICY "Users can insert own faces" ON faces
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM users WHERE external_auth_id = auth.uid()::text
        )
    );

-- Teachers and admins can read all attendance
CREATE POLICY "Teachers and admins can read all attendance" ON attendance
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE external_auth_id = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

-- Students can read their own attendance
CREATE POLICY "Students can read own attendance" ON attendance
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE external_auth_id = auth.uid()::text
        )
    );

-- System can insert attendance (for face recognition)
CREATE POLICY "System can insert attendance" ON attendance
    FOR INSERT WITH CHECK (true);

-- Teachers can manage exams
CREATE POLICY "Teachers can manage exams" ON exams
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE external_auth_id = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

-- Everyone can read exams
CREATE POLICY "Everyone can read exams" ON exams
    FOR SELECT USING (true);

-- Teachers can manage questions
CREATE POLICY "Teachers can manage questions" ON questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE external_auth_id = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

-- Everyone can read questions
CREATE POLICY "Everyone can read questions" ON questions
    FOR SELECT USING (true);

-- Students can insert their own answers
CREATE POLICY "Students can insert own answers" ON answers
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM users WHERE external_auth_id = auth.uid()::text
        )
    );

-- Teachers can read all answers
CREATE POLICY "Teachers can read all answers" ON answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE external_auth_id = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

-- Students can read their own answers
CREATE POLICY "Students can read own answers" ON answers
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE external_auth_id = auth.uid()::text
        )
    );

-- Teachers can manage pengumuman
CREATE POLICY "Teachers can manage pengumuman" ON pengumuman
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE external_auth_id = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

-- Everyone can read pengumuman
CREATE POLICY "Everyone can read pengumuman" ON pengumuman
    FOR SELECT USING (true);

-- Attendance Settings Policies
CREATE POLICY "Teachers can manage attendance settings" ON attendance_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE external_auth_id = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

CREATE POLICY "Everyone can read active attendance settings" ON attendance_settings
    FOR SELECT USING (is_active = true);

-- Attendance Periods Policies
CREATE POLICY "Teachers can manage attendance periods" ON attendance_periods
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE external_auth_id = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

CREATE POLICY "Everyone can read attendance periods" ON attendance_periods
    FOR SELECT USING (true);

-- Holidays Policies
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

-- Attendance Summary Policies
CREATE POLICY "Teachers can manage attendance summary" ON attendance_summary
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE external_auth_id = auth.uid()::text 
            AND role IN ('guru', 'admin')
        )
    );

CREATE POLICY "Everyone can read attendance summary" ON attendance_summary
    FOR SELECT USING (true);

-- Insert default attendance settings
INSERT INTO attendance_settings (name, jam_masuk, jam_terlambat, jam_pulang, toleransi_menit, is_active) 
VALUES ('Default Schedule', '07:00:00', '07:30:00', '15:00:00', 5, true)
ON CONFLICT (name) DO NOTHING;

-- Insert default attendance period (current academic year)
INSERT INTO attendance_periods (name, start_date, end_date, is_active) 
VALUES (
    'Tahun Ajaran 2024/2025', 
    '2024-07-01', 
    '2025-06-30', 
    true
) ON CONFLICT DO NOTHING;
