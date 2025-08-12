# Task List: Hybrid Student Registration System - Phase 3 Atomic Tasks

**Source PRD:** `docs/prds/prd-hybrid-student-registration-system.md`
**Phase 1 & 2:** See `docs/tasks/tasks-prd-hybrid-student-registration-system.md`

## Phase 3: Atomic Tasks

### Epic 1.0: Authentication & Access Control System

#### Story 1.1: Supabase Auth Integration

- [x] **1.1.1 Atomic:** Set up Supabase client configuration
  - **Files:** `src/lib/auth/supabase.ts`, `.env.local`
  - **Dependencies:** Supabase project created
  - **Acceptance:** Supabase client initialized with proper config, environment variables documented
  - **Tech:** TypeScript, Supabase Auth client, environment variable validation

- [x] **1.1.2 Atomic:** Create auth utilities and session management
  - **Files:** `src/lib/auth/utils.ts`, `src/lib/types/auth.ts`
  - **Dependencies:** Supabase client configured
  - **Acceptance:** Functions for login, logout, session check, TypeScript types defined
  - **Tech:** Supabase Auth methods, TypeScript interfaces, cookie handling

- [x] **1.1.3 Atomic:** Build authentication context provider
  - **Files:** `src/components/providers/AuthProvider.tsx`
  - **Dependencies:** Auth utilities complete
  - **Acceptance:** React context provides auth state, loading states, user session
  - **Tech:** React Context API, Supabase Auth state management

#### Story 1.2: Admin Route Protection

- [x] **1.2.1 Atomic:** Create authentication middleware
  - **Files:** `src/middleware.ts`
  - **Dependencies:** Auth utilities ready
  - **Acceptance:** Middleware protects `/admin` routes, redirects unauthenticated users
  - **Tech:** Next.js middleware, Supabase session validation

- [x] **1.2.2 Atomic:** Build admin route guard component
  - **Files:** `src/components/auth/AdminGuard.tsx`
  - **Dependencies:** Auth context provider
  - **Acceptance:** Component wraps admin pages, shows loading/unauthorized states
  - **Tech:** React component, conditional rendering, auth state checking

#### Story 1.3: IP Whitelisting Infrastructure

- [x] **1.3.1 Atomic:** Create IP whitelisting utility functions
  - **Files:** `src/lib/security/ip-whitelist.ts`
  - **Dependencies:** None
  - **Acceptance:** Functions to check IP against whitelist, configurable IP ranges
  - **Tech:** IP address validation, CIDR notation support, TypeScript

- [x] **1.3.2 Atomic:** Integrate IP checking into middleware
  - **Files:** `src/middleware.ts` (modify existing)
  - **Dependencies:** IP whitelist utilities, auth middleware
  - **Acceptance:** Admin routes check IP whitelist when enabled, graceful failure
  - **Tech:** Next.js middleware enhancement, environment-based configuration

### Epic 2.0: Database Schema & Student Data Model

#### Story 2.1: Prisma Schema Design

- [x] **2.1.1 Atomic:** Define Student and Program models
  - **Files:** `prisma/schema.prisma`
  - **Dependencies:** Database connection established
  - **Acceptance:** Models defined with all fields, constraints, relationships per PRD
  - **Tech:** Prisma schema syntax, PostgreSQL constraints, foreign keys

- [x] **2.1.2 Atomic:** Create initial database migration
  - **Files:** `prisma/migrations/` (auto-generated)
  - **Dependencies:** Schema defined
  - **Acceptance:** Migration creates tables with proper indexes and constraints
  - **Tech:** Prisma migrate, SQL DDL statements

#### Story 2.2: Database Client & Queries

- [x] **2.2.1 Atomic:** Set up Prisma client instance
  - **Files:** `src/lib/db/client.ts`
  - **Dependencies:** Schema migration complete
  - **Acceptance:** Singleton Prisma client with proper connection handling
  - **Tech:** Prisma Client, connection pooling, error handling

