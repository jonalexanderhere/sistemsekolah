const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kfstxlcoegqanytvpbgp.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Data guru
const dataGuru = [
  {
    nama: "DIDIK KURNIAWAN, S.Kom, M.TI",
    identitas: "198103102010011012",
    role: "guru"
  },
  {
    nama: "ADE FIRMANSYAH, S.Kom",
    identitas: "3855773674130022",
    role: "guru"
  }
];

// Data siswa
const dataSiswa = [
  { nisn: "0089990908", id: "6643", nama: "ALLDOO SAPUTRA" },
  { nisn: "0071887022", id: "6644", nama: "ALYA ANGGITA MAHERA" },
  { nisn: "0071317242", id: "6645", nama: "AMELIA" },
  { nisn: "0083627332", id: "6646", nama: "AMELIA SEPTIA SARI" },
  { nisn: "0081278251", id: "6647", nama: "AULIA KENANGA SAFITRI" },
  { nisn: "3102623580", id: "6648", nama: "AYUNDA NAFISHA" },
  { nisn: "0088754753", id: "6649", nama: "BERLIAN ANUGRAH PRATAMA" },
  { nisn: "0076775460", id: "6650", nama: "DESTI RAHAYU" },
  { nisn: "0077986875", id: "6651", nama: "DESTIA" },
  { nisn: "0069944236", id: "6652", nama: "ERIC ERIANTO" },
  { nisn: "0084352502", id: "6653", nama: "FAIZAH AZ ZAHRA" },
  { nisn: "0082539133", id: "6654", nama: "FITRI ULANDARI" },
  { nisn: "0074043979", id: "6655", nama: "GHEA LITA ANASTASYA" },
  { nisn: "0081353027", id: "6656", nama: "JHOVANI WIJAYA" },
  { nisn: "0082019386", id: "6657", nama: "KEISYA AGUSTIN RASFA AULIA" },
  { nisn: "0074731920", id: "6659", nama: "MAHARANI" },
  { nisn: "0076724319", id: "6660", nama: "NAURA GHIFARI AZHAR" },
  { nisn: "0083063479", id: "6662", nama: "PATRA ADITTIA" },
  { nisn: "0085480329", id: "6663", nama: "PUTRI SAPARA" },
  { nisn: "0079319957", id: "6664", nama: "RAFI SEPTA WIRA TAMA" },
  { nisn: "0082901449", id: "6665", nama: "RAKA RAMADHANI PRATAMA" },
  { nisn: "0081628824", id: "6666", nama: "REGITA MAHARANI" },
  { nisn: "0081133109", id: "6667", nama: "REGITHA ANINDYA AZZAHRA" },
  { nisn: "0076040547", id: "6668", nama: "RENDI ARISNANDO" },
  { nisn: "0078327818", id: "6669", nama: "RIDHO ZAENAL MUSTAQIM" },
  { nisn: "0076113354", id: "6670", nama: "RISTY WIDIASIH" },
  { nisn: "0084399894", id: "6671", nama: "SIFA RISTIANA" },
  { nisn: "", nama: "AMELIA DIANA" },
  { nisn: "", nama: "DESTA AMELIA" }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    console.log('🧹 Cleaning existing data...');
    await supabase.from('answers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('exams').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('attendance').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('faces').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('pengumuman').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert teachers
    console.log('👨‍🏫 Inserting teachers...');
    const { data: teachers, error: teacherError } = await supabase
      .from('users')
      .insert(dataGuru)
      .select();

    if (teacherError) {
      console.error('Error inserting teachers:', teacherError);
      return;
    }

    console.log(`✅ Inserted ${teachers.length} teachers`);

    // Insert students
    console.log('👨‍🎓 Inserting students...');
    const studentsToInsert = dataSiswa.map(siswa => ({
      nama: siswa.nama,
      nisn: siswa.nisn || null,
      role: 'siswa',
      face_embedding: null
    }));

    const { data: students, error: studentError } = await supabase
      .from('users')
      .insert(studentsToInsert)
      .select();

    if (studentError) {
      console.error('Error inserting students:', studentError);
      return;
    }

    console.log(`✅ Inserted ${students.length} students`);

    // Insert sample announcements
    console.log('📢 Inserting sample announcements...');
    const sampleAnnouncements = [
      {
        judul: "Selamat Datang di EduFace Cloud Pro",
        isi: "Sistem informasi sekolah dengan teknologi face recognition telah aktif. Silakan registrasi wajah Anda untuk menggunakan fitur absensi otomatis.",
        dibuat_oleh: teachers[0].id,
        tanggal: new Date().toISOString().split('T')[0]
      },
      {
        judul: "Panduan Penggunaan Face Recognition",
        isi: "1. Pastikan wajah terlihat jelas di kamera\n2. Hindari pencahayaan yang terlalu terang atau gelap\n3. Posisikan wajah menghadap kamera secara langsung\n4. Sistem akan otomatis mendeteksi dan mencatat kehadiran",
        dibuat_oleh: teachers[1].id,
        tanggal: new Date().toISOString().split('T')[0]
      }
    ];

    const { error: announcementError } = await supabase
      .from('pengumuman')
      .insert(sampleAnnouncements);

    if (announcementError) {
      console.error('Error inserting announcements:', announcementError);
      return;
    }

    console.log('✅ Inserted sample announcements');

    // Insert sample exam
    console.log('📝 Inserting sample exam...');
    const sampleExam = {
      judul: "Ujian Tengah Semester - Jaringan Komputer",
      deskripsi: "Ujian tengah semester mata pelajaran Teknik Jaringan Komputer dan Telekomunikasi",
      tanggal_mulai: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      tanggal_selesai: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days from now
      durasi_menit: 90,
      dibuat_oleh: teachers[0].id
    };

    const { data: exam, error: examError } = await supabase
      .from('exams')
      .insert([sampleExam])
      .select();

    if (examError) {
      console.error('Error inserting exam:', examError);
      return;
    }

    // Insert sample questions
    const sampleQuestions = [
      {
        exam_id: exam[0].id,
        pertanyaan: "Apa kepanjangan dari TCP/IP?",
        pilihan_a: "Transmission Control Protocol/Internet Protocol",
        pilihan_b: "Transfer Control Protocol/Internet Protocol",
        pilihan_c: "Transmission Communication Protocol/Internet Protocol",
        pilihan_d: "Transfer Communication Protocol/Internet Protocol",
        jawaban_benar: "a",
        nomor_urut: 1
      },
      {
        exam_id: exam[0].id,
        pertanyaan: "Port default untuk HTTP adalah?",
        pilihan_a: "21",
        pilihan_b: "80",
        pilihan_c: "443",
        pilihan_d: "8080",
        jawaban_benar: "b",
        nomor_urut: 2
      },
      {
        exam_id: exam[0].id,
        pertanyaan: "Topologi jaringan yang berbentuk lingkaran adalah?",
        pilihan_a: "Star",
        pilihan_b: "Bus",
        pilihan_c: "Ring",
        pilihan_d: "Mesh",
        jawaban_benar: "c",
        nomor_urut: 3
      }
    ];

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(sampleQuestions);

    if (questionsError) {
      console.error('Error inserting questions:', questionsError);
      return;
    }

    console.log('✅ Inserted sample exam and questions');

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Teachers: ${teachers.length}`);
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Announcements: ${sampleAnnouncements.length}`);
    console.log(`   - Exams: 1`);
    console.log(`   - Questions: ${sampleQuestions.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Run the seeding
seedDatabase();
