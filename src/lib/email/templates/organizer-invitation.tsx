import * as React from 'react'
import { BaseEmailTemplate } from './base-template'

interface OrganizerInvitationTemplateProps {
  organizerName: string
  inviteLink: string
  eventName?: string
}

export function OrganizerInvitationTemplate({ organizerName, inviteLink, eventName }: OrganizerInvitationTemplateProps) {
  return (
    <BaseEmailTemplate title="You're invited to organize with DTP Attendance">
      <p style={{ margin: '0 0 16px 0', fontSize: 16 }}>Hi {organizerName},</p>
      <p style={{ margin: '0 0 16px 0', fontSize: 16 }}>
        {eventName ? (
          <>You have been invited to organize <strong>{eventName}</strong> on the DTP Attendance system.</>
        ) : (
          <>You have been invited to join the DTP Attendance system as an organizer.</>
        )}
      </p>
      <p style={{ margin: '0 0 24px 0', fontSize: 16 }}>
        Click the button below to accept the invitation and set up your account.
      </p>
      <p style={{ margin: 0 }}>
        <a
          href={inviteLink}
          style={{
            display: 'inline-block',
            backgroundColor: '#0ea5e9',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: 6,
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Accept Invitation
        </a>
      </p>
      <p style={{ margin: '24px 0 0 0', fontSize: 14, color: '#475569' }}>
        If the button does not work, copy and paste this link into your browser:
        <br />
        <span style={{ wordBreak: 'break-all' }}>{inviteLink}</span>
      </p>
    </BaseEmailTemplate>
  )
}


