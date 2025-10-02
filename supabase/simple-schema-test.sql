-- Simple Schema Test - Isolate Syntax Issues
-- Test basic table creation

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Test simple table creation
CREATE TABLE test_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT CHECK (role IN ('student', 'teacher', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test system_logs table specifically
CREATE TABLE test_system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action TEXT NOT NULL,
    description TEXT,
    ip_address INET,
    status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'warning')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Test indexes
CREATE INDEX idx_test_users_role ON test_users(role);
CREATE INDEX idx_test_logs_action ON test_system_logs(action);

-- Test RLS
ALTER TABLE test_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_system_logs ENABLE ROW LEVEL SECURITY;

-- Test policies
CREATE POLICY "test_users_policy" ON test_users FOR SELECT USING (true);
CREATE POLICY "test_logs_policy" ON test_system_logs FOR SELECT USING (true);

-- Test function
CREATE OR REPLACE FUNCTION test_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cleanup (commented out for safety)
-- DROP TABLE IF EXISTS test_system_logs CASCADE;
-- DROP TABLE IF EXISTS test_users CASCADE;
-- DROP FUNCTION IF EXISTS test_update_timestamp CASCADE;
