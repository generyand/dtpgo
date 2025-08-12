import { NextResponse } from 'next/server'
import { getPrograms } from '@/lib/db/queries/programs'

export async function GET() {
  try {
    const programs = await getPrograms()
    return NextResponse.json({ programs }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load programs'
    return NextResponse.json({ error: message }, { status: 500 })
  }
} 