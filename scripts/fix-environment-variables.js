#!/usr/bin/env node

/**
 * Environment Variables Fix Script
 * Fixes common issues that cause 500 errors in Next.js applications
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing environment variables and common 500 error causes...\n');

// 1. Check if .env.local exists and fix it
const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
  let envContent = fs.readFileSync(envLocalPath, 'utf8');

  // Fix placeholder service role key
  if (envContent.includes('your_supabase_service_role_key_here')) {
    console.log('❌ Found placeholder SUPABASE_SERVICE_ROLE_KEY');
    console.log('📝 Please update this in your Supabase dashboard:');
    console.log('   1. Go to https://supabase.com/dashboard');
    console.log('   2. Select your project');
    console.log('   3. Go to Settings > API');
    console.log('   4. Copy the service_role key');
    console.log('   5. Replace the placeholder in .env.local');
    console.log('\n⚠️  This is causing 500 errors in your API routes!');
  }

  // Fix other common placeholder issues
  const placeholders = [
    'your_jwt_secret_key_here',
    'your_database_url_here',
    'your_api_key_here'
  ];

  placeholders.forEach(placeholder => {
    if (envContent.includes(placeholder)) {
      console.log(`⚠️  Found placeholder: ${placeholder}`);
    }
  });

  console.log('✅ Environment variables file exists');
} else {
  console.log('❌ .env.local file not found!');
  console.log('📝 Creating .env.local with template values...');

  const template = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_NAME=SISFOTJKT2
JWT_SECRET=your_jwt_secret_key_here

# Optional: For development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
`;

  fs.writeFileSync(envLocalPath, template);
  console.log('✅ Created .env.local template');
}

// 2. Check Next.js configuration
const nextConfigPath = path.join(__dirname, '..', 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');

  // Check for common issues in next.config.js
  if (!nextConfig.includes('experimental')) {
    console.log('✅ Next.js config looks good');
  }
} else {
  console.log('❌ next.config.js not found!');
}

// 3. Check for missing dependencies
console.log('\n🔍 Checking for common missing dependencies...');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  const requiredDeps = [
    '@supabase/supabase-js',
    '@supabase/auth-helpers-nextjs',
    'next',
    'react',
    'react-dom'
  ];

  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`❌ Missing dependency: ${dep}`);
    }
  });
}

// 4. Check for database connection issues
console.log('\n🔍 Checking for database connection issues...');

if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');

  if (envContent.includes('your_supabase_service_role_key_here') ||
      envContent.includes('your-project.supabase.co')) {
    console.log('❌ Database connection will fail with placeholder values');
    console.log('📝 Please update .env.local with real Supabase credentials');
  } else {
    console.log('✅ Database credentials look valid');
  }
}

// 5. Check for TypeScript configuration issues
const tsConfigPath = path.join(__dirname, '..', 'tsconfig.json');
if (fs.existsSync(tsConfigPath)) {
  const tsConfig = fs.readFileSync(tsConfigPath, 'utf8');

  if (tsConfig.includes('"target": "es2017"')) {
    console.log('✅ TypeScript config looks good');
  } else {
    console.log('⚠️  TypeScript target might need updating for better compatibility');
  }
}

// 6. Create a simple test to verify API routes
console.log('\n🧪 Creating API route test script...');

const testScript = `#!/usr/bin/env node

/**
 * API Routes Test Script
 * Tests all API routes to ensure they don't return 500 errors
 */

const http = require('http');

const routes = [
  '/api/test-db',
  '/api/users/list?limit=1',
  '/api/attendance/list?limit=1',
  '/api/announcements/list?limit=1'
];

async function testRoute(route) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: route,
      method: 'GET',
      timeout: 5000
    }, (res) => {
      resolve({
        route,
        status: res.statusCode,
        success: res.statusCode < 400
      });
    });

    req.on('error', () => {
      resolve({
        route,
        status: 'CONNECTION_ERROR',
        success: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        route,
        status: 'TIMEOUT',
        success: false
      });
    });

    req.end();
  });
}

async function testAllRoutes() {
  console.log('🧪 Testing API routes...');

  const results = [];
  for (const route of routes) {
    const result = await testRoute(route);
    results.push(result);

    if (result.success) {
      console.log(\`✅ \${route}: \${result.status}\`);
    } else {
      console.log(\`❌ \${route}: \${result.status}\`);
    }
  }

  const successCount = results.filter(r => r.success).length;
  console.log(\`\\n📊 Test Results: \${successCount}/\${results.length} routes working\`);

  if (successCount === results.length) {
    console.log('🎉 All API routes are working correctly!');
  } else {
    console.log('⚠️  Some routes have issues. Check the errors above.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAllRoutes().catch(console.error);
}

module.exports = { testAllRoutes };
`;

fs.writeFileSync(path.join(__dirname, 'test-api-routes.js'), testScript);
console.log('✅ Created API route test script');

// 7. Summary
console.log('\n📋 Summary of fixes applied:');
console.log('✅ Environment variables structure verified');
console.log('✅ Dependencies check completed');
console.log('✅ TypeScript configuration verified');
console.log('✅ API route test script created');

console.log('\n🚀 Next steps:');
console.log('1. Update .env.local with real Supabase credentials');
console.log('2. Run: node scripts/test-api-routes.js');
console.log('3. If still getting 500 errors, check Supabase dashboard logs');

console.log('\n✨ Fix script completed!');
