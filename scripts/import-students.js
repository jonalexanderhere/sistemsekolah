const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials. Please run setup-env.js first.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Available class options for all grade levels
const availableClasses = [
    // Grade X (10th)
    'X IPA 1', 'X IPA 2', 'X IPS 1', 'X IPS 2', 'X TJKT 1', 'X TJKT 2', 'X TJKT 3',
    // Grade XI (11th)  
    'XI IPA 1', 'XI IPA 2', 'XI IPS 1', 'XI IPS 2', 'XI TJKT 1', 'XI TJKT 2', 'XI TJKT 3',
    // Grade XII (12th)
    'XII IPA 1', 'XII IPA 2', 'XII IPS 1', 'XII IPS 2', 'XII TJKT 1', 'XII TJKT 2', 'XII TJKT 3'
];

// Function to get random class assignment
function getRandomClass() {
    return availableClasses[Math.floor(Math.random() * availableClasses.length)];
}

// Teacher data from previous system
const dataGuru = [
    { 
        nama: "DIDIK KURNIAWAN, S.Kom, M.TI", 
        nip: "198103102010011012", 
        id: "guru1",
        mata_pelajaran: "Teknologi Informasi",
        jabatan: "Guru"
    },
    { 
        nama: "ADE FIRMANSYAH, S.Kom", 
        nip: "3855773674130022", 
        id: "guru2",
        mata_pelajaran: "Komputer",
        jabatan: "Guru"
    }
];

// Original student data from previous system
const dataSiswa = [
    { nisn: "0089990908", id: "6643", nama: "ALLDOO SAPUTRA", hadir: false },
    { nisn: "0071887022", id: "6644", nama: "ALYA ANGGITA MAHERA", hadir: false },
    { nisn: "0071317242", id: "6645", nama: "AMELIA", hadir: false },
    { nisn: "0083627332", id: "6646", nama: "AMELIA SEPTIA SARI", hadir: false },
    { nisn: "0081278251", id: "6647", nama: "AULIA KENANGA SAFITRI", hadir: false },
    { nisn: "3102623580", id: "6648", nama: "AYUNDA NAFISHA", hadir: false },
    { nisn: "0088754753", id: "6649", nama: "BERLIAN ANUGRAH PRATAMA", hadir: false },
    { nisn: "0076775460", id: "6650", nama: "DESTI RAHAYU", hadir: false },
    { nisn: "0077986875", id: "6651", nama: "DESTIA", hadir: false },
    { nisn: "0069944236", id: "6652", nama: "ERIC ERIANTO", hadir: false },
    { nisn: "0084352502", id: "6653", nama: "FAIZAH AZ ZAHRA", hadir: false },
    { nisn: "0082539133", id: "6654", nama: "FITRI ULANDARI", hadir: false },
    { nisn: "0074043979", id: "6655", nama: "GHEA LITA ANASTASYA", hadir: false },
    { nisn: "0081353027", id: "6656", nama: "JHOVANI WIJAYA", hadir: false },
    { nisn: "0082019386", id: "6657", nama: "KEISYA AGUSTIN RASFA AULIA", hadir: false },
    { nisn: "0074731920", id: "6659", nama: "MAHARANI", hadir: false },
    { nisn: "0076724319", id: "6660", nama: "NAURA GHIFARI AZHAR", hadir: false },
    { nisn: "0083063479", id: "6662", nama: "PATRA ADITTIA", hadir: false },
    { nisn: "0085480329", id: "6663", nama: "PUTRI SAPARA", hadir: false },
    { nisn: "0079319957", id: "6664", nama: "RAFI SEPTA WIRA TAMA", hadir: false },
    { nisn: "0082901449", id: "6665", nama: "RAKA RAMADHANI PRATAMA", hadir: false },
    { nisn: "0081628824", id: "6666", nama: "REGITA MAHARANI", hadir: false },
    { nisn: "0081133109", id: "6667", nama: "REGITHA ANINDYA AZZAHRA", hadir: false },
    { nisn: "0076040547", id: "6668", nama: "RENDI ARISNANDO", hadir: false },
    { nisn: "0078327818", id: "6669", nama: "RIDHO ZAENAL MUSTAQIM", hadir: false },
    { nisn: "0076113354", id: "6670", nama: "RISTY WIDIASIH", hadir: false },
    { nisn: "0084399894", id: "6671", nama: "SIFA RISTIANA", hadir: false },
    { nisn: "", id: "6672", nama: "AMELIA DIANA", hadir: false },
    { nisn: "", id: "6673", nama: "DESTA AMELIA", hadir: false }
];

