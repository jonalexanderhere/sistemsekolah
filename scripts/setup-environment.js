#!/usr/bin/env node

/**
 * Environment Setup Script for SISFOTJKT2
 * Helps configure environment variables and test the setup
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 SISFOTJKT2 - Environment Setup\n');

// Check if .env.local exists
const envPath = '.env.local';
const envExamplePath = 'env.example';

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📋 Copying env.example to .env.local...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env.local created from env.example');
  } else {
    console.log('❌ env.example not found');
    process.exit(1);
  }
} else {
  console.log('✅ .env.local already exists');
}

// Read current environment
const envContent = fs.readFileSync(envPath, 'utf8');
console.log('\n📊 Current Environment Variables:');
console.log('==================================');

const envLines = envContent.split('\n');
const envVars = {};

envLines.forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
      const isPlaceholder = value.includes('your_') && value.includes('_here');
      console.log(`${isPlaceholder ? '⚠️ ' : '✅ '} ${key.trim()}: ${isPlaceholder ? 'Placeholder - needs real value' : 'Set'}`);
    }
  }
});

console.log('\n🔧 Required Environment Variables:');
console.log('==================================');

const requiredVars = [
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    description: 'Supabase project URL',
    example: 'https://your-project.supabase.co'
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Supabase anonymous key',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    description: 'Supabase service role key (for admin operations)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  {
    key: 'NEXT_PUBLIC_APP_NAME',
    description: 'Application name',
    example: 'SISFOTJKT2'
  }
];

requiredVars.forEach(envVar => {
  const currentValue = envVars[envVar.key];
  const isSet = currentValue && !currentValue.includes('your_') && !currentValue.includes('_here');
  
  console.log(`\n${isSet ? '✅' : '❌'} ${envVar.key}`);
  console.log(`   Description: ${envVar.description}`);
  console.log(`   Current: ${currentValue || 'Not set'}`);
  if (!isSet) {
    console.log(`   Example: ${envVar.example}`);
  }
});

console.log('\n📋 Setup Instructions:');
console.log('=====================');
console.log('1. Go to your Supabase project dashboard');
console.log('2. Navigate to Settings > API');
console.log('3. Copy the following values:');
console.log('   - Project URL → NEXT_PUBLIC_SUPABASE_URL');
console.log('   - anon public key → NEXT_PUBLIC_SUPABASE_ANON_KEY');
console.log('   - service_role secret key → SUPABASE_SERVICE_ROLE_KEY');
console.log('4. Update .env.local with the real values');
console.log('5. Restart your development server');

console.log('\n🧪 Testing Environment:');
console.log('======================');

// Test if we can load environment variables
try {
  require('dotenv').config({ path: envPath });
  console.log('✅ Environment file loaded successfully');
  
  // Check if variables are accessible
  const testVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  let allSet = true;
  testVars.forEach(varName => {
    const value = process.env[varName];
    const isSet = value && !value.includes('your_') && !value.includes('_here');
    console.log(`${isSet ? '✅' : '❌'} ${varName}: ${isSet ? 'Set' : 'Not set or placeholder'}`);
    if (!isSet) allSet = false;
  });
  
  if (allSet) {
    console.log('\n🎉 Environment is properly configured!');
    console.log('You can now run: npm run dev');
  } else {
    console.log('\n⚠️  Environment needs configuration');
    console.log('Please update .env.local with real Supabase values');
  }
  
} catch (error) {
  console.log('❌ Error loading environment:', error.message);
  console.log('Try running: npm install dotenv');
}

console.log('\n📚 Additional Resources:');
console.log('========================');
console.log('- Supabase Dashboard: https://supabase.com/dashboard');
console.log('- Supabase Docs: https://supabase.com/docs');
console.log('- Next.js Environment Variables: https://nextjs.org/docs/basic-features/environment-variables');

console.log('\n✅ Environment setup check completed!');