- [x] **2.2.2 Atomic:** Create student query functions
  - **Files:** `src/lib/db/queries/students.ts`
  - **Dependencies:** Prisma client ready
  - **Acceptance:** CRUD functions for students with TypeScript types, pagination support
  - **Tech:** Prisma queries, TypeScript generics, pagination patterns

- [x] **2.2.3 Atomic:** Create program query functions
  - **Files:** `src/lib/db/queries/programs.ts`
  - **Dependencies:** Prisma client ready
  - **Acceptance:** Functions to get all programs, create new programs with validation
  - **Tech:** Prisma queries, TypeScript types, data validation

#### Story 2.3: Database Seeding

- [x] **2.3.1 Atomic:** Create program seed data
  - **Files:** `prisma/seed.ts`
  - **Dependencies:** Query functions complete
  - **Acceptance:** Seed script creates initial programs (BSIT, BSCPE) with idempotency
  - **Tech:** Prisma seeding, upsert operations, TypeScript

- [x] **2.3.2 Atomic:** Add development student fixtures
  - **Files:** `prisma/seed.ts` (extend existing)
  - **Dependencies:** Program seed data
  - **Acceptance:** Creates sample students for testing, follows student ID pattern
  - **Tech:** Prisma seeding, realistic test data generation

### Epic 3.0: Admin Dashboard Features

#### Story 3.1: Admin Dashboard Layout

- [x] **3.1.1 Atomic:** Create admin layout component
  - **Files:** `src/app/(admin)/layout.tsx`
  - **Dependencies:** Auth guard component
  - **Acceptance:** Layout with navigation, responsive design, auth protection
  - **Tech:** Next.js layout, Tailwind CSS, responsive design patterns

- [x] **3.1.2 Atomic:** Build admin navigation component
  - **Files:** `src/components/admin/AdminNav.tsx`
  - **Dependencies:** None
  - **Acceptance:** Navigation menu with dashboard, register, students, analytics links
  - **Tech:** Next.js Link components, Tailwind CSS, active state handling

- [x] **3.1.3 Atomic:** Create dashboard home page
  - **Files:** `src/app/(admin)/dashboard/page.tsx`
  - **Dependencies:** Admin layout, student queries
  - **Acceptance:** Dashboard shows overview cards with student counts and recent activity
  - **Tech:** React Server Components, Tailwind CSS cards, data fetching

#### Story 3.2: Admin Registration Form

- [x] **3.2.1 Atomic:** Build student registration form component
  - **Files:** `src/components/admin/RegisterForm.tsx`
  - **Dependencies:** Program queries, validation schemas
  - **Acceptance:** Form with all student fields, program dropdown, validation feedback
  - **Tech:** React Hook Form, Zod validation, Tailwind CSS form styling

- [x] **3.2.2 Atomic:** Create admin registration page
  - **Files:** `src/app/(admin)/register/page.tsx`
  - **Dependencies:** RegisterForm component, admin registration API
  - **Acceptance:** Page with form, "Register and Add Another" functionality, success feedback
  - **Tech:** React state management, form submission handling, toast notifications

- [x] **3.2.3 Atomic:** Implement admin registration API endpoint
  - **Files:** `src/app/api/admin/register/route.ts`
  - **Dependencies:** Student queries, validation schemas, email service
  - **Acceptance:** POST endpoint validates data, creates student, sends email, returns result
  - **Tech:** Next.js API routes, Prisma operations, error handling, email integration

#### Story 3.3: Student Management Table

- [ ] **3.3.1 Atomic:** Create student data table component
  - **Files:** `src/components/admin/StudentsTable.tsx`
  - **Dependencies:** Student queries
  - **Acceptance:** Paginated table with search, sort, edit actions, responsive design
  - **Tech:** React table patterns, Tailwind CSS tables, pagination logic

- [ ] **3.3.2 Atomic:** Build student edit modal component
  - **Files:** `src/components/admin/EditStudentModal.tsx`
  - **Dependencies:** RegisterForm component (reusable)
  - **Acceptance:** Modal with pre-filled form, update functionality, validation
  - **Tech:** React portals, form pre-population, modal state management

