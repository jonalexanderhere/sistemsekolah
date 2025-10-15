#!/usr/bin/env node

/**
 * Test Production Environment Variables
 * Check if environment variables are properly set in production
 */

async function testProductionEnv() {
  console.log('🔍 Testing Production Environment...\n');
  
  try {
    // Test 1: Check if API is accessible
    console.log('📝 Test 1: API accessibility');
    const response = await fetch('https://sistemsekolah.vercel.app/api/test');
    const data = await response.json();
    
    console.log('📊 Test API Response:');
    console.log(`  Message: ${data.message || 'none'}`);
    console.log(`  Timestamp: ${data.timestamp || 'none'}`);

    // Test 2: Check database connection via API
    console.log('\n📝 Test 2: Database connection via API');
    const dbResponse = await fetch('https://sistemsekolah.vercel.app/api/test-db');
    const dbData = await dbResponse.json();
    
    console.log('📊 Database API Response:');
    console.log(`  Success: ${dbData.success || false}`);
    console.log(`  Message: ${dbData.message || 'none'}`);
    console.log(`  Tables: ${dbData.tables || 'none'}`);

    // Test 3: Check attendance API with debug
    console.log('\n📝 Test 3: Attendance API with debug');
    const attendanceResponse = await fetch('https://sistemsekolah.vercel.app/api/attendance/list?limit=5');
    const attendanceData = await attendanceResponse.json();
    
    console.log('📊 Attendance API Response:');
    console.log(`  Success: ${attendanceData.success || false}`);
    console.log(`  Source: ${attendanceData.source || 'unknown'}`);
    console.log(`  Records: ${attendanceData.data?.length || 0}`);
    console.log(`  Message: ${attendanceData.message || 'none'}`);
    console.log(`  Error: ${attendanceData.error || 'none'}`);
    console.log(`  Details: ${attendanceData.details || 'none'}`);

    // Test 4: Check users API
    console.log('\n📝 Test 4: Users API');
    const usersResponse = await fetch('https://sistemsekolah.vercel.app/api/users/list?limit=5');
    const usersData = await usersResponse.json();
    
    console.log('📊 Users API Response:');
    console.log(`  Success: ${usersData.success || false}`);
    console.log(`  Records: ${usersData.data?.length || 0}`);
    console.log(`  Message: ${usersData.message || 'none'}`);

    console.log('\n🎯 Production Environment Summary:');
    console.log(`✅ Test API: ${data.message ? 'Working' : 'Failed'}`);
    console.log(`✅ Database API: ${dbData.success ? 'Working' : 'Failed'}`);
    console.log(`✅ Attendance API: ${attendanceData.success ? 'Working' : 'Failed'}`);
    console.log(`✅ Users API: ${usersData.success ? 'Working' : 'Failed'}`);
    console.log(`📊 Attendance Records: ${attendanceData.data?.length || 0}`);
    console.log(`📊 User Records: ${usersData.data?.length || 0}`);

  } catch (error) {
    console.error('❌ Production test failed:', error.message);
  }
}

// Run test
testProductionEnv().catch(console.error);
