# Product Requirements Document: Hybrid Student Registration System

## Overview

The Hybrid Student Registration System is a comprehensive solution that supports two distinct registration workflows: secure admin-managed registration via a protected dashboard, and rapid self-registration by students during live events. Both workflows populate a centralized student database and generate unique QR codes for attendance tracking purposes.

## Goals

1. **Streamline Event Registration**: Enable rapid, on-the-spot student registration during live events with immediate QR code generation
2. **Provide Administrative Control**: Allow administrators to pre-register students and manage existing records through a secure dashboard
3. **Ensure Data Integrity**: Maintain a single source of truth for student data with validation and duplicate prevention
4. **Enable Attendance Tracking**: Generate static QR codes containing student IDs for seamless attendance management
5. **Scale for Peak Usage**: Handle hundreds of registrations per minute during high-volume events

## User Stories

### Admin Users
- **As an administrator**, I want to log into a secure dashboard so that I can manage student registrations
- **As an administrator**, I want to register individual students through a form so that I can pre-populate the system before events
- **As an administrator**, I want to view all registered students in a searchable table so that I can verify registrations and manage data
- **As an administrator**, I want to edit existing student records so that I can correct data entry errors
- **As an administrator**, I want to see registration analytics so that I can understand system usage and student demographics

### Student Users
- **As a student at an event**, I want to quickly register myself using my mobile device so that I can join the event without delay
- **As a student**, I want to immediately see my QR code after registration so that I can screenshot it for attendance purposes
- **As a student**, I want to receive an email with my QR code so that I have a backup copy for future reference

## Functional Requirements

### 1. Authentication & Access Control
1.1. The system must provide secure admin authentication using Supabase Auth
1.2. The admin dashboard must be protected and accessible only to authenticated administrators
1.3. The public registration page must be accessible without authentication
1.4. The system must support IP whitelisting for admin routes as an optional security enhancement

### 2. Student Data Model
2.1. The system must store student records with the following required fields:
   - `studentIdNumber`: String, must be unique, must match pattern `^S\d{3}-\d{4}-\d{3}$`
   - `firstName`: String, required
   - `lastName`: String, required  
   - `email`: String, must be unique, must be valid email format
   - `programId`: Foreign key reference to Program table
   - `year`: Integer, must be between 1-5

2.2. The system must maintain a separate `Program` table with configurable program options (initially: "BSIT", "BSCPE")
2.3. All student records must include automatic timestamps for creation and last update

### 3. Admin Dashboard Features
3.1. The system must provide a single student registration form for administrators
3.2. The form must include a "Register and Add Another" button for efficient sequential registration
3.3. The system must display all registered students in a paginated, searchable table
3.4. Administrators must be able to edit existing student records
3.5. The dashboard must display analytics including:
   - Total registrations count
   - Registrations by source (admin vs. public)
   - Student breakdown by program and year
3.6. The system must show near-real-time metrics updated from the database

### 4. Public Registration Interface
4.1. The public registration page must be optimized for portrait mobile devices
4.2. The registration form must collect all required student information
4.3. The system must validate for duplicate `studentIdNumber` and `email` in real-time
4.4. Upon successful registration, the system must immediately display a branded QR code
4.5. The QR code display must include:
   - University/Department logo
   - Student's full name
   - Student ID number
   - QR code containing the `studentIdNumber`
4.6. The QR code must remain visible until the user clicks "Done" or "Finish"

### 5. QR Code System
5.1. QR codes must contain only the student's `studentIdNumber`
5.2. QR codes must be static (non-expiring, reusable)
5.3. QR codes must be generated as downloadable/shareable images
5.4. The system must generate identical QR codes for the same student across all interfaces

### 6. Email Notifications
6.1. The system must send welcome emails with QR codes for both registration methods
6.2. Admin-initiated registrations must use the template: "An admin has registered an account for you"
6.3. Self-registrations must use the template: "Welcome! You've successfully registered"
6.4. Email failures must not prevent successful registration
6.5. Email delivery failures must be logged for admin review
6.6. Emails must include the same branded QR code image as the success screen

### 7. Data Validation & Error Handling
7.1. The system must enforce strict format validation for student ID numbers
7.2. The system must provide clear error messages for duplicate records:
   - Public form: "This Student ID or Email is already registered. If you believe this is an error, please see an event administrator."
   - Admin form: "This Student ID or Email is already registered. [View existing record]"
