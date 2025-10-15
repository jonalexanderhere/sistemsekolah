#!/usr/bin/env node

/**
 * Test Database Connection
 * Test koneksi ke Supabase dan cek tabel yang ada
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testing Database Connection...\n');

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kmmdnlbbeezsweqsxqzv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbWRubGJiZWV6c3dlcXN4cXp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQwNTU2MCwiZXhwIjoyMDc0OTgxNTYwfQ.TZzM-jc-AigFxJw6fOnIUKzk_x606gCwRR0lS-UUqh0';

console.log('📊 Environment Variables:');
console.log('   SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('   SERVICE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  try {
    console.log('\n🔗 Testing Supabase Connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Connection Error:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('📊 Users count:', data || 0);
    
    return true;
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
    return false;
  }
}

async function checkTables() {
  console.log('\n📋 Checking Required Tables...');
  
  const tables = [
    'users',
    'attendance', 
    'grades',
    'exams',
    'questions',
    'exam_results',
    'pengumuman',
    'notifications',
    'system_logs',
    'classes',
    'class_students'
  ];
  
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        results[table] = { exists: false, error: error.message };
      } else {
        results[table] = { exists: true, count: data || 0 };
      }
    } catch (err) {
      results[table] = { exists: false, error: err.message };
    }
  }
  
  // Display results
  for (const [table, result] of Object.entries(results)) {
    if (result.exists) {
      console.log(`✅ ${table}: ${result.count} records`);
    } else {
      console.log(`❌ ${table}: ${result.error}`);
    }
  }
  
  return results;
}

async function testSpecificQueries() {
  console.log('\n🧪 Testing Specific Queries...');
  
  // Test users query
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, nama, role')
      .limit(5);
    
    if (error) {
      console.log('❌ Users query failed:', error.message);
    } else {
      console.log('✅ Users query successful:', data?.length || 0, 'records');
    }
  } catch (err) {
    console.log('❌ Users query error:', err.message);
  }
  
  // Test attendance query
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('id, user_id, tanggal, status')
      .limit(5);
    
    if (error) {
      console.log('❌ Attendance query failed:', error.message);
    } else {
      console.log('✅ Attendance query successful:', data?.length || 0, 'records');
    }
  } catch (err) {
    console.log('❌ Attendance query error:', err.message);
  }
  
  // Test pengumuman query
  try {
    const { data, error } = await supabase
      .from('pengumuman')
      .select('id, judul, isi')
      .limit(5);
    
    if (error) {
      console.log('❌ Pengumuman query failed:', error.message);
    } else {
      console.log('✅ Pengumuman query successful:', data?.length || 0, 'records');
    }
  } catch (err) {
    console.log('❌ Pengumuman query error:', err.message);
  }
}

async function main() {
  console.log('🚀 Starting Database Connection Test...\n');
  
  const connected = await testConnection();
  
  if (!connected) {
    console.log('\n❌ Cannot proceed with table checks due to connection failure');
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your .env.local file');
    console.log('2. Verify Supabase credentials');
    console.log('3. Run: npm run setup-database-v3');
    return;
  }
  
  const tableResults = await checkTables();
  await testSpecificQueries();
  
  console.log('\n📊 Test Summary:');
  const existingTables = Object.values(tableResults).filter(r => r.exists).length;
  const totalTables = Object.keys(tableResults).length;
  
  console.log(`✅ Tables existing: ${existingTables}/${totalTables}`);
  
  if (existingTables < totalTables) {
    console.log('\n🔧 Missing tables detected. Run:');
    console.log('   npm run setup-database-v3');
  } else {
    console.log('\n🎉 All tables exist! Database is ready.');
  }
}

main().catch(console.error);
