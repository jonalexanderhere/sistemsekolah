#!/usr/bin/env node

/**
 * Check Student Data in Database
 * Verify student data exists for QR scanning
 */

const https = require('https');

console.log('🔍 Checking Student Data in Database...\n');

async function checkStudentData() {
  try {
    console.log('👥 Fetching all students...');
    
    const response = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'sistemsekolah.vercel.app',
        port: 443,
        path: '/api/users/list?role=siswa&limit=100',
        method: 'GET'
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            body: data
          });
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.end();
    });

    console.log(`📊 Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      try {
        const result = JSON.parse(response.body);
        if (result.success) {
          console.log(`✅ Found ${result.data.length} students:`);
          
          result.data.forEach((student, index) => {
            console.log(`  ${index + 1}. ${student.nama} (NISN: ${student.nisn})`);
          });
          
          // Check for specific student
          const targetStudent = result.data.find(s => s.nisn === '2024001');
          if (targetStudent) {
            console.log(`\n✅ Target student found: ${targetStudent.nama} (${targetStudent.nisn})`);
            console.log(`   ID: ${targetStudent.id}`);
            console.log(`   Role: ${targetStudent.role}`);
            console.log(`   Class: ${targetStudent.class_name}`);
          } else {
            console.log(`\n❌ Target student with NISN 2024001 not found`);
            console.log(`   Available NISNs: ${result.data.map(s => s.nisn).join(', ')}`);
          }
          
        } else {
          console.log(`❌ API Error: ${result.error}`);
        }
      } catch (e) {
        console.log(`⚠️  Response not JSON: ${response.body.substring(0, 200)}`);
      }
    } else {
      console.log(`❌ HTTP Error: ${response.statusCode}`);
    }
    
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`);
  }
}

async function testQRScan() {
  try {
    console.log('\n📱 Testing QR Scan API...');
    
    const response = await new Promise((resolve, reject) => {
      const postData = JSON.stringify({ qrData: 'STUDENT_2024001' });
      
      const req = https.request({
        hostname: 'sistemsekolah.vercel.app',
        port: 443,
        path: '/api/qr/scan',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            body: data
          });
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.write(postData);
      req.end();
    });

    console.log(`📊 QR Scan Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      try {
        const result = JSON.parse(response.body);
        if (result.success) {
          console.log(`✅ QR Scan successful:`);
          console.log(`   Student: ${result.data.student.nama}`);
          console.log(`   NISN: ${result.data.student.nisn}`);
          console.log(`   Attendance: ${result.data.attendance.status}`);
        } else {
          console.log(`❌ QR Scan failed: ${result.error}`);
        }
      } catch (e) {
        console.log(`⚠️  QR Response not JSON: ${response.body.substring(0, 200)}`);
      }
    } else {
      console.log(`❌ QR Scan HTTP Error: ${response.statusCode}`);
      console.log(`   Response: ${response.body.substring(0, 200)}`);
    }
    
  } catch (error) {
    console.log(`❌ QR Scan Network Error: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 Starting Student Data Check...\n');
  
  await checkStudentData();
  await testQRScan();
  
  console.log('\n📊 Analysis:');
  console.log('1. Check if student data exists in database');
  console.log('2. Verify QR scan API is working');
  console.log('3. Identify any missing data or API issues');
  
  console.log('\n🔧 If QR scan fails:');
  console.log('1. Ensure student data exists with correct NISN');
  console.log('2. Check QR scan API implementation');
  console.log('3. Verify database connection');
  console.log('4. Test with different student NISN');
}

main().catch(console.error);
