#!/usr/bin/env node

/**
 * Create Test Attendance Data
 * Create some test attendance records to verify the system
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://kmmdnlbbeezsweqsxqzv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbWRubGJiZWV6c3dlcXN4cXp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQwNTU2MCwiZXhwIjoyMDc0OTgxNTYwfQ.TZzM-jc-AigFxJw6fOnIUKzk_x606gCwRR0lS-UUqh0';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestAttendance() {
  console.log('📝 Creating Test Attendance Data...\n');
  
  try {
    // Get some students
    const { data: students, error: studentsError } = await supabase
      .from('users')
      .select('id, nama, nisn')
      .eq('role', 'siswa')
      .eq('class_name', 'XII TJKT 2')
      .limit(5);

    if (studentsError || !students || students.length === 0) {
      console.error('❌ No students found for test data');
      return;
    }

    console.log(`✅ Found ${students.length} students for test data`);

    // Create test attendance records for yesterday
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const testRecords = [];

    for (let i = 0; i < Math.min(3, students.length); i++) {
      const student = students[i];
      const timeOffset = i * 5; // 5 minutes apart
      const attendanceTime = new Date();
      attendanceTime.setMinutes(attendanceTime.getMinutes() + timeOffset);
      
      const record = {
        user_id: student.id,
        tanggal: yesterday,
        waktu_masuk: attendanceTime.toTimeString().split(' ')[0],
        status: 'hadir',
        method: 'qr_code',
        meta: {
          test: true,
          created_by: 'test_script',
          student_name: student.nama,
          student_nisn: student.nisn
        }
      };

      testRecords.push(record);
    }

    console.log('📝 Creating test attendance records...');
    
    // Insert test records
    const { data: insertedRecords, error: insertError } = await supabase
      .from('attendance')
      .insert(testRecords)
      .select(`
        id,
        tanggal,
        waktu_masuk,
        status,
        method,
        created_at,
        user_id,
        users!inner (
          id,
          nama,
          nisn
        )
      `);

    if (insertError) {
      console.error('❌ Error creating test records:', insertError.message);
    } else {
      console.log(`✅ Created ${insertedRecords?.length || 0} test attendance records`);
      
      if (insertedRecords && insertedRecords.length > 0) {
        console.log('\n📋 Test Records Created:');
        insertedRecords.forEach((record, index) => {
          console.log(`  ${index + 1}. ${record.users?.nama || 'Unknown'} (${record.users?.nisn || 'N/A'})`);
          console.log(`     Date: ${record.tanggal}, Time: ${record.waktu_masuk}`);
          console.log(`     Status: ${record.status}, Method: ${record.method}`);
          console.log('');
        });
      }
    }

    // Verify the records were created
    console.log('\n🔍 Verifying test records...');
    const { data: verifyRecords, error: verifyError } = await supabase
      .from('attendance')
      .select(`
        id,
        tanggal,
        waktu_masuk,
        status,
        method,
        created_at,
        user_id,
        users!inner (
          id,
          nama,
          nisn
        )
      `)
      .eq('tanggal', yesterday)
      .order('created_at', { ascending: false });

    if (verifyError) {
      console.error('❌ Error verifying records:', verifyError.message);
    } else {
      console.log(`✅ Verified ${verifyRecords?.length || 0} attendance records for today`);
      
      if (verifyRecords && verifyRecords.length > 0) {
        console.log('\n📋 All Today\'s Records:');
        verifyRecords.forEach((record, index) => {
          console.log(`  ${index + 1}. ${record.users?.nama || 'Unknown'} (${record.users?.nisn || 'N/A'})`);
          console.log(`     Time: ${record.waktu_masuk}, Status: ${record.status}`);
          console.log(`     Method: ${record.method}, Created: ${record.created_at}`);
          console.log('');
        });
      }
    }

    console.log('\n🎯 Test Data Creation Summary:');
    console.log(`✅ Students found: ${students.length}`);
    console.log(`✅ Test records created: ${insertedRecords?.length || 0}`);
    console.log(`✅ Total records today: ${verifyRecords?.length || 0}`);

  } catch (error) {
    console.error('❌ Test data creation failed:', error.message);
  }
}

// Run test
createTestAttendance().catch(console.error);
