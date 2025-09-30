import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security headers for production
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          // Prevent clickjacking attacks
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Enable XSS protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer policy for privacy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'development' 
              ? [
                  "default-src 'self' localhost:* 192.168.*:* 172.16.*:* 10.*:*",
                  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live localhost:* 192.168.*:* 172.16.*:* 10.*:*",
                  "style-src 'self' 'unsafe-inline' localhost:* 192.168.*:* 172.16.*:* 10.*:*",
                  "img-src 'self' data: https: blob: localhost:* 192.168.*:* 172.16.*:* 10.*:*",
                  "font-src 'self' data: localhost:* 192.168.*:* 172.16.*:* 10.*:*",
                  "connect-src 'self' https://*.supabase.co https://*.supabase.io wss://*.supabase.co wss://*.supabase.io localhost:* 192.168.*:* 172.16.*:* 10.*:*",
                  "frame-src 'none'",
                  "object-src 'none'",
                  "base-uri 'self' localhost:* 192.168.*:* 172.16.*:* 10.*:*",
                  "form-action 'self' localhost:* 192.168.*:* 172.16.*:* 10.*:*",
                  "frame-ancestors 'none'",
                ].join('; ')
              : [
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
                  "style-src 'self' 'unsafe-inline'",
                  "img-src 'self' data: https: blob:",
                  "font-src 'self' data:",
                  "connect-src 'self' https://*.supabase.co https://*.supabase.io wss://*.supabase.co wss://*.supabase.io",
                  "frame-src 'none'",
                  "object-src 'none'",
                  "base-uri 'self'",
                  "form-action 'self'",
                  "frame-ancestors 'none'",
                  "upgrade-insecure-requests",
                ].join('; '),
          },
          // Permissions Policy (formerly Feature Policy)
          {
            key: 'Permissions-Policy',
            value: [
              'camera=(self)', // Allow camera for QR scanning
              'microphone=()',
              'geolocation=()',
              'interest-cohort=()',
              'payment=()',
              'usb=()',
              'magnetometer=()',
              'gyroscope=()',
              'accelerometer=()',
            ].join(', '),
          },
          // Strict Transport Security (HTTPS only)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
      {
        // Additional headers for API routes
        source: '/api/(.*)',
        headers: [
          // Prevent caching of API responses
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          // Additional security for API routes
          {
            key: 'X-API-Version',
            value: '1.0',
          },
        ],
      },
    ];
  },

  // External packages for server components
  serverExternalPackages: ['@prisma/client'],
  
  // Webpack configuration to handle Node.js modules in browser
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude Node.js modules from client-side bundle
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        child_process: false,
        'detect-libc': false,
        sharp: false,
      };
    }
    return config;
  },

  // Image optimization settings
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },

  // Environment-specific configurations
  ...(process.env.NODE_ENV === 'production' && {
    // Production-only settings
    output: 'standalone',
    compress: true,
    poweredByHeader: false,
  }),
};

export default nextConfig;
