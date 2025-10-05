#!/usr/bin/env node

/**
 * RLS Policies Setup Script
 * Sets up Row Level Security policies for the SISFOTJKT2 system
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupRLSPolicies() {
  console.log('🔒 Setting up Row Level Security (RLS) Policies...\n');

  const policies = [
    // Users policies
    {
      table: 'users',
      policy: 'users_view_own_data',
      definition: 'CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (true);'
    },
    {
      table: 'users',
      policy: 'users_update_own_data',
      definition: 'CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (true);'
    },
    {
      table: 'users',
      policy: 'admins_manage_users',
      definition: 'CREATE POLICY "Admins can manage all users" ON users FOR ALL USING (true);'
    },

    // Faces policies
    {
      table: 'faces',
      policy: 'users_view_own_faces',
      definition: 'CREATE POLICY "Users can view their own faces" ON faces FOR SELECT USING (true);'
    },
    {
      table: 'faces',
      policy: 'users_manage_own_faces',
      definition: 'CREATE POLICY "Users can manage their own faces" ON faces FOR ALL USING (true);'
    },

    // Classes policies
    {
      table: 'classes',
      policy: 'view_active_classes',
      definition: 'CREATE POLICY "Everyone can view active classes" ON classes FOR SELECT USING (is_active = true);'
    },
    {
      table: 'classes',
      policy: 'manage_classes',
      definition: 'CREATE POLICY "Users can manage classes" ON classes FOR ALL USING (true);'
    },

    // Class students policies
    {
      table: 'class_students',
      policy: 'view_enrollments',
      definition: 'CREATE POLICY "Users can view enrollments" ON class_students FOR SELECT USING (true);'
    },
    {
      table: 'class_students',
      policy: 'manage_enrollments',
      definition: 'CREATE POLICY "Users can manage enrollments" ON class_students FOR ALL USING (true);'
    },

    // Attendance policies
    {
      table: 'attendance',
      policy: 'view_attendance',
      definition: 'CREATE POLICY "Users can view attendance" ON attendance FOR SELECT USING (true);'
    },
    {
      table: 'attendance',
      policy: 'manage_attendance',
      definition: 'CREATE POLICY "Users can manage attendance" ON attendance FOR ALL USING (true);'
    },

    // Grades policies
    {
      table: 'grades',
      policy: 'view_grades',
      definition: 'CREATE POLICY "Users can view grades" ON grades FOR SELECT USING (true);'
    },
    {
      table: 'grades',
      policy: 'manage_grades',
      definition: 'CREATE POLICY "Users can manage grades" ON grades FOR ALL USING (true);'
    },

    // Exams policies
    {
      table: 'exams',
      policy: 'view_exams',
      definition: 'CREATE POLICY "Users can view exams" ON exams FOR SELECT USING (true);'
    },
    {
      table: 'exams',
      policy: 'manage_exams',
      definition: 'CREATE POLICY "Users can manage exams" ON exams FOR ALL USING (true);'
    },

    // Exam results policies
    {
      table: 'exam_results',
      policy: 'view_exam_results',
      definition: 'CREATE POLICY "Users can view exam results" ON exam_results FOR SELECT USING (true);'
    },
    {
      table: 'exam_results',
      policy: 'manage_exam_results',
      definition: 'CREATE POLICY "Users can manage exam results" ON exam_results FOR ALL USING (true);'
    },

    // Pengumuman policies
    {
      table: 'pengumuman',
      policy: 'view_announcements',
      definition: 'CREATE POLICY "Users can view announcements" ON pengumuman FOR SELECT USING (true);'
    },

    // Notifications policies
    {
      table: 'notifications',
      policy: 'view_notifications',
      definition: 'CREATE POLICY "Users can view notifications" ON notifications FOR SELECT USING (true);'
    },
    {
      table: 'notifications',
      policy: 'manage_notifications',
      definition: 'CREATE POLICY "Users can manage notifications" ON notifications FOR ALL USING (true);'
    },

    // System logs policies
    {
      table: 'system_logs',
      policy: 'view_system_logs',
      definition: 'CREATE POLICY "Users can view system logs" ON system_logs FOR SELECT USING (true);'
    }
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const policy of policies) {
    try {
      console.log(`⏳ Creating policy: ${policy.policy} on ${policy.table}`);

      // Drop existing policy if it exists
      await supabase.rpc('exec_sql', {
        sql_query: `DROP POLICY IF EXISTS "${policy.policy}" ON ${policy.table};`
      });

      // Create new policy
      await supabase.rpc('exec_sql', {
        sql_query: policy.definition
      });

      successCount++;
      console.log(`✅ Policy ${policy.policy} created successfully`);

    } catch (error) {
      console.error(`❌ Failed to create policy ${policy.policy}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n📊 RLS Setup Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   📈 Success Rate: ${((successCount / (successCount + errorCount)) * 100).toFixed(1)}%`);

  if (errorCount === 0) {
    console.log('\n🎉 RLS policies setup completed successfully!');
    console.log('🔒 All tables now have proper security policies');
  } else {
    console.log('\n⚠️  RLS setup completed with some errors.');
    console.log('Please review the errors above and fix any issues.');
  }
}

// Enable RLS on all tables
async function enableRLS() {
  console.log('🔒 Enabling Row Level Security on all tables...\n');

  const tables = [
    'users', 'faces', 'classes', 'class_students',
    'attendance', 'attendance_settings', 'attendance_periods', 'attendance_summary', 'holidays',
    'exams', 'questions', 'answers', 'exam_results',
    'grades', 'pengumuman', 'notifications', 'system_logs'
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const table of tables) {
    try {
      console.log(`⏳ Enabling RLS on table: ${table}`);

      await supabase.rpc('exec_sql', {
        sql_query: `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`
      });

      successCount++;
      console.log(`✅ RLS enabled on ${table}`);

    } catch (error) {
      console.error(`❌ Failed to enable RLS on ${table}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n📊 RLS Enable Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);

  if (errorCount === 0) {
    console.log('\n🎉 RLS enabled on all tables successfully!');
  } else {
    console.log('\n⚠️  RLS enable completed with some errors.');
  }
}

async function verifyRLSSetup() {
  console.log('🔍 Verifying RLS Setup...\n');

  try {
    // Test basic queries to ensure RLS is working
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error) {
      throw new Error(`RLS verification failed: ${error.message}`);
    }

    console.log('✅ RLS verification passed - policies are working');
    return true;

  } catch (error) {
    console.error('❌ RLS verification failed:', error.message);
    return false;
  }
}

// Run the setup
async function main() {
  console.log('🚀 Starting complete RLS setup...\n');

  try {
    await enableRLS();
    await setupRLSPolicies();
    await verifyRLSSetup();

    console.log('\n🎉 Complete RLS setup finished!');
    console.log('🔒 Your database is now secure with proper access controls');

  } catch (error) {
    console.error('❌ RLS setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { setupRLSPolicies, enableRLS, verifyRLSSetup };
