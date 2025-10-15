#!/usr/bin/env node

/**
 * Test Production Login
 * Test login langsung di website production
 */

const https = require('https');

console.log('🔍 Testing Production Login...\n');

async function testProductionLogin() {
  const testCredentials = [
    { identitas: 'ADMIN001', type: 'Admin' },
    { nisn: '2024001', type: 'Student' },
    { nip: 'GURU001', type: 'Teacher' }
  ];

  for (const cred of testCredentials) {
    try {
      console.log(`🧪 Testing ${cred.type} login...`);
      
      const postData = JSON.stringify(cred);
      
      const options = {
        hostname: 'sistemsekolah.vercel.app',
        port: 443,
        path: '/api/auth/login',
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
              headers: res.headers,
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
          const data = JSON.parse(response.body);
          console.log(`✅ ${cred.type} login successful:`, data);
        } catch (e) {
          console.log(`⚠️  ${cred.type} response (not JSON):`, response.body.substring(0, 100));
        }
      } else {
        console.log(`❌ ${cred.type} login failed:`, response.body.substring(0, 200));
      }
      
    } catch (error) {
      console.log(`❌ ${cred.type} error:`, error.message);
    }
    
    console.log('---');
  }
}

async function testWebsiteAccess() {
  try {
    console.log('🌐 Testing website access...');
    
    const options = {
      hostname: 'sistemsekolah.vercel.app',
      port: 443,
      path: '/',
      method: 'GET'
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

      req.end();
    });

    console.log(`📊 Website Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log('✅ Website is accessible');
    } else {
      console.log('❌ Website access failed');
    }
    
  } catch (error) {
    console.log('❌ Website error:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting Production Test...\n');
  
  await testWebsiteAccess();
  console.log('');
  await testProductionLogin();
  
  console.log('\n📊 Test Summary:');
  console.log('1. Check if website is accessible');
  console.log('2. Test API login endpoints');
  console.log('3. Verify database connection in production');
  
  console.log('\n🔧 If login fails:');
  console.log('1. Check Vercel deployment logs');
  console.log('2. Verify environment variables');
  console.log('3. Check database connection');
}

main().catch(console.error);
