#!/usr/bin/env node

/**
 * Test All API Endpoints
 * Comprehensive testing of all API routes to ensure V3 connection
 */

async function testAllEndpoints() {
  console.log('🔍 Testing All API Endpoints...\n');
  
  const baseUrl = 'https://sistemsekolah.vercel.app/api';
  const endpoints = [
    // Auth endpoints
    { method: 'GET', path: '/auth/login', name: 'Login API' },
    { method: 'POST', path: '/auth/login', name: 'Login POST', body: { nisn: '2024001' } },
    
    // User endpoints
    { method: 'GET', path: '/users/list', name: 'Users List' },
    { method: 'GET', path: '/users/list?role=siswa', name: 'Students List' },
    { method: 'GET', path: '/users/list?role=guru', name: 'Teachers List' },
    { method: 'GET', path: '/users/list?role=admin', name: 'Admins List' },
    
    // Attendance endpoints
    { method: 'GET', path: '/attendance/list', name: 'Attendance List' },
    { method: 'GET', path: '/attendance/list?limit=10', name: 'Attendance List (limit 10)' },
    { method: 'GET', path: '/attendance/settings', name: 'Attendance Settings' },
    { method: 'POST', path: '/attendance/mark', name: 'Mark Attendance', body: { user_id: 'test', status: 'hadir' } },
    
    // QR endpoints
    { method: 'GET', path: '/qr/generate?studentId=2024001', name: 'QR Generate' },
    { method: 'POST', path: '/qr/scan', name: 'QR Scan', body: { qrData: 'STUDENT_2024001' } },
    
    // Exam endpoints
    { method: 'GET', path: '/exams/list', name: 'Exams List' },
    { method: 'GET', path: '/exams/list?limit=5', name: 'Exams List (limit 5)' },
    { method: 'POST', path: '/exams/create', name: 'Create Exam', body: { title: 'Test Exam', subject: 'Test' } },
    
    // Grade endpoints
    { method: 'GET', path: '/grades/list', name: 'Grades List' },
    { method: 'GET', path: '/grades/list?limit=5', name: 'Grades List (limit 5)' },
    
    // Question endpoints
    { method: 'GET', path: '/questions/list', name: 'Questions List' },
    { method: 'GET', path: '/questions/list?limit=5', name: 'Questions List (limit 5)' },
    
    // Announcement endpoints
    { method: 'GET', path: '/announcements/list', name: 'Announcements List' },
    { method: 'GET', path: '/announcements/list?limit=5', name: 'Announcements List (limit 5)' },
    
    // System endpoints
    { method: 'GET', path: '/system/log', name: 'System Log' },
    { method: 'POST', path: '/system/log', name: 'System Log POST', body: { action: 'test', details: 'test log' } },
    
    // Test endpoints
    { method: 'GET', path: '/test', name: 'Test API' },
    { method: 'GET', path: '/test-db', name: 'Test Database' }
  ];

  const results = {
    success: 0,
    failed: 0,
    localStorage: 0,
    supabase: 0,
    errors: []
  };

  for (const endpoint of endpoints) {
    try {
      console.log(`📝 Testing ${endpoint.name}...`);
      
      const options = {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (endpoint.body) {
        options.body = JSON.stringify(endpoint.body);
      }
      
      const response = await fetch(`${baseUrl}${endpoint.path}`, options);
      const data = await response.json();
      
      if (data.success) {
        results.success++;
        console.log(`  ✅ Success: ${data.source || 'unknown'}`);
        
        if (data.source === 'localStorage' || data.source === 'fallback') {
          results.localStorage++;
          console.log(`  ⚠️  Using fallback: ${data.source}`);
        } else if (data.source === 'supabase') {
          results.supabase++;
        }
      } else {
        results.failed++;
        console.log(`  ❌ Failed: ${data.error || 'Unknown error'}`);
        results.errors.push({
          endpoint: endpoint.name,
          error: data.error,
          details: data.details
        });
      }
      
      // Log record count if available
      if (data.data && Array.isArray(data.data)) {
        console.log(`  📊 Records: ${data.data.length}`);
      }
      
    } catch (error) {
      results.failed++;
      console.log(`  ❌ Error: ${error.message}`);
      results.errors.push({
        endpoint: endpoint.name,
        error: error.message
      });
    }
    
    console.log(''); // Empty line for readability
  }

  console.log('🎯 Test Results Summary:');
  console.log(`✅ Successful: ${results.success}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Using localStorage/fallback: ${results.localStorage}`);
  console.log(`✅ Using Supabase: ${results.supabase}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors Found:');
    results.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.endpoint}: ${error.error}`);
    });
  }
  
  console.log('\n📊 Connection Status:');
  if (results.localStorage > 0) {
    console.log('⚠️  Some endpoints are using localStorage fallback');
    console.log('   This indicates Supabase connection issues');
  } else {
    console.log('✅ All endpoints using Supabase database');
  }
  
  console.log('\n🔧 Recommendations:');
  if (results.localStorage > 0) {
    console.log('1. Check environment variables in production');
    console.log('2. Verify Supabase service key is correct');
    console.log('3. Check database connection status');
    console.log('4. Clear any cached responses');
  } else {
    console.log('✅ All endpoints properly connected to V3 database');
  }
}

// Run test
testAllEndpoints().catch(console.error);
