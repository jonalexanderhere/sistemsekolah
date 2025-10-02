const fs = require('fs');
const path = require('path');
const https = require('https');

// Base URL for face-api.js models
const BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

// Models to download with their files
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
  console.log('📁 Created models directory');
}

// Download function
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
        fs.unlink(filepath, () => {}); // Delete the file on error
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Main download function
async function downloadModels() {
  console.log('🚀 Starting face-api.js models download...');
  console.log(`📂 Target directory: ${modelsDir}`);
  
  let totalFiles = 0;
  let downloadedFiles = 0;
  
  // Count total files
  for (const modelFiles of Object.values(MODELS)) {
    totalFiles += modelFiles.length;
  }
  
  try {
    for (const [modelName, files] of Object.entries(MODELS)) {
      console.log(`\n📦 Downloading ${modelName} model...`);
      
      for (const filename of files) {
        const url = `${BASE_URL}/${filename}`;
        const filepath = path.join(modelsDir, filename);
        
        // Check if file already exists
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
          console.error(`   ❌ Failed to download ${filename}:`, error.message);
        }
      }
    }
    
    console.log(`\n🎉 Download completed!`);
    console.log(`📊 Summary: ${downloadedFiles}/${totalFiles} files ready`);
    
    // Verify all required files exist
    console.log('\n🔍 Verifying model files...');
    let allFilesExist = true;
    
    for (const [modelName, files] of Object.entries(MODELS)) {
      console.log(`\n📋 ${modelName}:`);
      for (const filename of files) {
        const filepath = path.join(modelsDir, filename);
        const exists = fs.existsSync(filepath);
        const size = exists ? fs.statSync(filepath).size : 0;
        
        console.log(`   ${exists ? '✅' : '❌'} ${filename} ${exists ? `(${(size/1024).toFixed(1)}KB)` : '(missing)'}`);
        
        if (!exists) {
          allFilesExist = false;
        }
      }
    }
    
    if (allFilesExist) {
      console.log('\n🎯 All model files are ready for face recognition!');
      console.log('\n📝 Next steps:');
      console.log('   1. Run: npm run dev');
      console.log('   2. Navigate to the face registration page');
      console.log('   3. Register your face for attendance tracking');
    } else {
      console.log('\n⚠️  Some model files are missing. Please run this script again.');
    }
    
  } catch (error) {
    console.error('❌ Error downloading models:', error);
  }
}

// Alternative download URLs (fallback)
const ALTERNATIVE_URLS = [
  'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights',
  'https://raw.githubusercontent.com/WebDevSimplified/Face-Recognition-JavaScript/master/models'
];

// Run the download
console.log('🤖 EduFace Cloud Pro - Model Downloader');
console.log('=====================================');
downloadModels().catch(console.error);

