#!/usr/bin/env node

/**
 * Test Attendance API Directly
 * Test the attendance API endpoint to check data retrieval
 */

async function testAttendanceAPI() {
  console.log('🔍 Testing Attendance API...\n');
  
  try {
    // Test 1: Basic API call
    console.log('📝 Test 1: Basic API call');
    const response = await fetch('https://sistemsekolah.vercel.app/api/attendance/list?limit=10');
    const data = await response.json();
    
    console.log('📊 API Response:');
    console.log(`  Success: ${data.success}`);
    console.log(`  Source: ${data.source || 'unknown'}`);
    console.log(`  Records: ${data.data?.length || 0}`);
    console.log(`  Message: ${data.message || 'none'}`);
    
    if (data.data && data.data.length > 0) {
      console.log('\n📋 Sample Records:');
      data.data.slice(0, 3).forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.users?.nama || 'Unknown'} - ${record.tanggal}`);
        console.log(`     Status: ${record.status}, Method: ${record.method}`);
      });
    }

    // Test 2: Today's attendance
    console.log('\n📝 Test 2: Today\'s attendance');
    const today = new Date().toISOString().split('T')[0];
    const todayResponse = await fetch(`https://sistemsekolah.vercel.app/api/attendance/list?date=${today}&limit=50`);
    const todayData = await todayResponse.json();
    
    console.log('📊 Today\'s API Response:');
    console.log(`  Success: ${todayData.success}`);
    console.log(`  Records: ${todayData.data?.length || 0}`);
    
    if (todayData.data && todayData.data.length > 0) {
      console.log('\n📋 Today\'s Records:');
      todayData.data.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.users?.nama || 'Unknown'} (${record.users?.nisn || 'N/A'})`);
        console.log(`     Time: ${record.waktu_masuk}, Status: ${record.status}`);
      });
    }

    // Test 3: Recent attendance (last 7 days)
    console.log('\n📝 Test 3: Recent attendance (last 7 days)');
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const recentResponse = await fetch(`https://sistemsekolah.vercel.app/api/attendance/list?startDate=${sevenDaysAgo}&limit=100`);
    const recentData = await recentResponse.json();
    
    console.log('📊 Recent API Response:');
    console.log(`  Success: ${recentData.success}`);
    console.log(`  Records: ${recentData.data?.length || 0}`);
    
    if (recentData.data && recentData.data.length > 0) {
      console.log('\n📋 Recent Records:');
      recentData.data.forEach((record, index) => {
        console.log(`  ${index + 1}. ${record.users?.nama || 'Unknown'} - ${record.tanggal}`);
        console.log(`     Status: ${record.status}, Method: ${record.method}`);
      });
    }

    console.log('\n🎯 API Test Summary:');
    console.log(`✅ Basic API: ${data.success ? 'Working' : 'Failed'}`);
    console.log(`✅ Today's API: ${todayData.success ? 'Working' : 'Failed'}`);
    console.log(`✅ Recent API: ${recentData.success ? 'Working' : 'Failed'}`);
    console.log(`📊 Total records found: ${data.data?.length || 0}`);
    console.log(`📅 Today's records: ${todayData.data?.length || 0}`);
    console.log(`📅 Recent records: ${recentData.data?.length || 0}`);

  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

// Run test
testAttendanceAPI().catch(console.error);