- [ ] **3.3.3 Atomic:** Create students management page
  - **Files:** `src/app/(admin)/students/page.tsx`
  - **Dependencies:** StudentsTable, EditStudentModal, student API endpoints
  - **Acceptance:** Page displays table, handles edit/delete operations, real-time updates
  - **Tech:** React Server Components, client-side state, optimistic updates

- [ ] **3.3.4 Atomic:** Implement student management API endpoints
  - **Files:** `src/app/api/admin/students/route.ts`, `src/app/api/admin/students/[id]/route.ts`
  - **Dependencies:** Student queries
  - **Acceptance:** GET (list), PUT (update), DELETE endpoints with proper validation
  - **Tech:** Next.js API routes, HTTP method handling, input validation

#### Story 3.4: Admin Analytics Dashboard

- [ ] **3.4.1 Atomic:** Create analytics data aggregation functions
  - **Files:** `src/lib/db/queries/analytics.ts`
  - **Dependencies:** Student queries complete
  - **Acceptance:** Functions return registration counts by source, program, year breakdowns
  - **Tech:** Prisma aggregation queries, TypeScript types, data transformation

- [ ] **3.4.2 Atomic:** Build analytics visualization components
  - **Files:** `src/components/admin/AnalyticsCards.tsx`, `src/components/admin/AnalyticsCharts.tsx`
  - **Dependencies:** Analytics queries
  - **Acceptance:** Cards show key metrics, charts display program/year distributions
  - **Tech:** React components, chart library integration, responsive design

- [ ] **3.4.3 Atomic:** Create analytics page
  - **Files:** `src/app/(admin)/analytics/page.tsx`
  - **Dependencies:** Analytics components, analytics API
  - **Acceptance:** Page displays real-time metrics, auto-refreshes, exports data
  - **Tech:** React Server Components, real-time updates, data visualization

- [ ] **3.4.4 Atomic:** Implement analytics API endpoint
  - **Files:** `src/app/api/admin/analytics/route.ts`
  - **Dependencies:** Analytics queries
  - **Acceptance:** GET endpoint returns all analytics data with proper caching
  - **Tech:** Next.js API routes, data aggregation, response caching

### Epic 4.0: Public Registration Interface

#### Story 4.1: Mobile-First Registration Page

- [ ] **4.1.1 Atomic:** Create public registration layout
  - **Files:** `src/app/join/layout.tsx`
  - **Dependencies:** None
  - **Acceptance:** Mobile-optimized layout with minimal navigation, portrait-first design
  - **Tech:** Next.js layout, Tailwind CSS mobile-first, viewport optimization

- [ ] **4.1.2 Atomic:** Build public registration form component
  - **Files:** `src/components/public/PublicRegisterForm.tsx`
  - **Dependencies:** Validation schemas, program queries
  - **Acceptance:** Mobile-friendly form with large touch targets, clear validation
  - **Tech:** React Hook Form, mobile-first styling, touch-friendly inputs

- [ ] **4.1.3 Atomic:** Create public registration page
  - **Files:** `src/app/join/page.tsx`
  - **Dependencies:** PublicRegisterForm, public registration API
  - **Acceptance:** Page handles form submission, loading states, error display
  - **Tech:** React state management, form handling, mobile UX patterns

#### Story 4.2: Real-Time Validation

- [ ] **4.2.1 Atomic:** Create duplicate checking API endpoint
  - **Files:** `src/app/api/public/check-duplicate/route.ts`
  - **Dependencies:** Student queries
  - **Acceptance:** POST endpoint checks student ID and email uniqueness with rate limiting
  - **Tech:** Next.js API routes, database queries, rate limiting middleware

- [ ] **4.2.2 Atomic:** Implement live validation in public form
  - **Files:** `src/components/public/PublicRegisterForm.tsx` (enhance existing)
  - **Dependencies:** Duplicate checking API
  - **Acceptance:** Form shows real-time validation feedback, debounced API calls
  - **Tech:** React hooks, debouncing, API integration, UX feedback

