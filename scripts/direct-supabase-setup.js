const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Teacher data
const dataGuru = [
    { 
        nama: "DIDIK KURNIAWAN, S.Kom, M.TI", 
        nip: "198103102010011012", 
        mata_pelajaran: "Teknologi Informasi"
    },
    { 
        nama: "ADE FIRMANSYAH, S.Kom", 
        nip: "3855773674130022", 
        mata_pelajaran: "Komputer"
    }
];

// Student data
const dataSiswa = [
    { nisn: "0089990908", id: "6643", nama: "ALLDOO SAPUTRA" },
    { nisn: "0071887022", id: "6644", nama: "ALYA ANGGITA MAHERA" },
    { nisn: "0071317242", id: "6645", nama: "AMELIA" },
    { nisn: "0083627332", id: "6646", nama: "AMELIA SEPTIA SARI" },
    { nisn: "0081278251", id: "6647", nama: "AULIA KENANGA SAFITRI" },
    { nisn: "3102623580", id: "6648", nama: "AYUNDA NAFISHA" },
    { nisn: "0088754753", id: "6649", nama: "BERLIAN ANUGRAH PRATAMA" },
    { nisn: "0076775460", id: "6650", nama: "DESTI RAHAYU" },
    { nisn: "0077986875", id: "6651", nama: "DESTIA" },
    { nisn: "0069944236", id: "6652", nama: "ERIC ERIANTO" },
    { nisn: "0084352502", id: "6653", nama: "FAIZAH AZ ZAHRA" },
    { nisn: "0082539133", id: "6654", nama: "FITRI ULANDARI" },
    { nisn: "0074043979", id: "6655", nama: "GHEA LITA ANASTASYA" },
    { nisn: "0081353027", id: "6656", nama: "JHOVANI WIJAYA" },
    { nisn: "0082019386", id: "6657", nama: "KEISYA AGUSTIN RASFA AULIA" },
    { nisn: "0074731920", id: "6659", nama: "MAHARANI" },
    { nisn: "0076724319", id: "6660", nama: "NAURA GHIFARI AZHAR" },
    { nisn: "0083063479", id: "6662", nama: "PATRA ADITTIA" },
    { nisn: "0085480329", id: "6663", nama: "PUTRI SAPARA" },
    { nisn: "0079319957", id: "6664", nama: "RAFI SEPTA WIRA TAMA" },
    { nisn: "0082901449", id: "6665", nama: "RAKA RAMADHANI PRATAMA" },
    { nisn: "0081628824", id: "6666", nama: "REGITA MAHARANI" },
    { nisn: "0081133109", id: "6667", nama: "REGITHA ANINDYA AZZAHRA" },
    { nisn: "0076040547", id: "6668", nama: "RENDI ARISNANDO" },
    { nisn: "0078327818", id: "6669", nama: "RIDHO ZAENAL MUSTAQIM" },
    { nisn: "0076113354", id: "6670", nama: "RISTY WIDIASIH" },
    { nisn: "0084399894", id: "6671", nama: "SIFA RISTIANA" },
    { nisn: "", id: "6672", nama: "AMELIA DIANA" },
    { nisn: "", id: "6673", nama: "DESTA AMELIA" }
];

async function createBasicTables() {
    console.log('🗄️  Creating basic tables...');
    
    try {
        // Create users table first
        const { error: usersError } = await supabase.rpc('sql', {
            query: `
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
            `
        });
        
        if (usersError) {
            console.log('⚠️  Users table may already exist or using direct insert');
        } else {
            console.log('✅ Users table created');
        }
        
        // Create faces table
        const { error: facesError } = await supabase.rpc('sql', {
            query: `
            CREATE TABLE IF NOT EXISTS faces (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                embedding JSONB NOT NULL,
                confidence DECIMAL(5,4) DEFAULT 0.0000,
                image_url TEXT,
                is_primary BOOLEAN DEFAULT false,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
            `
        });
        
        if (facesError) {
            console.log('⚠️  Faces table may already exist');
        } else {
            console.log('✅ Faces table created');
        }
        
        // Create attendance table
        const { error: attendanceError } = await supabase.rpc('sql', {
            query: `
            CREATE TABLE IF NOT EXISTS attendance (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
            `
        });
        
        if (attendanceError) {
            console.log('⚠️  Attendance table may already exist');
        } else {
            console.log('✅ Attendance table created');
        }
        
        return true;
    } catch (error) {
        console.log('⚠️  Using direct insert method instead of RPC');
        return true; // Continue anyway
    }
}

