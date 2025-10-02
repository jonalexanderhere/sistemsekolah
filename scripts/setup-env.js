const fs = require('fs');
const path = require('path');

// Environment variables configuration
const envConfig = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://kmmdnlbbeezsweqsxqzv.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbWRubGJiZWV6c3dlcXN4cXp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MDU1NjAsImV4cCI6MjA3NDk4MTU2MH0.UQ49a5K0Me7-aS5U80bRBLExnx-Hmgpg4X4DMXgZP5Y"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbWRubGJiZWV6c3dlcXN4cXp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQwNTU2MCwiZXhwIjoyMDc0OTgxNTYwfQ.TZzM-jc-AigFxJw6fOnIUKzk_x606gCwRR0lS-UUqh0"
SUPABASE_URL="https://kmmdnlbbeezsweqsxqzv.supabase.co"
SUPABASE_JWT_SECRET="BkSYNUIygrrHO8gy05nOT80tSJSmbGTxcCTSlrFPG1dMdgxpb1dy9bOpWKLhbaNgSfdLj6NM0Cqkp8vUZQc5rw=="

# PostgreSQL Database Configuration
POSTGRES_URL="postgres://postgres.kmmdnlbbeezsweqsxqzv:Tgf1mA8uPtNkaWBL@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x"
POSTGRES_PRISMA_URL="postgres://postgres.kmmdnlbbeezsweqsxqzv:Tgf1mA8uPtNkaWBL@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgres://postgres.kmmdnlbbeezsweqsxqzv:Tgf1mA8uPtNkaWBL@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="Tgf1mA8uPtNkaWBL"
POSTGRES_HOST="db.kmmdnlbbeezsweqsxqzv.supabase.co"
POSTGRES_DATABASE="postgres"

# App Configuration
NEXT_PUBLIC_APP_NAME="SISFOTJKT2"
JWT_SECRET="BkSYNUIygrrHO8gy05nOT80tSJSmbGTxcCTSlrFPG1dMdgxpb1dy9bOpWKLhbaNgSfdLj6NM0Cqkp8vUZQc5rw=="

# Development Configuration
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NODE_ENV="development"
`;

function setupEnvironment() {
    console.log('🔧 Setting up environment configuration...');
    
    try {
        // Write .env.local file
        const envLocalPath = path.join(process.cwd(), '.env.local');
        fs.writeFileSync(envLocalPath, envConfig);
        console.log('✅ Created .env.local file with Supabase credentials');
        
        // Also create .env for backup
        const envPath = path.join(process.cwd(), '.env');
        fs.writeFileSync(envPath, envConfig);
        console.log('✅ Created .env file as backup');
        
        console.log('🎉 Environment setup completed successfully!');
        console.log('');
        console.log('📋 Configuration Summary:');
        console.log('- Supabase URL: https://kmmdnlbbeezsweqsxqzv.supabase.co');
        console.log('- Database Host: db.kmmdnlbbeezsweqsxqzv.supabase.co');
        console.log('- App Name: SISFOTJKT2');
        console.log('');
        console.log('⚠️  Important: Keep your .env files secure and never commit them to version control!');
        
    } catch (error) {
        console.error('❌ Error setting up environment:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    setupEnvironment();
}

module.exports = { setupEnvironment };
