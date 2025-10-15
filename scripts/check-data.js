#!/usr/bin/env node

/**
 * Check Data in Database
 * Check if there's data in pengumuman and exams tables
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://kmmdnlbbeezsweqsxqzv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbWRubGJiZWV6c3dlcXN4cXp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQwNTU2MCwiZXhwIjoyMDc0OTgxNTYwfQ.TZzM-jc-AigFxJw6fOnIUKzk_x606gCwRR0lS-UUqh0';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkData() {
  console.log('🔍 Checking Database Data...\n');

  // Check pengumuman
  try {
    const { data: pengumuman, error } = await supabase
      .from('pengumuman')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('❌ Pengumuman error:', error.message);
    } else {
      console.log('✅ Pengumuman:', pengumuman?.length || 0, 'records');
      if (pengumuman && pengumuman.length > 0) {
        console.log('   Sample:', pengumuman[0].judul);
      }
    }
  } catch (err) {
    console.log('❌ Pengumuman error:', err.message);
  }

  // Check exams
  try {
    const { data: exams, error } = await supabase
      .from('exams')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('❌ Exams error:', error.message);
    } else {
      console.log('✅ Exams:', exams?.length || 0, 'records');
      if (exams && exams.length > 0) {
        console.log('   Sample:', exams[0].title);
      }
    }
  } catch (err) {
    console.log('❌ Exams error:', err.message);
  }

  // Check users
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('❌ Users error:', error.message);
    } else {
      console.log('✅ Users:', users?.length || 0, 'records');
      if (users && users.length > 0) {
        console.log('   Sample:', users[0].nama);
      }
    }
  } catch (err) {
    console.log('❌ Users error:', err.message);
  }
}

checkData().catch(console.error);
