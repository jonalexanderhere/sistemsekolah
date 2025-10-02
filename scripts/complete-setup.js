const { setupEnvironment } = require('./setup-env');
const { fullSetup } = require('./setup-database');
const { fullImport } = require('./import-students');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function completeSetup() {
    console.log('🎯 SISFOTJKT2 - Complete System Setup');
    console.log('=====================================');
    console.log('');
    
    try {
        // Step 1: Setup Environment
        console.log('📋 Step 1: Environment Configuration');
        console.log('-----------------------------------');
        setupEnvironment();
        console.log('');
        
        // Step 2: Install Dependencies
        console.log('📦 Step 2: Installing Dependencies');
        console.log('----------------------------------');
        console.log('Installing npm packages...');
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Dependencies installed successfully');
        console.log('');
        
        // Step 3: Download Face Recognition Models
        console.log('🤖 Step 3: Downloading Face Recognition Models');
        console.log('----------------------------------------------');
        
        const modelsDir = path.join(process.cwd(), 'public', 'models');
        if (!fs.existsSync(modelsDir)) {
            fs.mkdirSync(modelsDir, { recursive: true });
        }
        
        // Check if models exist
        const modelFiles = [
            'tiny_face_detector_model-weights_manifest.json',
            'face_landmark_68_model-weights_manifest.json',
            'face_recognition_model-weights_manifest.json'
        ];
        
        const modelsExist = modelFiles.every(file => 
            fs.existsSync(path.join(modelsDir, file))
        );
        
        if (modelsExist) {
            console.log('✅ Face recognition models already exist');
        } else {
            console.log('Downloading face recognition models...');
            try {
                execSync('npm run download-models', { stdio: 'inherit' });
                console.log('✅ Face recognition models downloaded');
            } catch (error) {
                console.warn('⚠️  Model download failed, but continuing setup...');
            }
        }
        console.log('');
        
        // Step 4: Database Setup
        console.log('🗄️  Step 4: Database Configuration');
        console.log('----------------------------------');
        await fullSetup();
        console.log('');
        
        // Step 5: Import Student Data
        console.log('👥 Step 5: Importing Student Data');
        console.log('---------------------------------');
        await fullImport();
        console.log('');
        
        // Step 6: Final Verification
        console.log('🔍 Step 6: Final System Verification');
        console.log('------------------------------------');
        
        // Check if all required files exist
        const requiredFiles = [
            '.env.local',
            'package.json',
            'next.config.js',
            'tailwind.config.js'
        ];
        
        let allFilesExist = true;
        for (const file of requiredFiles) {
            if (fs.existsSync(path.join(process.cwd(), file))) {
                console.log(`✅ ${file} exists`);
            } else {
                console.log(`❌ ${file} missing`);
                allFilesExist = false;
            }
        }
        
        if (allFilesExist) {
            console.log('✅ All required files are present');
        }
        
        console.log('');
        console.log('🎉 COMPLETE SETUP FINISHED SUCCESSFULLY!');
        console.log('========================================');
        console.log('');
        console.log('🚀 Next Steps:');
        console.log('1. Start the development server: npm run dev');
        console.log('2. Open http://localhost:3000 in your browser');
        console.log('3. Login with default credentials:');
        console.log('   - Admin: admin@sisfotjkt2.com');
        console.log('   - Teacher: guru@sisfotjkt2.com');
        console.log('   - Student: siswa1@sisfotjkt2.com');
        console.log('');
        console.log('📚 Features Available:');
        console.log('- Face Recognition Attendance');
        console.log('- User Management');
        console.log('- Attendance Reports');
        console.log('- Announcements');
        console.log('- Settings Configuration');
        console.log('');
        console.log('⚠️  Security Notes:');
        console.log('- Change default passwords in production');
        console.log('- Keep .env files secure');
        console.log('- Configure proper RLS policies for production');
        console.log('');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        console.log('');
        console.log('🔧 Troubleshooting:');
        console.log('1. Check your internet connection');
        console.log('2. Verify Supabase credentials are correct');
        console.log('3. Ensure you have Node.js 18+ installed');
        console.log('4. Try running individual setup steps manually');
        process.exit(1);
    }
}

if (require.main === module) {
    completeSetup();
}

module.exports = { completeSetup };
