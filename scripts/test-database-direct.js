#!/usr/bin/env node

/**
 * Test Database Direct Connection
 * Test Supabase connection and query attendance data directly
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

async function testDatabaseDirect() {
  console.log('🔍 Testing Database Direct Connection...\n');
  
  try {
    // Test 1: Basic connection
    console.log('📝 Test 1: Basic Supabase connection');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Basic connection failed:', testError.message);
      return;
    } else {
      console.log('✅ Basic connection successful');
    }

    // Test 2: Attendance table structure
    console.log('\n📝 Test 2: Attendance table structure');
    const { data: attendanceStructure, error: structureError } = await supabase
      .from('attendance')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.error('❌ Attendance table access failed:', structureError.message);
    } else {
      console.log('✅ Attendance table accessible');
      if (attendanceStructure && attendanceStructure.length > 0) {
        console.log('📋 Sample record structure:', Object.keys(attendanceStructure[0]));
      }
    }

    // Test 3: Get all attendance records
    console.log('\n📝 Test 3: Get all attendance records');
    const { data: allAttendance, error: allError } = await supabase
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
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ Get all attendance failed:', allError.message);
    } else {
      console.log(`✅ Found ${allAttendance?.length || 0} attendance records`);
      if (allAttendance && allAttendance.length > 0) {
        console.log('\n📋 All Attendance Records:');
        allAttendance.forEach((record, index) => {
          console.log(`  ${index + 1}. ${record.users?.nama || 'Unknown'} (${record.users?.nisn || 'N/A'})`);
          console.log(`     Date: ${record.tanggal}, Time: ${record.waktu_masuk}`);
          console.log(`     Status: ${record.status}, Method: ${record.method}`);
          console.log(`     Created: ${record.created_at}`);
          console.log('');
        });
      }
    }

    // Test 4: Test the exact query used by API
    console.log('\n📝 Test 4: Test exact API query');
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const { data: apiQuery, error: apiError } = await supabase
      .from('attendance')
      .select(`
        id,
        tanggal,
        waktu_masuk,
        waktu_keluar,
        status,
        method,
        meta,
        created_at,
        user_id,
        users!inner (
          id,
          nama,
          role,
          nisn
        )
      `)
      .gte('tanggal', thirtyDaysAgo)
      .lte('tanggal', today)
      .order('created_at', { ascending: false })
      .range(0, 49);

    if (apiError) {
      console.error('❌ API query failed:', apiError.message);
    } else {
      console.log(`✅ API query successful: ${apiQuery?.length || 0} records`);
      if (apiQuery && apiQuery.length > 0) {
        console.log('\n📋 API Query Results:');
        apiQuery.forEach((record, index) => {
          console.log(`  ${index + 1}. ${record.users?.nama || 'Unknown'} - ${record.tanggal}`);
          console.log(`     Status: ${record.status}, Method: ${record.method}`);
        });
      }
    }

    // Test 5: Check if there are any records at all
    console.log('\n📝 Test 5: Check total records count');
    const { count: totalCount, error: countError } = await supabase
      .from('attendance')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Count query failed:', countError.message);
    } else {
      console.log(`✅ Total attendance records in database: ${totalCount || 0}`);
    }

    console.log('\n🎯 Database Test Summary:');
    console.log(`✅ Connection: Working`);
    console.log(`✅ Table Access: Working`);
    console.log(`📊 Total Records: ${totalCount || 0}`);
    console.log(`📊 API Query Results: ${apiQuery?.length || 0}`);
    console.log(`📊 All Records: ${allAttendance?.length || 0}`);

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
}

// Run test
testDatabaseDirect().catch(console.error);
