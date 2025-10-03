#!/usr/bin/env node

/**
 * Test Camera Functionality Script
 * Tests camera access and face recognition components
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

console.log('🎥 Testing Camera Functionality...\n');

async function testPageAccess(url, description) {
  return new Promise((resolve) => {
    console.log(`📡 Testing: ${description}`);
    console.log(`   URL: ${url}`);
    
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          console.log(`   ✅ ${description} - Accessible`);
          
          // Check if page contains camera-related content
          if (data.includes('FaceRecognition') || data.includes('camera') || data.includes('Kamera')) {
            console.log(`   ✅ Camera components detected`);
          } else {
            console.log(`   ⚠️  Camera components not detected in HTML`);
          }
        } else {
          console.log(`   ❌ ${description} - Not accessible`);
        }
        
        console.log('');
        resolve({ status: res.statusCode, accessible: res.statusCode === 200 });
      });
    });
    
    req.on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}`);
      console.log('');
      resolve({ error: err.message, accessible: false });
    });
    
    req.setTimeout(5000, () => {
      console.log(`   ⏰ Timeout after 5 seconds`);
      req.destroy();
      resolve({ error: 'Timeout', accessible: false });
    });
  });
}

async function testCameraRequirements() {
  console.log('🔍 Testing Camera Requirements:');
  console.log('==============================');
  
  // Test 1: HTTPS requirement
  const isHttps = BASE_URL.startsWith('https');
  console.log(`${isHttps ? '✅' : '⚠️ '} HTTPS: ${isHttps ? 'Using HTTPS' : 'Using HTTP (may cause camera issues)'}`);
  
  // Test 2: Localhost access
  const isLocalhost = BASE_URL.includes('localhost') || BASE_URL.includes('127.0.0.1');
  console.log(`${isLocalhost ? '✅' : '⚠️ '} Localhost: ${isLocalhost ? 'Using localhost (camera should work)' : 'Not localhost (may need HTTPS)'}`);
  
  console.log('');
}

async function runCameraTests() {
  console.log('🧪 Camera Functionality Tests');
  console.log('=============================');
  
  // Test camera requirements
  await testCameraRequirements();
  
  // Test pages
  const pages = [
    { url: `${BASE_URL}/face-register`, name: 'Face Registration Page' },
    { url: `${BASE_URL}/face-attendance`, name: 'Face Attendance Page' },
    { url: `${BASE_URL}/`, name: 'Home Page' }
  ];
  
  const results = [];
  
  for (const page of pages) {
    const result = await testPageAccess(page.url, page.name);
    results.push({ ...page, ...result });
  }
  
  // Summary
  console.log('📊 Test Summary');
  console.log('================');
  
  const accessiblePages = results.filter(r => r.accessible).length;
  const totalPages = results.length;
  
  console.log(`Pages Accessible: ${accessiblePages}/${totalPages}`);
  
  if (accessiblePages === totalPages) {
    console.log('✅ All pages are accessible!');
  } else {
    console.log('⚠️  Some pages are not accessible');
  }
  
  console.log('\n💡 Camera Setup Instructions:');
  console.log('============================');
  console.log('1. Open browser to http://localhost:3000/face-register');
  console.log('2. Click "Mulai Kamera" button');
  console.log('3. Allow camera permission when prompted');
  console.log('4. Check browser console for camera logs');
  console.log('5. If camera doesn\'t work, try:');
  console.log('   - Use HTTPS (https://localhost:3000)');
  console.log('   - Check browser camera permissions');
  console.log('   - Try different browser (Chrome recommended)');
  
  console.log('\n🔧 Troubleshooting:');
  console.log('==================');
  console.log('If camera still doesn\'t work:');
  console.log('1. Check browser console for errors');
  console.log('2. Verify camera is not used by other applications');
  console.log('3. Try incognito/private browsing mode');
  console.log('4. Check browser camera settings');
  console.log('5. Restart browser and try again');
  
  console.log('\n✅ Camera functionality test completed!');
}

runCameraTests().catch(console.error);
