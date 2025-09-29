import { sendEmail } from './email-service'

interface SendOrganizerInvitationParams {
  recipientEmail: string
  recipientName: string
  inviteLink: string
  eventName?: string
}

export async function sendOrganizerInvitationEmail(params: SendOrganizerInvitationParams) {
  const html = buildOrganizerInvitationHtml(params)

  return await sendEmail({
    to: params.recipientEmail,
    subject: params.eventName
      ? `Invitation to organize ${params.eventName} — DTP Attendance`
      : 'Organizer invitation — DTP Attendance',
    html,
    text: `Hi ${params.recipientName},\n\nYou have been invited to join the DTP Attendance system${
      params.eventName ? ` for ${params.eventName}` : ''
    }.\n\nOpen this link to accept: ${params.inviteLink}`,
  })
}

function buildOrganizerInvitationHtml({ recipientName, inviteLink, eventName }: SendOrganizerInvitationParams): string {
  const intro = eventName
    ? `You have been invited to organize <strong>${escapeHtml(eventName)}</strong> on the DTP Attendance system.`
    : 'You have been invited to join the DTP Attendance system as an organizer.'

  const escapedName = escapeHtml(recipientName)
  const escapedLink = escapeHtml(inviteLink)

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta http-equiv="x-ua-compatible" content="ie=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>You're invited to organize with DTP Attendance</title>
  <style>
    body { margin:0; padding:0; background-color:#f5f6f8; }
  </style>
  </head>
  <body>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f5f6f8; padding:24px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff; border-radius:8px; overflow:hidden; font-family:Inter, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color:#0f172a;">
            <tr>
              <td style="padding:24px 32px; background-color:#0ea5e9; color:#ffffff;">
                <h1 style="margin:0; font-size:20px; line-height:28px;">DTP Attendance</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;">
                <p style="margin:0 0 16px 0; font-size:16px;">Hi ${escapedName},</p>
                <p style="margin:0 0 16px 0; font-size:16px;">${intro}</p>
                <p style="margin:0 0 24px 0; font-size:16px;">Click the button below to accept the invitation and set up your account.</p>
                <p style="margin:0;">
                  <a href="${escapedLink}" style="display:inline-block; background-color:#0ea5e9; color:#ffffff; padding:12px 20px; border-radius:6px; text-decoration:none; font-weight:600;">Accept Invitation</a>
                </p>
                <p style="margin:24px 0 0 0; font-size:14px; color:#475569;">If the button does not work, copy and paste this link into your browser:<br />
                  <span style="word-break: break-all;">${escapedLink}</span>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px; background-color:#f8fafc; font-size:12px; color:#475569;">
                <p style="margin:0;">This email was sent by the DTP Attendance System.</p>
                <p style="margin:0;">Please do not reply directly to this email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;')
}


