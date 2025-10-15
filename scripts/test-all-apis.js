#!/usr/bin/env node

/**
 * Test All API Endpoints
 * Comprehensive test of all API routes
 */

const https = require('https');

console.log('🔍 Testing All API Endpoints...\n');

const API_BASE = 'sistemsekolah.vercel.app';

async function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      const postData = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: data,
          path: path,
          method: method
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testAPI(name, path, method = 'GET', body = null) {
  try {
    console.log(`🧪 Testing ${name}...`);
    const response = await makeRequest(path, method, body);
    
    console.log(`📊 Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      try {
        const data = JSON.parse(response.body);
        if (data.success) {
          console.log(`✅ ${name}: SUCCESS`);
          if (data.data && Array.isArray(data.data)) {
            console.log(`   📊 Records: ${data.data.length}`);
          }
        } else {
          console.log(`⚠️  ${name}: API Error - ${data.error || 'Unknown error'}`);
        }
      } catch (e) {
        console.log(`⚠️  ${name}: Response not JSON`);
      }
    } else if (response.statusCode === 404) {
      console.log(`❌ ${name}: NOT FOUND (404)`);
    } else if (response.statusCode === 500) {
      console.log(`❌ ${name}: SERVER ERROR (500)`);
      try {
        const error = JSON.parse(response.body);
        console.log(`   Error: ${error.error || 'Unknown error'}`);
      } catch (e) {
        console.log(`   Raw error: ${response.body.substring(0, 100)}`);
      }
    } else {
      console.log(`⚠️  ${name}: Status ${response.statusCode}`);
    }
    
  } catch (error) {
    console.log(`❌ ${name}: Network Error - ${error.message}`);
  }
  
  console.log('---');
}

async function main() {
  console.log('🚀 Starting Comprehensive API Test...\n');
  
  // Test Authentication APIs
  console.log('🔐 AUTHENTICATION APIs:');
  await testAPI('Login API', '/api/auth/login', 'POST', { identitas: 'ADMIN001' });
  await testAPI('Test API', '/api/test');
  
  // Test User Management APIs
  console.log('👥 USER MANAGEMENT APIs:');
  await testAPI('Users List', '/api/users/list');
  await testAPI('Users List (Students)', '/api/users/list?role=siswa');
  await testAPI('Users List (Teachers)', '/api/users/list?role=guru');
  
  // Test Attendance APIs
  console.log('📅 ATTENDANCE APIs:');
  await testAPI('Attendance List', '/api/attendance/list');
  await testAPI('Attendance Settings', '/api/attendance/settings');
  await testAPI('Attendance Mark', '/api/attendance/mark', 'POST', {
    user_id: '550e8400-e29b-41d4-a716-446655440003',
    status: 'hadir',
    method: 'qr_code'
  });
  
  // Test QR Code APIs
  console.log('📱 QR CODE APIs:');
  await testAPI('QR Scan', '/api/qr/scan', 'POST', { qrData: 'STUDENT_2024001' });
  
  // Test Exam APIs
  console.log('📝 EXAM APIs:');
  await testAPI('Exams List', '/api/exams/list');
  await testAPI('Exams Create', '/api/exams/create', 'POST', {
    title: 'Test Exam',
    subject: 'Mathematics',
    duration_minutes: 60,
    total_questions: 10,
    max_score: 100
  });
  
  // Test Question APIs
  console.log('❓ QUESTION APIs:');
  await testAPI('Questions List', '/api/questions/list');
  
  // Test Grade APIs
  console.log('📊 GRADE APIs:');
  await testAPI('Grades List', '/api/grades/list');
  await testAPI('Grades Create', '/api/grades/list', 'POST', {
    student_id: '550e8400-e29b-41d4-a716-446655440003',
    teacher_id: '550e8400-e29b-41d4-a716-446655440002',
    assignment_name: 'Test Assignment',
    subject: 'Mathematics',
    grade: 85,
    max_grade: 100
  });
  
  // Test Announcement APIs
  console.log('📢 ANNOUNCEMENT APIs:');
  await testAPI('Announcements List', '/api/announcements/list');
  
  // Test System APIs
  console.log('⚙️ SYSTEM APIs:');
  await testAPI('System Log', '/api/system/log');
  
  console.log('\n📊 Test Summary:');
  console.log('✅ = Working correctly');
  console.log('⚠️  = Working with warnings');
  console.log('❌ = Not working (404/500 errors)');
  
  console.log('\n🔧 Common Issues:');
  console.log('• 404 errors: API route not found or not deployed');
  console.log('• 500 errors: Database connection or schema issues');
  console.log('• Network errors: Connection problems');
  
  console.log('\n📝 Next Steps:');
  console.log('1. Fix any 404 errors by checking route files');
  console.log('2. Fix any 500 errors by checking database schema');
  console.log('3. Test individual APIs that failed');
  console.log('4. Deploy fixes to production');
}

main().catch(console.error);
