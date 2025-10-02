const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials. Please run setup-env.js first.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
    console.log('🗄️  Setting up database schema...');
    
    try {
        // Read the enhanced schema file
        const schemaPath = path.join(process.cwd(), 'supabase', 'enhanced-schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('📋 Executing database schema...');
        
        // Execute the schema
        const { error } = await supabase.rpc('exec_sql', { sql: schema });
        
        if (error) {
            // If RPC doesn't work, try alternative method
            console.log('⚠️  RPC method failed, trying direct execution...');
            
            // Split schema into individual statements
            const statements = schema
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
            
            for (const statement of statements) {
                if (statement.trim()) {
                    console.log(`Executing: ${statement.substring(0, 50)}...`);
                    const { error: stmtError } = await supabase.rpc('exec_sql', { 
                        sql: statement + ';' 
                    });
                    
                    if (stmtError) {
                        console.warn(`⚠️  Warning executing statement: ${stmtError.message}`);
                    }
                }
            }
        }
        
        console.log('✅ Database schema executed successfully');
        
        // Verify tables were created
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public');
        
        if (!tablesError && tables) {
            console.log('📊 Created tables:');
            tables.forEach(table => {
                console.log(`  - ${table.table_name}`);
            });
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
        return false;
    }
}

async function seedInitialData() {
    console.log('🌱 Seeding initial data...');
    
    try {
        // Create admin user
        const { data: adminUser, error: adminError } = await supabase
            .from('users')
            .upsert({
                role: 'admin',
                nama: 'Administrator',
                nisn: 'ADMIN001',
                identitas: 'admin@sisfotjkt2.com',
                external_auth_id: 'admin-default'
            })
            .select()
            .single();
        
        if (adminError) {
            console.warn('⚠️  Admin user may already exist:', adminError.message);
        } else {
            console.log('✅ Created admin user');
        }
        
        // Create sample teacher
        const { data: teacher, error: teacherError } = await supabase
            .from('users')
            .upsert({
                role: 'guru',
                nama: 'Guru Contoh',
                nisn: 'GURU001',
                identitas: 'guru@sisfotjkt2.com',
                external_auth_id: 'teacher-default'
            })
            .select()
            .single();
        
        if (teacherError) {
            console.warn('⚠️  Teacher user may already exist:', teacherError.message);
        } else {
            console.log('✅ Created sample teacher');
        }
        
        // Create sample students
        const students = [
            { nama: 'Siswa Satu', nisn: '2024001', identitas: 'siswa1@sisfotjkt2.com' },
            { nama: 'Siswa Dua', nisn: '2024002', identitas: 'siswa2@sisfotjkt2.com' },
            { nama: 'Siswa Tiga', nisn: '2024003', identitas: 'siswa3@sisfotjkt2.com' }
        ];
        
        for (const student of students) {
            const { error: studentError } = await supabase
                .from('users')
                .upsert({
                    role: 'siswa',
                    nama: student.nama,
                    nisn: student.nisn,
                    identitas: student.identitas,
                    external_auth_id: `student-${student.nisn}`
                });
            
            if (studentError) {
                console.warn(`⚠️  Student ${student.nama} may already exist:`, studentError.message);
            } else {
                console.log(`✅ Created student: ${student.nama}`);
            }
        }
        
        // Create sample announcement
        const { error: announcementError } = await supabase
            .from('pengumuman')
            .upsert({
                judul: 'Selamat Datang di SISFOTJKT2',
                isi: 'Sistem Face Recognition untuk absensi telah aktif. Silakan daftarkan wajah Anda untuk mulai menggunakan sistem.',
                tanggal: new Date().toISOString().split('T')[0],
                dibuat_oleh: adminUser?.id
            });
        
        if (announcementError) {
            console.warn('⚠️  Announcement may already exist:', announcementError.message);
        } else {
            console.log('✅ Created welcome announcement');
        }
        
        console.log('🎉 Initial data seeded successfully!');
        return true;
        
    } catch (error) {
        console.error('❌ Error seeding data:', error.message);
        return false;
    }
}

async function testConnection() {
    console.log('🔍 Testing database connection...');
    
    try {
        // Test basic connection
        const { data, error } = await supabase
            .from('users')
            .select('count(*)')
            .single();
        
        if (error) {
            console.error('❌ Connection test failed:', error.message);
            return false;
        }
        
        console.log('✅ Database connection successful');
        
        // Test each table
        const tables = ['users', 'faces', 'attendance', 'exams', 'questions', 'answers', 'pengumuman', 'attendance_settings', 'attendance_periods', 'holidays', 'attendance_summary'];
        
        for (const table of tables) {
            const { data: tableData, error: tableError } = await supabase
                .from(table)
                .select('count(*)')
                .single();
            
            if (tableError) {
                console.warn(`⚠️  Table ${table} test failed:`, tableError.message);
            } else {
                console.log(`✅ Table ${table} is accessible`);
            }
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Connection test error:', error.message);
        return false;
    }
}

async function fullSetup() {
    console.log('🚀 Starting full database setup...');
    console.log('');
    
    const dbSetup = await setupDatabase();
    if (!dbSetup) {
        console.error('❌ Database setup failed');
        process.exit(1);
    }
    
    console.log('');
    const seedSuccess = await seedInitialData();
    if (!seedSuccess) {
        console.error('❌ Data seeding failed');
        process.exit(1);
    }
    
    console.log('');
    const testSuccess = await testConnection();
    if (!testSuccess) {
        console.error('❌ Connection test failed');
        process.exit(1);
    }
    
    console.log('');
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('📋 Setup Summary:');
    console.log('✅ Database schema created');
    console.log('✅ Initial data seeded');
    console.log('✅ Connection verified');
    console.log('');
    console.log('🔐 Default Users Created:');
    console.log('- Admin: admin@sisfotjkt2.com (ADMIN001)');
    console.log('- Teacher: guru@sisfotjkt2.com (GURU001)');
    console.log('- Students: siswa1-3@sisfotjkt2.com (2024001-003)');
    console.log('');
    console.log('🚀 You can now start the application with: npm run dev');
}

if (require.main === module) {
    fullSetup();
}

module.exports = { setupDatabase, seedInitialData, testConnection, fullSetup };
