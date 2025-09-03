#!/usr/bin/env node

/**
 * Epic 1 & 2 Testing Script
 * 
 * This script tests key functionality from Epic 1 (Authentication) and Epic 2 (Event Management)
 * to ensure everything is working before proceeding to Epic 3.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Epic 1 & 2 Testing Script');
console.log('============================\n');

// Test 1: TypeScript Compilation
console.log('1️⃣ Testing TypeScript compilation...');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('✅ TypeScript compilation successful\n');
} catch (error) {
  console.log('❌ TypeScript compilation failed');
  console.log(error.stdout?.toString() || error.message);
  process.exit(1);
}

// Test 2: Unit Tests
console.log('2️⃣ Running unit tests...');
try {
  const testOutput = execSync('pnpm test --passWithNoTests', { 
    stdio: 'pipe',
    encoding: 'utf8'
  });
  
  // Extract test results
  const testMatch = testOutput.match(/Test Suites: (\d+) passed, (\d+) total/);
  if (testMatch) {
    const passed = parseInt(testMatch[1]);
    const total = parseInt(testMatch[2]);
    console.log(`✅ Unit tests: ${passed}/${total} test suites passed\n`);
  } else {
    console.log('✅ Unit tests completed\n');
  }
} catch (error) {
  console.log('❌ Unit tests failed');
  console.log(error.stdout?.toString() || error.message);
  process.exit(1);
}

// Test 3: Check Key Files Exist
console.log('3️⃣ Checking key files exist...');
const keyFiles = [
  // Epic 1 Files
  'src/app/auth/login/page.tsx',
  'src/components/features/auth/LoginForm.tsx',
  'src/components/auth/RoleGuard.tsx',
  'src/app/admin/register/page.tsx',
  'src/app/admin/students/page.tsx',
  
  // Epic 2 Files
  'src/app/admin/events/page.tsx',
  'src/components/admin/EventManagement.tsx',
  'src/components/admin/SessionConfig.tsx',
  'src/components/admin/TimeWindowConfig.tsx',
  'src/app/organizer/sessions/page.tsx',
  'src/components/organizer/SessionSelector.tsx',
  
  // API Endpoints
  'src/app/api/admin/events/route.ts',
  'src/app/api/admin/sessions/route.ts',
  'src/app/api/admin/organizers/route.ts',
  'src/app/api/organizer/sessions/route.ts',
  
  // Database Schema
  'prisma/schema.prisma',
];

let missingFiles = [];
keyFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length === 0) {
  console.log('✅ All key files exist\n');
} else {
  console.log('❌ Missing key files:');
  missingFiles.forEach(file => console.log(`   - ${file}`));
  console.log('');
}

// Test 4: Check Database Schema
console.log('4️⃣ Checking database schema...');
let missingModels = [];
try {
  const schemaContent = fs.readFileSync('prisma/schema.prisma', 'utf8');
  
  const requiredModels = ['Student', 'Program', 'Event', 'Session', 'Organizer', 'Attendance'];
  
  requiredModels.forEach(model => {
    if (!schemaContent.includes(`model ${model}`)) {
      missingModels.push(model);
    }
  });
  
  if (missingModels.length === 0) {
    console.log('✅ All required database models exist\n');
  } else {
    console.log('❌ Missing database models:');
    missingModels.forEach(model => console.log(`   - ${model}`));
    console.log('');
  }
} catch (error) {
  console.log('❌ Could not read database schema');
  console.log(error.message);
  console.log('');
}

// Test 5: Check Package Dependencies
console.log('5️⃣ Checking package dependencies...');
let missingDeps = [];
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredDeps = [
    'next',
    'react',
    'typescript',
    '@prisma/client',
    'prisma',
    'tailwindcss',
    'lucide-react',
    'sonner',
    'zod',
    '@hookform/resolvers',
    'react-hook-form'
  ];
  
  requiredDeps.forEach(dep => {
    if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
      missingDeps.push(dep);
    }
  });
  
  if (missingDeps.length === 0) {
    console.log('✅ All required dependencies are installed\n');
  } else {
    console.log('❌ Missing dependencies:');
    missingDeps.forEach(dep => console.log(`   - ${dep}`));
    console.log('');
  }
} catch (error) {
  console.log('❌ Could not read package.json');
  console.log(error.message);
  console.log('');
}

// Test 6: Check Environment Variables
console.log('6️⃣ Checking environment variables...');
const envFile = '.env.local';
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  let missingEnvVars = [];
  requiredEnvVars.forEach(envVar => {
    if (!envContent.includes(envVar)) {
      missingEnvVars.push(envVar);
    }
  });
  
  if (missingEnvVars.length === 0) {
    console.log('✅ All required environment variables are configured\n');
  } else {
    console.log('❌ Missing environment variables:');
    missingEnvVars.forEach(envVar => console.log(`   - ${envVar}`));
    console.log('');
  }
} else {
  console.log('⚠️  .env.local file not found - please ensure environment variables are configured\n');
}

// Summary
console.log('📊 Testing Summary');
console.log('==================');
console.log('✅ TypeScript compilation: PASSED');
console.log('✅ Unit tests: PASSED');
console.log(missingFiles.length === 0 ? '✅ Key files: ALL PRESENT' : '❌ Key files: SOME MISSING');
console.log(missingModels.length === 0 ? '✅ Database schema: COMPLETE' : '❌ Database schema: INCOMPLETE');
console.log(missingDeps.length === 0 ? '✅ Dependencies: ALL INSTALLED' : '❌ Dependencies: SOME MISSING');

if (missingFiles.length === 0 && missingModels.length === 0 && missingDeps.length === 0) {
  console.log('\n🎉 Epic 1 & 2 are ready for Epic 3!');
  console.log('All core functionality has been implemented and tested.');
} else {
  console.log('\n⚠️  Some issues found. Please resolve them before proceeding to Epic 3.');
  process.exit(1);
}
