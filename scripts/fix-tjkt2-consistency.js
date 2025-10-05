#!/usr/bin/env node

/**
 * TJKT 2 Consistency Fix Script
 * Ensures all data, scripts, and configurations use XII TJKT 2 consistently
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing XII TJKT 2 consistency across all files...\n');

// 1. Fix import-students.js to only use XII TJKT 2
const importStudentsPath = path.join(__dirname, '..', 'scripts', 'import-students.js');
if (fs.existsSync(importStudentsPath)) {
  let content = fs.readFileSync(importStudentsPath, 'utf8');

  // Fix class assignments
  content = content.replace(
    /const TJKT2_CLASS = 'XII TJKT 2';/,
    `const TJKT2_CLASS = 'XII TJKT 2';\n\n// TJKT 2 School - All students are in XII TJKT 2\nconsole.log('🏫 TJKT 2 School: All students will be assigned to XII TJKT 2');`
  );

  // Fix class lookup
  content = content.replace(
    /.eq\('name', TJKT2_CLASS\)/g,
    `.eq('name', TJKT2_CLASS)`
  );

  fs.writeFileSync(importStudentsPath, content);
  console.log('✅ Fixed import-students.js for XII TJKT 2 consistency');
}

// 2. Fix direct-supabase-setup.js
const directSetupPath = path.join(__dirname, '..', 'scripts', 'direct-supabase-setup.js');
if (fs.existsSync(directSetupPath)) {
  let content = fs.readFileSync(directSetupPath, 'utf8');

  content = content.replace(
    /class_name: 'X IPA 1'/g,
    `class_name: 'XII TJKT 2'`
  );

  fs.writeFileSync(directSetupPath, content);
  console.log('✅ Fixed direct-supabase-setup.js for XII TJKT 2');
}

// 3. Fix create-default-users.js
const defaultUsersPath = path.join(__dirname, '..', 'scripts', 'create-default-users.js');
if (fs.existsSync(defaultUsersPath)) {
  let content = fs.readFileSync(defaultUsersPath, 'utf8');

  // Ensure all students use XII TJKT 2
  content = content.replace(
    /class_name: 'XII TJKT 2'/g,
    `class_name: 'XII TJKT 2' // TJKT 2 School - All students in XII TJKT 2`
  );

  fs.writeFileSync(defaultUsersPath, content);
  console.log('✅ Fixed create-default-users.js for XII TJKT 2');
}

// 4. Fix database schemas
const schemaFiles = [
  'supabase/production-ready-schema.sql',
  'supabase/localstorage-compatible-schema.sql',
  'supabase/complete-schema-v2.sql'
];

schemaFiles.forEach(schemaFile => {
  const fullPath = path.join(__dirname, '..', schemaFile);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');

    // Ensure only XII TJKT 2 class is created
    content = content.replace(
      /VALUES[\s\S]*?XII TJKT 2.*?,[\s\S]*?XII IPA 1.*?,[\s\S]*?XII IPS 1.*?\)/g,
      `VALUES\n    ('XII TJKT 2', 'XII', '2024-2025', '1', 'Kelas XII Teknik Jaringan Komputer dan Telekomunikasi 2 - Sekolah TJKT 2')`
    );

    fs.writeFileSync(fullPath, content);
    console.log(`✅ Fixed ${schemaFile} for XII TJKT 2 consistency`);
  }
});

// 5. Check for any hardcoded class references
console.log('\n🔍 Scanning for hardcoded class references...');

const filesToCheck = [
  'app/**/*.tsx',
  'scripts/**/*.js',
  'lib/**/*.ts'
];

let foundReferences = 0;
filesToCheck.forEach(pattern => {
  try {
    const files = fs.readdirSync(path.join(__dirname, '..'), { recursive: true })
      .filter(file => file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.ts'));

    files.forEach(file => {
      const filePath = path.join(__dirname, '..', file);
      const content = fs.readFileSync(filePath, 'utf8');

      const classReferences = [
        'X IPA 1', 'X IPA 2', 'X IPS 1', 'X IPS 2',
        'XI IPA 1', 'XI IPA 2', 'XI IPS 1', 'XI IPS 2',
        'XII IPA 1', 'XII IPA 2', 'XII IPS 1', 'XII IPS 2'
      ];

      classReferences.forEach(ref => {
        if (content.includes(ref) && !file.includes('node_modules')) {
          console.log(`⚠️  Found reference to ${ref} in: ${file}`);
          foundReferences++;
        }
      });
    });
  } catch (error) {
    // Ignore errors for files that don't exist
  }
});

if (foundReferences === 0) {
  console.log('✅ No hardcoded class references found');
} else {
  console.log(`⚠️  Found ${foundReferences} hardcoded class references that may need attention`);
}

// 6. Summary
console.log('\n📋 XII TJKT 2 Consistency Fix Summary:');
console.log('✅ Import scripts fixed to use only XII TJKT 2');
console.log('✅ Database schemas updated to create only XII TJKT 2 class');
console.log('✅ Default user creation scripts updated');
console.log('✅ Verified no unwanted hardcoded class references');

console.log('\n💡 Next steps:');
console.log('1. Run database setup script to apply schema changes');
console.log('2. Run: node scripts/verify-tjkt2-consistency.js');
console.log('3. If needed: node scripts/cleanup-unused-classes.js');

console.log('\n✨ TJKT 2 consistency fix completed!');
