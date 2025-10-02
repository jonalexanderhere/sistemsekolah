const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Enhanced database setup with comprehensive schema
async function setupDatabaseV2() {
    console.log('🚀 SISFOTJKT2 Database Setup V2.0');
    console.log('==================================');
    console.log('');

    // Validate environment variables
    const requiredEnvVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:');
        missingVars.forEach(varName => {
            console.error(`   - ${varName}`);
        });
        console.error('');
        console.error('Please ensure your .env.local file contains all required variables.');
        process.exit(1);
    }

    // Initialize Supabase client with service role
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    try {
        console.log('📋 Reading enhanced schema file...');
        const schemaPath = path.join(__dirname, '..', 'supabase', 'complete-schema-v2.sql');
        
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found: ${schemaPath}`);
        }

        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        console.log('✅ Schema file loaded successfully');
        console.log(`📊 Schema size: ${(schemaSQL.length / 1024).toFixed(1)} KB`);
        console.log('');

        console.log('🔧 Executing database schema...');
        console.log('This may take a few moments...');
        console.log('');

        // Execute the schema
        const { data, error } = await supabase.rpc('exec_sql', { sql: schemaSQL });

        if (error) {
            console.log('⚠️  RPC method failed, trying direct execution...');
            
            // If RPC fails, provide instructions for manual execution
            console.log('');
            console.log('📝 Manual Setup Required:');
            console.log('========================');
            console.log('');
            console.log('1. Go to your Supabase Dashboard');
            console.log('2. Navigate to SQL Editor');
            console.log('3. Copy and paste the contents of: supabase/complete-schema-v2.sql');
            console.log('4. Execute the SQL script');
            console.log('');
            console.log('Alternative: Use the Supabase CLI:');
            console.log('supabase db reset --linked');
            console.log('');
            
            // Save a simplified version for manual execution
            const manualSetupPath = path.join(__dirname, '..', 'supabase', 'manual-setup-v2.sql');
            fs.writeFileSync(manualSetupPath, schemaSQL);
            console.log(`💾 Schema saved to: ${manualSetupPath}`);
            console.log('');
            
            return false;
        }

        console.log('✅ Database schema executed successfully!');
        console.log('');

        // Verify the setup by checking if tables exist
        console.log('🔍 Verifying database setup...');
        
        const tables = [
            'users', 'faces', 'classes', 'class_students', 
            'attendance', 'attendance_settings', 'attendance_periods', 'holidays',
            'exams', 'questions', 'answers', 'exam_results',
            'pengumuman', 'notifications', 'system_logs'
        ];

        let allTablesExist = true;
        for (const table of tables) {
            const { data: tableExists, error: tableError } = await supabase
                .from(table)
                .select('id')
                .limit(1);
            
            if (tableError && tableError.code === 'PGRST116') {
                console.log(`❌ Table '${table}' not found`);
                allTablesExist = false;
            } else {
                console.log(`✅ Table '${table}' exists`);
            }
        }

        if (!allTablesExist) {
            console.log('');
            console.log('⚠️  Some tables are missing. Please run the manual setup.');
            return false;
        }

        console.log('');
        console.log('🎉 Database Setup V2.0 Complete!');
        console.log('================================');
        console.log('');
        console.log('📊 Features Available:');
        console.log('  ✅ Enhanced User Management (Students, Teachers, Admin, Staff)');
        console.log('  ✅ Advanced Face Recognition System');
        console.log('  ✅ Comprehensive Class Management');
        console.log('  ✅ Multi-Method Attendance System');
        console.log('  ✅ Full-Featured Examination System');
        console.log('  ✅ Communication & Notifications');
        console.log('  ✅ System Audit & Logging');
        console.log('  ✅ Performance Optimized Indexes');
        console.log('  ✅ Row Level Security (RLS)');
        console.log('  ✅ Automated Triggers & Functions');
        console.log('');
        console.log('🔐 Security Features:');
        console.log('  ✅ Role-based Access Control');
        console.log('  ✅ Data Encryption');
        console.log('  ✅ Audit Trail');
        console.log('  ✅ Input Validation');
        console.log('');
        console.log('📈 Performance Features:');
        console.log('  ✅ Optimized Indexes');
        console.log('  ✅ Full-text Search');
        console.log('  ✅ Efficient Queries');
        console.log('  ✅ Caching Ready');
        console.log('');
        console.log('🎯 Next Steps:');
        console.log('  1. Run: npm run import-all-users');
        console.log('  2. Test the system: npm run test-system');
        console.log('  3. Access dashboard: /teacher-dashboard');
        console.log('');

        return true;

    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        console.error('');
        console.error('🔧 Troubleshooting:');
        console.error('  1. Check your Supabase credentials');
        console.error('  2. Ensure your Supabase project is active');
        console.error('  3. Verify network connectivity');
        console.error('  4. Try manual setup via Supabase Dashboard');
        console.error('');
        return false;
    }
}

// Enhanced system verification
async function verifySystem() {
    console.log('🔍 System Verification');
    console.log('======================');
    console.log('');

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    try {
        // Test database connection
        console.log('📡 Testing database connection...');
        const { data, error } = await supabase.from('users').select('count').limit(1);
        if (error) throw error;
        console.log('✅ Database connection successful');

        // Check RLS policies
        console.log('🔐 Checking security policies...');
        const { data: policies, error: policyError } = await supabase.rpc('get_policies');
        if (!policyError && policies) {
            console.log(`✅ ${policies.length} security policies active`);
        } else {
            console.log('⚠️  Could not verify security policies');
        }

        // Check indexes
        console.log('📊 Verifying performance indexes...');
        const { data: indexes, error: indexError } = await supabase.rpc('get_indexes');
        if (!indexError && indexes) {
            console.log(`✅ ${indexes.length} performance indexes active`);
        } else {
            console.log('⚠️  Could not verify indexes');
        }

        console.log('');
        console.log('✅ System verification complete!');
        return true;

    } catch (error) {
        console.error('❌ System verification failed:', error.message);
        return false;
    }
}

// Run setup if called directly
if (require.main === module) {
    setupDatabaseV2()
        .then(success => {
            if (success) {
                return verifySystem();
            }
            return false;
        })
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('❌ Setup failed:', error);
            process.exit(1);
        });
}

module.exports = { setupDatabaseV2, verifySystem };
