/**
 * Prisma Database Client
 * Provides a singleton Prisma client instance with connection management
 */

import { PrismaClient } from '@prisma/client'

// Global for Prisma client in development to prevent multiple instances
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with enhanced configuration
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
})

// In development, store the client globally to prevent multiple instances
// due to hot reloading in Next.js
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/**
 * Graceful shutdown handler for Prisma client
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
}

// Handle graceful shutdown
if (typeof process !== 'undefined') {
  process.on('beforeExit', disconnectDatabase)
  process.on('SIGINT', disconnectDatabase)
  process.on('SIGTERM', disconnectDatabase)
}

export default prisma
