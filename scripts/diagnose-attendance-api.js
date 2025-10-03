#!/usr/bin/env node

/**
 * Diagnostic script for attendance API issues
 * Run with: node scripts/diagnose-attendance-api.js
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://sistemsekolah.vercel.app';

console.log('🔍 Diagnosing Attendance API Issues...\n');

async function makeRequest(url, description) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    
    console.log(`📡 Testing: ${description}`);
    console.log(`   URL: ${url}`);
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);
        
        try {
          const jsonData = JSON.parse(data);
          console.log(`   Response: ${JSON.stringify(jsonData, null, 2)}`);
        } catch (e) {
          console.log(`   Response (raw): ${data.substring(0, 200)}...`);
        }
        
        console.log('');
        resolve({ status: res.statusCode, data, headers: res.headers });
      });
    });
    
    req.on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}`);
      console.log('');
      resolve({ error: err.message });
    });
    
    req.setTimeout(10000, () => {
      console.log(`   ⏰ Timeout after 10 seconds`);
      req.destroy();
      resolve({ error: 'Timeout' });
    });
  });
}

async function runDiagnostics() {
  console.log('🔧 Environment Check:');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Node Version: ${process.version}`);
  console.log(`   Platform: ${process.platform}`);
  console.log('');

  // Test 1: Basic connectivity
  console.log('🧪 Test 1: Basic Connectivity');
  await makeRequest(`${BASE_URL}/api/test-db`, 'Database Connection Test');

  // Test 2: Attendance API with different parameters
  console.log('🧪 Test 2: Attendance API Tests');
  
  // Test with date range
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  await makeRequest(
    `${BASE_URL}/api/attendance/list?startDate=${thirtyDaysAgo}&endDate=${today}&limit=10`,
    'Attendance API with date range'
  );

  // Test with specific date
  await makeRequest(
    `${BASE_URL}/api/attendance/list?date=${today}&limit=10`,
    'Attendance API with specific date'
  );

  // Test without parameters
  await makeRequest(
    `${BASE_URL}/api/attendance/list?limit=10`,
    'Attendance API without date filters'
  );

  console.log('✅ Diagnosis complete!');
  console.log('\n📋 Common Issues and Solutions:');
  console.log('1. 500 Error - Check Supabase environment variables');
  console.log('2. Database connection issues - Verify SUPABASE_SERVICE_ROLE_KEY');
  console.log('3. Table not found - Run database migration scripts');
  console.log('4. Permission issues - Check RLS policies in Supabase');
  console.log('5. Query timeout - Check database performance and indexes');
}

runDiagnostics().catch(console.error);
