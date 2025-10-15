#!/usr/bin/env node

/**
 * Test QR Scanner with Debugging
 * Detailed test of QR scanning functionality
 */

const https = require('https');

console.log('🔍 Testing QR Scanner with Debugging...\n');

async function testQRScanDetailed() {
  const testQRData = 'STUDENT_2024001';
  
  try {
    console.log(`📱 Testing QR Data: ${testQRData}`);
    
    const postData = JSON.stringify({ qrData: testQRData });
    
    const response = await new Promise((resolve, reject) => {
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
            body: data,
            headers: res.headers
          });
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.write(postData);
      req.end();
    });

    console.log(`📊 Response Status: ${response.statusCode}`);
    console.log(`📊 Response Headers:`, response.headers);
    
    if (response.statusCode === 200) {
      try {
        const result = JSON.parse(response.body);
        console.log(`📊 Full Response:`, JSON.stringify(result, null, 2));
        
        if (result.success) {
          console.log(`✅ QR Scan SUCCESS:`);
          console.log(`   Student: ${result.data.student.nama}`);
          console.log(`   NISN: ${result.data.student.nisn}`);
          console.log(`   ID: ${result.data.student.id}`);
          console.log(`   Class: ${result.data.student.class_name}`);
          console.log(`   Attendance Status: ${result.data.attendance.status}`);
          console.log(`   Attendance Time: ${result.data.attendance.waktu_masuk}`);
          console.log(`   Method: ${result.data.attendance.method}`);
        } else {
          console.log(`❌ QR Scan FAILED:`);
          console.log(`   Error: ${result.error}`);
          console.log(`   Details: ${result.details}`);
        }
      } catch (e) {
        console.log(`⚠️  Response not JSON:`, response.body);
      }
    } else {
      console.log(`❌ HTTP Error: ${response.statusCode}`);
      console.log(`   Response: ${response.body}`);
    }
    
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`);
  }
}

async function testMultipleQRData() {
  const testData = [
    'STUDENT_2024001',
    'STUDENT_2024002', 
    'STUDENT_2024003',
    'INVALID_QR',
    'STUDENT_INVALID'
  ];
  
  console.log('\n🧪 Testing Multiple QR Data...');
  
  for (const qrData of testData) {
    try {
      console.log(`\n📱 Testing: ${qrData}`);
      
      const postData = JSON.stringify({ qrData });
      
      const response = await new Promise((resolve, reject) => {
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

      if (response.statusCode === 200) {
        try {
          const result = JSON.parse(response.body);
          if (result.success) {
            console.log(`   ✅ SUCCESS: ${result.data.student.nama}`);
          } else {
            console.log(`   ❌ FAILED: ${result.error}`);
          }
        } catch (e) {
          console.log(`   ⚠️  Not JSON: ${response.body.substring(0, 100)}`);
        }
      } else {
        console.log(`   ❌ HTTP ${response.statusCode}: ${response.body.substring(0, 100)}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🚀 Starting QR Scanner Debug Test...\n');
  
  await testQRScanDetailed();
  await testMultipleQRData();
  
  console.log('\n📊 Debug Summary:');
  console.log('1. Tested QR scan API with detailed logging');
  console.log('2. Tested multiple QR data formats');
  console.log('3. Identified any issues with QR processing');
  
  console.log('\n🔧 If QR scan fails:');
  console.log('1. Check database connection');
  console.log('2. Verify student data exists');
  console.log('3. Check API error messages');
  console.log('4. Test with different QR formats');
}

main().catch(console.error);
