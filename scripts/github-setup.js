#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

console.log('📦 GitHub Setup Script - EduFace Cloud Pro');
console.log('=' .repeat(50));

// Create .gitignore if not exists
function createGitIgnore() {
  console.log('📝 Creating .gitignore...');
  
  const gitignoreContent = `# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Environment variables
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Face models (large files - use Git LFS if needed)
# public/models/*.json
# public/models/*-shard*

# Temporary files
tmp/
temp/
`;

  fs.writeFileSync('.gitignore', gitignoreContent);
  console.log('✅ .gitignore created');
}

// Create README for GitHub
function createGitHubReadme() {
  console.log('📄 Creating GitHub README...');
  
  const readmeContent = `# 🎓 EduFace Cloud Pro - SISFOTJKT2

Sistem Informasi Sekolah TJKT 2 dengan Face Recognition untuk absensi otomatis.

## ✨ Features

- 🤖 **Face Recognition** - Absensi otomatis dengan AI
- ⏰ **Dynamic Time Settings** - Guru dapat atur waktu absensi
- 📊 **Export Data** - Excel & PDF reports
- 👥 **Multi-user Support** - Siswa & Guru
- 📱 **Responsive Design** - Mobile-friendly
- ☁️ **Cloud Ready** - Deploy ke Vercel

## 🚀 Quick Start

\`\`\`bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/eduface-cloud-pro.git
cd eduface-cloud-pro

# Install dependencies
npm install

# Setup environment
cp env.example .env.local
# Edit .env.local - add SUPABASE_SERVICE_ROLE_KEY

# Full setup
npm run full-setup

# Start development
npm run dev
\`\`\`

## 🔑 Login Credentials

### Guru:
- **DIDIK KURNIAWAN**: \`198103102010011012\`
- **ADE FIRMANSYAH**: \`3855773674130022\`

### Siswa (29 total):
- **ALLDOO SAPUTRA**: \`0089990908\`
- **ALYA ANGGITA**: \`0071887022\`
- **AMELIA**: \`0071317242\`
- Dan 26 siswa lainnya...

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: TailwindCSS + shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Face AI**: face-api.js (TensorFlow.js)
- **Export**: Excel (xlsx) & PDF (jsPDF)
- **Deployment**: Vercel

## 📁 Project Structure

\`\`\`
eduface-cloud-pro/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── face-register/     # Face registration
│   ├── face-attendance/   # Face attendance
│   ├── attendance/        # Attendance data
│   ├── settings/          # Time settings
│   └── users/            # User management
├── components/            # React components
├── lib/                  # Utilities
├── scripts/              # Setup scripts
├── supabase/            # Database schema
└── public/models/       # Face AI models
\`\`\`

## 🔧 Configuration

### Environment Variables:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://kfstxlcoegqanytvpbgp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_NAME=SISFOTJKT2
JWT_SECRET=your_jwt_secret
\`\`\`

### Database Schema:
- Run \`supabase/schema.sql\` in Supabase Dashboard
- Includes 11 tables with RLS policies
- Optimized indexes for performance

## 🚀 Deployment

### Vercel (Recommended):
\`\`\`bash
npm i -g vercel
vercel
\`\`\`

Set environment variables in Vercel Dashboard.

## 📚 Documentation

- \`SETUP.md\` - Detailed setup guide
- \`DEPLOYMENT.md\` - Deployment instructions
- \`QUICK_START.md\` - 5-minute setup
- \`GET_SERVICE_KEY.md\` - Supabase configuration

## 🎯 Usage

1. **Login** - Use NISN (siswa) or Identitas (guru)
2. **Register Face** - One-time face registration
3. **Attendance** - Automatic face recognition
4. **Settings** - Configure time schedules (guru only)
5. **Export** - Generate reports (Excel/PDF)

## 🔒 Security

- Row Level Security (RLS) policies
- Face embeddings only (no images stored)
- Role-based access control
- Environment variable protection

## 📊 Features Detail

### For Students:
- Face registration
- Automatic attendance
- View attendance history
- Export personal reports

### For Teachers:
- Configure attendance times
- Manage student data
- View all attendance records
- Export class reports
- System settings

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - See LICENSE file for details.

## 👥 Team

- **School**: TJKT 2
- **System**: EduFace Cloud Pro
- **Year**: 2024

---

**Made with ❤️ for TJKT 2 Students & Teachers**
`;

  fs.writeFileSync('README-GITHUB.md', readmeContent);
  console.log('✅ GitHub README created');
}

// Initialize Git repository
function initGitRepo() {
  console.log('🔧 Initializing Git repository...');
  
  try {
    // Check if already a git repo
    if (fs.existsSync('.git')) {
      console.log('ℹ️  Git repository already exists');
      return;
    }

    execSync('git init', { stdio: 'inherit' });
    console.log('✅ Git repository initialized');
  } catch (error) {
    console.log('❌ Error initializing Git:', error.message);
  }
}

// Add all files to git
function addFilesToGit() {
  console.log('📁 Adding files to Git...');
  
  try {
    execSync('git add .', { stdio: 'inherit' });
    console.log('✅ Files added to Git');
  } catch (error) {
    console.log('❌ Error adding files:', error.message);
  }
}

// Create initial commit
function createInitialCommit() {
  console.log('💾 Creating initial commit...');
  
  try {
    execSync('git commit -m "🎉 Initial commit: EduFace Cloud Pro - SISFOTJKT2"', { stdio: 'inherit' });
    console.log('✅ Initial commit created');
  } catch (error) {
    console.log('❌ Error creating commit:', error.message);
  }
}

// Main function
function setupGitHub() {
  console.log('\n🎯 Setting up GitHub repository...\n');

  createGitIgnore();
  createGitHubReadme();
  initGitRepo();
  addFilesToGit();
  createInitialCommit();

  console.log('\n📊 GITHUB SETUP COMPLETE');
  console.log('=' .repeat(50));
  console.log('✅ .gitignore created');
  console.log('✅ README-GITHUB.md created');
  console.log('✅ Git repository initialized');
  console.log('✅ Initial commit created');

  console.log('\n🚀 NEXT STEPS:');
  console.log('1. Create repository on GitHub');
  console.log('2. Add remote origin:');
  console.log('   git remote add origin https://github.com/YOUR_USERNAME/eduface-cloud-pro.git');
  console.log('3. Push to GitHub:');
  console.log('   git branch -M main');
  console.log('   git push -u origin main');
  console.log('4. Deploy to Vercel from GitHub');

  console.log('\n📝 REPOSITORY INFO:');
  console.log('Name: eduface-cloud-pro');
  console.log('Description: Sistem Informasi Sekolah TJKT 2 dengan Face Recognition');
  console.log('Topics: nextjs, supabase, face-recognition, education, typescript');
}

// Run setup
setupGitHub();

