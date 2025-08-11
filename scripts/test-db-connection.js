/**
 * Comprehensive Database and System Test Script
 * Run with: npm run db:test
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

async function testEnvironmentSetup() {
  console.log('\n=== Environment Setup Test ===')
  
  // Check for .env.local file
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env.local file not found')
    console.log('📖 Create .env.local using docs/environment-setup.md as a guide')
    return false
  } else {
    console.log('✅ .env.local file exists')
  }
  
  // Check required environment variables
  const requiredVars = ['DATABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']
  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.log('⚠️  Missing required environment variables:')
    missingVars.forEach(varName => console.log(`   - ${varName}`))
    return false
  } else {
    console.log('✅ All required environment variables are set')
  }
  
  return true
}

async function testDatabaseConnection() {
  console.log('\n=== Database Connection Test ===')
  const prisma = new PrismaClient()
  
  try {
    console.log('🔍 Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Test if we can query (this will fail if migrations haven't run)
    try {
      const programCount = await prisma.program.count()
      console.log(`✅ Database schema is ready! Found ${programCount} programs.`)
      
      // Test all tables
      const studentCount = await prisma.student.count()
      const registrationAttemptCount = await prisma.registrationAttempt.count()
      const emailStatusCount = await prisma.emailStatus.count()
      
      console.log(`📊 Database statistics:`)
      console.log(`   - Programs: ${programCount}`)
      console.log(`   - Students: ${studentCount}`)
      console.log(`   - Registration Attempts: ${registrationAttemptCount}`)
      console.log(`   - Email Status Records: ${emailStatusCount}`)
      
      return true
    } catch (error) {
      if (error.code === 'P2021') {
        console.log('⚠️  Database connected but schema not applied yet.')
        console.log('💡 Run: npm run db:migrate')
        return false
      } else {
        console.log('⚠️  Database connected but schema issue:', error.message)
        return false
      }
    }
    
  } catch (error) {
    console.error('❌ Database connection failed!')
    console.error('Error:', error.message)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Troubleshooting tips:')
      console.log('1. Ensure PostgreSQL is running')
      console.log('2. Check your DATABASE_URL in .env.local')
      console.log('3. Verify the port (usually 5432)')
    }
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Check your username and password in DATABASE_URL')
    }
    
    if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('\n💡 Create the database first or check the database name in DATABASE_URL')
    }
    
    return false
  } finally {
    await prisma.$disconnect()
  }
}

async function testSupabaseConnection() {
  console.log('\n=== Supabase Connection Test ===')
  
  try {
    // Test if Supabase environment variables are properly formatted
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('⚠️  Supabase environment variables not set')
      return false
    }
    
    if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
      console.log('⚠️  NEXT_PUBLIC_SUPABASE_URL format looks incorrect')
      console.log('Expected format: https://your-project-ref.supabase.co')
      return false
    }
    
    console.log('✅ Supabase environment variables are properly formatted')
    console.log(`🔗 Supabase URL: ${supabaseUrl}`)
    
    return true
  } catch (error) {
    console.log('⚠️  Error testing Supabase configuration:', error.message)
    return false
  }
}

async function runAllTests() {
  console.log('🧪 DTP Attendance System - Comprehensive Test Suite')
  console.log('===================================================')
  
  let allTestsPassed = true
  
  // Test 1: Environment Setup
  const envTest = await testEnvironmentSetup()
  if (!envTest) allTestsPassed = false
  
  // Test 2: Supabase Configuration
  const supabaseTest = await testSupabaseConnection()
  if (!supabaseTest) allTestsPassed = false
  
  // Test 3: Database Connection
  const dbTest = await testDatabaseConnection()
  if (!dbTest) allTestsPassed = false
  
  // Summary
  console.log('\n=== Test Summary ===')
  if (allTestsPassed) {
    console.log('🎉 All tests passed! Your system is ready for development.')
    console.log('\n📋 Next steps:')
    console.log('1. Start development server: npm run dev')
    console.log('2. View database: npm run db:studio')
    console.log('3. Check health endpoint: http://localhost:3000/api/health')
  } else {
    console.log('❌ Some tests failed. Please fix the issues above before proceeding.')
    console.log('\n📖 See docs/environment-setup.md for detailed setup instructions')
  }
  
  return allTestsPassed
}

// Run the test if this script is executed directly
if (require.main === module) {
  runAllTests()
    .then((success) => process.exit(success ? 0 : 1))
    .catch(() => process.exit(1))
}

module.exports = { 
  testEnvironmentSetup,
  testDatabaseConnection, 
  testSupabaseConnection,
  runAllTests
}
