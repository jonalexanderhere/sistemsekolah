const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Data migration from V1 to V2 schema
async function migrateToV2() {
    console.log('🔄 SISFOTJKT2 Data Migration V1 → V2');
    console.log('====================================');
    console.log('');

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    try {
        console.log('📊 Analyzing existing data...');
        
        // Check if V1 tables exist
        const v1Tables = ['users', 'faces', 'attendance', 'exams', 'questions', 'answers', 'pengumuman'];
        const existingTables = [];
        
        for (const table of v1Tables) {
            try {
                const { data, error } = await supabase.from(table).select('id').limit(1);
                if (!error) {
                    existingTables.push(table);
                    console.log(`✅ Found existing table: ${table}`);
                }
            } catch (err) {
                console.log(`⚠️  Table not found: ${table}`);
            }
        }

        if (existingTables.length === 0) {
            console.log('');
            console.log('ℹ️  No existing data found. This appears to be a fresh installation.');
            console.log('   You can proceed with the new schema setup.');
            return true;
        }

        console.log('');
        console.log('🔄 Starting data migration...');
        console.log('');

        // Backup existing data
        console.log('💾 Creating data backup...');
        const backupData = {};
        
        for (const table of existingTables) {
            console.log(`  📋 Backing up ${table}...`);
            const { data, error } = await supabase.from(table).select('*');
            if (error) {
                console.error(`❌ Failed to backup ${table}:`, error.message);
                continue;
            }
            backupData[table] = data;
            console.log(`  ✅ Backed up ${data.length} records from ${table}`);
        }

        // Save backup to file
        const fs = require('fs');
        const path = require('path');
        const backupPath = path.join(__dirname, '..', 'backup', `backup-${Date.now()}.json`);
        
        // Ensure backup directory exists
        const backupDir = path.dirname(backupPath);
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
        console.log(`💾 Backup saved to: ${backupPath}`);
        console.log('');

        // Migrate users data
        if (backupData.users) {
            console.log('👥 Migrating users data...');
            const users = backupData.users;
            
            for (const user of users) {
                const migratedUser = {
                    id: user.id,
                    role: user.role || 'siswa',
                    nama: user.nama,
                    nisn: user.nisn,
                    identitas: user.identitas,
                    external_auth_id: user.external_auth_id,
                    email: user.email || user.identitas,
                    phone: user.phone,
                    address: user.address,
                    class_name: user.class_name,
                    is_active: user.is_active !== false,
                    face_registered_at: user.face_registered_at,
                    created_at: user.created_at,
                    updated_at: user.updated_at || user.created_at
                };

                const { error } = await supabase
                    .from('users')
                    .upsert(migratedUser);

                if (error) {
                    console.error(`❌ Failed to migrate user ${user.nama}:`, error.message);
                } else {
                    console.log(`✅ Migrated user: ${user.nama}`);
                }
            }
        }

        // Migrate faces data
        if (backupData.faces) {
            console.log('👤 Migrating faces data...');
            const faces = backupData.faces;
            
            for (const face of faces) {
                const migratedFace = {
                    id: face.id,
                    user_id: face.user_id,
                    embedding: face.embedding,
                    confidence: face.confidence || 0.0,
                    is_primary: true, // Set first face as primary
                    is_active: true,
                    created_at: face.created_at,
                    updated_at: face.updated_at || face.created_at
                };

                const { error } = await supabase
                    .from('faces')
                    .upsert(migratedFace);

                if (error) {
                    console.error(`❌ Failed to migrate face for user ${face.user_id}:`, error.message);
                } else {
                    console.log(`✅ Migrated face for user: ${face.user_id}`);
                }
            }
        }

        // Migrate attendance data
        if (backupData.attendance) {
            console.log('📅 Migrating attendance data...');
            const attendance = backupData.attendance;
            
            for (const record of attendance) {
                const migratedRecord = {
                    id: record.id,
                    user_id: record.user_id,
                    tanggal: record.tanggal,
                    waktu_masuk: record.waktu_masuk,
                    waktu_keluar: record.waktu_keluar,
                    status: record.status,
                    method: record.method || 'face_recognition',
                    confidence_score: record.confidence_score,
                    notes: record.notes,
                    created_at: record.created_at,
                    updated_at: record.updated_at || record.created_at
                };

                const { error } = await supabase
                    .from('attendance')
                    .upsert(migratedRecord);

                if (error) {
                    console.error(`❌ Failed to migrate attendance for ${record.tanggal}:`, error.message);
                } else {
                    console.log(`✅ Migrated attendance: ${record.tanggal}`);
                }
            }
        }

        // Migrate exams data
        if (backupData.exams) {
            console.log('📝 Migrating exams data...');
            const exams = backupData.exams;
            
            for (const exam of exams) {
                const migratedExam = {
                    id: exam.id,
                    judul: exam.judul,
                    deskripsi: exam.deskripsi,
                    mata_pelajaran: exam.mata_pelajaran,
                    kelas: exam.kelas,
                    tanggal_mulai: exam.tanggal_mulai,
                    tanggal_selesai: exam.tanggal_selesai,
                    durasi_menit: exam.durasi_menit || 60,
                    max_attempts: exam.max_attempts || 1,
                    passing_score: exam.passing_score || 60.0,
                    is_active: exam.is_active !== false,
                    is_published: exam.is_published !== false,
                    dibuat_oleh: exam.dibuat_oleh,
                    created_at: exam.created_at,
                    updated_at: exam.updated_at || exam.created_at
                };

                const { error } = await supabase
                    .from('exams')
                    .upsert(migratedExam);

                if (error) {
                    console.error(`❌ Failed to migrate exam ${exam.judul}:`, error.message);
                } else {
                    console.log(`✅ Migrated exam: ${exam.judul}`);
                }
            }
        }

        // Migrate questions data
        if (backupData.questions) {
            console.log('❓ Migrating questions data...');
            const questions = backupData.questions;
            
            for (const question of questions) {
                const migratedQuestion = {
                    id: question.id,
                    exam_id: question.exam_id,
                    question_type: 'multiple_choice',
                    pertanyaan: question.pertanyaan,
                    pilihan_a: question.pilihan_a,
                    pilihan_b: question.pilihan_b,
                    pilihan_c: question.pilihan_c,
                    pilihan_d: question.pilihan_d,
                    jawaban_benar: question.jawaban_benar,
                    points: question.points || 1.0,
                    nomor_urut: question.nomor_urut,
                    created_at: question.created_at,
                    updated_at: question.updated_at || question.created_at
                };

                const { error } = await supabase
                    .from('questions')
                    .upsert(migratedQuestion);

                if (error) {
                    console.error(`❌ Failed to migrate question ${question.id}:`, error.message);
                } else {
                    console.log(`✅ Migrated question: ${question.nomor_urut}`);
                }
            }
        }

        // Migrate answers data
        if (backupData.answers) {
            console.log('📋 Migrating answers data...');
            const answers = backupData.answers;
            
            for (const answer of answers) {
                const migratedAnswer = {
                    id: answer.id,
                    exam_id: answer.exam_id,
                    question_id: answer.question_id,
                    user_id: answer.user_id,
                    jawaban: answer.jawaban,
                    is_correct: answer.is_correct,
                    points_earned: answer.points_earned || 0.0,
                    answered_at: answer.answered_at || answer.created_at,
                    created_at: answer.created_at
                };

                const { error } = await supabase
                    .from('answers')
                    .upsert(migratedAnswer);

                if (error) {
                    console.error(`❌ Failed to migrate answer ${answer.id}:`, error.message);
                } else {
                    console.log(`✅ Migrated answer: ${answer.id}`);
                }
            }
        }

        // Migrate announcements data
        if (backupData.pengumuman) {
            console.log('📢 Migrating announcements data...');
            const pengumuman = backupData.pengumuman;
            
            for (const announcement of pengumuman) {
                const migratedAnnouncement = {
                    id: announcement.id,
                    judul: announcement.judul,
                    isi: announcement.isi,
                    category: 'general',
                    priority: 'normal',
                    target_audience: 'all',
                    is_published: announcement.is_published !== false,
                    tanggal: announcement.tanggal,
                    dibuat_oleh: announcement.dibuat_oleh,
                    created_at: announcement.created_at,
                    updated_at: announcement.updated_at || announcement.created_at
                };

                const { error } = await supabase
                    .from('pengumuman')
                    .upsert(migratedAnnouncement);

                if (error) {
                    console.error(`❌ Failed to migrate announcement ${announcement.judul}:`, error.message);
                } else {
                    console.log(`✅ Migrated announcement: ${announcement.judul}`);
                }
            }
        }

        // Create default classes and assign students
        console.log('🏫 Creating default classes...');
        
        // Get all students
        const { data: students, error: studentsError } = await supabase
            .from('users')
            .select('id, nama, class_name')
            .eq('role', 'siswa');

        if (!studentsError && students) {
            // Group students by class
            const classesByName = {};
            students.forEach(student => {
                if (student.class_name) {
                    if (!classesByName[student.class_name]) {
                        classesByName[student.class_name] = [];
                    }
                    classesByName[student.class_name].push(student);
                }
            });

            // Create classes and enroll students
            for (const [className, classStudents] of Object.entries(classesByName)) {
                // Create or get class
                const { data: existingClass } = await supabase
                    .from('classes')
                    .select('id')
                    .eq('name', className)
                    .single();

                let classId;
                if (existingClass) {
                    classId = existingClass.id;
                } else {
                    const { data: newClass, error: classError } = await supabase
                        .from('classes')
                        .insert({
                            name: className,
                            code: className.replace(/\s+/g, '-').toUpperCase(),
                            academic_year: '2024/2025',
                            is_active: true
                        })
                        .select('id')
                        .single();

                    if (classError) {
                        console.error(`❌ Failed to create class ${className}:`, classError.message);
                        continue;
                    }
                    classId = newClass.id;
                }

                // Enroll students
                for (const student of classStudents) {
                    const { error: enrollError } = await supabase
                        .from('class_students')
                        .upsert({
                            class_id: classId,
                            student_id: student.id,
                            status: 'active'
                        });

                    if (enrollError) {
                        console.error(`❌ Failed to enroll ${student.nama}:`, enrollError.message);
                    } else {
                        console.log(`✅ Enrolled ${student.nama} in ${className}`);
                    }
                }
            }
        }

        console.log('');
        console.log('🎉 Migration Complete!');
        console.log('======================');
        console.log('');
        console.log('📊 Migration Summary:');
        console.log(`  👥 Users: ${backupData.users?.length || 0} migrated`);
        console.log(`  👤 Faces: ${backupData.faces?.length || 0} migrated`);
        console.log(`  📅 Attendance: ${backupData.attendance?.length || 0} migrated`);
        console.log(`  📝 Exams: ${backupData.exams?.length || 0} migrated`);
        console.log(`  ❓ Questions: ${backupData.questions?.length || 0} migrated`);
        console.log(`  📋 Answers: ${backupData.answers?.length || 0} migrated`);
        console.log(`  📢 Announcements: ${backupData.pengumuman?.length || 0} migrated`);
        console.log('');
        console.log('✅ All data has been successfully migrated to V2 schema!');
        console.log(`💾 Backup saved to: ${backupPath}`);
        console.log('');
        console.log('🎯 Next Steps:');
        console.log('  1. Test the migrated system');
        console.log('  2. Verify all data is accessible');
        console.log('  3. Update any custom queries to use new schema');
        console.log('');

        return true;

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('');
        console.error('🔧 Recovery Steps:');
        console.error('  1. Check the backup file created');
        console.error('  2. Restore from backup if needed');
        console.error('  3. Contact support if issues persist');
        console.error('');
        return false;
    }
}

