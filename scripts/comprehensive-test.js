#!/usr/bin/env node

/**
 * Comprehensive Test Script for SISFOTJKT2 System
 * Tests all components, APIs, and functionality
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 SISFOTJKT2 - Comprehensive System Test\n');

// Test Results
const testResults = {
  environment: {},
  database: {},
  apis: {},
  components: {},
  camera: {},
  summary: {}
};

// Helper function to check if file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

// Helper function to read file content
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

// Test 1: Environment Variables
console.log('📋 Test 1: Environment Variables');
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
  const isPlaceholder = value && value.includes('your_') && value.includes('_here');
  
  testResults.environment[envVar] = {
    exists,
    isPlaceholder,
    hasValue: exists && !isPlaceholder
  };
  
  console.log(`${exists ? '✅' : '❌'} ${envVar}: ${exists ? (isPlaceholder ? '⚠️  Placeholder value' : '✅ Set') : '❌ Missing'}`);
});

console.log('');

// Test 2: File Structure
console.log('📁 Test 2: File Structure');
console.log('=========================');

const requiredFiles = [
  'package.json',
  'next.config.js',
  'lib/supabase.ts',
  'app/api/attendance/list/route.ts',
  'app/api/test-db/route.ts',
  'components/FaceRecognition.tsx',
  'app/face-attendance/page.tsx',
  'app/face-register/page.tsx'
];

requiredFiles.forEach(file => {
  const exists = fileExists(file);
  testResults.components[file] = { exists };
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

console.log('');

// Test 3: Package Dependencies
console.log('📦 Test 3: Package Dependencies');
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
    'react-dom'
  ];
  
  requiredDeps.forEach(dep => {
    const exists = pkg.dependencies && pkg.dependencies[dep];
    testResults.components[`dep_${dep}`] = { exists };
    console.log(`${exists ? '✅' : '❌'} ${dep}`);
  });
} else {
  console.log('❌ package.json not found');
}

console.log('');

// Test 4: Database Schema Files
console.log('🗄️  Test 4: Database Schema');
console.log('===========================');

const schemaFiles = [
  'supabase/schema.sql',
  'supabase/enhanced-schema.sql', 
  'supabase/complete-schema-v2.sql'
];

schemaFiles.forEach(file => {
  const exists = fileExists(file);
  testResults.database[file] = { exists };
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

console.log('');

// Test 5: API Endpoints
console.log('🔌 Test 5: API Endpoints');
console.log('=======================');

const apiEndpoints = [
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

apiEndpoints.forEach(endpoint => {
  const exists = fileExists(endpoint);
  testResults.apis[endpoint] = { exists };
  console.log(`${exists ? '✅' : '❌'} ${endpoint}`);
});

console.log('');

// Test 6: Face Recognition Components
console.log('👤 Test 6: Face Recognition Components');
console.log('=====================================');

const faceComponents = [
  'components/FaceRecognition.tsx',
  'lib/faceapi.ts',
  'public/models/face_landmark_68_model-shard1',
  'public/models/face_recognition_model-shard1',
  'public/models/tiny_face_detector_model-shard1'
];

faceComponents.forEach(component => {
  const exists = fileExists(component);
  testResults.camera[component] = { exists };
  console.log(`${exists ? '✅' : '❌'} ${component}`);
});

console.log('');

// Test 7: Pages and UI Components
console.log('📄 Test 7: Pages and UI');
console.log('======================');

const pages = [
  'app/page.tsx',
  'app/layout.tsx',
  'app/face-attendance/page.tsx',
  'app/face-register/page.tsx',
  'app/attendance/page.tsx',
  'app/users/page.tsx',
  'app/settings/page.tsx',
  'app/teacher-dashboard/page.tsx',
  'app/admin-dashboard/page.tsx'
];

pages.forEach(page => {
  const exists = fileExists(page);
  testResults.components[page] = { exists };
  console.log(`${exists ? '✅' : '❌'} ${page}`);
});

console.log('');

// Test 8: Configuration Files
console.log('⚙️  Test 8: Configuration');
console.log('=========================');

const configFiles = [
  'next.config.js',
  'tailwind.config.js',
  'tsconfig.json',
  'postcss.config.js'
];

configFiles.forEach(config => {
  const exists = fileExists(config);
  testResults.components[config] = { exists };
  console.log(`${exists ? '✅' : '❌'} ${config}`);
});

console.log('');

// Generate Summary Report
console.log('📊 Test Summary Report');
console.log('=====================');

// Count results
const envIssues = Object.values(testResults.environment).filter(r => !r.hasValue).length;
const fileIssues = Object.values(testResults.components).filter(r => !r.exists).length;
const apiIssues = Object.values(testResults.apis).filter(r => !r.exists).length;
const cameraIssues = Object.values(testResults.camera).filter(r => !r.exists).length;

console.log(`Environment Issues: ${envIssues}`);
console.log(`Missing Files: ${fileIssues}`);
console.log(`Missing APIs: ${apiIssues}`);
console.log(`Camera Issues: ${cameraIssues}`);

console.log('');

// Recommendations
console.log('💡 Recommendations');
console.log('==================');

if (envIssues > 0) {
  console.log('🔧 Environment Setup:');
  console.log('   1. Copy env.example to .env.local');
  console.log('   2. Set SUPABASE_SERVICE_ROLE_KEY with actual value');
  console.log('   3. Verify all environment variables are set');
  console.log('');
}

if (fileIssues > 0) {
  console.log('📁 Missing Files:');
  console.log('   1. Check if all required files are present');
  console.log('   2. Run git status to see if files are committed');
  console.log('   3. Ensure proper file structure');
  console.log('');
}

if (apiIssues > 0) {
  console.log('🔌 API Issues:');
  console.log('   1. Check if API routes are properly created');
  console.log('   2. Verify file naming conventions');
  console.log('   3. Ensure proper exports in route files');
  console.log('');
}

if (cameraIssues > 0) {
  console.log('📷 Camera Issues:');
  console.log('   1. Download face recognition models');
  console.log('   2. Run: node scripts/download-models.js');
  console.log('   3. Verify model files are in public/models/');
  console.log('');
}

console.log('🚀 Next Steps:');
console.log('   1. Fix environment variables');
console.log('   2. Run: npm install');
console.log('   3. Run: npm run dev');
console.log('   4. Test local endpoints');
console.log('   5. Deploy to production');

// Save test results
const resultsFile = 'test-results.json';
fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2));
console.log(`\n📄 Test results saved to: ${resultsFile}`);

console.log('\n✅ Comprehensive test completed!');
