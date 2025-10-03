#!/usr/bin/env node

/**
 * Script to fix attendance table schema issues
 * This script ensures the attendance table has the correct structure
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkTableExists(tableName) {
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_name', tableName)
    .eq('table_schema', 'public');

  if (error) {
    console.error(`❌ Error checking table ${tableName}:`, error);
    return false;
  }

  return data && data.length > 0;
}

async function checkColumnExists(tableName, columnName) {
  const { data, error } = await supabase
    .from('information_schema.columns')
    .select('column_name')
    .eq('table_name', tableName)
    .eq('column_name', columnName)
    .eq('table_schema', 'public');

  if (error) {
    console.error(`❌ Error checking column ${tableName}.${columnName}:`, error);
    return false;
  }

  return data && data.length > 0;
}

async function addMissingColumns() {
  console.log('🔧 Checking and adding missing columns...');

  const requiredColumns = [
    { name: 'waktu_masuk', type: 'TIMESTAMPTZ' },
    { name: 'waktu_keluar', type: 'TIMESTAMPTZ' },
    { name: 'method', type: 'TEXT DEFAULT \'face_recognition\'' },
    { name: 'confidence_score', type: 'DECIMAL(5,4)' },
    { name: 'notes', type: 'TEXT' },
    { name: 'created_at', type: 'TIMESTAMPTZ DEFAULT NOW()' },
    { name: 'updated_at', type: 'TIMESTAMPTZ DEFAULT NOW()' }
  ];

  for (const column of requiredColumns) {
    const exists = await checkColumnExists('attendance', column.name);
    if (!exists) {
      console.log(`➕ Adding column: ${column.name}`);
      const { error } = await supabase.rpc('exec_sql', {
        sql: `ALTER TABLE attendance ADD COLUMN ${column.name} ${column.type};`
      });
      
      if (error) {
        console.error(`❌ Error adding column ${column.name}:`, error);
      } else {
        console.log(`✅ Added column: ${column.name}`);
      }
    } else {
      console.log(`✅ Column exists: ${column.name}`);
    }
  }
}

async function testAttendanceQuery() {
  console.log('🧪 Testing attendance query...');
  
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        id,
        tanggal,
        waktu_masuk,
        waktu_keluar,
        status,
        method,
        notes,
        created_at,
        user_id,
        users!inner (
          id,
          nama,
          role,
          nisn
        )
      `)
      .limit(1);

    if (error) {
      console.error('❌ Attendance query test failed:', error);
      return false;
    }

    console.log('✅ Attendance query test successful');
    console.log('📊 Sample data:', data);
    return true;
  } catch (err) {
    console.error('❌ Attendance query test error:', err);
    return false;
  }
}

async function main() {
  console.log('🔧 Fixing Attendance Schema Issues...\n');

  // Check if attendance table exists
  const tableExists = await checkTableExists('attendance');
  if (!tableExists) {
    console.error('❌ Attendance table does not exist!');
    console.error('Please run the database setup scripts first.');
    process.exit(1);
  }

  console.log('✅ Attendance table exists');

  // Add missing columns
  await addMissingColumns();

  // Test the query
  const queryWorks = await testAttendanceQuery();
  
  if (queryWorks) {
    console.log('\n✅ Attendance schema is now working correctly!');
  } else {
    console.log('\n❌ Attendance schema still has issues. Please check the database manually.');
  }
}

main().catch(console.error);
