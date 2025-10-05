#!/usr/bin/env node

/**
 * Cleanup Unused Classes Script
 * Removes all classes except XII TJKT 2 from the database
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

async function cleanupUnusedClasses() {
  console.log('🧹 Cleaning up unused classes (keeping only XII TJKT 2)...\n');

  try {
    // 1. Get all classes
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('id, name, is_active');

    if (classesError) {
      throw new Error(`Failed to fetch classes: ${classesError.message}`);
    }

    console.log(`📊 Found ${classes.length} classes`);

    // 2. Identify classes to keep vs delete
    const classesToKeep = classes.filter(cls => cls.name === 'XII TJKT 2');
    const classesToDelete = classes.filter(cls => cls.name !== 'XII TJKT 2');

    console.log(`📋 Classes to keep: ${classesToKeep.length}`);
    console.log(`📋 Classes to delete: ${classesToDelete.length}`);

    if (classesToDelete.length === 0) {
      console.log('✅ No classes to delete - only XII TJKT 2 exists');
      return;
    }

    // 3. Show what will be deleted
    console.log('\n📋 Classes to be deleted:');
    classesToDelete.forEach(cls => {
      console.log(`   ❌ ${cls.name} (${cls.is_active ? 'Active' : 'Inactive'})`);
    });

    // 4. Delete unused classes (be careful with cascade)
    console.log('\n🗑️  Deleting unused classes...');

    for (const cls of classesToDelete) {
      try {
        // First, remove any enrollments for this class
        const { error: enrollmentError } = await supabase
          .from('class_students')
          .delete()
          .eq('class_id', cls.id);

        if (enrollmentError) {
          console.warn(`⚠️  Failed to remove enrollments for ${cls.name}:`, enrollmentError.message);
        }

        // Then delete the class
        const { error: deleteError } = await supabase
          .from('classes')
          .delete()
          .eq('id', cls.id);

        if (deleteError) {
          console.error(`❌ Failed to delete class ${cls.name}:`, deleteError.message);
        } else {
          console.log(`✅ Deleted class: ${cls.name}`);
        }

      } catch (error) {
        console.error(`❌ Error deleting class ${cls.name}:`, error.message);
      }
    }

    // 5. Verify cleanup
    console.log('\n🔍 Verifying cleanup...');

    const { data: remainingClasses, error: verifyError } = await supabase
      .from('classes')
      .select('name');

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
    } else {
      console.log(`✅ Remaining classes: ${remainingClasses.length}`);
      remainingClasses.forEach(cls => {
        console.log(`   ${cls.name === 'XII TJKT 2' ? '✅' : '❌'} ${cls.name}`);
      });

      if (remainingClasses.length === 1 && remainingClasses[0].name === 'XII TJKT 2') {
        console.log('\n🎉 Cleanup successful! Only XII TJKT 2 class remains.');
      } else {
        console.log('\n⚠️  Cleanup may not be complete. Check remaining classes.');
      }
    }

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

// Run cleanup
if (require.main === module) {
  console.log('🚀 Starting class cleanup...\n');

  // Ask for confirmation
  console.log('⚠️  This will delete all classes except XII TJKT 2!');
  console.log('Make sure you have backed up your data.\n');

  cleanupUnusedClasses()
    .then(() => {
      console.log('\n✨ Class cleanup completed!');
    })
    .catch(console.error);
}

module.exports = { cleanupUnusedClasses };
