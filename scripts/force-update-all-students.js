#!/usr/bin/env node

/**
 * Force Update All Students Script
 * Forces all students to use XII TJKT 2 class regardless of current assignment
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

async function forceUpdateAllStudents() {
  console.log('🔄 Force updating ALL students to XII TJKT 2 class...\n');

  try {
    // 1. Get all students
    console.log('📝 Fetching all students...');

    const { data: students, error: studentsError } = await supabase
      .from('users')
      .select('id, nama, class_name, role')
      .eq('role', 'siswa');

    if (studentsError) {
      throw new Error(`Failed to fetch students: ${studentsError.message}`);
    }

    console.log(`📊 Found ${students.length} students`);

    if (students.length === 0) {
      console.log('✅ No students to update');
      return;
    }

    // 2. Force update all students to XII TJKT 2
    console.log('🔄 Force updating all students...');

    const updates = students.map(student => ({
      id: student.id,
      class_name: 'XII TJKT 2',
      updated_at: new Date().toISOString()
    }));

    // Update in smaller batches to avoid timeout
    const batchSize = 10;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);

      console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(updates.length / batchSize)} (${batch.length} students)`);

      const { error: updateError } = await supabase
        .from('users')
        .upsert(batch, { onConflict: 'id' });

      if (updateError) {
        console.error(`❌ Batch ${Math.floor(i / batchSize) + 1} failed:`, updateError.message);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
        console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} updated successfully`);
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n📊 Force Update Summary:`);
    console.log(`   ✅ Updated: ${successCount} students`);
    console.log(`   ❌ Failed: ${errorCount} students`);
    console.log(`   📈 Success Rate: ${((successCount / (successCount + errorCount)) * 100).toFixed(1)}%`);

    // 3. Update class enrollments
    console.log('\n📝 Updating class enrollments...');

    // Ensure XII TJKT 2 class exists
    const { data: tjkt2Class, error: classError } = await supabase
      .from('classes')
      .select('id')
      .eq('name', 'XII TJKT 2')
      .single();

    if (classError) {
      console.error('❌ XII TJKT 2 class not found:', classError.message);
      return;
    }

    // Delete all existing enrollments and recreate them
    const { error: deleteError } = await supabase
      .from('class_students')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.error('❌ Failed to clear enrollments:', deleteError.message);
    } else {
      console.log('✅ Cleared all existing enrollments');
    }

    // Create new enrollments for all students in XII TJKT 2
    const enrollments = students.map(student => ({
      class_id: tjkt2Class.id,
      student_id: student.id,
      enrollment_date: new Date().toISOString().split('T')[0],
      status: 'active'
    }));

    if (enrollments.length > 0) {
      const { error: enrollmentError } = await supabase
        .from('class_students')
        .insert(enrollments);

      if (enrollmentError) {
        console.error('❌ Failed to create enrollments:', enrollmentError.message);
      } else {
        console.log(`✅ Created ${enrollments.length} new enrollments in XII TJKT 2`);
      }
    }

    // 4. Final verification
    console.log('\n🔍 Final verification...');

    const { data: finalStudents, error: verifyError } = await supabase
      .from('users')
      .select('class_name')
      .eq('role', 'siswa')
      .limit(5);

    if (verifyError) {
      console.error('❌ Final verification failed:', verifyError.message);
    } else {
      const uniqueClasses = [...new Set(finalStudents.map(s => s.class_name))];
      console.log('✅ Sample of final classes:', uniqueClasses);

      if (uniqueClasses.length === 1 && uniqueClasses[0] === 'XII TJKT 2') {
        console.log('\n🎉 FORCE UPDATE SUCCESSFUL! All students are now in XII TJKT 2 class!');
        console.log('✅ TJKT 2 consistency achieved!');
      } else {
        console.log('\n⚠️  Some students may still have different classes');
        console.log('Classes found:', uniqueClasses);
      }
    }

  } catch (error) {
    console.error('❌ Force update failed:', error.message);
    process.exit(1);
  }
}

// Run the force update
if (require.main === module) {
  console.log('🚀 Starting FORCE UPDATE of all students to XII TJKT 2...\n');

  forceUpdateAllStudents()
    .then(() => {
      console.log('\n✨ Force update completed!');
    })
    .catch(console.error);
}

module.exports = { forceUpdateAllStudents };
