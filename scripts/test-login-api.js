#!/usr/bin/env node

/**
 * Test Login API
 * Test API login untuk memastikan berfungsi dengan baik
 */

const { createClient } = require('@supabase/supabase-js');

console.log('🔍 Testing Login API...\n');

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

async function testDatabaseConnection() {
  try {
    console.log('\n🔗 Testing Database Connection...');
    
    const { data, error } = await supabase
      .from('users')
      .select('id, nama, role, nisn, identitas')
      .limit(5);
    
    if (error) {
      console.log('❌ Database Error:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    console.log('📊 Users found:', data?.length || 0);
    
    if (data && data.length > 0) {
      console.log('👥 Sample users:');
      data.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.nama} (${user.role}) - NISN: ${user.nisn || 'N/A'} - Identitas: ${user.identitas || 'N/A'}`);
      });
    }
    
    return true;
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
    return false;
  }
}

async function testLoginCredentials() {
  console.log('\n🔐 Testing Login Credentials...');
  
  const testCredentials = [
    { identitas: 'ADMIN001', type: 'Admin' },
    { nisn: '2024001', type: 'Student' },
    { nip: 'GURU001', type: 'Teacher' }
  ];
  
  for (const cred of testCredentials) {
    try {
      let query = supabase.from('users').select('*');
      
      if (cred.identitas) {
        query = query.eq('identitas', cred.identitas);
      } else if (cred.nisn) {
        query = query.eq('nisn', cred.nisn);
      } else if (cred.nip) {
        query = query.eq('nip', cred.nip);
      }
      
      const { data, error } = await query.single();
      
      if (error) {
        console.log(`❌ ${cred.type} (${Object.values(cred)[0]}): ${error.message}`);
      } else if (data) {
        console.log(`✅ ${cred.type} (${Object.values(cred)[0]}): Found - ${data.nama}`);
      } else {
        console.log(`⚠️  ${cred.type} (${Object.values(cred)[0]}): Not found`);
      }
    } catch (err) {
      console.log(`❌ ${cred.type} (${Object.values(cred)[0]}): ${err.message}`);
    }
  }
}

async function testAPIEndpoint() {
  console.log('\n🌐 Testing API Endpoint...');
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identitas: 'ADMIN001'
      })
    });
    
    console.log('📊 Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response:', data);
    } else {
      const error = await response.text();
      console.log('❌ API Error:', error);
    }
  } catch (err) {
    console.log('❌ API Request failed:', err.message);
    console.log('💡 Make sure the development server is running: npm run dev');
  }
}

async function main() {
  console.log('🚀 Starting Login API Test...\n');
  
  const dbConnected = await testDatabaseConnection();
  
  if (dbConnected) {
    await testLoginCredentials();
    await testAPIEndpoint();
  }
  
  console.log('\n📊 Test Summary:');
  console.log('1. Check if database has user data');
  console.log('2. Verify API endpoint is accessible');
  console.log('3. Test with correct credentials');
  
  if (!dbConnected) {
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Run: npm run setup-database-v3');
    console.log('2. Check Supabase credentials');
    console.log('3. Verify database schema is set up');
  }
}

main().catch(console.error);
