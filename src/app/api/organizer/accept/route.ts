import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/client'
import { organizerAcceptSchema } from '@/lib/validations/organizer-accept'
import { createSupabaseServiceClient } from '@/lib/auth/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = organizerAcceptSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 })
    }

    const { token, password } = parsed.data

    // Look up organizer by token and ensure not expired
    const organizer = await prisma.organizer.findFirst({
      where: {
        invitationToken: token,
        invitationExpiresAt: { gt: new Date() },
      },
    })

    if (!organizer) {
      return Response.json({ error: 'Invalid or expired invitation token' }, { status: 400 })
    }

    // Create or update Supabase user password
    const admin = createSupabaseServiceClient()

    // Find user by email
    const { data: listRes, error: listErr } = await admin.auth.admin.listUsers()
    if (listErr) {
      return Response.json({ error: listErr.message || 'Failed to query users' }, { status: 500 })
    }
    const existing = listRes.users.find((u: { email?: string }) => u.email?.toLowerCase() === organizer.email.toLowerCase())

    if (existing) {
      const { error: setPassError } = await admin.auth.admin.updateUserById(existing.id, {
        password,
        user_metadata: { role: organizer.role },
      })
      if (setPassError) {
        return Response.json({ error: setPassError.message || 'Failed to set password' }, { status: 500 })
      }
    } else {
      const { error: signUpError } = await admin.auth.admin.createUser({
        email: organizer.email,
        password,
        email_confirm: true,
        user_metadata: { role: organizer.role },
      })
      if (signUpError) {
        return Response.json({ error: signUpError.message || 'Failed to create organizer account' }, { status: 500 })
      }
    }

    // Activate organizer, clear token
    await prisma.organizer.update({
      where: { id: organizer.id },
      data: {
        isActive: true,
        invitationToken: null,
        invitationExpiresAt: null,
      },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Organizer accept error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}


