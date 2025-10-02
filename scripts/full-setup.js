#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

console.log('🚀 EduFace Cloud Pro - Full Setup Script');
console.log('=' .repeat(50));

// Configuration
const CONFIG = {
  supabaseUrl: 'https://kfstxlcoegqanytvpbgp.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3R4bGNvZWdxYW55dHZwYmdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNzgzMzYsImV4cCI6MjA3NDk1NDMzNn0.04Rsbu-9yqVB-nP3dfm2tCqtYJ5JrIMJFv7bTeLOln0',
  appName: 'SISFOTJKT2',
  jwtSecret: 'eduface-cloud-pro-tjkt2-2024-secret-key'
};

// Step 1: Create .env.local file
function createEnvFile() {
  console.log('📝 Step 1: Creating .env.local file...');
  
  const envContent = `# Supabase Configuration - TJKT2 EduFace Cloud Pro
NEXT_PUBLIC_SUPABASE_URL=${CONFIG.supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${CONFIG.supabaseAnonKey}

# Service Role Key - WAJIB: Dapatkan dari Supabase Dashboard > Settings > API
# Ganti SERVICE_ROLE_KEY_HERE dengan service role key yang benar
SUPABASE_SERVICE_ROLE_KEY=SERVICE_ROLE_KEY_HERE

# App Configuration
NEXT_PUBLIC_APP_NAME=${CONFIG.appName}
JWT_SECRET=${CONFIG.jwtSecret}

# Development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
`;

  try {
    fs.writeFileSync('.env.local', envContent);
    console.log('✅ .env.local file created successfully');
    console.log('⚠️  IMPORTANT: Edit .env.local and add your SUPABASE_SERVICE_ROLE_KEY');
  } catch (error) {
    console.log('ℹ️  .env.local already exists or cannot be created');
    console.log('   Please create it manually with the configuration above');
  }
}

// Step 2: Test Supabase connection
async function testSupabaseConnection() {
  console.log('\n🔗 Step 2: Testing Supabase connection...');
  
  try {
    // Try to load service key from env
    require('dotenv').config({ path: '.env.local' });
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceKey || serviceKey === 'SERVICE_ROLE_KEY_HERE') {
      console.log('❌ Service role key not configured');
      console.log('   Please edit .env.local and add your service role key');
      return false;
    }

    const supabase = createClient(CONFIG.supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Test connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.log('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.log('❌ Connection test failed:', error.message);
    return false;
  }
}

// Step 3: Download face models
async function downloadFaceModels() {
  console.log('\n🤖 Step 3: Downloading face recognition models...');
  
  const https = require('https');
  const BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
  
  const MODELS = {
    'tiny_face_detector': [
      'tiny_face_detector_model-weights_manifest.json',
      'tiny_face_detector_model-shard1'
    ],
    'face_landmark_68': [
      'face_landmark_68_model-weights_manifest.json', 
      'face_landmark_68_model-shard1'
    ],
    'face_recognition': [
      'face_recognition_model-weights_manifest.json',
      'face_recognition_model-shard1',
      'face_recognition_model-shard2'
    ]
  };

  // Create models directory
  const modelsDir = path.join(process.cwd(), 'public', 'models');
  if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
  }

  function downloadFile(url, filepath) {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filepath);
      
      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
          return;
        }
        
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
        
        file.on('error', (err) => {
          fs.unlink(filepath, () => {});
          reject(err);
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }

  let totalFiles = 0;
  let downloadedFiles = 0;
  
  for (const modelFiles of Object.values(MODELS)) {
    totalFiles += modelFiles.length;
  }

  try {
    for (const [modelName, files] of Object.entries(MODELS)) {
      console.log(`   📦 Downloading ${modelName} model...`);
      
      for (const filename of files) {
        const url = `${BASE_URL}/${filename}`;
        const filepath = path.join(modelsDir, filename);
        
        if (fs.existsSync(filepath)) {
          console.log(`   ✅ ${filename} (already exists)`);
          downloadedFiles++;
          continue;
        }
        
        try {
          console.log(`   ⬇️  Downloading ${filename}...`);
          await downloadFile(url, filepath);
          console.log(`   ✅ ${filename} (downloaded)`);
          downloadedFiles++;
        } catch (error) {
          console.log(`   ❌ Failed to download ${filename}: ${error.message}`);
        }
      }
    }
    
    console.log(`✅ Models download completed: ${downloadedFiles}/${totalFiles} files`);
    return downloadedFiles === totalFiles;
  } catch (error) {
    console.log('❌ Error downloading models:', error.message);
    return false;
  }
}

// Step 4: Setup database schema
async function setupDatabase() {
  console.log('\n🗄️  Step 4: Setting up database schema...');
  
  try {
    require('dotenv').config({ path: '.env.local' });
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceKey || serviceKey === 'SERVICE_ROLE_KEY_HERE') {
      console.log('❌ Cannot setup database: Service role key not configured');
      console.log('   Please configure your service role key first');
      return false;
    }

    const supabase = createClient(CONFIG.supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Read schema file
    const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.log('❌ Schema file not found: supabase/schema.sql');
      return false;
    }

    console.log('ℹ️  Database schema setup requires manual execution in Supabase Dashboard');
    console.log('   1. Open Supabase Dashboard > SQL Editor');
    console.log('   2. Copy contents of supabase/schema.sql');
    console.log('   3. Paste and run the SQL');
    
    return true;
  } catch (error) {
    console.log('❌ Database setup error:', error.message);
    return false;
  }
}

