#!/usr/bin/env node

/**
 * Recreate XII TJKT 2 Class Script
 * Recreates the XII TJKT 2 class after cleanup
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function recreateTJKT2Class() {
  console.log('🏗️  Recreating XII TJKT 2 class...\n');

  try {
    // 1. Check if XII TJKT 2 class already exists
    const { data: existingClass, error: checkError } = await supabase
      .from('classes')
      .select('id')
      .eq('name', 'XII TJKT 2')
      .single();

    if (!checkError && existingClass) {
      console.log('✅ XII TJKT 2 class already exists');
      return;
    }

    // 2. Create XII TJKT 2 class
    console.log('📝 Creating XII TJKT 2 class...');

    const { data: newClass, error: createError } = await supabase
      .from('classes')
      .insert({
        name: 'XII TJKT 2',
        grade_level: 'XII',
        academic_year: '2024-2025',
        semester: '1',
        description: 'Kelas XII Teknik Jaringan Komputer dan Telekomunikasi 2 - Sekolah TJKT 2',
        capacity: 40,
        is_active: true
      })
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create XII TJKT 2 class: ${createError.message}`);
    }

    console.log('✅ Created XII TJKT 2 class:', newClass.id);

    // 3. Get all students
    const { data: students, error: studentsError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'siswa');

    if (studentsError) {
      throw new Error(`Failed to fetch students: ${studentsError.message}`);
    }

    console.log(`📊 Found ${students.length} students for enrollment`);

    // 4. Create enrollments for all students
    if (students.length > 0) {
      const enrollments = students.map(student => ({
        class_id: newClass.id,
        student_id: student.id,
        enrollment_date: new Date().toISOString().split('T')[0],
        status: 'active'
      }));

      const { error: enrollmentError } = await supabase
        .from('class_students')
        .insert(enrollments);

      if (enrollmentError) {
        console.error('❌ Failed to create enrollments:', enrollmentError.message);
      } else {
        console.log(`✅ Created ${enrollments.length} enrollments in XII TJKT 2`);
      }
    }

    // 5. Final verification
    console.log('\n🔍 Final verification...');

    const { data: finalClass, error: verifyError } = await supabase
      .from('classes')
      .select('name')
      .eq('name', 'XII TJKT 2')
      .single();

    if (verifyError) {
      console.error('❌ Final verification failed:', verifyError.message);
    } else {
      console.log('✅ XII TJKT 2 class exists:', finalClass.name);

      const { count, error: countError } = await supabase
        .from('class_students')
        .select('id', { count: 'exact', head: true })
        .eq('class_id', finalClass.id);

      if (countError) {
        console.error('❌ Failed to count enrollments:', countError.message);
      } else {
        console.log(`✅ XII TJKT 2 class has ${count} enrollments`);
      }
    }

    console.log('\n🎉 XII TJKT 2 class recreation completed!');

  } catch (error) {
    console.error('❌ Recreation failed:', error.message);
    process.exit(1);
  }
}

// Run the recreation
if (require.main === module) {
  console.log('🚀 Starting XII TJKT 2 class recreation...\n');

  recreateTJKT2Class()
    .then(() => {
      console.log('\n✨ XII TJKT 2 class recreation completed!');
    })
    .catch(console.error);
}

module.exports = { recreateTJKT2Class };
