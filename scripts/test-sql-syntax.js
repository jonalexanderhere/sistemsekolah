const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function testSQLSyntax() {
    console.log('🔍 Testing SQL Schema Syntax...');
    console.log('================================');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ Missing Supabase credentials');
        return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
        // Read the schema file
        const schemaPath = path.join(__dirname, '..', 'supabase', 'complete-schema-v2.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        
        console.log(`📋 Schema file size: ${(schemaSQL.length / 1024).toFixed(1)} KB`);
        
        // Split into individual statements
        const statements = schemaSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`📊 Found ${statements.length} SQL statements`);
        console.log('');
        
        // Test each statement
        let errorCount = 0;
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            
            // Skip comments and empty statements
            if (statement.startsWith('--') || statement.length < 10) {
                continue;
            }
            
            try {
                console.log(`Testing statement ${i + 1}/${statements.length}...`);
                
                // For CREATE TABLE statements, we can test syntax
                if (statement.toUpperCase().includes('CREATE TABLE')) {
                    const tableName = statement.match(/CREATE TABLE (\w+)/i)?.[1];
                    console.log(`  📋 Creating table: ${tableName}`);
                }
                
                // Execute the statement
                const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
                
                if (error) {
                    console.error(`❌ Error in statement ${i + 1}:`, error.message);
                    console.error(`Statement: ${statement.substring(0, 100)}...`);
                    errorCount++;
                } else {
                    console.log(`✅ Statement ${i + 1} executed successfully`);
                }
                
            } catch (err) {
                console.error(`❌ Exception in statement ${i + 1}:`, err.message);
                errorCount++;
            }
        }
        
        console.log('');
        console.log('📊 Test Results:');
        console.log(`  Total statements: ${statements.length}`);
        console.log(`  Errors found: ${errorCount}`);
        console.log(`  Success rate: ${((statements.length - errorCount) / statements.length * 100).toFixed(1)}%`);
        
        if (errorCount === 0) {
            console.log('🎉 All SQL statements are syntactically correct!');
        } else {
            console.log('⚠️  Some SQL statements have syntax errors');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run if called directly
if (require.main === module) {
    testSQLSyntax();
}

module.exports = { testSQLSyntax };
