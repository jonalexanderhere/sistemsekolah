-- Fix RLS policies to allow anon access for face recognition
-- This allows the anon key to access faces and attendance data

-- Enable RLS on faces table
ALTER TABLE faces ENABLE ROW LEVEL SECURITY;

-- Allow anon users to read faces data
CREATE POLICY "Allow anon read faces" ON faces
FOR SELECT USING (true);

-- Allow anon users to insert faces data
CREATE POLICY "Allow anon insert faces" ON faces
FOR INSERT WITH CHECK (true);

-- Allow anon users to update faces data
CREATE POLICY "Allow anon update faces" ON faces
FOR UPDATE USING (true);

-- Enable RLS on attendance table
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Allow anon users to read attendance data
CREATE POLICY "Allow anon read attendance" ON attendance
FOR SELECT USING (true);

-- Allow anon users to insert attendance data
CREATE POLICY "Allow anon insert attendance" ON attendance
FOR INSERT WITH CHECK (true);

-- Allow anon users to update attendance data
CREATE POLICY "Allow anon update attendance" ON attendance
FOR UPDATE USING (true);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow anon users to read users data
CREATE POLICY "Allow anon read users" ON users
FOR SELECT USING (true);

-- Allow anon users to insert users data
CREATE POLICY "Allow anon insert users" ON users
FOR INSERT WITH CHECK (true);

-- Allow anon users to update users data
CREATE POLICY "Allow anon update users" ON users
FOR UPDATE USING (true);

-- Enable RLS on attendance_settings table
ALTER TABLE attendance_settings ENABLE ROW LEVEL SECURITY;

-- Allow anon users to read attendance settings
CREATE POLICY "Allow anon read attendance_settings" ON attendance_settings
FOR SELECT USING (true);
