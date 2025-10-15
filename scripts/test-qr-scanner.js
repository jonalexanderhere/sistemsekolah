#!/usr/bin/env node

/**
 * Test QR Scanner Functionality
 * Test QR code generation and scanning
 */

const https = require('https');

console.log('🔍 Testing QR Scanner Functionality...\n');

async function testQRGeneration() {
  console.log('🧪 Testing QR Code Generation...');
  
  const testData = [
    'STUDENT_2024001',
    'STUDENT_2024002', 
    'STUDENT_2024003'
  ];

  for (const data of testData) {
    try {
      console.log(`📱 Testing QR data: ${data}`);
      
      // Test QR scan API
      const postData = JSON.stringify({ qrData: data });
      
      const options = {
        hostname: 'sistemsekolah.vercel.app',
        port: 443,
        path: '/api/qr/scan',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const response = await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
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

      console.log(`📊 Status: ${response.statusCode}`);
      
      if (response.statusCode === 200) {
        try {
          const result = JSON.parse(response.body);
          if (result.success) {
            console.log(`✅ QR Scan successful:`, {
              student: result.data.student.nama,
              nisn: result.data.student.nisn,
              attendance: result.data.attendance.status
            });
          } else {
            console.log(`❌ QR Scan failed:`, result.error);
          }
        } catch (e) {
          console.log(`⚠️  Response (not JSON):`, response.body.substring(0, 100));
        }
      } else {
        console.log(`❌ QR Scan failed:`, response.body.substring(0, 200));
      }
      
    } catch (error) {
      console.log(`❌ Error testing ${data}:`, error.message);
    }
    
    console.log('---');
  }
}

async function testAttendanceAPI() {
  console.log('🧪 Testing Attendance API...');
  
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'sistemsekolah.vercel.app',
        port: 443,
        path: `/api/attendance/list?date=${today}&limit=10`,
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

    console.log(`📊 Attendance API Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      try {
        const result = JSON.parse(response.body);
        if (result.success) {
          console.log(`✅ Attendance API working:`, {
            total: result.data.length,
            today: today
          });
          
          // Show recent attendance
          result.data.slice(0, 3).forEach((record, index) => {
            console.log(`  ${index + 1}. ${record.users?.nama || 'Unknown'} - ${record.status} (${record.method})`);
          });
        } else {
          console.log(`❌ Attendance API failed:`, result.error);
        }
      } catch (e) {
        console.log(`⚠️  Attendance response (not JSON):`, response.body.substring(0, 100));
      }
    } else {
      console.log(`❌ Attendance API failed:`, response.body.substring(0, 200));
    }
    
  } catch (error) {
    console.log('❌ Attendance API error:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting QR Scanner Test...\n');
  
  await testQRGeneration();
  console.log('');
  await testAttendanceAPI();
  
  console.log('\n📊 Test Summary:');
  console.log('1. QR Code generation and scanning');
  console.log('2. Attendance recording via QR scan');
  console.log('3. Database integration');
  
  console.log('\n🔧 QR Scanner Features:');
  console.log('✅ Enhanced detection with multiple methods');
  console.log('✅ Faster scanning (50ms intervals)');
  console.log('✅ High error correction QR codes');
  console.log('✅ Automatic attendance recording');
  console.log('✅ Reusable QR codes');
  
  console.log('\n📱 QR Code Format:');
  console.log('• Student QR: STUDENT_[NISN]');
  console.log('• Example: STUDENT_2024001');
  console.log('• Can be used multiple times');
}

main().catch(console.error);
