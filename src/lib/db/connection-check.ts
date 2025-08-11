/**
 * Database Connection Verification
 * Checks database connectivity and schema status on server startup
 */

import { PrismaClient } from '@prisma/client'

// Global for Prisma client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create a singleton Prisma client
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Verifies database connection and schema status
 */
export async function verifyDatabaseConnection(): Promise<{
  connected: boolean
  schemaReady: boolean
  error?: string
  details?: string
}> {
  try {
    console.log('🔍 Verifying database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Test if schema is applied by checking if tables exist
    try {
      // Try to count programs (this will fail if schema not applied)
      await prisma.program.count()
      console.log('✅ Database schema is ready')
      
      return {
        connected: true,
        schemaReady: true,
        details: 'Database connection and schema verified successfully'
      }
    } catch (schemaError: any) {
      if (schemaError.code === 'P2021') {
        console.log('⚠️  Database connected but schema not applied')
        console.log('💡 Run: npm run db:migrate')
        
        return {
          connected: true,
          schemaReady: false,
          error: 'Schema not applied',
          details: 'Database is connected but migrations need to be run. Execute: npm run db:migrate'
        }
      } else {
        console.log('⚠️  Database connected but schema issue:', schemaError.message)
        
        return {
          connected: true,
          schemaReady: false,
          error: 'Schema error',
          details: `Schema validation failed: ${schemaError.message}`
        }
      }
    }
    
  } catch (connectionError: any) {
    console.error('❌ Database connection failed!')
    console.error('Error:', connectionError.message)
    
    let errorDetails = `Connection failed: ${connectionError.message}`
    
    if (connectionError.message.includes('ECONNREFUSED')) {
      errorDetails += '\n\nTroubleshooting tips:\n1. Ensure PostgreSQL is running\n2. Check your DATABASE_URL in .env.local\n3. Verify the port (usually 5432)'
    }
    
    if (connectionError.message.includes('password authentication failed')) {
      errorDetails += '\n\nCheck your username and password in DATABASE_URL'
    }
    
    if (connectionError.message.includes('database') && connectionError.message.includes('does not exist')) {
      errorDetails += '\n\nCreate the database first or check the database name in DATABASE_URL'
    }
    
    return {
      connected: false,
      schemaReady: false,
      error: 'Connection failed',
      details: errorDetails
    }
  }
}

/**
 * Initialization function that runs database checks
 * Called once when the server starts
 */
let connectionChecked = false

export async function initializeDatabase(): Promise<void> {
  // Only check once per server startup
  if (connectionChecked) return
  connectionChecked = true
  
  // Skip database checks in certain environments
  if (process.env.SKIP_DB_CHECK === 'true') {
    console.log('⏭️  Database check skipped (SKIP_DB_CHECK=true)')
    return
  }
  
  console.log('\n=== Database Initialization ===')
  
  const result = await verifyDatabaseConnection()
  
  if (!result.connected) {
    console.error('\n❌ CRITICAL: Database connection failed!')
    console.error(result.details)
    
    if (process.env.NODE_ENV === 'production') {
      console.error('🚨 Server will continue but database functionality will be unavailable')
    } else {
      console.error('🚨 Development server will continue but you need to fix database connection')
      console.error('\n📖 See docs/environment-setup.md for setup instructions')
    }
  } else if (!result.schemaReady) {
    console.warn('\n⚠️  Database connected but schema not ready!')
    console.warn(result.details)
    console.warn('🔧 Run: npm run db:migrate')
  } else {
    console.log('✅ Database fully operational!')
  }
  
  console.log('=== Database Check Complete ===\n')
}

/**
 * Get database status for health checks
 */
export async function getDatabaseStatus() {
  try {
    const result = await verifyDatabaseConnection()
    return {
      status: result.connected && result.schemaReady ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      ...result
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      connected: false,
      schemaReady: false,
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
