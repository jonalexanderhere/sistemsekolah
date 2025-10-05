#!/usr/bin/env node

/**
 * Update All Students to XII TJKT 2 Script
 * Updates all existing students to use XII TJKT 2 class
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

async function updateAllStudentsToTJKT2() {
  console.log('🔄 Updating all students to XII TJKT 2 class...\n');

  try {
    // 1. Update all students to use XII TJKT 2 class
    console.log('📝 Updating student class assignments...');

    const { data: students, error: studentsError } = await supabase
      .from('users')
      .select('id, nama, class_name')
      .eq('role', 'siswa');

    if (studentsError) {
      throw new Error(`Failed to fetch students: ${studentsError.message}`);
    }

    console.log(`📊 Found ${students.length} students to update`);

    if (students.length === 0) {
      console.log('✅ No students to update');
      return;
    }

    // Update all students to XII TJKT 2
    const updates = students.map(student => ({
      id: student.id,
      class_name: 'XII TJKT 2',
      updated_at: new Date().toISOString()
    }));

    // Update students in batches to avoid timeout
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);

      console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(updates.length / batchSize)}`);

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
    }

    console.log(`\n📊 Update Summary:`);
    console.log(`   ✅ Updated: ${successCount} students`);
    console.log(`   ❌ Failed: ${errorCount} students`);
    console.log(`   📈 Success Rate: ${((successCount / (successCount + errorCount)) * 100).toFixed(1)}%`);

    // 2. Update class enrollments
    console.log('\n📝 Updating class enrollments...');

    // First, ensure XII TJKT 2 class exists
    const { data: tjkt2Class, error: classError } = await supabase
      .from('classes')
      .select('id')
      .eq('name', 'XII TJKT 2')
      .single();

    if (classError) {
      console.error('❌ XII TJKT 2 class not found:', classError.message);
      return;
    }

    // Update all class enrollments
    const { error: enrollmentError } = await supabase
      .from('class_students')
      .update({ class_id: tjkt2Class.id })
      .neq('class_id', tjkt2Class.id); // Update only if different

    if (enrollmentError) {
      console.error('❌ Failed to update class enrollments:', enrollmentError.message);
    } else {
      console.log('✅ Class enrollments updated successfully');
    }

    // 3. Verify the updates
    console.log('\n🔍 Verifying updates...');

    const { data: updatedStudents, error: verifyError } = await supabase
      .from('users')
      .select('class_name')
      .eq('role', 'siswa')
      .limit(5);

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
    } else {
      const uniqueClasses = [...new Set(updatedStudents.map(s => s.class_name))];
      console.log('✅ Sample of updated classes:', uniqueClasses);

      if (uniqueClasses.length === 1 && uniqueClasses[0] === 'XII TJKT 2') {
        console.log('🎉 All students are now in XII TJKT 2 class!');
      } else {
        console.log('⚠️  Some students may still have different classes');
      }
    }

  } catch (error) {
    console.error('❌ Update failed:', error.message);
    process.exit(1);
  }
}

// Run the update
if (require.main === module) {
  console.log('🚀 Starting student class update...\n');

  updateAllStudentsToTJKT2()
    .then(() => {
      console.log('\n✨ Student class update completed!');
    })
    .catch(console.error);
}

module.exports = { updateAllStudentsToTJKT2 };
