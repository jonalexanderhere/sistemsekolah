#!/usr/bin/env node

/**
 * Check Attendance Data in Database
 * Verify attendance records and troubleshoot display issues
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

async function checkAttendanceData() {
  console.log('📊 Checking Attendance Data in Database...\n');
  
  try {
    // Check total attendance records
    console.log('🔍 1. Total Attendance Records:');
    const { data: totalAttendance, error: totalError } = await supabase
      .from('attendance')
      .select('id', { count: 'exact' });

    if (totalError) {
      console.error('❌ Error getting total attendance:', totalError.message);
    } else {
      console.log(`✅ Total attendance records: ${totalAttendance?.length || 0}`);
    }

    // Check recent attendance (last 7 days)
    console.log('\n🔍 2. Recent Attendance (Last 7 days):');
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    const { data: recentAttendance, error: recentError } = await supabase
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
          nisn,
          role
        )
      `)
      .gte('tanggal', sevenDaysAgo)
      .lte('tanggal', today)
      .order('created_at', { ascending: false });

    if (recentError) {
      console.error('❌ Error getting recent attendance:', recentError.message);
    } else {
      console.log(`✅ Recent attendance records: ${recentAttendance?.length || 0}`);
      if (recentAttendance && recentAttendance.length > 0) {
        console.log('\n📋 Recent Attendance Details:');
        recentAttendance.forEach((record, index) => {
          console.log(`  ${index + 1}. ${record.users?.nama || 'Unknown'} (${record.users?.nisn || 'N/A'})`);
          console.log(`     Date: ${record.tanggal}, Time: ${record.waktu_masuk}`);
          console.log(`     Status: ${record.status}, Method: ${record.method}`);
          console.log(`     Created: ${record.created_at}`);
          console.log('');
        });
      }
    }

    // Check today's attendance
    console.log('\n🔍 3. Today\'s Attendance:');
    const { data: todayAttendance, error: todayError } = await supabase
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
          nisn,
          role
        )
      `)
      .eq('tanggal', today)
      .order('created_at', { ascending: false });

    if (todayError) {
      console.error('❌ Error getting today\'s attendance:', todayError.message);
    } else {
      console.log(`✅ Today's attendance records: ${todayAttendance?.length || 0}`);
      if (todayAttendance && todayAttendance.length > 0) {
        console.log('\n📋 Today\'s Attendance Details:');
        todayAttendance.forEach((record, index) => {
          console.log(`  ${index + 1}. ${record.users?.nama || 'Unknown'} (${record.users?.nisn || 'N/A'})`);
          console.log(`     Time: ${record.waktu_masuk}, Status: ${record.status}`);
          console.log(`     Method: ${record.method}, Created: ${record.created_at}`);
          console.log('');
        });
      }
    }

    // Check students without attendance today
    console.log('\n🔍 4. Students Without Attendance Today:');
    const { data: allStudents, error: studentsError } = await supabase
      .from('users')
      .select('id, nama, nisn')
      .eq('role', 'siswa')
      .eq('class_name', 'XII TJKT 2');

    if (studentsError) {
      console.error('❌ Error getting students:', studentsError.message);
    } else {
      const attendedToday = todayAttendance?.map(record => record.user_id) || [];
      const notAttended = allStudents?.filter(student => !attendedToday.includes(student.id)) || [];
      
      console.log(`✅ Students without attendance today: ${notAttended.length}`);
      if (notAttended.length > 0) {
        console.log('\n📋 Students Not Attended Today:');
        notAttended.forEach((student, index) => {
          console.log(`  ${index + 1}. ${student.nama} (${student.nisn})`);
        });
      }
    }

    // Test API endpoint
    console.log('\n🔍 5. Testing API Endpoint:');
    try {
      const response = await fetch('https://sistemsekolah.vercel.app/api/attendance/list?limit=10');
      const apiData = await response.json();
      
      if (apiData.success) {
        console.log(`✅ API returned ${apiData.data?.length || 0} records`);
        console.log(`✅ API source: ${apiData.source || 'unknown'}`);
        if (apiData.data && apiData.data.length > 0) {
          console.log('\n📋 API Data Sample:');
          apiData.data.slice(0, 3).forEach((record, index) => {
            console.log(`  ${index + 1}. ${record.users?.nama || 'Unknown'} - ${record.tanggal}`);
          });
        }
      } else {
        console.log('❌ API returned error:', apiData.error);
      }
    } catch (apiError) {
      console.log('⚠️ API test failed (expected if not deployed):', apiError.message);
    }

    console.log('\n🎯 Summary:');
    console.log(`📊 Total records in database: ${totalAttendance?.length || 0}`);
    console.log(`📅 Recent records (7 days): ${recentAttendance?.length || 0}`);
    console.log(`📅 Today's records: ${todayAttendance?.length || 0}`);
    console.log(`👥 Students without attendance: ${notAttended?.length || 0}`);

  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

// Run check
checkAttendanceData().catch(console.error);
