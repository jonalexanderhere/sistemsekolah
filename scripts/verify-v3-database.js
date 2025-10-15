#!/usr/bin/env node

/**
 * Verify V3 Database Connection and Data
 * Comprehensive check of all database tables and data
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

async function verifyV3Database() {
  console.log('🔍 Verifying V3 Database Connection and Data...\n');
  
  const results = {
    connection: false,
    tables: {},
    errors: []
  };

  try {
    // Test 1: Basic connection
    console.log('📝 Test 1: Basic Supabase connection');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Basic connection failed:', testError.message);
      results.errors.push({ test: 'connection', error: testError.message });
    } else {
      console.log('✅ Basic connection successful');
      results.connection = true;
    }

    // Test 2: Users table
    console.log('\n📝 Test 2: Users table');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, nama, role, nisn, class_name')
      .order('nama');

    if (usersError) {
      console.error('❌ Users table error:', usersError.message);
      results.errors.push({ test: 'users', error: usersError.message });
    } else {
      console.log(`✅ Users table: ${users?.length || 0} records`);
      results.tables.users = users?.length || 0;
      
      // Show user breakdown
      const roleCount = users?.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {}) || {};
      
      console.log('📊 User breakdown:', roleCount);
    }

    // Test 3: Attendance table
    console.log('\n📝 Test 3: Attendance table');
    const { data: attendance, error: attendanceError } = await supabase
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
      .order('created_at', { ascending: false });

    if (attendanceError) {
      console.error('❌ Attendance table error:', attendanceError.message);
      results.errors.push({ test: 'attendance', error: attendanceError.message });
    } else {
      console.log(`✅ Attendance table: ${attendance?.length || 0} records`);
      results.tables.attendance = attendance?.length || 0;
      
      if (attendance && attendance.length > 0) {
        console.log('📋 Recent attendance:');
        attendance.slice(0, 3).forEach((record, index) => {
          console.log(`  ${index + 1}. ${record.users?.nama || 'Unknown'} - ${record.tanggal} (${record.status})`);
        });
      }
    }

    // Test 4: Exams table
    console.log('\n📝 Test 4: Exams table');
    const { data: exams, error: examsError } = await supabase
      .from('exams')
      .select('id, title, subject, is_active, created_at')
      .order('created_at', { ascending: false });

    if (examsError) {
      console.error('❌ Exams table error:', examsError.message);
      results.errors.push({ test: 'exams', error: examsError.message });
    } else {
      console.log(`✅ Exams table: ${exams?.length || 0} records`);
      results.tables.exams = exams?.length || 0;
    }

    // Test 5: Grades table
    console.log('\n📝 Test 5: Grades table');
    const { data: grades, error: gradesError } = await supabase
      .from('grades')
      .select('id, user_id, subject, score, created_at')
      .order('created_at', { ascending: false });

    if (gradesError) {
      console.error('❌ Grades table error:', gradesError.message);
      results.errors.push({ test: 'grades', error: gradesError.message });
    } else {
      console.log(`✅ Grades table: ${grades?.length || 0} records`);
      results.tables.grades = grades?.length || 0;
    }

    // Test 6: Questions table
    console.log('\n📝 Test 6: Questions table');
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, question_text, subject, created_at')
      .order('created_at', { ascending: false });

    if (questionsError) {
      console.error('❌ Questions table error:', questionsError.message);
      results.errors.push({ test: 'questions', error: questionsError.message });
    } else {
      console.log(`✅ Questions table: ${questions?.length || 0} records`);
      results.tables.questions = questions?.length || 0;
    }

    // Test 7: Announcements table
    console.log('\n📝 Test 7: Announcements table');
    const { data: announcements, error: announcementsError } = await supabase
      .from('pengumuman')
      .select('id, judul, isi, is_active, created_at')
      .order('created_at', { ascending: false });

    if (announcementsError) {
      console.error('❌ Announcements table error:', announcementsError.message);
      results.errors.push({ test: 'announcements', error: announcementsError.message });
    } else {
      console.log(`✅ Announcements table: ${announcements?.length || 0} records`);
      results.tables.announcements = announcements?.length || 0;
    }

    // Test 8: System logs table
    console.log('\n📝 Test 8: System logs table');
    const { data: logs, error: logsError } = await supabase
      .from('system_logs')
      .select('id, action, details, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (logsError) {
      console.error('❌ System logs table error:', logsError.message);
      results.errors.push({ test: 'system_logs', error: logsError.message });
    } else {
      console.log(`✅ System logs table: ${logs?.length || 0} records`);
      results.tables.system_logs = logs?.length || 0;
    }

    // Test 9: Check specific student data
    console.log('\n📝 Test 9: Check specific student data');
    const { data: student, error: studentError } = await supabase
      .from('users')
      .select('id, nama, nisn, role, class_name')
      .eq('nisn', '2024001')
      .single();

    if (studentError) {
      console.error('❌ Student lookup error:', studentError.message);
      results.errors.push({ test: 'student_lookup', error: studentError.message });
    } else {
      console.log(`✅ Student found: ${student?.nama || 'Unknown'} (${student?.nisn || 'N/A'})`);
    }

    // Test 10: Check today's attendance
    console.log('\n📝 Test 10: Check today\'s attendance');
    const today = new Date().toISOString().split('T')[0];
    const { data: todayAttendance, error: todayError } = await supabase
      .from('attendance')
      .select(`
        id,
        tanggal,
        waktu_masuk,
        status,
        user_id,
        users!inner (
          id,
          nama,
          nisn
        )
      `)
      .eq('tanggal', today);

    if (todayError) {
      console.error('❌ Today\'s attendance error:', todayError.message);
      results.errors.push({ test: 'today_attendance', error: todayError.message });
    } else {
      console.log(`✅ Today's attendance: ${todayAttendance?.length || 0} records`);
      if (todayAttendance && todayAttendance.length > 0) {
        todayAttendance.forEach((record, index) => {
          console.log(`  ${index + 1}. ${record.users?.nama || 'Unknown'} - ${record.waktu_masuk} (${record.status})`);
        });
      }
    }

    console.log('\n🎯 V3 Database Verification Summary:');
    console.log(`✅ Connection: ${results.connection ? 'Working' : 'Failed'}`);
    console.log(`📊 Tables Status:`);
    Object.entries(results.tables).forEach(([table, count]) => {
      console.log(`  ${table}: ${count} records`);
    });
    console.log(`❌ Errors: ${results.errors.length}`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ Errors Found:');
      results.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error.test}: ${error.error}`);
      });
    }

    console.log('\n🔧 Database Status:');
    if (results.connection) {
      console.log('✅ Database connection working');
      console.log('✅ All tables accessible');
      console.log('✅ Data retrieval successful');
    } else {
      console.log('❌ Database connection failed');
      console.log('❌ Check environment variables');
      console.log('❌ Verify Supabase service key');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

// Run verification
verifyV3Database().catch(console.error);
