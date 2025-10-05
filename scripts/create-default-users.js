const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Default users data
const defaultUsers = [
    // Admin Users
    {
        role: 'admin',
        nama: 'Administrator System',
        nisn: 'ADMIN001',
        identitas: 'admin@sisfotjkt2.com',
        external_auth_id: 'admin-001',
        email: 'admin@sisfotjkt2.com',
        phone: '081234567890',
        address: 'Jakarta Timur',
        birth_date: '1985-01-01',
        gender: 'L',
        class_name: null,
        student_id: null,
        employee_id: 'EMP001',
        is_active: true,
        is_verified: true
    },
    {
        role: 'admin',
        nama: 'Super Administrator',
        nisn: 'ADMIN002',
        identitas: 'superadmin@sisfotjkt2.com',
        external_auth_id: 'admin-002',
        email: 'superadmin@sisfotjkt2.com',
        phone: '081234567891',
        address: 'Jakarta Timur',
        birth_date: '1980-05-15',
        gender: 'P',
        class_name: null,
        student_id: null,
        employee_id: 'EMP002',
        is_active: true,
        is_verified: true
    },

    // Teacher Users (Enhanced from existing)
    {
        role: 'guru',
        nama: 'DIDIK KURNIAWAN, S.Kom, M.TI',
        nisn: '198103102010011012',
        identitas: 'didik.kurniawan@sisfotjkt2.com',
        external_auth_id: 'teacher-198103102010011012',
        email: 'didik.kurniawan@sisfotjkt2.com',
        phone: '081234567892',
        address: 'Jakarta Timur',
        birth_date: '1981-03-10',
        gender: 'L',
        class_name: null,
        student_id: null,
        employee_id: '198103102010011012',
        is_active: true,
        is_verified: true
    },
    {
        role: 'guru',
        nama: 'ADE FIRMANSYAH, S.Kom',
        nisn: '3855773674130022',
        identitas: 'ade.firmansyah@sisfotjkt2.com',
        external_auth_id: 'teacher-3855773674130022',
        email: 'ade.firmansyah@sisfotjkt2.com',
        phone: '081234567893',
        address: 'Jakarta Timur',
        birth_date: '1985-07-20',
        gender: 'L',
        class_name: null,
        student_id: null,
        employee_id: '3855773674130022',
        is_active: true,
        is_verified: true
    },

    // Sample Student Users
    {
        role: 'siswa',
        nama: 'STUDENT DEMO 1',
        nisn: 'DEMO001',
        identitas: 'student1@sisfotjkt2.com',
        external_auth_id: 'student-demo001',
        email: 'student1@sisfotjkt2.com',
        phone: '081234567894',
        address: 'Jakarta Timur',
        birth_date: '2007-01-15',
        gender: 'L',
        class_name: 'XII TJKT 2' // TJKT 2 School - All students in XII TJKT 2,
        student_id: 'STD001',
        employee_id: null,
        is_active: true,
        is_verified: true
    },
    {
        role: 'siswa',
        nama: 'STUDENT DEMO 2',
        nisn: 'DEMO002',
        identitas: 'student2@sisfotjkt2.com',
        external_auth_id: 'student-demo002',
        email: 'student2@sisfotjkt2.com',
        phone: '081234567895',
        address: 'Jakarta Timur',
        birth_date: '2007-03-20',
        gender: 'P',
        class_name: 'XII TJKT 2' // TJKT 2 School - All students in XII TJKT 2,
        student_id: 'STD002',
        employee_id: null,
        is_active: true,
        is_verified: true
    }
];

