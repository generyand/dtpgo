import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { authenticateAdminApi, createAuthErrorResponse } from '@/lib/auth/api-auth'
import { prisma } from '@/lib/db/client'
import { sendOrganizerInvitationEmail } from '@/lib/email/invitation-service'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await authenticateAdminApi(request)
    if (!authResult.success) {
      return createAuthErrorResponse(authResult)
    }

    const adminUser = authResult.user!
    const organizerId = params.id

    const organizer = await prisma.organizer.findUnique({ where: { id: organizerId } })
    if (!organizer) {
      return NextResponse.json({ error: 'Organizer not found' }, { status: 404 })
    }

    // Generate a fresh token and expiry (48 hours)
    const token = crypto.randomBytes(32).toString('base64url')
    const invitationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 48)

    await prisma.organizer.update({
      where: { id: organizerId },
      data: { invitationToken: token, invitationExpiresAt },
    })

    const origin = request.headers.get('origin') || request.nextUrl.origin
    const inviteLink = `${origin}/organizer/accept?token=${encodeURIComponent(token)}`

    const sendResult = await sendOrganizerInvitationEmail({
      recipientEmail: organizer.email,
      recipientName: organizer.fullName || organizer.email,
      inviteLink,
    })

    // Update invitedAt timestamp
    await prisma.organizer.update({
      where: { id: organizerId },
      data: { invitedAt: new Date() },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'admin_action',
        action: 'resend_invitation',
        description: `Admin ${adminUser.email} resent invitation to organizer ${organizer.email}`,
        organizerId: organizerId,
        userId: adminUser.id,
        metadata: { organizerEmail: organizer.email, messageId: sendResult.messageId },
        source: 'admin',
        category: 'authentication',
        severity: 'info',
      },
    })

    return NextResponse.json({ success: true, messageId: sendResult.messageId })
  } catch (error) {
    console.error('Error resending invitation:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to resend organizer invitation' },
      { status: 500 }
    )
  }
}