async function insertUsers() {
    console.log('👥 Inserting users directly...');
    
    try {
        // Insert admin user
        const { error: adminError } = await supabase
            .from('users')
            .upsert({
                role: 'admin',
                nama: 'Administrator',
                nisn: 'ADMIN001',
                identitas: 'admin@sisfotjkt2.com',
                external_auth_id: 'admin-default',
                is_active: true
            }, { onConflict: 'nisn' });
        
        if (!adminError) {
            console.log('✅ Admin user created');
        }
        
        // Insert teachers
        for (const guru of dataGuru) {
            const { error } = await supabase
                .from('users')
                .upsert({
                    role: 'guru',
                    nama: guru.nama,
                    nisn: guru.nip,
                    identitas: `${guru.nama.toLowerCase()
                        .replace(/[^a-z\s]/g, '')
                        .replace(/\s+/g, '.')
                        .replace(/\.+/g, '.')
                        .replace(/^\.+|\.+$/g, '')
                    }@sisfotjkt2.com`,
                    external_auth_id: `teacher-${guru.nip}`,
                    is_active: true
                }, { onConflict: 'nisn' });
            
            if (!error) {
                console.log(`✅ Teacher: ${guru.nama}`);
            } else {
                console.log(`⚠️  Teacher ${guru.nama}: ${error.message}`);
            }
        }
        
        // Insert students
        for (const siswa of dataSiswa) {
            const nisn = siswa.nisn || siswa.id;
            const { error } = await supabase
                .from('users')
                .upsert({
                    role: 'siswa',
                    nama: siswa.nama,
                    nisn: nisn,
                    identitas: `${siswa.nama.toLowerCase()
                        .replace(/\s+/g, '.')
                    }@sisfotjkt2.com`,
                    external_auth_id: `student-${nisn}`,
                    class_name: 'X IPA 1',
                    is_active: true
                }, { onConflict: 'nisn' });
            
            if (!error) {
                console.log(`✅ Student: ${siswa.nama} (NISN: ${nisn})`);
            } else {
                console.log(`⚠️  Student ${siswa.nama}: ${error.message}`);
            }
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error inserting users:', error.message);
        return false;
    }
}

async function verifyData() {
    console.log('🔍 Verifying imported data...');
    
    try {
        // Count users by role
        const { data: adminCount } = await supabase
            .from('users')
            .select('*', { count: 'exact' })
            .eq('role', 'admin');
        
        const { data: teacherCount } = await supabase
            .from('users')
            .select('*', { count: 'exact' })
            .eq('role', 'guru');
        
        const { data: studentCount } = await supabase
            .from('users')
            .select('*', { count: 'exact' })
            .eq('role', 'siswa');
        
        console.log('📊 Data Summary:');
        console.log(`👑 Admins: ${adminCount?.length || 0}`);
        console.log(`👨‍🏫 Teachers: ${teacherCount?.length || 0}`);
        console.log(`👥 Students: ${studentCount?.length || 0}`);
        
        // Show some sample data
        const { data: sampleUsers } = await supabase
            .from('users')
            .select('nama, role, nisn, identitas')
            .limit(5);
        
        if (sampleUsers && sampleUsers.length > 0) {
            console.log('');
            console.log('📋 Sample Users:');
            sampleUsers.forEach(user => {
                console.log(`- ${user.nama} (${user.role}) - ${user.identitas}`);
            });
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error verifying data:', error.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Direct Supabase Import Started');
    console.log('=================================');
    console.log('');
    
    console.log('🔗 Connecting to Supabase...');
    console.log(`📍 URL: ${supabaseUrl}`);
    console.log('');
    
    // Step 1: Create tables (if needed)
    await createBasicTables();
    console.log('');
    
    // Step 2: Insert all users
    const insertSuccess = await insertUsers();
    if (!insertSuccess) {
        console.error('❌ Insert failed');
        process.exit(1);
    }
    console.log('');
    
    // Step 3: Verify data
    await verifyData();
    console.log('');
    
    console.log('🎉 Import completed successfully!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('👑 Admin: admin@sisfotjkt2.com (NISN: ADMIN001)');
    console.log('👨‍🏫 Teachers:');
    console.log('   - didik.kurniawan.s.kom.m.ti@sisfotjkt2.com (NIP: 198103102010011012)');
    console.log('   - ade.firmansyah.s.kom@sisfotjkt2.com (NIP: 3855773674130022)');
    console.log('👥 Students: Check the generated emails above');
    console.log('');
    console.log('🔗 Access your system at: http://localhost:3000');
}

if (require.main === module) {
    main();
}

module.exports = { main };
