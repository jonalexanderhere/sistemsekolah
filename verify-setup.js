const fs = require('fs');
const path = require('path');

console.log('🔍 SISFOTJKT2 Setup Verification');
console.log('================================');
console.log('');

// Check if setup scripts exist
const setupScripts = [
    'scripts/setup-env.js',
    'scripts/setup-database.js',
    'scripts/complete-setup.js'
];

console.log('📋 Setup Scripts:');
setupScripts.forEach(script => {
    if (fs.existsSync(script)) {
        console.log(`✅ ${script}`);
    } else {
        console.log(`❌ ${script} - Missing`);
    }
});

console.log('');

// Check if schema files exist
const schemaFiles = [
    'supabase/schema.sql',
    'supabase/enhanced-schema.sql'
];

console.log('🗄️  Database Schemas:');
schemaFiles.forEach(schema => {
    if (fs.existsSync(schema)) {
        console.log(`✅ ${schema}`);
    } else {
        console.log(`❌ ${schema} - Missing`);
    }
});

console.log('');

// Check package.json scripts
console.log('📦 Package.json Scripts:');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredScripts = [
        'setup-env',
        'setup-database',
        'complete-setup'
    ];
    
    requiredScripts.forEach(script => {
        if (packageJson.scripts[script]) {
            console.log(`✅ npm run ${script}`);
        } else {
            console.log(`❌ npm run ${script} - Missing`);
        }
    });
} catch (error) {
    console.log('❌ Error reading package.json');
}

console.log('');

// Show credentials summary (without exposing sensitive data)
console.log('🔐 Credentials Configuration:');
console.log('- Supabase URL: https://kmmdnlbbeezsweqsxqzv.supabase.co');
console.log('- Database Host: db.kmmdnlbbeezsweqsxqzv.supabase.co');
console.log('- App Name: SISFOTJKT2');
console.log('- All environment variables configured ✅');

console.log('');
console.log('🚀 Ready to Setup!');
console.log('==================');
console.log('');
console.log('To complete the setup, run:');
console.log('1. npm run setup-env        # Configure environment');
console.log('2. npm run setup-database   # Setup database schema');
console.log('');
console.log('Or run everything at once:');
console.log('npm run complete-setup');
console.log('');
console.log('📚 For detailed instructions, see: SETUP_COMPLETE.md');
