-- SISFOTJKT2 - Direct Supabase Setup
-- Copy and paste this entire script into Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
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

-- Create faces table
CREATE TABLE IF NOT EXISTS faces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    embedding JSONB NOT NULL,
    confidence DECIMAL(5,4) DEFAULT 0.0000,
    image_url TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    waktu_masuk TIMESTAMPTZ,
    waktu_keluar TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('hadir', 'terlambat', 'tidak_hadir', 'izin', 'sakit')),
    method TEXT DEFAULT 'face_recognition' CHECK (method IN ('face_recognition', 'manual', 'card', 'qr_code')),
    confidence_score DECIMAL(5,4),
    location JSONB,
    device_info JSONB,
    notes TEXT,
    approved_by UUID REFERENCES users(id),
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, tanggal)
);

-- Create exams table
CREATE TABLE IF NOT EXISTS exams (
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

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
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

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    jawaban TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    points_earned DECIMAL(5,2) DEFAULT 0.00,
    time_spent INTEGER,
    attempt_number INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exam_id, question_id, user_id, attempt_number)
);

-- Create pengumuman table
CREATE TABLE IF NOT EXISTS pengumuman (
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

-- Create attendance_settings table
CREATE TABLE IF NOT EXISTS attendance_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    jam_masuk TIME NOT NULL DEFAULT '07:00:00',
    jam_terlambat TIME NOT NULL DEFAULT '07:30:00',
    jam_pulang TIME NOT NULL DEFAULT '15:00:00',
    jam_pulang_jumat TIME DEFAULT '11:30:00',
    toleransi_menit INTEGER DEFAULT 5,
    auto_checkout BOOLEAN DEFAULT false,
    require_checkout BOOLEAN DEFAULT false,
    weekend_attendance BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    grade_level TEXT,
    homeroom_teacher UUID REFERENCES users(id),
    max_students INTEGER DEFAULT 40,
    academic_year TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_nisn ON users(nisn) WHERE nisn IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_identitas ON users(identitas) WHERE identitas IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_faces_user_id ON faces(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_tanggal ON attendance(user_id, tanggal);
CREATE INDEX IF NOT EXISTS idx_attendance_tanggal ON attendance(tanggal);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE faces ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengumuman ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users based on email" ON users FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON faces FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON faces FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON attendance FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON attendance FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON exams FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON exams FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON questions FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON questions FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON answers FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON answers FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON pengumuman FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON pengumuman FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON attendance_settings FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON attendance_settings FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON classes FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON classes FOR INSERT WITH CHECK (true);

-- Insert default data
INSERT INTO attendance_settings (name, jam_masuk, jam_terlambat, jam_pulang, jam_pulang_jumat, toleransi_menit, is_active) 
VALUES ('Default Schedule', '07:00:00', '07:30:00', '15:00:00', '11:30:00', 5, true)
ON CONFLICT (name) DO NOTHING;

-- Insert default classes
INSERT INTO classes (name, grade_level, academic_year, is_active) VALUES
('X IPA 1', '10', '2024/2025', true),
('X IPA 2', '10', '2024/2025', true),
('XI IPA 1', '11', '2024/2025', true),
('XI IPA 2', '11', '2024/2025', true),
('XII IPA 1', '12', '2024/2025', true),
('XII IPA 2', '12', '2024/2025', true)
ON CONFLICT (name) DO NOTHING;

-- Insert Admin User
INSERT INTO users (role, nama, nisn, identitas, external_auth_id, is_active) 
VALUES ('admin', 'Administrator', 'ADMIN001', 'admin@sisfotjkt2.com', 'admin-default', true)
ON CONFLICT (nisn) DO NOTHING;

-- Insert Teachers
INSERT INTO users (role, nama, nisn, identitas, external_auth_id, is_active) VALUES
('guru', 'DIDIK KURNIAWAN, S.Kom, M.TI', '198103102010011012', 'didik.kurniawan.s.kom.m.ti@sisfotjkt2.com', 'teacher-198103102010011012', true),
('guru', 'ADE FIRMANSYAH, S.Kom', '3855773674130022', 'ade.firmansyah.s.kom@sisfotjkt2.com', 'teacher-3855773674130022', true)
ON CONFLICT (nisn) DO NOTHING;

-- Insert Students
INSERT INTO users (role, nama, nisn, identitas, external_auth_id, class_name, is_active) VALUES
('siswa', 'ALLDOO SAPUTRA', '0089990908', 'alldoo.saputra@sisfotjkt2.com', 'student-0089990908', 'X IPA 1', true),
('siswa', 'ALYA ANGGITA MAHERA', '0071887022', 'alya.anggita.mahera@sisfotjkt2.com', 'student-0071887022', 'X IPA 1', true),
('siswa', 'AMELIA', '0071317242', 'amelia@sisfotjkt2.com', 'student-0071317242', 'X IPA 1', true),
('siswa', 'AMELIA SEPTIA SARI', '0083627332', 'amelia.septia.sari@sisfotjkt2.com', 'student-0083627332', 'X IPA 1', true),
('siswa', 'AULIA KENANGA SAFITRI', '0081278251', 'aulia.kenanga.safitri@sisfotjkt2.com', 'student-0081278251', 'X IPA 1', true),
('siswa', 'AYUNDA NAFISHA', '3102623580', 'ayunda.nafisha@sisfotjkt2.com', 'student-3102623580', 'X IPA 1', true),
('siswa', 'BERLIAN ANUGRAH PRATAMA', '0088754753', 'berlian.anugrah.pratama@sisfotjkt2.com', 'student-0088754753', 'X IPA 1', true),
('siswa', 'DESTI RAHAYU', '0076775460', 'desti.rahayu@sisfotjkt2.com', 'student-0076775460', 'X IPA 1', true),
('siswa', 'DESTIA', '0077986875', 'destia@sisfotjkt2.com', 'student-0077986875', 'X IPA 1', true),
('siswa', 'ERIC ERIANTO', '0069944236', 'eric.erianto@sisfotjkt2.com', 'student-0069944236', 'X IPA 1', true),
('siswa', 'FAIZAH AZ ZAHRA', '0084352502', 'faizah.az.zahra@sisfotjkt2.com', 'student-0084352502', 'X IPA 1', true),
('siswa', 'FITRI ULANDARI', '0082539133', 'fitri.ulandari@sisfotjkt2.com', 'student-0082539133', 'X IPA 1', true),
('siswa', 'GHEA LITA ANASTASYA', '0074043979', 'ghea.lita.anastasya@sisfotjkt2.com', 'student-0074043979', 'X IPA 1', true),
('siswa', 'JHOVANI WIJAYA', '0081353027', 'jhovani.wijaya@sisfotjkt2.com', 'student-0081353027', 'X IPA 1', true),
('siswa', 'KEISYA AGUSTIN RASFA AULIA', '0082019386', 'keisya.agustin.rasfa.aulia@sisfotjkt2.com', 'student-0082019386', 'X IPA 1', true),
('siswa', 'MAHARANI', '0074731920', 'maharani@sisfotjkt2.com', 'student-0074731920', 'X IPA 1', true),
('siswa', 'NAURA GHIFARI AZHAR', '0076724319', 'naura.ghifari.azhar@sisfotjkt2.com', 'student-0076724319', 'X IPA 1', true),
('siswa', 'PATRA ADITTIA', '0083063479', 'patra.adittia@sisfotjkt2.com', 'student-0083063479', 'X IPA 1', true),
('siswa', 'PUTRI SAPARA', '0085480329', 'putri.sapara@sisfotjkt2.com', 'student-0085480329', 'X IPA 1', true),
('siswa', 'RAFI SEPTA WIRA TAMA', '0079319957', 'rafi.septa.wira.tama@sisfotjkt2.com', 'student-0079319957', 'X IPA 1', true),
('siswa', 'RAKA RAMADHANI PRATAMA', '0082901449', 'raka.ramadhani.pratama@sisfotjkt2.com', 'student-0082901449', 'X IPA 1', true),
('siswa', 'REGITA MAHARANI', '0081628824', 'regita.maharani@sisfotjkt2.com', 'student-0081628824', 'X IPA 1', true),
('siswa', 'REGITHA ANINDYA AZZAHRA', '0081133109', 'regitha.anindya.azzahra@sisfotjkt2.com', 'student-0081133109', 'X IPA 1', true),
('siswa', 'RENDI ARISNANDO', '0076040547', 'rendi.arisnando@sisfotjkt2.com', 'student-0076040547', 'X IPA 1', true),
('siswa', 'RIDHO ZAENAL MUSTAQIM', '0078327818', 'ridho.zaenal.mustaqim@sisfotjkt2.com', 'student-0078327818', 'X IPA 1', true),
('siswa', 'RISTY WIDIASIH', '0076113354', 'risty.widiasih@sisfotjkt2.com', 'student-0076113354', 'X IPA 1', true),
('siswa', 'SIFA RISTIANA', '0084399894', 'sifa.ristiana@sisfotjkt2.com', 'student-0084399894', 'X IPA 1', true),
('siswa', 'AMELIA DIANA', '6672', 'amelia.diana@sisfotjkt2.com', 'student-6672', 'X IPA 1', true),
('siswa', 'DESTA AMELIA', '6673', 'desta.amelia@sisfotjkt2.com', 'student-6673', 'X IPA 1', true)
ON CONFLICT (nisn) DO NOTHING;

-- Insert welcome announcement
INSERT INTO pengumuman (judul, isi, tanggal, category, priority, target_audience, is_published) 
VALUES (
    'Selamat Datang di SISFOTJKT2', 
    'Sistem Face Recognition untuk absensi telah aktif. Silakan daftarkan wajah Anda untuk mulai menggunakan sistem absensi otomatis.',
    CURRENT_DATE,
    'general',
    'high',
    'all',
    true
)
ON CONFLICT DO NOTHING;