#### Story 4.3: Registration Success Flow

- [ ] **4.3.1 Atomic:** Create QR code success page
  - **Files:** `src/app/join/success/page.tsx`
  - **Dependencies:** QR code display component
  - **Acceptance:** Page shows branded QR code, student info, user-controlled dismissal
  - **Tech:** React components, QR code display, mobile-optimized layout

- [ ] **4.3.2 Atomic:** Implement public registration API endpoint
  - **Files:** `src/app/api/public/register/route.ts`
  - **Dependencies:** Student queries, QR generation, email service, rate limiting
  - **Acceptance:** POST endpoint creates student, generates QR, sends email, handles failures
  - **Tech:** Next.js API routes, transaction handling, error recovery, rate limiting

### Epic 5.0: QR Code Generation System

#### Story 5.1: QR Code Generation Utilities

- [ ] **5.1.1 Atomic:** Create QR code generation functions
  - **Files:** `src/lib/qr/generator.ts`
  - **Dependencies:** None
  - **Acceptance:** Functions generate QR codes from student IDs, configurable size/format
  - **Tech:** QR code library, base64 encoding, TypeScript types

- [ ] **5.1.2 Atomic:** Build branded QR code composition
  - **Files:** `src/lib/qr/branding.ts`
  - **Dependencies:** QR generator functions
  - **Acceptance:** Creates branded image with logo, student info, QR code
  - **Tech:** Canvas API or image library, image composition, buffer handling

#### Story 5.2: QR Code Display Components

- [ ] **5.2.1 Atomic:** Create QR code display component
  - **Files:** `src/components/ui/QRCodeDisplay.tsx`
  - **Dependencies:** Branded QR functions
  - **Acceptance:** Component displays QR code with branding, download functionality
  - **Tech:** React component, image handling, download triggers

- [ ] **5.2.2 Atomic:** Add QR code to student types and queries
  - **Files:** `src/lib/types/student.ts` (enhance), `src/lib/db/queries/students.ts` (enhance)
  - **Dependencies:** QR generation utilities
  - **Acceptance:** Student type includes QR code data, queries generate QR when needed
  - **Tech:** TypeScript types, lazy QR generation, caching strategies

### Epic 6.0: Email Notification System

#### Story 6.1: Email Service Integration

- [ ] **6.1.1 Atomic:** Set up email service configuration
  - **Files:** `src/lib/email/config.ts`, `.env.local` (extend)
  - **Dependencies:** Email service account (Resend)
  - **Acceptance:** Email client configured with API keys, sender verification
  - **Tech:** Email service SDK, environment configuration, TypeScript config

- [ ] **6.1.2 Atomic:** Create email client utilities
  - **Files:** `src/lib/email/client.ts`
  - **Dependencies:** Email configuration
  - **Acceptance:** Email sending functions with error handling, retry logic
  - **Tech:** Email service integration, error handling, async operations

#### Story 6.2: Email Templates & Sending

- [ ] **6.2.1 Atomic:** Build HTML email templates
  - **Files:** `src/lib/email/templates/admin-registration.tsx`, `src/lib/email/templates/self-registration.tsx`
  - **Dependencies:** None
  - **Acceptance:** React-based email templates with QR code embedding, responsive design
  - **Tech:** React email components, HTML email best practices, inline CSS

- [ ] **6.2.2 Atomic:** Create email sending service
  - **Files:** `src/lib/email/service.ts`
  - **Dependencies:** Email client, email templates, QR code system
  - **Acceptance:** Service sends registration emails with QR attachments, logs results
  - **Tech:** Email composition, attachment handling, logging integration

#### Story 6.3: Email Failure Handling

- [ ] **6.3.1 Atomic:** Implement email failure logging
  - **Files:** `src/lib/email/logger.ts`
  - **Dependencies:** Email service
  - **Acceptance:** Logs email failures with details, provides retry mechanisms
  - **Tech:** Structured logging, error categorization, retry logic

