#!/usr/bin/env node

/**
 * API Routes Test Script
 * Tests all API routes to ensure they don't return 500 errors
 */

const http = require('http');

const routes = [
  '/api/test-db',
  '/api/users/list?limit=1',
  '/api/attendance/list?limit=1',
  '/api/announcements/list?limit=1',
  '/api/faces/list?limit=1'
];

async function testRoute(route) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: route,
      method: 'GET',
      timeout: 10000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          route,
          status: res.statusCode,
          success: res.statusCode < 500, // Accept 4xx as valid responses
          data: data.substring(0, 200) + (data.length > 200 ? '...' : '')
        });
      });
    });

    req.on('error', () => {
      resolve({
        route,
        status: 'CONNECTION_ERROR',
        success: false,
        data: 'Connection failed'
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        route,
        status: 'TIMEOUT',
        success: false,
        data: 'Request timed out'
      });
    });

    req.end();
  });
}

async function testAllRoutes() {
  console.log('🧪 Testing API routes...\n');

  const results = [];
  for (const route of routes) {
    console.log(`Testing: ${route}`);
    const result = await testRoute(route);
    results.push(result);

    if (result.success) {
      console.log(`✅ ${route}: ${result.status} - ${result.data}`);
    } else {
      console.log(`❌ ${route}: ${result.status} - ${result.data}`);
    }
  }

  const successCount = results.filter(r => r.success).length;
  console.log(`\n📊 Test Results: ${successCount}/${results.length} routes working`);

  if (successCount === results.length) {
    console.log('🎉 All API routes are working correctly!');
    console.log('\n💡 Note: Some routes may return 404/401 if no data exists, which is expected.');
  } else {
    console.log('\n⚠️  Some routes have issues. Check the errors above.');
    console.log('\n🔧 Common fixes:');
    console.log('1. Update .env.local with correct Supabase credentials');
    console.log('2. Run database setup script');
    console.log('3. Check if Next.js dev server is running');
  }

  return results;
}

// Run tests if this file is executed directly
if (require.main === module) {
  console.log('🚀 Starting API route tests...\n');
  console.log('💡 Make sure Next.js dev server is running on port 3000\n');

  testAllRoutes()
    .then(() => {
      console.log('\n✨ API route testing completed!');
    })
    .catch(console.error);
}

module.exports = { testAllRoutes };
