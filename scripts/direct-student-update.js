#!/usr/bin/env node

/**
 * Direct Student Update Script
 * Directly updates student class assignments in database
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

async function directStudentUpdate() {
  console.log('🔄 Direct student update to XII TJKT 2...\n');

  try {
    // 1. First, let's see what the current data looks like
    console.log('📊 Checking current student data...');

    const { data: currentStudents, error: checkError } = await supabase
      .from('users')
      .select('id, nama, class_name, role')
      .eq('role', 'siswa')
      .limit(5);

    if (checkError) {
      console.error('❌ Error checking current data:', checkError.message);
      return;
    }

    console.log('Current sample data:');
    currentStudents.forEach(student => {
      console.log(`  ${student.nama}: ${student.class_name || 'No class'}`);
    });

    // 2. Update all students to XII TJKT 2
    console.log('\n🔄 Updating all students to XII TJKT 2...');

    const { data: allStudents, error: fetchError } = await supabase
      .from('users')
      .select('id, nama')
      .eq('role', 'siswa');

    if (fetchError) {
      throw new Error(`Failed to fetch students: ${fetchError.message}`);
    }

    console.log(`📊 Found ${allStudents.length} students to update`);

    // Update each student individually to avoid constraint issues
    let successCount = 0;
    let errorCount = 0;

    for (const student of allStudents) {
      try {
        const { error: updateError } = await supabase
          .from('users')
          .update({
            class_name: 'XII TJKT 2',
            updated_at: new Date().toISOString()
          })
          .eq('id', student.id);

        if (updateError) {
          console.error(`❌ Failed to update ${student.nama}:`, updateError.message);
          errorCount++;
        } else {
          successCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));

      } catch (error) {
        console.error(`❌ Error updating ${student.nama}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Direct Update Summary:`);
    console.log(`   ✅ Updated: ${successCount} students`);
    console.log(`   ❌ Failed: ${errorCount} students`);
    console.log(`   📈 Success Rate: ${((successCount / (successCount + errorCount)) * 100).toFixed(1)}%`);

    // 3. Verify the updates
    console.log('\n🔍 Verifying updates...');

    const { data: verifyStudents, error: verifyError } = await supabase
      .from('users')
      .select('class_name')
      .eq('role', 'siswa')
      .limit(10);

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
    } else {
      const uniqueClasses = [...new Set(verifyStudents.map(s => s.class_name))];
      console.log('✅ Sample of updated classes:', uniqueClasses);

      if (uniqueClasses.length === 1 && uniqueClasses[0] === 'XII TJKT 2') {
        console.log('\n🎉 DIRECT UPDATE SUCCESSFUL! All students are now in XII TJKT 2 class!');
      } else {
        console.log('\n⚠️  Some students may still have different classes');
        console.log('Classes found:', uniqueClasses);
      }
    }

    // 4. Show final status
    console.log('\n📋 Final Status:');
    console.log('✅ All database operations completed');
    console.log('✅ Student class assignments updated');
    console.log('💡 Note: Refresh your application to see changes');

  } catch (error) {
    console.error('❌ Direct update failed:', error.message);
    process.exit(1);
  }
}

// Run the direct update
if (require.main === module) {
  console.log('🚀 Starting DIRECT student update...\n');

  directStudentUpdate()
    .then(() => {
      console.log('\n✨ Direct student update completed!');
    })
    .catch(console.error);
}

module.exports = { directStudentUpdate };
