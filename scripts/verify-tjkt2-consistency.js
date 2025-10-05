#!/usr/bin/env node

/**
 * TJKT 2 Consistency Verification Script
 * Verifies that all students are in XII TJKT 2 class
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

async function verifyTJKT2Consistency() {
  console.log('🔍 Verifying XII TJKT 2 consistency across all data...\n');

  try {
    // 1. Check all students
    console.log('📊 Checking student class assignments...');

    const { data: students, error: studentsError } = await supabase
      .from('users')
      .select('id, nama, class_name, role')
      .eq('role', 'siswa');

    if (studentsError) {
      throw new Error(`Failed to fetch students: ${studentsError.message}`);
    }

    console.log(`📈 Total students found: ${students.length}`);

    // Group students by class
    const classGroups = {};
    let tjkt2Count = 0;
    let otherClassCount = 0;

    students.forEach(student => {
      const className = student.class_name || 'Not Assigned';
      if (!classGroups[className]) {
        classGroups[className] = [];
      }
      classGroups[className].push(student);

      if (className === 'XII TJKT 2') {
        tjkt2Count++;
      } else {
        otherClassCount++;
      }
    });

    console.log('\n📋 Class Distribution:');
    Object.keys(classGroups).forEach(className => {
      const count = classGroups[className].length;
      const percentage = ((count / students.length) * 100).toFixed(1);
      const status = className === 'XII TJKT 2' ? '✅' : '⚠️';
      console.log(`   ${status} ${className}: ${count} students (${percentage}%)`);
    });

    // 2. Check class enrollments
    console.log('\n📊 Checking class enrollments...');

    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('class_students')
      .select(`
        class_id,
        classes!inner(name)
      `);

    if (enrollmentsError) {
      console.error('❌ Failed to fetch enrollments:', enrollmentsError.message);
    } else {
      const enrollmentClasses = {};
      enrollments.forEach(enrollment => {
        const className = enrollment.classes?.name || 'Unknown';
        enrollmentClasses[className] = (enrollmentClasses[className] || 0) + 1;
      });

      console.log('📋 Enrollment Distribution:');
      Object.keys(enrollmentClasses).forEach(className => {
        const count = enrollmentClasses[className];
        console.log(`   ${className === 'XII TJKT 2' ? '✅' : '⚠️'} ${className}: ${count} enrollments`);
      });
    }

    // 3. Check available classes
    console.log('\n📊 Checking available classes...');

    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('name, is_active');

    if (classesError) {
      console.error('❌ Failed to fetch classes:', classesError.message);
    } else {
      console.log('📋 Available Classes:');
      classes.forEach(cls => {
        const status = cls.name === 'XII TJKT 2' ? '✅ PRIMARY' : '⚠️  OTHER';
        console.log(`   ${status}: ${cls.name} (${cls.is_active ? 'Active' : 'Inactive'})`);
      });
    }

    // 4. Summary
    console.log('\n📊 Consistency Summary:');
    console.log(`   ✅ Students in XII TJKT 2: ${tjkt2Count}`);
    console.log(`   ⚠️  Students in other classes: ${otherClassCount}`);
    console.log(`   📈 TJKT 2 Coverage: ${((tjkt2Count / (tjkt2Count + otherClassCount)) * 100).toFixed(1)}%`);

    if (otherClassCount === 0) {
      console.log('\n🎉 Perfect! All students are in XII TJKT 2 class!');
      console.log('✅ TJKT 2 consistency verified!');
    } else {
      console.log('\n⚠️  Some students are still in other classes.');
      console.log('💡 Run the update script: node scripts/update-all-students-to-tjkt2.js');
    }

    // 5. Recommendations
    console.log('\n💡 Recommendations:');
    if (otherClassCount > 0) {
      console.log('1. Run: node scripts/update-all-students-to-tjkt2.js');
      console.log('2. Check import scripts for hardcoded class assignments');
      console.log('3. Verify database schema defaults');
    } else {
      console.log('✅ No action needed - all students are correctly assigned');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
  }
}

// Run verification
if (require.main === module) {
  console.log('🚀 Starting TJKT 2 consistency verification...\n');

  verifyTJKT2Consistency()
    .then(() => {
      console.log('\n✨ TJKT 2 verification completed!');
    })
    .catch(console.error);
}

module.exports = { verifyTJKT2Consistency };
