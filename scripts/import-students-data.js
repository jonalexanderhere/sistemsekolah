#!/usr/bin/env node

/**
 * Import Student Data to Database
 * Import all student data to Supabase database
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://kmmdnlbbeezsweqsxqzv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttbWRubGJiZWV6c3dlcXN4cXp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQwNTU2MCwiZXhwIjoyMDc0OTgxNTYwfQ.TZzM-jc-AigFxJw6fOnIUKzk_x606gCwRR0lS-UUqh0';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Student data
const studentsData = [
  { nisn: "0089990908", id: "6643", nama: "ALLDOO SAPUTRA", hadir: false },
  { nisn: "0071887022", id: "6644", nama: "ALYA ANGGITA MAHERA", hadir: false },
  { nisn: "0071317242", id: "6645", nama: "AMELIA", hadir: false },
  { nisn: "0083627332", id: "6646", nama: "AMELIA SEPTIA SARI", hadir: false },
  { nisn: "0081278251", id: "6647", nama: "AULIA KENANGA SAFITRI", hadir: false },
  { nisn: "3102623580", id: "6648", nama: "AYUNDA NAFISHA", hadir: false },
  { nisn: "0088754753", id: "6649", nama: "BERLIAN ANUGRAH PRATAMA", hadir: false },
  { nisn: "0076775460", id: "6650", nama: "DESTI RAHAYU", hadir: false },
  { nisn: "0077986875", id: "6651", nama: "DESTIA", hadir: false },
  { nisn: "0069944236", id: "6652", nama: "ERIC ERIANTO", hadir: false },
  { nisn: "0084352502", id: "6653", nama: "FAIZAH AZ ZAHRA", hadir: false },
  { nisn: "0082539133", id: "6654", nama: "FITRI ULANDARI", hadir: false },
  { nisn: "0074043979", id: "6655", nama: "GHEA LITA ANASTASYA", hadir: false },
  { nisn: "0081353027", id: "6656", nama: "JHOVANI WIJAYA", hadir: false },
  { nisn: "0082019386", id: "6657", nama: "KEISYA AGUSTIN RASFA AULIA", hadir: false },
  { nisn: "0074731920", id: "6659", nama: "MAHARANI", hadir: false },
  { nisn: "0076724319", id: "6660", nama: "NAURA GHIFARI AZHAR", hadir: false },
  { nisn: "0083063479", id: "6662", nama: "PATRA ADITTIA", hadir: false },
  { nisn: "0085480329", id: "6663", nama: "PUTRI SAPARA", hadir: false },
  { nisn: "0079319957", id: "6664", nama: "RAFI SEPTA WIRA TAMA", hadir: false },
  { nisn: "0082901449", id: "6665", nama: "RAKA RAMADHANI PRATAMA", hadir: false },
  { nisn: "0081628824", id: "6666", nama: "REGITA MAHARANI", hadir: false },
  { nisn: "0081133109", id: "6667", nama: "REGITHA ANINDYA AZZAHRA", hadir: false },
  { nisn: "0076040547", id: "6668", nama: "RENDI ARISNANDO", hadir: false },
  { nisn: "0078327818", id: "6669", nama: "RIDHO ZAENAL MUSTAQIM", hadir: false },
  { nisn: "0076113354", id: "6670", nama: "RISTY WIDIASIH", hadir: false },
  { nisn: "0084399894", id: "6671", nama: "SIFA RISTIANA", hadir: false },
  { nisn: "", id: "6672", nama: "AMELIA DIANA", hadir: false },
  { nisn: "", id: "6673", nama: "DESTA AMELIA", hadir: false }
];

async function importStudents() {
  console.log('📚 Starting student data import...\n');
  
  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  for (const student of studentsData) {
    try {
      // Generate NISN if empty
      const nisn = student.nisn || `STUDENT_${student.id}`;
      
      // Generate UUID for student
      const crypto = require('crypto');
      const studentId = crypto.randomUUID();
      
      // Prepare student data
      const studentData = {
        id: studentId,
        nama: student.nama,
        role: 'siswa',
        nisn: nisn,
        class_name: 'XII TJKT 2',
        is_active: true,
        is_verified: true,
        created_at: new Date().toISOString()
      };

      // Insert student to database
      const { data, error } = await supabase
        .from('users')
        .upsert(studentData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        console.error(`❌ Error importing ${student.nama}:`, error.message);
        errors.push({ student: student.nama, error: error.message });
        errorCount++;
      } else {
        console.log(`✅ ${student.nama} (${nisn}) imported successfully`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ Unexpected error for ${student.nama}:`, error.message);
      errors.push({ student: student.nama, error: error.message });
      errorCount++;
    }
  }

  console.log('\n📊 Import Summary:');
  console.log(`✅ Successfully imported: ${successCount} students`);
  console.log(`❌ Failed to import: ${errorCount} students`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(({ student, error }) => {
      console.log(`  • ${student}: ${error}`);
    });
  }

  // Verify import
  console.log('\n🔍 Verifying import...');
  try {
    const { data: students, error } = await supabase
      .from('users')
      .select('id, nama, nisn, role, class_name')
      .eq('role', 'siswa')
      .eq('class_name', 'XII TJKT 2')
      .order('nama');

    if (error) {
      console.error('❌ Error verifying import:', error.message);
    } else {
      console.log(`✅ Found ${students.length} students in database`);
      console.log('\n📋 Student List:');
      students.forEach((student, index) => {
        console.log(`  ${index + 1}. ${student.nama} (${student.nisn})`);
      });
    }
  } catch (error) {
    console.error('❌ Error during verification:', error.message);
  }

  console.log('\n🎉 Student data import completed!');
}

// Run import
importStudents().catch(console.error);