async function importTeachers() {
    console.log('👨‍🏫 Importing Teacher Data from Previous System');
    console.log('==============================================');
    console.log('');
    
    try {
        // Process teacher data
        const processedTeachers = dataGuru.map(teacher => {
            return {
                role: 'guru',
                nama: teacher.nama,
                nisn: teacher.nip, // Use NIP as NISN for teachers
                identitas: `${teacher.nama.toLowerCase()
                    .replace(/[^a-z\s]/g, '') // Remove special characters
                    .replace(/\s+/g, '.')     // Replace spaces with dots
                    .replace(/\.+/g, '.')     // Replace multiple dots with single dot
                    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
                }@sisfotjkt2.com`,
                external_auth_id: `teacher-${teacher.nip}`,
                email: `${teacher.nama.toLowerCase()
                    .replace(/[^a-z\s]/g, '')
                    .replace(/\s+/g, '.')
                    .replace(/\.+/g, '.')
                    .replace(/^\.+|\.+$/g, '')
                }@sisfotjkt2.com`,
                phone: null,
                address: null,
                is_active: true
            };
        });
        
        console.log(`📋 Processing ${processedTeachers.length} teachers...`);
        console.log('');
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const teacher of processedTeachers) {
            try {
                const { data, error } = await supabase
                    .from('users')
                    .upsert(teacher, { 
                        onConflict: 'nisn',
                        ignoreDuplicates: false 
                    })
                    .select()
                    .single();
                
                if (error) {
                    console.warn(`⚠️  Warning for ${teacher.nama} (NIP: ${teacher.nisn}):`, error.message);
                    errorCount++;
                } else {
                    console.log(`✅ ${teacher.nama} (NIP: ${teacher.nisn})`);
                    successCount++;
                }
            } catch (err) {
                console.error(`❌ Error importing ${teacher.nama}:`, err.message);
                errorCount++;
            }
        }
        
        console.log('');
        console.log('📊 Teacher Import Summary:');
        console.log(`✅ Successfully imported: ${successCount} teachers`);
        console.log(`⚠️  Warnings/Errors: ${errorCount} teachers`);
        console.log('');
        
        // Show imported teachers
        console.log('👨‍🏫 Imported Teachers:');
        dataGuru.forEach((teacher, index) => {
            console.log(`${index + 1}. ${teacher.nama}`);
            console.log(`   NIP: ${teacher.nip}`);
            console.log(`   Mata Pelajaran: ${teacher.mata_pelajaran}`);
            console.log(`   Email: ${processedTeachers[index].identitas}`);
            console.log('');
        });
        
        return true;
        
    } catch (error) {
        console.error('❌ Teacher import failed:', error.message);
        return false;
    }
}

