# Quick Start Guide

## 🚀 Setup Your DTP Attendance System

### 1. Environment Configuration

Create `.env.local` in your project root:

```env
# Database (Get from Supabase Dashboard > Settings > Database)
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Supabase Auth (Get from Supabase Dashboard > Settings > API)
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key_here"

# Optional: Security
IP_WHITELIST_ENABLED=false
IP_WHITELIST_ALLOW_LOCALHOST=true
IP_WHITELIST_ALLOW_PRIVATE=true
```

### 2. Test Your Setup

```bash
# Test everything (environment, database, Supabase)
npm run db:test

# Generate Prisma client
npm run db:generate

# Apply database migrations
npm run db:migrate
```

### 3. Start Development

```bash
# Start the development server
npm run dev

# In another terminal, view your database
npm run db:studio
```

### 4. Verify Everything Works

1. **Server starts successfully** with database connection logs
2. **Health check**: Visit http://localhost:3000/api/health
3. **Database viewer**: Visit http://localhost:5555 (Prisma Studio)

## 🔧 What's Been Implemented

### ✅ Epic 1.0: Authentication & Access Control
- **Supabase Auth Integration**: Complete auth system with utilities
- **Admin Route Protection**: Middleware + React components
- **IP Whitelisting**: Optional security layer with CIDR support

### ✅ Epic 2.0: Database Schema (In Progress)
- **Prisma Schema**: Student, Program, RegistrationAttempt, EmailStatus models
- **Database Migrations**: Ready-to-apply SQL migrations
- **Connection Management**: Automatic startup verification

### 🎯 System Features
- **Comprehensive Testing**: Environment, database, and Supabase validation
- **Health Monitoring**: `/api/health` endpoint for system status
- **Startup Verification**: Automatic database connection check
- **Developer Tools**: Complete npm script suite

## 🛠️ Available Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:test          # Test all connections
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Apply migrations
npm run db:studio        # Open database viewer
npm run db:push          # Push schema (dev only)
npm run db:reset         # Reset database

# Utilities
npm run lint             # Run ESLint
npm run structure        # Show project structure
```

## 🔍 Troubleshooting

### Database Connection Issues
1. **Check `.env.local`** exists and has correct DATABASE_URL
2. **Test connection**: `npm run db:test`
3. **Apply migrations**: `npm run db:migrate`

### Supabase Issues
1. **Verify credentials** in Supabase dashboard
2. **Check URL format**: Must be `https://[ref].supabase.co`
3. **Test environment**: `npm run db:test`

### Server Issues
1. **Check startup logs** for database connection status
2. **Visit health endpoint**: http://localhost:3000/api/health
3. **Verify all tests pass**: `npm run db:test`

## 📖 Detailed Documentation

- **Environment Setup**: `docs/environment-setup.md`
- **Database Setup**: `docs/database-setup.md`
- **Project Structure**: See `npm run structure`

---

**🎉 You're ready to start developing!** 

Your authentication system, database schema, and connection verification are all in place.
