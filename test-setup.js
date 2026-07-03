// Simple test to check if the application can start
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking HR System Setup...\n');

// Check if all required files exist
const requiredFiles = [
  'package.json',
  'backend/package.json',
  'frontend/package.json',
  'backend/server.js',
  'frontend/src/App.js',
  'backend/.env'
];

console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

// Check if node_modules exist
console.log('\n📦 Checking dependencies:');
const nodeModulesPaths = [
  'node_modules',
  'backend/node_modules',
  'frontend/node_modules'
];

nodeModulesPaths.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}`);
  } else {
    console.log(`❌ ${dir} - MISSING (run npm install)`);
  }
});

// Check environment file content
console.log('\n🔧 Checking environment configuration:');
if (fs.existsSync('backend/.env')) {
  const envContent = fs.readFileSync('backend/.env', 'utf8');
  const requiredEnvVars = ['NODE_ENV', 'PORT', 'MONGODB_URI', 'JWT_SECRET'];
  
  requiredEnvVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`✅ ${varName}`);
    } else {
      console.log(`❌ ${varName} - MISSING in .env`);
    }
  });
} else {
  console.log('❌ backend/.env - MISSING');
}

console.log('\n🚀 Setup check complete!');
console.log('\nTo start the application:');
console.log('1. Make sure MongoDB is running');
console.log('2. Run: npm run dev');
console.log('3. Open http://localhost:3000 in your browser');
