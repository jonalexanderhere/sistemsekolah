#!/usr/bin/env node

/**
 * Simple Database Test
 * Test koneksi ke Supabase dengan kredensial hardcoded
 */

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Simple Database Connection Test...\n');

// Use hardcoded credentials from the code
const supabaseUrl = 'https://kmmdnlbbeezsweqsxqzv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbWRubGJiZWV6c3dlcXN4cXp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQwNTU2MCwiZXhwIjoyMDc0OTgxNTYwfQ.TZzM-jc-AigFxJw6fOnIUKzk_x606gCwRR0lS-UUqh0';

console.log('📊 Using hardcoded credentials:');
console.log('   URL:', supabaseUrl);
console.log('   Service Key:', supabaseServiceKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  try {
    console.log('\n🔗 Testing Supabase Connection...');
    
    // Test basic connection with a simple query
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Connection Error:', error.message);
      console.log('❌ Error Code:', error.code);
      console.log('❌ Error Details:', error.details);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('📊 Users count:', data || 0);
    return true;
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
    console.log('❌ Error type:', err.constructor.name);
    return false;
  }
}

async function checkTables() {
  console.log('\n📋 Checking Tables...');
  
  const tables = ['users', 'attendance', 'pengumuman', 'exams', 'grades'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: ${data || 0} records`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }
}

async function main() {
  const connected = await testConnection();
  
  if (connected) {
    await checkTables();
    console.log('\n🎉 Database connection test completed!');
  } else {
    console.log('\n❌ Database connection failed!');
    console.log('\n🔧 Possible solutions:');
    console.log('1. Check if Supabase project is active');
    console.log('2. Verify service role key is correct');
    console.log('3. Check network connectivity');
    console.log('4. Run database schema setup');
  }
}

main().catch(console.error);