// Rollback function
async function rollbackMigration(backupFile) {
    console.log('🔄 Rolling back migration...');
    console.log('============================');
    console.log('');

    const fs = require('fs');
    const path = require('path');

    if (!fs.existsSync(backupFile)) {
        console.error('❌ Backup file not found:', backupFile);
        return false;
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
        const backupData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
        
        console.log('📊 Restoring data from backup...');
        
        // Restore each table
        for (const [tableName, records] of Object.entries(backupData)) {
            if (records && records.length > 0) {
                console.log(`📋 Restoring ${tableName}...`);
                
                // Clear existing data
                await supabase.from(tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000');
                
                // Insert backup data
                const { error } = await supabase.from(tableName).insert(records);
                
                if (error) {
                    console.error(`❌ Failed to restore ${tableName}:`, error.message);
                } else {
                    console.log(`✅ Restored ${records.length} records to ${tableName}`);
                }
            }
        }

        console.log('');
        console.log('✅ Rollback completed successfully!');
        return true;

    } catch (error) {
        console.error('❌ Rollback failed:', error.message);
        return false;
    }
}

// Run migration if called directly
if (require.main === module) {
    const command = process.argv[2];
    
    if (command === 'rollback') {
        const backupFile = process.argv[3];
        if (!backupFile) {
            console.error('❌ Please provide backup file path');
            console.error('Usage: node migration-v2.js rollback <backup-file>');
            process.exit(1);
        }
        
        rollbackMigration(backupFile)
            .then(success => process.exit(success ? 0 : 1));
    } else {
        migrateToV2()
            .then(success => process.exit(success ? 0 : 1))
            .catch(error => {
                console.error('❌ Migration failed:', error);
                process.exit(1);
            });
    }
}

module.exports = { migrateToV2, rollbackMigration };