7.3. The system must validate email formats using standard regex patterns
7.4. The system must validate year values within the acceptable range (1-5)

### 8. Security & Performance
8.1. The public registration API must implement rate limiting (10 requests per minute per IP)
8.2. The system must log all registration attempts (successful and failed) with failure reasons
8.3. The system must handle high-volume traffic during events (hundreds of registrations per minute)
8.4. Database queries must be optimized for performance during peak usage

### 9. Logging & Analytics
9.1. The system must log every registration attempt with:
   - Timestamp
   - Source (admin/public)
   - Success/failure status
   - Failure reason (if applicable)
   - IP address (for security auditing)
9.2. Logs must be accessible to administrators for debugging and analysis

## Non-Goals (Out of Scope for V1)

1. **Bulk/CSV Registration**: Batch upload functionality will be considered for V2
2. **Role-Based Access Control**: Multiple admin permission levels beyond single admin role
3. **Offline Functionality**: Progressive Web App features and offline registration
4. **Advanced Email Validation**: Verification against disposable email services
5. **Dynamic QR Codes**: Time-sensitive or event-specific QR code generation
6. **Advanced Analytics**: Detailed reporting beyond basic metrics dashboard
7. **Student Self-Service Portal**: Student login and profile management features
8. **CAPTCHA Integration**: Anti-bot measures beyond rate limiting

## Technical Considerations

### Architecture
- **Frontend**: Next.js 15 with App Router, mobile-first responsive design
- **Backend**: Next.js API routes with Prisma ORM
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth for admin access
- **Email Service**: Transactional email service (e.g., Resend)
- **Hosting**: Vercel for automatic scaling capabilities

### Database Schema
```sql
-- Programs table for scalable program management
Program {
  id: String @id @default(cuid())
  name: String @unique // "BSIT", "BSCPE"
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
}

-- Main student records
Student {
  id: String @id @default(cuid())
  studentIdNumber: String @unique
  firstName: String
  lastName: String
  email: String @unique
  programId: String // FK to Program
  year: Int
  registrationSource: String // "admin" | "public"
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
}
```

### API Endpoints
- `POST /api/admin/register` - Admin student registration
- `POST /api/public/register` - Public student registration  
- `GET /api/admin/students` - Retrieve student list (paginated)
- `PUT /api/admin/students/[id]` - Update student record
- `GET /api/admin/analytics` - Registration analytics

### Security Implementation
- Supabase RLS policies for data access control
- Rate limiting middleware for public endpoints
- Input validation and sanitization
- HTTPS enforcement for all communications

## Success Metrics

### Primary Metrics
1. **Registration Completion Rate**: >95% successful completion for both admin and public flows
2. **System Performance**: <2 second response time for registration during peak usage
3. **Data Quality**: <1% duplicate or invalid records in the database
4. **Email Delivery**: >98% successful email delivery rate

### Secondary Metrics
1. **User Experience**: Average registration time <60 seconds for public flow
2. **Admin Efficiency**: Admin can register 10+ students per minute
3. **QR Code Usage**: QR codes successfully scannable by standard QR readers
4. **System Reliability**: 99.9% uptime during event periods

## Open Questions

1. **Email Template Design**: Do we need custom HTML email templates or plain text with QR code attachment?
2. **Program Management**: Should program addition/editing be available in V1 admin interface or handled via database updates?
3. **Data Export**: Is there a need for CSV export functionality in V1 for external systems integration?
4. **QR Code Scanning**: Will the institution provide a specific QR scanning app, or should codes work with standard camera apps?
5. **Event Context**: Should students be associated with specific events, or is this a general registration system?
6. **Data Retention**: Are there any data retention policies or GDPR considerations for student information?

## Implementation Priority

### Phase 1 (Core System)
1. Database schema and basic API endpoints
2. Admin authentication and dashboard structure
3. Single student registration (admin flow)
4. Basic student listing and editing

### Phase 2 (Public Registration)
1. Public registration interface (mobile-optimized)
2. QR code generation and display
3. Email notification system
4. Rate limiting and security measures

### Phase 3 (Analytics & Polish)
1. Registration analytics dashboard
2. Comprehensive logging system
3. Error handling improvements
4. Performance optimization

---

**Document Version**: 1.0  
**Last Updated**: [Current Date]  
**Next Review**: After Phase 1 completion