// Step 5: Seed database
async function seedDatabase() {
  console.log('\n🌱 Step 5: Seeding database...');
  
  try {
    require('dotenv').config({ path: '.env.local' });
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceKey || serviceKey === 'SERVICE_ROLE_KEY_HERE') {
      console.log('❌ Cannot seed database: Service role key not configured');
      return false;
    }

    const supabase = createClient(CONFIG.supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
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

    // Data siswa TJKT 2
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

    // Clear existing data
    console.log('   🧹 Cleaning existing data...');
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert teachers
    console.log('   👨‍🏫 Inserting teachers...');
    const { data: teachers, error: teacherError } = await supabase
      .from('users')
      .insert(dataGuru)
      .select();

    if (teacherError) {
      console.log('❌ Error inserting teachers:', teacherError.message);
      return false;
    }

    // Insert students
    console.log('   👨‍🎓 Inserting students...');
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
      console.log('❌ Error inserting students:', studentError.message);
      return false;
    }

    console.log(`✅ Database seeded successfully!`);
    console.log(`   - Teachers: ${teachers.length}`);
    console.log(`   - Students: ${students.length}`);
    
    return true;
  } catch (error) {
    console.log('❌ Seeding error:', error.message);
    return false;
  }
}

// Step 6: Test system
async function testSystem() {
  console.log('\n🧪 Step 6: Testing system...');
  
  try {
    // Test models
    const modelsDir = path.join(process.cwd(), 'public', 'models');
    const modelFiles = [
      'tiny_face_detector_model-weights_manifest.json',
      'tiny_face_detector_model-shard1',
      'face_landmark_68_model-weights_manifest.json',
      'face_landmark_68_model-shard1',
      'face_recognition_model-weights_manifest.json',
      'face_recognition_model-shard1',
      'face_recognition_model-shard2'
    ];

    let modelsFound = 0;
    for (const file of modelFiles) {
      if (fs.existsSync(path.join(modelsDir, file))) {
        modelsFound++;
      }
    }

    console.log(`   📊 Face models: ${modelsFound}/${modelFiles.length} files`);

    // Test database connection
    require('dotenv').config({ path: '.env.local' });
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (serviceKey && serviceKey !== 'SERVICE_ROLE_KEY_HERE') {
      const supabase = createClient(CONFIG.supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });

      const { data: users, error } = await supabase.from('users').select('*');
      if (!error) {
        const siswaCount = users.filter(u => u.role === 'siswa').length;
        const guruCount = users.filter(u => u.role === 'guru').length;
        console.log(`   👥 Users: ${users.length} total (${siswaCount} siswa, ${guruCount} guru)`);
      }
    }

    console.log('✅ System test completed');
    return true;
  } catch (error) {
    console.log('❌ System test error:', error.message);
    return false;
  }
}

// Main setup function
async function runFullSetup() {
  console.log('\n🎯 Starting full setup process...\n');

  // Step 1: Create env file
  createEnvFile();

  // Step 2: Test connection
  const connectionOk = await testSupabaseConnection();
  
  // Step 3: Download models
  const modelsOk = await downloadFaceModels();

  // Step 4: Setup database (manual step)
  await setupDatabase();

  // Step 5: Seed database (if connection is ok)
  let seedOk = false;
  if (connectionOk) {
    seedOk = await seedDatabase();
  }

  // Step 6: Test system
  await testSystem();

  // Summary
  console.log('\n📊 SETUP SUMMARY');
  console.log('=' .repeat(50));
  console.log(`✅ Environment file: Created`);
  console.log(`${connectionOk ? '✅' : '❌'} Database connection: ${connectionOk ? 'OK' : 'Failed'}`);
  console.log(`${modelsOk ? '✅' : '❌'} Face models: ${modelsOk ? 'Downloaded' : 'Incomplete'}`);
  console.log(`${seedOk ? '✅' : '❌'} Database seed: ${seedOk ? 'Completed' : 'Skipped'}`);

  console.log('\n🎯 NEXT STEPS:');
  if (!connectionOk) {
    console.log('1. Edit .env.local and add your SUPABASE_SERVICE_ROLE_KEY');
    console.log('2. Get service role key from: https://supabase.com/dashboard > Settings > API');
  }
  console.log('3. Run database schema in Supabase Dashboard SQL Editor');
  console.log('4. Start development server: npm run dev');
  console.log('5. Open: http://localhost:3000');

  console.log('\n🔑 LOGIN CREDENTIALS:');
  console.log('Guru:');
  console.log('  - DIDIK KURNIAWAN: 198103102010011012');
  console.log('  - ADE FIRMANSYAH: 3855773674130022');
  console.log('Siswa (contoh):');
  console.log('  - ALLDOO SAPUTRA: 0089990908');
  console.log('  - ALYA ANGGITA: 0071887022');
  console.log('  - (29 siswa total - lihat database)');
}

// Run setup
runFullSetup().catch(console.error);

