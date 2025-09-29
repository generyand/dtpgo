import * as React from 'react'

interface BaseEmailTemplateProps {
  title: string
  children: React.ReactNode
}

export function BaseEmailTemplate({ title, children }: BaseEmailTemplateProps) {
  return (
    <html>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f5f6f8' }}>
        <table width="100%" cellPadding={0} cellSpacing={0} role="presentation" style={{ backgroundColor: '#f5f6f8', padding: '24px 0' }}>
          <tbody>
            <tr>
              <td align="center">
                <table width="600" cellPadding={0} cellSpacing={0} role="presentation" style={{ backgroundColor: '#ffffff', borderRadius: 8, overflow: 'hidden', fontFamily: 'Inter, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif', color: '#0f172a' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '24px 32px', backgroundColor: '#0ea5e9', color: '#ffffff' }}>
                        <h1 style={{ margin: 0, fontSize: 20, lineHeight: '28px' }}>DTP Attendance</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '24px 32px' }}>
                        {children}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '16px 32px', backgroundColor: '#f8fafc', fontSize: 12, color: '#475569' }}>
                        <p style={{ margin: 0 }}>This email was sent by the DTP Attendance System.</p>
                        <p style={{ margin: 0 }}>Please do not reply directly to this email.</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}


