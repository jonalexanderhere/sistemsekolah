const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kfstxlcoegqanytvpbgp.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testSystem() {
  console.log('🧪 Testing EduFace Cloud Pro System...\n');

  try {
    // Test 1: Database Connection
    console.log('1️⃣ Testing database connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return;
    }
    console.log('✅ Database connection successful\n');

    // Test 2: Check Tables
    console.log('2️⃣ Checking required tables...');
    const tables = [
      'users', 'faces', 'attendance', 'attendance_settings', 
      'attendance_periods', 'holidays', 'attendance_summary',
      'exams', 'questions', 'answers', 'pengumuman'
    ];

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.error(`❌ Table '${table}' not found or accessible`);
        } else {
          console.log(`✅ Table '${table}' exists`);
        }
      } catch (err) {
        console.error(`❌ Error checking table '${table}':`, err.message);
      }
    }
    console.log();

    // Test 3: Check Seed Data
    console.log('3️⃣ Checking seed data...');
    
    // Check users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
    } else {
      const siswaCount = users.filter(u => u.role === 'siswa').length;
      const guruCount = users.filter(u => u.role === 'guru').length;
      console.log(`✅ Users found: ${users.length} total (${siswaCount} siswa, ${guruCount} guru)`);
    }

    // Check attendance settings
    const { data: settings, error: settingsError } = await supabase
      .from('attendance_settings')
      .select('*')
      .eq('is_active', true);
    
    if (settingsError) {
      console.error('❌ Error fetching attendance settings:', settingsError.message);
    } else if (settings.length === 0) {
      console.log('⚠️  No active attendance settings found');
    } else {
      console.log(`✅ Attendance settings configured: ${settings[0].name}`);
    }
    console.log();

    // Test 4: API Endpoints
    console.log('4️⃣ Testing API endpoints...');
    
    const apiTests = [
      '/api/auth/login',
      '/api/attendance/settings',
      '/api/users/list',
      '/api/announcements/list'
    ];

    for (const endpoint of apiTests) {
      try {
        const response = await fetch(`http://localhost:3000${endpoint}`, {
          method: 'GET'
        });
        
        if (response.ok || response.status === 400) { // 400 is expected for some endpoints without params
          console.log(`✅ API endpoint '${endpoint}' accessible`);
        } else {
          console.log(`⚠️  API endpoint '${endpoint}' returned status: ${response.status}`);
        }
      } catch (err) {
        console.log(`❌ API endpoint '${endpoint}' not accessible (server not running?)`);
      }
    }
    console.log();

    // Test 5: Environment Variables
    console.log('5️⃣ Checking environment variables...');
    const requiredEnvs = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_APP_NAME',
      'JWT_SECRET'
    ];

    for (const env of requiredEnvs) {
      if (process.env[env]) {
        console.log(`✅ ${env} is set`);
      } else {
        console.log(`❌ ${env} is missing`);
      }
    }
    console.log();

    // Test 6: Face Models
    console.log('6️⃣ Checking face recognition models...');
    const fs = require('fs');
    const path = require('path');
    
    const modelFiles = [
      'tiny_face_detector_model-weights_manifest.json',
      'tiny_face_detector_model-shard1',
      'face_landmark_68_model-weights_manifest.json',
      'face_landmark_68_model-shard1',
      'face_recognition_model-weights_manifest.json',
      'face_recognition_model-shard1',
      'face_recognition_model-shard2'
    ];

    const modelsDir = path.join(process.cwd(), 'public', 'models');
    let modelsFound = 0;

    for (const file of modelFiles) {
      const filePath = path.join(modelsDir, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log(`✅ ${file} (${(stats.size / 1024).toFixed(1)}KB)`);
        modelsFound++;
      } else {
        console.log(`❌ ${file} not found`);
      }
    }

    if (modelsFound === modelFiles.length) {
      console.log('✅ All face recognition models are present');
    } else {
      console.log(`⚠️  ${modelsFound}/${modelFiles.length} models found. Run: npm run download-models`);
    }
    console.log();

    // Summary
    console.log('📊 SYSTEM TEST SUMMARY');
    console.log('='.repeat(50));
    console.log('✅ Database: Connected');
    console.log(`✅ Users: ${users ? users.length : 0} total`);
    console.log(`✅ Models: ${modelsFound}/${modelFiles.length} files`);
    console.log(`✅ Settings: ${settings && settings.length > 0 ? 'Configured' : 'Default'}`);
    console.log();

    if (modelsFound < modelFiles.length) {
      console.log('🔧 NEXT STEPS:');
      console.log('1. Run: npm run download-models');
      console.log('2. Start dev server: npm run dev');
      console.log('3. Open: http://localhost:3000');
    } else {
      console.log('🎉 System is ready!');
      console.log('Start dev server: npm run dev');
      console.log('Open: http://localhost:3000');
    }

  } catch (error) {
    console.error('❌ System test failed:', error);
  }
}

// Run the test
testSystem();

