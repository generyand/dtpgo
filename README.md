# DTP Attendance - Hybrid Student Registration System

A comprehensive attendance tracking and student registration system built with Next.js 15, TypeScript, and Tailwind CSS. The system supports two distinct registration workflows: secure admin-managed registration via a protected dashboard, and rapid self-registration by students during live events.

## 🌟 Features

### Core Functionality
- **Dual Registration Workflows**: Admin dashboard and public self-registration
- **QR Code Generation**: Static QR codes for attendance tracking
- **Real-time Analytics**: Registration metrics and student demographics
- **Email Notifications**: Automated welcome emails with QR codes
- **Mobile-First Design**: Optimized for portrait mobile devices

### Admin Features
- 🔐 **Secure Authentication**: Supabase Auth integration
- 👥 **Student Management**: Register, view, and edit student records
- 📊 **Analytics Dashboard**: Real-time registration statistics
- 🔍 **Searchable Tables**: Paginated student listings
- 🛡️ **IP Whitelisting**: Optional security enhancement

### Student Features
- 📱 **Quick Registration**: Mobile-optimized registration form
- 🎯 **Instant QR Codes**: Immediate QR code generation post-registration
- 📧 **Email Delivery**: QR code backup via email
- ✅ **Real-time Validation**: Duplicate prevention and format checking

### Technical Highlights
- **Framework**: Next.js 15 with App Router
- **Database**: Supabase PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth for secure admin access
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Type Safety**: TypeScript 5 with strict configuration
- **Performance**: Rate limiting and optimized queries

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Supabase account and project
- PostgreSQL database access

### Environment Setup

Create a `.env.local` file in your project root:

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

### Installation & Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up database**:
   ```bash
   # Generate Prisma client
   pnpm db:generate
   
   # Apply database migrations
   pnpm db:migrate
   
   # Test database connection
   pnpm db:test
   ```

3. **Start development server**:
   ```bash
   pnpm dev
   ```

4. **Open your browser**: [http://localhost:3000](http://localhost:3000)

### Database Options

#### Option 1: Supabase Database (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to Settings > Database
3. Copy the connection string
4. Replace `[password]` with your actual database password

#### Option 2: Local PostgreSQL
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/dtp_attendance"
```

#### Option 3: Docker PostgreSQL
```bash
docker run --name dtp-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=dtp_attendance -p 5432:5432 -d postgres:15
```

## 📁 Project Structure

To view the project structure, you can use one of these commands:

### Using pnpm (if PowerShell execution policy allows):
```bash
pnpm structure          # Shows clean project structure
pnpm structure:full     # Shows complete structure including node_modules
```

### Using Node.js directly:
```bash
node scripts/list-structure.js           # Shows clean project structure
node scripts/list-structure.js --full    # Shows complete structure including node_modules
```

### Using Windows batch file:
```bash
scripts\structure.bat           # Shows clean project structure  
scripts\structure.bat --full    # Shows complete structure including node_modules
```

The structure command intelligently excludes build artifacts, dependencies, and temporary files while showing the essential project organization.

## 🛠️ Available Scripts

```bash
# Development
pnpm dev                # Start development server with Turbopack
pnpm build              # Build for production
pnpm start              # Start production server
pnpm lint               # Run ESLint

# Database Management
pnpm db:test            # Test database connection
pnpm db:generate        # Generate Prisma client
pnpm db:migrate         # Run database migrations
pnpm db:studio          # Open Prisma Studio
pnpm db:reset           # Reset database
pnpm db:push            # Push schema changes

# Project Structure
pnpm structure          # View project structure
pnpm structure:full     # View complete structure
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS 4, shadcn/ui, Lucide React icons
- **Database**: Supabase PostgreSQL, Prisma ORM
- **Authentication**: Supabase Auth
- **Email**: Resend (planned)
- **Deployment**: Vercel (recommended)

### Data Model
- **Students**: Core registration data with unique ID and email
- **Programs**: Configurable academic programs (BSIT, BSCPE)
- **Dual Source Tracking**: Admin vs. public registration analytics
- **QR Code Integration**: Static codes containing student ID numbers

## 🔒 Security Features

- **Admin Authentication**: Supabase Auth with secure session management
- **IP Whitelisting**: Optional IP restrictions for admin routes
- **Rate Limiting**: API protection against abuse (10 req/min per IP)
- **Input Validation**: Strict format validation and sanitization
- **Row Level Security**: Database-level access control via Supabase RLS

## 📊 Student Data Schema

Students must provide:
- **Student ID**: Format `S###-####-###` (e.g., S123-4567-890)
- **Full Name**: First and last name
- **Email**: Unique, valid email address
- **Program**: Academic program (BSIT, BSCPE)
- **Year Level**: 1-5 academic year

## 🎯 Use Cases

### For Administrators
- Pre-register students before events
- Manage existing student records
- View registration analytics in real-time
- Sequential student registration workflow

### For Students
- Quick self-registration during live events
- Instant QR code generation for attendance
- Email backup of QR codes
- Mobile-optimized experience

## 📱 Mobile Optimization

The public registration interface is specifically designed for:
- Portrait mobile device orientation
- Touch-friendly form inputs
- Immediate visual feedback
- Quick registration flow (<60 seconds)

## 🔮 Roadmap

### Phase 1 (Core System) ✅
- Database schema and API endpoints
- Admin authentication and dashboard
- Single student registration
- Basic student management

### Phase 2 (Public Registration) 🚧
- Mobile-optimized registration interface
- QR code generation and display
- Email notification system
- Security measures and rate limiting

### Phase 3 (Analytics & Polish) 📋
- Registration analytics dashboard
- Comprehensive logging system
- Performance optimization
- Error handling improvements

## 📈 Performance Targets

- **Registration Rate**: Handle 100+ registrations per minute
- **Response Time**: <2 seconds during peak usage
- **Completion Rate**: >95% successful registrations
- **Email Delivery**: >98% successful delivery rate
- **System Uptime**: 99.9% during event periods

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
