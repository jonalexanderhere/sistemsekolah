#!/usr/bin/env node

/**
 * Complete Test Suite for SISFOTJKT2
 * Tests all components, APIs, and functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 SISFOTJKT2 - Complete Test Suite\n');

// Test Results
const results = {
  timestamp: new Date().toISOString(),
  environment: {},
  files: {},
  apis: {},
  components: {},
  database: {},
  camera: {},
  summary: {}
};

// Helper functions
function checkFile(filePath) {
  return fs.existsSync(filePath);
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

function checkDirectory(dirPath) {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch (error) {
    return false;
  }
}

// Test 1: Environment Variables
console.log('🔧 Test 1: Environment Variables');
console.log('================================');

const envVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_NAME'
];

envVars.forEach(envVar => {
  const value = process.env[envVar];
  const exists = !!value;
  const isPlaceholder = value && (value.includes('your_') || value.includes('_here'));
  
  results.environment[envVar] = {
    exists,
    isPlaceholder,
    hasRealValue: exists && !isPlaceholder
  };
  
  const status = exists ? (isPlaceholder ? '⚠️  Placeholder' : '✅ Set') : '❌ Missing';
  console.log(`${status} ${envVar}`);
});

console.log('');

// Test 2: Core Application Files
console.log('📱 Test 2: Core Application Files');
console.log('=================================');

const coreFiles = [
  'package.json',
  'next.config.js',
  'app/layout.tsx',
  'app/page.tsx',
  'lib/supabase.ts',
  'lib/faceapi.ts',
  'components/FaceRecognition.tsx'
];

coreFiles.forEach(file => {
  const exists = checkFile(file);
  results.files[file] = { exists };
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

console.log('');

// Test 3: API Endpoints
console.log('🔌 Test 3: API Endpoints');
console.log('=======================');

const apiFiles = [
  'app/api/attendance/list/route.ts',
  'app/api/attendance/mark/route.ts',
  'app/api/attendance/settings/route.ts',
  'app/api/auth/login/route.ts',
  'app/api/users/list/route.ts',
  'app/api/faces/register/route.ts',
  'app/api/faces/recognize/route.ts',
  'app/api/exams/list/route.ts',
  'app/api/exams/create/route.ts',
  'app/api/announcements/list/route.ts',
  'app/api/system/log/route.ts',
  'app/api/test-db/route.ts'
];

apiFiles.forEach(api => {
  const exists = checkFile(api);
  results.apis[api] = { exists };
  console.log(`${exists ? '✅' : '❌'} ${api}`);
});

console.log('');

// Test 4: Pages and UI Components
console.log('📄 Test 4: Pages and UI Components');
console.log('===================================');

const pages = [
  'app/face-attendance/page.tsx',
  'app/face-register/page.tsx',
  'app/attendance/page.tsx',
  'app/users/page.tsx',
  'app/settings/page.tsx',
  'app/teacher-dashboard/page.tsx',
  'app/admin-dashboard/page.tsx',
  'app/teacher-dashboard/exams/page.tsx'
];

pages.forEach(page => {
  const exists = checkFile(page);
  results.components[page] = { exists };
  console.log(`${exists ? '✅' : '❌'} ${page}`);
});

console.log('');

// Test 5: Face Recognition Models
console.log('👤 Test 5: Face Recognition Models');
console.log('=================================');

const modelFiles = [
  'public/models/face_landmark_68_model-shard1',
  'public/models/face_recognition_model-shard1',
  'public/models/face_recognition_model-shard2',
  'public/models/tiny_face_detector_model-shard1',
  'public/models/face_landmark_68_model-weights_manifest.json',
  'public/models/face_recognition_model-weights_manifest.json',
  'public/models/tiny_face_detector_model-weights_manifest.json'
];

modelFiles.forEach(model => {
  const exists = checkFile(model);
  results.camera[model] = { exists };
  console.log(`${exists ? '✅' : '❌'} ${model}`);
});

console.log('');

// Test 6: Database Schema Files
console.log('🗄️  Test 6: Database Schema Files');
console.log('==================================');

const schemaFiles = [
  'supabase/schema.sql',
  'supabase/enhanced-schema.sql',
  'supabase/complete-schema-v2.sql',
  'supabase-direct-setup.sql'
];

schemaFiles.forEach(schema => {
  const exists = checkFile(schema);
  results.database[schema] = { exists };
  console.log(`${exists ? '✅' : '❌'} ${schema}`);
});

console.log('');

// Test 7: Configuration Files
console.log('⚙️  Test 7: Configuration Files');
console.log('==============================');

const configFiles = [
  'tailwind.config.js',
  'tsconfig.json',
  'postcss.config.js',
  'vercel.json'
];

configFiles.forEach(config => {
  const exists = checkFile(config);
  results.files[config] = { exists };
  console.log(`${exists ? '✅' : '❌'} ${config}`);
});

console.log('');

// Test 8: Package Dependencies
console.log('📦 Test 8: Package Dependencies');
console.log('==============================');

const packageJson = readFile('package.json');
if (packageJson) {
  const pkg = JSON.parse(packageJson);
  const requiredDeps = [
    '@supabase/supabase-js',
    '@supabase/auth-helpers-nextjs',
    'face-api.js',
    'next',
    'react',
    'react-dom',
    'typescript',
    'tailwindcss'
  ];
  
  requiredDeps.forEach(dep => {
    const exists = pkg.dependencies && pkg.dependencies[dep];
    results.components[`dep_${dep}`] = { exists };
    console.log(`${exists ? '✅' : '❌'} ${dep}`);
  });
} else {
  console.log('❌ package.json not found');
}

console.log('');

// Test 9: Scripts and Utilities
console.log('🛠️  Test 9: Scripts and Utilities');
console.log('=================================');

const scripts = [
  'scripts/setup-database.js',
  'scripts/import-students.js',
  'scripts/download-models.js',
  'scripts/test-api-endpoints.js',
  'scripts/comprehensive-test.js',
  'scripts/setup-environment.js',
  'scripts/diagnose-attendance-api.js',
  'scripts/fix-attendance-schema.js'
];

scripts.forEach(script => {
  const exists = checkFile(script);
  results.components[script] = { exists };
  console.log(`${exists ? '✅' : '❌'} ${script}`);
});

console.log('');

// Generate Summary
console.log('📊 Test Summary');
console.log('===============');

const envIssues = Object.values(results.environment).filter(r => !r.hasRealValue).length;
const fileIssues = Object.values(results.files).filter(r => !r.exists).length;
const apiIssues = Object.values(results.apis).filter(r => !r.exists).length;
const componentIssues = Object.values(results.components).filter(r => !r.exists).length;
const cameraIssues = Object.values(results.camera).filter(r => !r.exists).length;
const dbIssues = Object.values(results.database).filter(r => !r.exists).length;

console.log(`Environment Issues: ${envIssues}`);
console.log(`Missing Files: ${fileIssues}`);
console.log(`Missing APIs: ${apiIssues}`);
console.log(`Missing Components: ${componentIssues}`);
console.log(`Camera Issues: ${cameraIssues}`);
console.log(`Database Issues: ${dbIssues}`);

const totalIssues = envIssues + fileIssues + apiIssues + componentIssues + cameraIssues + dbIssues;

console.log(`\nTotal Issues: ${totalIssues}`);

if (totalIssues === 0) {
  console.log('\n🎉 All tests passed! System is ready.');
} else {
  console.log('\n⚠️  Some issues found. See recommendations below.');
}

console.log('\n💡 Recommendations');
console.log('==================');

if (envIssues > 0) {
  console.log('\n🔧 Environment Setup:');
  console.log('   1. Update .env.local with real Supabase values');
  console.log('   2. Get SUPABASE_SERVICE_ROLE_KEY from Supabase dashboard');
  console.log('   3. Restart development server after changes');
}

if (cameraIssues > 0) {
  console.log('\n📷 Face Recognition Setup:');
  console.log('   1. Download face recognition models');
  console.log('   2. Run: node scripts/download-models.js');
  console.log('   3. Verify models are in public/models/ directory');
}

if (dbIssues > 0) {
  console.log('\n🗄️  Database Setup:');
  console.log('   1. Run database migration scripts');
  console.log('   2. Set up Supabase tables');
  console.log('   3. Configure RLS policies');
}

console.log('\n🚀 Next Steps:');
console.log('==============');
console.log('1. Fix environment variables (especially SUPABASE_SERVICE_ROLE_KEY)');
console.log('2. Run: npm install');
console.log('3. Run: npm run dev');
console.log('4. Test local endpoints');
console.log('5. Deploy to production');

// Save results
const resultsFile = 'test-results-complete.json';
fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
console.log(`\n📄 Complete test results saved to: ${resultsFile}`);

console.log('\n✅ Complete test suite finished!');