- [ ] **6.3.2 Atomic:** Add email status to student records
  - **Files:** `prisma/schema.prisma` (enhance), migration files
  - **Dependencies:** Email logging system
  - **Acceptance:** Student model tracks email status, admin can see email failures
  - **Tech:** Database schema updates, migration handling, status tracking

### Epic 7.0: Data Validation & Error Handling

#### Story 7.1: Validation Schemas

- [ ] **7.1.1 Atomic:** Create student validation schemas
  - **Files:** `src/lib/validation/student.ts`
  - **Dependencies:** Student types defined
  - **Acceptance:** Zod schemas for all student fields, regex for student ID format
  - **Tech:** Zod validation library, regex patterns, TypeScript integration

- [ ] **7.1.2 Atomic:** Create shared validation utilities
  - **Files:** `src/lib/validation/utils.ts`
  - **Dependencies:** Validation schemas
  - **Acceptance:** Reusable validation functions, error formatting utilities
  - **Tech:** Zod utilities, error transformation, TypeScript helpers

#### Story 7.2: Error Messaging System

- [ ] **7.2.1 Atomic:** Build error message components
  - **Files:** `src/components/ui/ErrorMessage.tsx`, `src/components/ui/ValidationFeedback.tsx`
  - **Dependencies:** None
  - **Acceptance:** Components display user-friendly errors, different styles for contexts
  - **Tech:** React components, Tailwind CSS styling, accessibility features

- [ ] **7.2.2 Atomic:** Create error message constants
  - **Files:** `src/lib/constants/error-messages.ts`
  - **Dependencies:** None
  - **Acceptance:** Centralized error messages for admin vs public forms, i18n ready
  - **Tech:** TypeScript constants, message categorization, internationalization prep

#### Story 7.3: Duplicate Detection Logic

- [ ] **7.3.1 Atomic:** Implement duplicate checking functions
  - **Files:** `src/lib/db/queries/duplicates.ts`
  - **Dependencies:** Student queries
  - **Acceptance:** Functions check student ID and email uniqueness with performance optimization
  - **Tech:** Database queries, indexing optimization, TypeScript types

- [ ] **7.3.2 Atomic:** Add "View existing record" functionality
  - **Files:** `src/components/admin/ViewStudentLink.tsx`
  - **Dependencies:** Student queries, admin navigation
  - **Acceptance:** Component links to existing student record from duplicate error
  - **Tech:** Next.js routing, conditional rendering, admin permissions

### Epic 8.0: Security & Performance Implementation

#### Story 8.1: Rate Limiting Middleware

- [ ] **8.1.1 Atomic:** Create rate limiting utilities
  - **Files:** `src/lib/security/rate-limit.ts`
  - **Dependencies:** None
  - **Acceptance:** Configurable rate limiting with Redis or memory store, IP-based limits
  - **Tech:** Rate limiting algorithms, storage abstraction, TypeScript configuration

- [ ] **8.1.2 Atomic:** Integrate rate limiting into public endpoints
  - **Files:** `src/middleware.ts` (enhance existing)
  - **Dependencies:** Rate limiting utilities
  - **Acceptance:** Public registration API protected with 10 req/min limit, proper error responses
  - **Tech:** Next.js middleware enhancement, HTTP status codes, error handling

#### Story 8.2: Database Query Optimization

- [ ] **8.2.1 Atomic:** Add database indexes for performance
  - **Files:** `prisma/schema.prisma` (enhance), new migration
  - **Dependencies:** Core database operations tested
  - **Acceptance:** Indexes on frequently queried fields, query performance under load
  - **Tech:** Database indexing, Prisma index syntax, performance testing

- [ ] **8.2.2 Atomic:** Implement query optimization patterns
  - **Files:** `src/lib/db/queries/` (enhance all query files)
  - **Dependencies:** Database indexes in place
  - **Acceptance:** Queries use select optimization, pagination cursors, connection pooling
  - **Tech:** Prisma query optimization, database best practices, performance monitoring

