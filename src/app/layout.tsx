import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { initializeDatabase } from "@/lib/db/connection-check";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DTP Attendance System",
  description: "Hybrid Student Registration System for Department of Technology Programs",
};

// Initialize database connection check on server startup
if (typeof window === 'undefined') {
  initializeDatabase().catch(console.error);
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
