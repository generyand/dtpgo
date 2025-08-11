/**
 * Health Check API Endpoint
 * Provides system health status including database connectivity
 */

import { NextResponse } from 'next/server'
import { getDatabaseStatus } from '@/lib/db/connection-check'

export async function GET() {
  try {
    const dbStatus = await getDatabaseStatus()
    
    const healthData = {
      status: dbStatus.status,
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus.status,
          connected: dbStatus.connected,
          schemaReady: dbStatus.schemaReady,
          error: dbStatus.error || null,
          details: dbStatus.details || null
        },
        server: {
          status: 'healthy',
          uptime: process.uptime(),
          environment: process.env.NODE_ENV || 'unknown'
        }
      },
      version: process.env.npm_package_version || '1.0.0'
    }
    
    // Return appropriate HTTP status based on overall health
    const httpStatus = dbStatus.status === 'healthy' ? 200 : 
                      dbStatus.status === 'degraded' ? 206 : 503
    
    return NextResponse.json(healthData, { status: httpStatus })
    
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}

export async function HEAD() {
  // Quick health check for load balancers
  try {
    const dbStatus = await getDatabaseStatus()
    const httpStatus = dbStatus.status === 'healthy' ? 200 : 503
    return new NextResponse(null, { status: httpStatus })
  } catch {
    return new NextResponse(null, { status: 503 })
  }
}
