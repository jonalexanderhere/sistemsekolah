const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanAndReimportStudents() {
    console.log('🧹 Cleaning and Re-importing Student Data');
    console.log('=========================================');
    console.log('');

    try {
        // Step 1: Delete existing students (except demo students and admin/teachers)
        console.log('🗑️  Removing existing student data...');
        
        const { data: existingStudents, error: fetchError } = await supabase
            .from('users')
            .select('id, nama, nisn, role')
            .eq('role', 'siswa')
            .not('nisn', 'in', '(DEMO001,DEMO002,ADMIN001,ADMIN002)');

        if (fetchError) {
            console.error('Error fetching existing students:', fetchError.message);
            return false;
        }

        if (existingStudents && existingStudents.length > 0) {
            console.log(`Found ${existingStudents.length} existing students to remove`);
            
            const studentIds = existingStudents.map(s => s.id);
            
            // Delete from class_students first (foreign key constraint)
            const { error: classError } = await supabase
                .from('class_students')
                .delete()
                .in('student_id', studentIds);

            if (classError) {
                console.warn('Warning removing class assignments:', classError.message);
            }

            // Delete from faces table
            const { error: facesError } = await supabase
                .from('faces')
                .delete()
                .in('user_id', studentIds);

            if (facesError) {
                console.warn('Warning removing face data:', facesError.message);
            }

            // Delete from attendance table
            const { error: attendanceError } = await supabase
                .from('attendance')
                .delete()
                .in('user_id', studentIds);

            if (attendanceError) {
                console.warn('Warning removing attendance data:', attendanceError.message);
            }

            // Finally delete users
            const { error: deleteError } = await supabase
                .from('users')
                .delete()
                .in('id', studentIds);

            if (deleteError) {
                console.error('Error deleting students:', deleteError.message);
                return false;
            }

            console.log(`✅ Removed ${existingStudents.length} existing students`);
        } else {
            console.log('ℹ️  No existing students to remove');
        }

        console.log('');

        // Step 2: Import new student data
        console.log('📚 Importing fresh student data...');
        
        // Import the students using the existing import function
        const { importStudents } = require('./import-students.js');
        const success = await importStudents();

        if (success) {
            console.log('');
            console.log('🎉 Clean and re-import completed successfully!');
            return true;
        } else {
            console.log('❌ Import failed');
            return false;
        }

    } catch (error) {
        console.error('❌ Clean and re-import failed:', error.message);
        return false;
    }
}

// Run if called directly
if (require.main === module) {
    cleanAndReimportStudents()
        .then(success => {
            if (success) {
                console.log('');
                console.log('✅ All student data has been cleaned and re-imported!');
                console.log('');
                console.log('🚀 Next Steps:');
                console.log('  1. Test student login with NISN/NIS');
                console.log('  2. Check class assignments');
                console.log('  3. Test face registration');
            }
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Process failed:', error);
            process.exit(1);
        });
}

module.exports = { cleanAndReimportStudents };
