# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in your project root with the following configuration:

```env
# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
# PostgreSQL Database Connection String
# Get this from: Supabase Dashboard > Settings > Database > Connection string > URI
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# =============================================================================
# SUPABASE AUTHENTICATION
# =============================================================================
# Get these from: Supabase Dashboard > Settings > API

# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"

# Your Supabase anon/public key
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key_here"

# Optional: Supabase service role key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"

# =============================================================================
# IP WHITELISTING SECURITY (Optional)
# =============================================================================
# Enable IP whitelisting for admin routes
IP_WHITELIST_ENABLED=false

# Comma-separated list of allowed IP addresses
IP_WHITELIST_IPS=""

# Comma-separated list of allowed IP ranges (CIDR notation or ranges)
IP_WHITELIST_RANGES=""

# Allow localhost access (default: true)
IP_WHITELIST_ALLOW_LOCALHOST=true

# Allow private network access (default: true)
IP_WHITELIST_ALLOW_PRIVATE=true

# =============================================================================
# EMAIL SERVICE (For future implementation)
# =============================================================================
RESEND_API_KEY="your_resend_api_key_here"
FROM_EMAIL="noreply@yourdomain.com"

# =============================================================================
# APPLICATION CONFIGURATION
# =============================================================================
NODE_ENV=development
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Setup Steps

1. **Copy the above configuration** to `.env.local` in your project root
2. **Get Supabase credentials** from your Supabase dashboard
3. **Set up database connection** (preferably using Supabase)
4. **Test connection**: `npm run db:test`
5. **Apply migrations**: `npm run db:migrate`
6. **Start development**: `npm run dev`

## Database Options

### Option 1: Supabase Database (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to Settings > Database
3. Copy the connection string
4. Replace `[password]` with your actual database password

### Option 2: Local PostgreSQL
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/dtp_attendance"
```

### Option 3: Docker PostgreSQL
```bash
docker run --name dtp-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=dtp_attendance -p 5432:5432 -d postgres:15
```
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/dtp_attendance"
```