async function createDefaultUsers() {
    console.log('👥 Creating Default Users (Admin, Guru, Siswa)');
    console.log('===============================================');
    console.log('');

    try {
        // Check if users already exist
        const { data: existingUsers, error: checkError } = await supabase
            .from('users')
            .select('nisn, nama, role')
            .in('nisn', defaultUsers.map(u => u.nisn));

        if (checkError) {
            console.error('❌ Error checking existing users:', checkError.message);
            return false;
        }

        const existingNisns = new Set(existingUsers?.map(u => u.nisn) || []);
        const newUsers = defaultUsers.filter(u => !existingNisns.has(u.nisn));

        if (newUsers.length === 0) {
            console.log('ℹ️  All default users already exist');
            await showExistingUsers();
            return true;
        }

        console.log(`📋 Creating ${newUsers.length} new default users...`);
        console.log('');

        // Insert new users
        const { data: insertedUsers, error: insertError } = await supabase
            .from('users')
            .insert(newUsers)
            .select();

        if (insertError) {
            console.error('❌ Error creating users:', insertError.message);
            return false;
        }

        console.log(`✅ Successfully created ${insertedUsers.length} users`);
        console.log('');

        // Show created users by role
        const usersByRole = {
            admin: insertedUsers.filter(u => u.role === 'admin'),
            guru: insertedUsers.filter(u => u.role === 'guru'),
            siswa: insertedUsers.filter(u => u.role === 'siswa')
        };

        console.log('👨‍💼 ADMIN USERS CREATED:');
        console.log('========================');
        usersByRole.admin.forEach(user => {
            console.log(`  👤 ${user.nama}`);
            console.log(`     ID: ${user.nisn}`);
            console.log(`     Email: ${user.email}`);
            console.log(`     Login: ${user.identitas}`);
            console.log('');
        });

        console.log('👨‍🏫 TEACHER USERS CREATED:');
        console.log('===========================');
        usersByRole.guru.forEach(user => {
            console.log(`  👤 ${user.nama}`);
            console.log(`     NIP: ${user.nisn}`);
            console.log(`     Email: ${user.email}`);
            console.log(`     Login: ${user.identitas}`);
            console.log('');
        });

        console.log('👨‍🎓 STUDENT USERS CREATED:');
        console.log('===========================');
        usersByRole.siswa.forEach(user => {
            console.log(`  👤 ${user.nama}`);
            console.log(`     NISN: ${user.nisn}`);
            console.log(`     Class: ${user.class_name}`);
            console.log(`     Email: ${user.email}`);
            console.log(`     Login: ${user.identitas}`);
            console.log('');
        });

        console.log('🔑 LOGIN CREDENTIALS SUMMARY:');
        console.log('=============================');
        console.log('');
        console.log('🔐 ADMIN ACCESS:');
        console.log('  • admin@sisfotjkt2.com (Administrator System)');
        console.log('  • superadmin@sisfotjkt2.com (Super Administrator)');
        console.log('  • ADMIN001 or ADMIN002 (using NISN)');
        console.log('');
        console.log('👨‍🏫 TEACHER ACCESS:');
        console.log('  • didik.kurniawan@sisfotjkt2.com');
        console.log('  • ade.firmansyah@sisfotjkt2.com');
        console.log('  • 198103102010011012 (NIP)');
        console.log('  • 3855773674130022 (NIP)');
        console.log('');
        console.log('👨‍🎓 STUDENT ACCESS:');
        console.log('  • student1@sisfotjkt2.com');
        console.log('  • student2@sisfotjkt2.com');
        console.log('  • DEMO001 or DEMO002 (NISN)');
        console.log('');

        return true;

    } catch (error) {
        console.error('❌ Failed to create default users:', error.message);
        return false;
    }
}

async function showExistingUsers() {
    console.log('👥 EXISTING DEFAULT USERS:');
    console.log('==========================');
    
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('nama, nisn, identitas, role, email, is_active')
            .in('role', ['admin', 'guru', 'siswa'])
            .order('role')
            .order('nama');

        if (error) {
            console.error('Error fetching users:', error.message);
            return;
        }

        const usersByRole = {
            admin: users.filter(u => u.role === 'admin'),
            guru: users.filter(u => u.role === 'guru'),
            siswa: users.filter(u => u.role === 'siswa')
        };

        if (usersByRole.admin.length > 0) {
            console.log('');
            console.log('👨‍💼 ADMIN USERS:');
            usersByRole.admin.forEach(user => {
                console.log(`  ✅ ${user.nama} (${user.identitas}) - ${user.is_active ? 'Active' : 'Inactive'}`);
            });
        }

        if (usersByRole.guru.length > 0) {
            console.log('');
            console.log('👨‍🏫 TEACHER USERS:');
            usersByRole.guru.forEach(user => {
                console.log(`  ✅ ${user.nama} (${user.identitas}) - ${user.is_active ? 'Active' : 'Inactive'}`);
            });
        }

        if (usersByRole.siswa.length > 0) {
            console.log('');
            console.log('👨‍🎓 STUDENT USERS:');
            usersByRole.siswa.forEach(user => {
                console.log(`  ✅ ${user.nama} (${user.identitas}) - ${user.is_active ? 'Active' : 'Inactive'}`);
            });
        }

        console.log('');

    } catch (error) {
        console.error('Error showing existing users:', error.message);
    }
}

// Run if called directly
if (require.main === module) {
    createDefaultUsers()
        .then(success => {
            if (success) {
                console.log('🎉 Default users setup completed successfully!');
                console.log('');
                console.log('🚀 Next Steps:');
                console.log('  1. Test admin login: admin@sisfotjkt2.com');
                console.log('  2. Test teacher login: didik.kurniawan@sisfotjkt2.com');
                console.log('  3. Test student login: student1@sisfotjkt2.com');
                console.log('  4. Check auto-redirect functionality');
            }
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Setup failed:', error);
            process.exit(1);
        });
}

module.exports = { createDefaultUsers, showExistingUsers };
