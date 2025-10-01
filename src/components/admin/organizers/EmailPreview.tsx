import { Card, CardContent } from '@/components/ui/card';
import { renderToString } from 'react-dom/server';
import { OrganizerInvitationTemplate } from '@/lib/email/templates/organizer-invitation';
import { useTheme } from 'next-themes';

// Force email-safe fonts
const EMAIL_SAFE_FONTS = `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif !important;`;

interface EmailPreviewProps {
  organizerName: string;
  inviteLink: string;
  eventName?: string;
}

export function EmailPreview({ organizerName, inviteLink, eventName }: EmailPreviewProps) {
  const { theme } = useTheme();

  // Convert React component to HTML string
  const emailHtml = renderToString(
    <OrganizerInvitationTemplate
      organizerName={organizerName}
      inviteLink={inviteLink}
      eventName={eventName}
    />
  );

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardContent className="p-0 overflow-hidden">
        <div className="w-full bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
          <iframe
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8" />
                  <meta name="color-scheme" content="${theme === 'dark' ? 'dark' : 'light'}" />
                  <style>
                    body { 
                      margin: 0;
                      background-color: ${theme === 'dark' ? '#1a1b1e' : '#f8fafc'};
                      ${EMAIL_SAFE_FONTS}
                    }
                    * {
                      ${EMAIL_SAFE_FONTS}
                    }
                  </style>
                </head>
                <body>
                  ${emailHtml}
                </body>
              </html>
            `}
            className="w-full h-[500px] border-0 bg-transparent"
            title="Email Preview"
          />
        </div>
      </CardContent>
    </Card>
  );
}
