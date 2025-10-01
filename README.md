# DTP Go - Hybrid Student Registration System

DTP Go is a comprehensive attendance tracking and student registration system built with Next.js 15, TypeScript, and Tailwind CSS. The system supports two distinct registration workflows: secure admin-managed registration via a protected dashboard, and rapid self-registration by students during live events.

## 🎯 Project Overview

**Main Purpose**: DTP Go provides comprehensive attendance tracking and student registration for educational events

**Problem Solved**: DTP Go streamlines event attendance management by providing a one-time student registration system with QR code-based attendance tracking for multiple events

**Target Audience**: 
- **Administrators**: Manage students, events, organizers, and view analytics
- **Organizers**: Scan student QR codes for attendance tracking at events
- **Students**: Register once to receive a permanent QR code that works for all future events

### 📱 Application Screenshots

*Screenshots and GIFs showcasing the different user interfaces:*

#### Admin Dashboard
![Admin Dashboard](https://via.placeholder.com/800x400/1e40af/ffffff?text=Admin+Dashboard+-+Student+Management+%26+Analytics)

#### Organizer Scanning Interface
![Organizer Scanning](https://via.placeholder.com/400x600/059669/ffffff?text=QR+Scanner+-+Real-time+Attendance+Tracking)

#### Student Registration
![Student Registration](https://via.placeholder.com/400x600/7c3aed/ffffff?text=Student+Registration+-+Mobile+Optimized)

#### QR Code Display
![QR Code Display](https://via.placeholder.com/400x500/dc2626/ffffff?text=QR+Code+Generated+-+Ready+for+Events)

## ✨ Core Features

- **One-Time Student Registration**: Students register once and receive a permanent QR code for all future events
- **Dual Registration Workflows**: Admin dashboard and public self-registration
- **QR Code Generation**: Static QR codes containing student IDs for attendance tracking
- **Real-time QR Scanning**: Organizers scan student QR codes using device cameras
- **Event & Session Management**: Create events with multiple attendance sessions and time windows
- **Organizer Management**: Invite and assign organizers to specific events
- **Analytics Dashboard**: Real-time registration metrics and attendance statistics
- **Role-based Authentication**: Secure Supabase Auth with Admin/Organizer permissions

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS 4, shadcn/ui components, Lucide React icons
- **Database**: Supabase PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth with role-based access control
- **QR Code**: qrcode library for generation, html5-qrcode for scanning
- **Email**: Nodemailer for notifications
- **Validation**: Zod schemas for data validation

## 📋 Prerequisites

- Node.js 18+ and pnpm package manager
- Supabase account and project setup
- PostgreSQL database access
- Camera access for QR scanning functionality

## 🚀 Quick Start

### Environment Setup

Create a `.env.local` file in your project root:

```env
# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================
# PostgreSQL Database Connection String
# Get this from: Supabase Dashboard > Settings > Database > Connection string > URI
DATABASE_URL=

# =============================================================================
# SUPABASE AUTHENTICATION
# =============================================================================
# Get these from: Supabase Dashboard > Settings > API

# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=

# Your Supabase anon/public key
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Optional: Supabase service role key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=

# =============================================================================
# EMAIL SERVICE (For future implementation)
# =============================================================================
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=cylqbhnlazehbfxx
EMAIL_FROM=DTP Go <your@gmail.com>
EMAIL_REPLY_TO=youremail@gmail.com

# =============================================================================
# APPLICATION CONFIGURATION
# =============================================================================
NODE_ENV=development
NEXT_PUBLIC_APP_URL="http://localhost:3000"

ADMIN_EMAIL=""
ADMIN_PASSWORD=""
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
   ```

3. **Create admin user in Supabase**:
   - Go to your Supabase project dashboard
   - Navigate to Authentication > Users
   - Click "Add user" and create an admin account
   - Note the user's email address

4. **Set admin role in Supabase**:
   - Go to Supabase SQL Editor
   - Run the following SQL command to set admin role:
   ```sql
   UPDATE auth.users 
   SET raw_user_meta_data = jsonb_set(
     COALESCE(raw_user_meta_data, '{}'), 
     '{role}', 
     '"admin"'
   ) 
   WHERE email = 'your-admin-email@example.com';
   ```

5. **Start development server**:
   ```bash
   pnpm dev
   ```

6. **Open your browser**: [http://localhost:3000](http://localhost:3000)

## 📖 Basic Usage

### For Administrators
- Login at `/auth/login` → Access admin dashboard
- Manage students, events, and organizers
- View analytics and registration statistics

### For Organizers
- Login → Select event/session
- Scan student QR codes for attendance tracking
- Real-time attendance recording

### For Students
- Register once at `/join` → Receive permanent QR code
- Present QR code at any future event for attendance
- No need to re-register for each event

## 🔄 User Flow Diagram

```mermaid
graph TD
    %% Admin Flow
    A[Admin Login] --> B[Admin Dashboard]
    B --> C[Manage Students]
    B --> D[Create Events]
    B --> E[Invite Organizers]
    B --> F[View Analytics]
    
    %% Organizer Flow
    G[Organizer Login] --> H[Select Event/Session]
    H --> I[QR Scanner Interface]
    I --> J[Scan Student QR Code]
    J --> K[Record Attendance]
    K --> L[Real-time Updates]
    
    %% Student Flow
    M[Student Registration] --> N[Fill Registration Form]
    N --> O[Receive QR Code]
    O --> P[Save QR Code]
    P --> Q[Attend Event]
    Q --> R[Present QR Code]
    R --> S[Get Scanned by Organizer]
    
    %% Connections between flows
    E --> T[Organizer Receives Invitation]
    T --> G
    D --> H
    S --> J
    
    %% Styling
    classDef adminFlow fill:#3b82f6,stroke:#1e40af,stroke-width:2px,color:#fff
    classDef organizerFlow fill:#059669,stroke:#047857,stroke-width:2px,color:#fff
    classDef studentFlow fill:#7c3aed,stroke:#6d28d9,stroke-width:2px,color:#fff
    classDef connection fill:#f3f4f6,stroke:#6b7280,stroke-width:1px,color:#374151
    
    class A,B,C,D,E,F adminFlow
    class G,H,I,J,K,L,T organizerFlow
    class M,N,O,P,Q,R,S studentFlow
    class E,D,S connection
```

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── admin/          # Admin dashboard pages
│   ├── organizer/      # Organizer scanning interface
│   ├── join/           # Public student registration
│   └── api/            # API routes
├── components/         # React components
│   ├── admin/          # Admin-specific components
│   ├── organizer/      # Organizer-specific components
│   └── ui/             # Reusable UI components
├── lib/                # Utilities and configurations
│   ├── auth/           # Authentication logic
│   ├── db/             # Database queries
│   ├── qr/             # QR code generation
│   └── scanning/       # QR scanning logic
└── prisma/             # Database schema
```

## 🛠️ Available Scripts

```bash
# Development
pnpm dev                # Start development server
pnpm build              # Build for production
pnpm start              # Start production server
pnpm lint               # Run ESLint

# Database Management
pnpm db:generate        # Generate Prisma client
pnpm db:migrate         # Run database migrations
pnpm db:studio          # Open Prisma Studio
pnpm db:reset           # Reset database

# Testing
pnpm test               # Run tests
pnpm test:watch         # Run tests in watch mode
pnpm test:coverage      # Run tests with coverage
```

## 🚀 Deployment

### Recommended Platform
- **Vercel**: Optimized for Next.js applications
- **Database**: Supabase PostgreSQL
- **Environment**: Set all required environment variables in deployment platform

### Deployment Steps
1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

## 🤝 Contributing

- **Repository**: GitHub-based development
- **Issues**: Report bugs and feature requests through GitHub Issues
- **Documentation**: Comprehensive PRDs and task lists in `/docs` folder

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the comprehensive PRDs for feature details

---

Built with ❤️ using Next.js 15, TypeScript, and Tailwind CSS