async function importStudents() {
    console.log('📚 Importing Student Data from Previous System');
    console.log('==============================================');
    console.log('');
    
    try {
        // Process student data
        const processedStudents = dataSiswa.map(student => {
            // Use NISN if available, otherwise use ID as NIS (Nomor Induk Siswa)
            const studentNumber = student.nisn && student.nisn.trim() !== '' ? student.nisn : student.id;
            const numberType = student.nisn && student.nisn.trim() !== '' ? 'NISN' : 'NIS';
            
            // Generate clean email from name
            const emailName = student.nama.toLowerCase()
                .replace(/[^a-z\s]/g, '')
                .replace(/\s+/g, '.')
                .replace(/\.+/g, '.')
                .replace(/^\.+|\.+$/g, '');
            
            console.log(`📝 Processing: ${student.nama} - ${numberType}: ${studentNumber}`);
            
            return {
                role: 'siswa',
                nama: student.nama,
                nisn: studentNumber, // Store in nisn field regardless of type
                identitas: `${emailName}@sisfotjkt2.com`,
                external_auth_id: `student-${studentNumber}`,
                email: `${emailName}@sisfotjkt2.com`,
                phone: null,
                address: null,
                birth_date: null,
                gender: null,
                class_name: getRandomClass(),
                student_id: studentNumber,
                employee_id: null,
                is_active: true,
                is_verified: true
            };
        });
        
        console.log(`📋 Processing ${processedStudents.length} students...`);
        console.log('');
        
        // Import students in batches
        const batchSize = 10;
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < processedStudents.length; i += batchSize) {
            const batch = processedStudents.slice(i, i + batchSize);
            
            console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(processedStudents.length / batchSize)}...`);
            
            for (const student of batch) {
                try {
                    const { data, error } = await supabase
                        .from('users')
                        .upsert(student, { 
                            onConflict: 'nisn',
                            ignoreDuplicates: false 
                        })
                        .select()
                        .single();
                    
                    if (error) {
                        console.warn(`⚠️  Warning for ${student.nama} (${student.nisn}):`, error.message);
                        errorCount++;
                    } else {
                        console.log(`✅ ${student.nama} (NISN: ${student.nisn})`);
                        successCount++;
                    }
                } catch (err) {
                    console.error(`❌ Error importing ${student.nama}:`, err.message);
                    errorCount++;
                }
            }
            
            // Small delay between batches
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('');
        console.log('📊 Import Summary:');
        console.log(`✅ Successfully imported: ${successCount} students`);
        console.log(`⚠️  Warnings/Errors: ${errorCount} students`);
        console.log('');
        
        // Verify import
        const { data: totalStudents, error: countError } = await supabase
            .from('users')
            .select('count(*)')
            .eq('role', 'siswa')
            .single();
        
        if (!countError) {
            console.log(`📈 Total students in database: ${totalStudents.count}`);
        }
        
        // Show students without NISN that used ID
        const studentsWithoutNISN = dataSiswa.filter(s => !s.nisn);
        if (studentsWithoutNISN.length > 0) {
            console.log('');
            console.log('🔄 Students without NISN (using ID as NISN):');
            studentsWithoutNISN.forEach(student => {
                console.log(`- ${student.nama}: ID ${student.id} → NISN ${student.id}`);
            });
        }
        
        console.log('');
        console.log('🎉 Student import completed successfully!');
        console.log('');
        console.log('📋 Next Steps:');
        console.log('1. Assign students to appropriate classes');
        console.log('2. Have students register their faces');
        console.log('3. Configure attendance settings if needed');
        console.log('4. Start using the face recognition system');
        
        return true;
        
    } catch (error) {
        console.error('❌ Import failed:', error.message);
        return false;
    }
}

async function assignStudentsToClass() {
    console.log('');
    console.log('🏫 Assigning Students to Multiple Classes...');
    
    try {
        // Get or create default class
        const { data: defaultClass, error: classError } = await supabase
            .from('classes')
            .select('id')
            .eq('name', 'X IPA 1')
            .single();
        
        if (classError) {
            console.warn('⚠️  Default class not found, students assigned to class name only');
            return;
        }
        
        // Get all imported students
        const { data: students, error: studentsError } = await supabase
            .from('users')
            .select('id, nama, nisn, class_name')
            .eq('role', 'siswa');
        
        if (studentsError || !students) {
            console.warn('⚠️  Could not retrieve students for class assignment');
            return;
        }
        
        // Assign students to class
        const classAssignments = students.map(student => ({
            class_id: defaultClass.id,
            student_id: student.id,
            enrollment_date: new Date().toISOString().split('T')[0],
            is_active: true
        }));
        
        const { error: assignError } = await supabase
            .from('class_students')
            .upsert(classAssignments, { 
                onConflict: 'class_id,student_id',
                ignoreDuplicates: true 
            });
        
        if (assignError) {
            console.warn('⚠️  Some class assignments may have failed:', assignError.message);
        } else {
            console.log(`✅ Assigned ${students.length} students to class "X IPA 1"`);
        }
        
    } catch (error) {
        console.warn('⚠️  Class assignment error:', error.message);
    }
}

async function showImportedUsers() {
    console.log('');
    console.log('👥 All Imported Users:');
    console.log('====================');
    
    try {
        // Show teachers
        const { data: teachers, error: teacherError } = await supabase
            .from('users')
            .select('nama, nisn, identitas, role, created_at')
            .eq('role', 'guru')
            .order('nama');
        
        if (!teacherError && teachers && teachers.length > 0) {
            console.log('👨‍🏫 Teachers:');
            console.log('----------');
            teachers.forEach((teacher, index) => {
                console.log(`${(index + 1).toString().padStart(2, '0')}. ${teacher.nama}`);
                console.log(`    NIP: ${teacher.nisn}`);
                console.log(`    Email: ${teacher.identitas}`);
                console.log(`    Role: ${teacher.role}`);
                console.log('');
            });
        }
        
        // Show students
        const { data: students, error: studentError } = await supabase
            .from('users')
            .select('nama, nisn, identitas, class_name, role, created_at')
            .eq('role', 'siswa')
            .order('nama');
        
        if (!studentError && students && students.length > 0) {
            console.log('👥 Students:');
            console.log('----------');
            students.forEach((student, index) => {
                console.log(`${(index + 1).toString().padStart(2, '0')}. ${student.nama}`);
                console.log(`    NISN: ${student.nisn}`);
                console.log(`    Email: ${student.identitas}`);
                console.log(`    Class: ${student.class_name || 'Not assigned'}`);
                console.log('');
            });
        }
        
        // Show summary
        const teacherCount = teachers ? teachers.length : 0;
        const studentCount = students ? students.length : 0;
        
        console.log('📊 Import Summary:');
        console.log(`👨‍🏫 Teachers: ${teacherCount}`);
        console.log(`👥 Students: ${studentCount}`);
        console.log(`📋 Total Users: ${teacherCount + studentCount}`);
        
    } catch (error) {
        console.error('❌ Error showing users:', error.message);
    }
}

async function showImportedStudents() {
    console.log('');
    console.log('👥 Imported Students List:');
    console.log('========================');
    
    try {
        const { data: students, error } = await supabase
            .from('users')
            .select('nama, nisn, identitas, class_name, created_at')
            .eq('role', 'siswa')
            .order('nama');
        
        if (error) {
            console.error('❌ Could not retrieve students:', error.message);
            return;
        }
        
        students.forEach((student, index) => {
            console.log(`${(index + 1).toString().padStart(2, '0')}. ${student.nama}`);
            console.log(`    NISN: ${student.nisn}`);
            console.log(`    Email: ${student.identitas}`);
            console.log(`    Class: ${student.class_name || 'Not assigned'}`);
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ Error showing students:', error.message);
    }
}

async function fullImport() {
    console.log('🚀 Starting Full Data Import Process...');
    console.log('');
    
    // Import teachers first
    const teacherImportSuccess = await importTeachers();
    if (!teacherImportSuccess) {
        console.error('❌ Teacher import failed');
        process.exit(1);
    }
    
    // Then import students
    const studentImportSuccess = await importStudents();
    if (!studentImportSuccess) {
        console.error('❌ Student import failed');
        process.exit(1);
    }
    
    await assignStudentsToClass();
    await showImportedUsers();
    
    console.log('🎉 Full import process completed!');
    console.log('');
    console.log('🔗 Access your system at: http://localhost:3000');
    console.log('📚 Login credentials:');
    console.log('   Admin: admin@sisfotjkt2.com');
    console.log('   Teachers: didik.kurniawan.s.kom.m.ti@sisfotjkt2.com, ade.firmansyah.s.kom@sisfotjkt2.com');
    console.log('   Students: Use generated emails from import list');
}

if (require.main === module) {
    fullImport();
}

module.exports = { importTeachers, importStudents, assignStudentsToClass, showImportedStudents, showImportedUsers, fullImport };