#### Story 8.3: Security Monitoring

- [ ] **8.3.1 Atomic:** Create security logging utilities
  - **Files:** `src/lib/security/logger.ts`
  - **Dependencies:** Rate limiting system
  - **Acceptance:** Logs security events, suspicious activity patterns, admin alerts
  - **Tech:** Structured logging, event categorization, alert thresholds

- [ ] **8.3.2 Atomic:** Implement security monitoring dashboard
  - **Files:** `src/app/(admin)/security/page.tsx`, `src/components/admin/SecurityDashboard.tsx`
  - **Dependencies:** Security logging, admin layout
  - **Acceptance:** Admin page shows security events, rate limit violations, IP patterns
  - **Tech:** React components, data visualization, real-time updates

### Epic 9.0: Logging & Analytics System

#### Story 9.1: Registration Attempt Logging

- [ ] **9.1.1 Atomic:** Create registration logging schema
  - **Files:** `prisma/schema.prisma` (enhance), new migration
  - **Dependencies:** Core student schema complete
  - **Acceptance:** RegistrationAttempt model with all required fields per PRD
  - **Tech:** Prisma schema, database relationships, indexing for queries

- [ ] **9.1.2 Atomic:** Implement registration attempt logging
  - **Files:** `src/lib/logging/registration.ts`
  - **Dependencies:** Registration logging schema, database client
  - **Acceptance:** Functions log all registration attempts with metadata, failure reasons
  - **Tech:** Database operations, structured logging, TypeScript types

- [ ] **9.1.3 Atomic:** Integrate logging into registration APIs
  - **Files:** `src/app/api/admin/register/route.ts` (enhance), `src/app/api/public/register/route.ts` (enhance)
  - **Dependencies:** Registration logging functions
  - **Acceptance:** All registration endpoints log attempts before and after processing
  - **Tech:** API integration, error handling, async logging operations

#### Story 9.2: Analytics Data Collection

- [ ] **9.2.1 Atomic:** Create analytics aggregation functions
  - **Files:** `src/lib/analytics/aggregators.ts`
  - **Dependencies:** Registration logging, student queries
  - **Acceptance:** Functions calculate real-time metrics, cache expensive queries
  - **Tech:** Database aggregation, caching strategies, performance optimization

- [ ] **9.2.2 Atomic:** Build analytics data models
  - **Files:** `src/lib/types/analytics.ts`
  - **Dependencies:** Analytics aggregation functions
  - **Acceptance:** TypeScript types for all analytics data, API response formats
  - **Tech:** TypeScript interfaces, data transformation types, API contracts

#### Story 9.3: Admin Analytics Interface

- [ ] **9.3.1 Atomic:** Create analytics visualization components
  - **Files:** `src/components/admin/AnalyticsCharts.tsx` (enhance existing)
  - **Dependencies:** Analytics data models, chart library
  - **Acceptance:** Interactive charts for registration trends, program distribution, success rates
  - **Tech:** Chart library integration, responsive design, interactive features

- [ ] **9.3.2 Atomic:** Build comprehensive analytics page
  - **Files:** `src/app/(admin)/analytics/page.tsx` (enhance existing)
  - **Dependencies:** Enhanced analytics components, analytics API
  - **Acceptance:** Full analytics dashboard with filters, exports, real-time updates
  - **Tech:** React Server Components, client-side interactivity, data export functionality

---

**Atomic Review Checklist:**
- [x] Each task completable by junior developer in 2-8 hours
- [x] Specific file paths provided for all tasks
- [x] Acceptance criteria are testable and specific
- [x] Tech requirements specify exact tools/patterns from stack
- [x] Dependencies clearly stated for proper sequencing
- [x] Tasks align with Next.js 15 + TypeScript + Prisma architecture

**Implementation Ready:** All tasks now include exact file paths, detailed acceptance criteria, and technology specifications for immediate development start.

**Total Atomic Tasks:** 67 granular, actionable tasks ready for assignment to junior developers.
