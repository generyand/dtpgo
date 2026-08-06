import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";
import { Analytics } from '@vercel/analytics/next';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-sans")} suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
