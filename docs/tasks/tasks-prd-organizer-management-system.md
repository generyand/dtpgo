# Tasks: Organizer Management System

## PRD Traceability Matrix

Map each functional requirement to specific tasks:
- **FR-01** Organizer Management Dashboard → Epic 1.0
- **FR-02** Organizer Invitation System → Epic 2.0
- **FR-03** Event Assignment Management → Epic 3.0
- **FR-04** Organizer Profile Management → Epic 4.0
- **FR-05** Event Management Integration → Epic 5.0
- **FR-06** Organizer Portal Enhancement → Epic 6.0
- **FR-07** Activity Tracking and Analytics → Epic 7.0

## Relevant Files

Tech-stack specific file structure:
- `src/app/admin/organizers/page.tsx` - Dedicated organizer management page ✅
- `src/app/admin/organizers/[id]/page.tsx` - Individual organizer details page ✅
- `src/app/admin/organizers/[id]/not-found.tsx` - Not found page for organizers ✅
- `src/app/api/admin/organizers/[id]/route.ts` - Individual organizer API endpoints ✅
- `src/hooks/use-organizer-details.ts` - Hook for organizer details management ✅
- `src/components/admin/organizers/OrganizerList.tsx` - Organizer listing component ✅
- `src/hooks/use-organizers.ts` - Custom hook for fetching organizer data ✅
- `src/components/admin/organizers/OrganizerCard.tsx` - Individual organizer card component ✅
- `src/components/admin/organizers/index.ts` - Component exports ✅
- `src/components/admin/AdminNav.tsx` - Updated with organizers navigation ✅
- `src/components/admin/organizers/OrganizerStats.tsx` - Organizer statistics component ✅
- `src/lib/db/queries/organizers.ts` - Organizer database queries ✅
- `src/app/api/admin/organizers/stats/route.ts` - Organizer statistics API ✅
- `src/components/admin/organizers/OrganizerActions.tsx` - Organizer action dropdown menu ✅
- `src/components/admin/organizers/OrganizerForm.tsx` - Organizer creation/editing form
- `src/components/admin/organizers/OrganizerAssignments.tsx` - Event assignment management
- `src/components/admin/organizers/BulkAssignmentModal.tsx` - Bulk assignment interface
- `src/app/api/admin/organizers/[id]/route.ts` - Individual organizer API endpoints
- `src/lib/email/invitation-service.ts` - Email invitation service
- `src/lib/email/templates/organizer-invitation.tsx` - Email template component
- `src/lib/email/nodemailer-config.ts` - Nodemailer configuration
- `src/components/organizer/OrganizerDashboard.tsx` - Enhanced organizer portal
- `src/components/organizer/SessionManager.tsx` - Session management interface

### Testing Notes

- **Component Testing:** Place test files alongside components (`.test.tsx`)
- **API Testing:** Test API routes using Next.js testing utilities
- **Type Safety:** Leverage TypeScript for compile-time validation
- **Run Tests:** Use `pnpm test` from project root

## Tasks

### Three-Tier Structure: Epic → Story → Atomic

- [ ] **1.0 Epic: Organizer Management Dashboard** *(FR-01)*
  - [ ] **1.1 Story: Organizer List Interface**
    - [x] **1.1.1 Atomic:** Create organizer management page at `/admin/organizers`
      - **Files:** `src/app/admin/organizers/page.tsx`
      - **Dependencies:** Admin layout, authentication system
      - **Acceptance:** Page renders with header, stats cards, and organizer list
      - **Tech:** Next.js App Router, TypeScript, responsive design
    - [x] **1.1.2 Atomic:** Build OrganizerList component with search and filtering
      - **Files:** `src/components/admin/organizers/OrganizerList.tsx`, `src/hooks/use-organizers.ts`
      - **Dependencies:** Organizer API endpoints
      - **Acceptance:** Displays organizers in table/card format with search, filter, and pagination
      - **Tech:** React hooks, Tailwind CSS, Lucide icons
    - [x] **1.1.3 Atomic:** Create OrganizerCard component for individual organizer display
      - **Files:** `src/components/admin/organizers/OrganizerCard.tsx`, `src/components/admin/organizers/index.ts`
      - **Dependencies:** Organizer type definitions
      - **Acceptance:** Shows organizer details, status, assignments, and action buttons
      - **Tech:** CVA for variants, responsive design, hover states
    - [x] **1.1.4 Atomic:** Add organizer statistics cards to dashboard
      - **Files:** `src/components/admin/organizers/OrganizerStats.tsx`, `src/lib/db/queries/organizers.ts`, `src/app/api/admin/organizers/stats/route.ts`
      - **Dependencies:** Organizer API with statistics
      - **Acceptance:** Displays total, active, inactive, and assignment counts
      - **Tech:** Real-time data fetching, animated counters

  - [ ] **1.2 Story: Organizer Details and Actions**
    - [x] **1.2.1 Atomic:** Create individual organizer details page
      - **Files:** `src/app/admin/organizers/[id]/page.tsx`, `src/app/admin/organizers/[id]/not-found.tsx`, `src/app/api/admin/organizers/[id]/route.ts`, `src/hooks/use-organizer-details.ts`
      - **Dependencies:** OrganizerList component
      - **Acceptance:** Shows detailed organizer info, assignments, and activity history
      - **Tech:** Dynamic routing, server-side data fetching
    - [x] **1.2.2 Atomic:** Implement organizer action dropdown menu
      - **Files:** `src/components/admin/organizers/OrganizerActions.tsx`
      - **Dependencies:** Organizer API endpoints
      - **Acceptance:** Edit, deactivate, resend invitation, view details actions
      - **Tech:** DropdownMenu component, confirmation dialogs

- [ ] **2.0 Epic: Organizer Invitation System** *(FR-02)*
  - [ ] **2.1 Story: Email Service Integration**
    - [ ] **2.1.1 Atomic:** Set up Nodemailer email service
      - **Files:** `src/lib/email/nodemailer-config.ts`, `src/lib/email/email-service.ts`, `.env.local`
      - **Dependencies:** Nodemailer package installation
      - **Acceptance:** Nodemailer configured with SMTP settings and testable
      - **Tech:** Nodemailer, SMTP configuration, environment variables, error handling
    - [ ] **2.1.2 Atomic:** Create email template system
      - **Files:** `src/lib/email/templates/organizer-invitation.tsx`, `src/lib/email/templates/base-template.tsx`
      - **Dependencies:** Email service setup
      - **Acceptance:** Professional HTML email template with branding
      - **Tech:** React Email, responsive design, inline CSS, Nodemailer HTML rendering
    - [ ] **2.1.3 Atomic:** Implement invitation email service
      - **Files:** `src/lib/email/invitation-service.ts`
      - **Dependencies:** Email templates, Nodemailer configuration
      - **Acceptance:** Sends invitation emails with proper content and tracking
      - **Tech:** Nodemailer, async/await, error handling, retry logic, HTML rendering

  - [ ] **2.2 Story: Invitation UI and Workflow**
    - [ ] **2.2.1 Atomic:** Enhance existing InviteOrganizerForm with email integration
      - **Files:** `src/components/admin/InviteOrganizerForm.tsx`
      - **Dependencies:** Email service, invitation API
      - **Acceptance:** Form sends actual emails, shows delivery status
      - **Tech:** React Hook Form, toast notifications, loading states
    - [ ] **2.2.2 Atomic:** Add invitation status tracking to organizer list
      - **Files:** `src/components/admin/organizers/InvitationStatus.tsx`
      - **Dependencies:** Organizer API with invitation data
      - **Acceptance:** Shows pending, sent, accepted, failed invitation status
      - **Tech:** Status badges, real-time updates
    - [ ] **2.2.3 Atomic:** Implement resend invitation functionality
      - **Files:** `src/app/api/admin/organizers/[id]/resend-invitation/route.ts`
      - **Dependencies:** Email service, organizer data
      - **Acceptance:** Resends invitation email and updates status
      - **Tech:** Next.js API route, error handling, rate limiting

- [ ] **3.0 Epic: Event Assignment Management** *(FR-03)*
  - [ ] **3.1 Story: Assignment Interface Components**
    - [ ] **3.1.1 Atomic:** Create OrganizerAssignments component for event details
      - **Files:** `src/components/admin/organizers/OrganizerAssignments.tsx`
      - **Dependencies:** Event organizer API endpoints
      - **Acceptance:** Shows assigned organizers, allows add/remove actions
      - **Tech:** Multi-select component, real-time updates
    - [ ] **3.1.2 Atomic:** Build BulkAssignmentModal for multiple event assignment
      - **Files:** `src/components/admin/organizers/BulkAssignmentModal.tsx`
      - **Dependencies:** Bulk assignment API, event selection
      - **Acceptance:** Select multiple events and organizers, bulk assign/remove
      - **Tech:** Modal component, checkbox groups, confirmation dialogs
    - [ ] **3.1.3 Atomic:** Enhance existing BulkOrganizerAssignment component
      - **Files:** `src/components/admin/BulkOrganizerAssignment.tsx`
      - **Dependencies:** Event selection state
      - **Acceptance:** Improved UI, better error handling, progress indicators
      - **Tech:** Loading states, error boundaries, success feedback

  - [ ] **3.2 Story: Assignment API Integration**
    - [ ] **3.2.1 Atomic:** Enhance event organizer API with bulk operations
      - **Files:** `src/app/api/admin/events/[id]/organizers/route.ts`
      - **Dependencies:** Existing assignment API
      - **Acceptance:** Supports bulk assignment, better error handling
      - **Tech:** Prisma transactions, validation, activity logging
    - [ ] **3.2.2 Atomic:** Add assignment validation and conflict detection
      - **Files:** `src/lib/validations/organizer-assignment.ts`
      - **Dependencies:** Event and organizer data models
      - **Acceptance:** Prevents duplicate assignments, validates permissions
      - **Tech:** Zod validation, business logic rules

- [ ] **4.0 Epic: Organizer Profile Management** *(FR-04)*
  - [ ] **4.1 Story: Profile Editing Interface**
    - [ ] **4.1.1 Atomic:** Create OrganizerForm component for editing
      - **Files:** `src/components/admin/organizers/OrganizerForm.tsx`
      - **Dependencies:** Organizer type definitions, validation schemas
      - **Acceptance:** Edit name, email, role with validation and error handling
      - **Tech:** React Hook Form, Zod validation, controlled inputs
    - [ ] **4.1.2 Atomic:** Implement profile update API endpoint
      - **Files:** `src/app/api/admin/organizers/[id]/route.ts`
      - **Dependencies:** Organizer model, validation
      - **Acceptance:** Updates organizer data, maintains data integrity
      - **Tech:** Prisma updates, validation, activity logging
    - [ ] **4.1.3 Atomic:** Add account status management (activate/deactivate)
      - **Files:** `src/components/admin/organizers/AccountStatus.tsx`
      - **Dependencies:** Organizer API with status updates
      - **Acceptance:** Toggle active status with confirmation and feedback
      - **Tech:** Toggle component, confirmation dialogs, status indicators

  - [ ] **4.2 Story: Data Validation and Security**
    - [ ] **4.2.1 Atomic:** Create organizer validation schemas
      - **Files:** `src/lib/validations/organizer.ts`
      - **Dependencies:** Organizer type definitions
      - **Acceptance:** Validates email format, name requirements, role constraints
      - **Tech:** Zod schemas, custom validators, error messages
    - [ ] **4.2.2 Atomic:** Implement email uniqueness validation
      - **Files:** `src/lib/validations/organizer-email.ts`
      - **Dependencies:** Database queries, validation schemas
      - **Acceptance:** Prevents duplicate emails, handles case sensitivity
      - **Tech:** Database queries, async validation, real-time feedback

- [ ] **5.0 Epic: Event Management Integration** *(FR-05)*
  - [ ] **5.1 Story: Event Details Integration**
    - [ ] **5.1.1 Atomic:** Add organizer section to EventDetailTabs
      - **Files:** `src/components/admin/EventDetailTabs.tsx`
      - **Dependencies:** OrganizerAssignments component
      - **Acceptance:** New "Organizers" tab shows assigned organizers
      - **Tech:** Tab component, conditional rendering, data fetching
    - [ ] **5.1.2 Atomic:** Integrate organizer assignment into EventManagementSplitPane
      - **Files:** `src/components/admin/EventManagementSplitPane.tsx`
      - **Dependencies:** Organizer management components
      - **Acceptance:** Quick organizer assignment in event management interface
      - **Tech:** Component composition, state management, real-time updates
    - [ ] **5.1.3 Atomic:** Add organizer count to event cards
      - **Files:** `src/components/admin/EventsList.tsx`
      - **Dependencies:** Event organizer data
      - **Acceptance:** Shows number of assigned organizers per event
      - **Tech:** Data aggregation, badge components, hover tooltips

  - [ ] **5.2 Story: Quick Assignment Interface**
    - [ ] **5.2.1 Atomic:** Create quick assignment dropdown in event cards
      - **Files:** `src/components/admin/QuickOrganizerAssignment.tsx`
      - **Dependencies:** Organizer API, assignment API
      - **Acceptance:** Dropdown to quickly assign/remove organizers from events
      - **Tech:** DropdownMenu, multi-select, optimistic updates
    - [ ] **5.2.2 Atomic:** Add organizer management to event creation form
      - **Files:** `src/components/admin/EventForm.tsx`
      - **Dependencies:** Organizer selection component
      - **Acceptance:** Option to assign organizers during event creation
      - **Tech:** Form integration, conditional fields, validation

- [ ] **6.0 Epic: Organizer Portal Enhancement** *(FR-06)*
  - [ ] **6.1 Story: Enhanced Dashboard Interface**
    - [ ] **6.1.1 Atomic:** Create OrganizerDashboard component
      - **Files:** `src/components/organizer/OrganizerDashboard.tsx`
      - **Dependencies:** Organizer session API, authentication
      - **Acceptance:** Shows assigned events, upcoming sessions, quick actions
      - **Tech:** Dashboard layout, data fetching, responsive design
    - [ ] **6.1.2 Atomic:** Enhance SessionSelector with better UX
      - **Files:** `src/components/organizer/SessionSelector.tsx`
      - **Dependencies:** Session API, QR scanning components
      - **Acceptance:** Improved session display, better filtering, status indicators
      - **Tech:** Enhanced UI, real-time updates, better error handling
    - [ ] **6.1.3 Atomic:** Add session management tools
      - **Files:** `src/components/organizer/SessionManager.tsx`
      - **Dependencies:** Session API, attendance tracking
      - **Acceptance:** View session details, manage attendance, export data
      - **Tech:** Management interface, data tables, export functionality

  - [ ] **6.2 Story: QR Code Scanning Enhancement**
    - [ ] **6.2.1 Atomic:** Improve QRCodeScanner component
      - **Files:** `src/components/organizer/QRCodeScanner.tsx`
      - **Dependencies:** Camera API, QR detection library
      - **Acceptance:** Better scanning UI, error handling, success feedback
      - **Tech:** Camera permissions, error boundaries, user feedback
    - [ ] **6.2.2 Atomic:** Add manual entry fallback
      - **Files:** `src/components/organizer/ManualEntry.tsx`
      - **Dependencies:** Attendance API, student validation
      - **Acceptance:** Manual student ID entry when QR scanning fails
      - **Tech:** Form validation, student lookup, error handling

- [ ] **7.0 Epic: Activity Tracking and Analytics** *(FR-07)*
  - [ ] **7.1 Story: Activity Logging System**
    - [ ] **7.1.1 Atomic:** Enhance activity logging for organizer actions
      - **Files:** `src/lib/db/queries/activity.ts`
      - **Dependencies:** Existing activity logging system
      - **Acceptance:** Logs organizer assignments, profile changes, login activity
      - **Tech:** Activity logging, metadata tracking, audit trails
    - [ ] **7.1.2 Atomic:** Create organizer activity feed component
      - **Files:** `src/components/admin/organizers/OrganizerActivity.tsx`
      - **Dependencies:** Activity API, organizer data
      - **Acceptance:** Shows recent organizer actions and system events
      - **Tech:** Activity feed, real-time updates, filtering
    - [ ] **7.1.3 Atomic:** Add activity tracking to organizer portal
      - **Files:** `src/components/organizer/ActivityHistory.tsx`
      - **Dependencies:** Activity API, organizer authentication
      - **Acceptance:** Shows organizer's own activity and session history
      - **Tech:** Personal activity feed, session tracking, data visualization

  - [ ] **7.2 Story: Analytics and Reporting**
    - [ ] **7.2.1 Atomic:** Create organizer analytics API endpoints
      - **Files:** `src/app/api/admin/analytics/organizers/route.ts`
      - **Dependencies:** Database queries, aggregation logic
      - **Acceptance:** Returns organizer usage statistics and trends
      - **Tech:** Prisma aggregations, date filtering, performance optimization
    - [ ] **7.2.2 Atomic:** Build organizer analytics dashboard
      - **Files:** `src/components/admin/organizers/OrganizerAnalytics.tsx`
      - **Dependencies:** Analytics API, chart components
      - **Acceptance:** Visual charts showing organizer activity and usage
      - **Tech:** Chart.js or similar, responsive charts, data filtering
    - [ ] **7.2.3 Atomic:** Add organizer usage reports
      - **Files:** `src/components/admin/organizers/UsageReports.tsx`
      - **Dependencies:** Analytics data, export functionality
      - **Acceptance:** Generate and export organizer usage reports
      - **Tech:** Report generation, CSV/PDF export, date range selection

## Implementation Priority

### Phase 1 (Core Functionality)
- Epic 1.0: Organizer Management Dashboard
- Epic 2.0: Organizer Invitation System (email integration)
- Epic 3.0: Event Assignment Management

### Phase 2 (Integration & Enhancement)
- Epic 4.0: Organizer Profile Management
- Epic 5.0: Event Management Integration
- Epic 6.0: Organizer Portal Enhancement

### Phase 3 (Analytics & Polish)
- Epic 7.0: Activity Tracking and Analytics
- Performance optimization
- Advanced features and polish

## Dependencies

### External Dependencies
- SMTP email service (Gmail, Outlook, or custom SMTP server)
- Camera permissions for QR scanning
- Database migration for any schema changes
- Nodemailer package installation

### Internal Dependencies
- Existing organizer API endpoints
- Authentication system integration
- Activity logging system
- Event management components

## Nodemailer Configuration

### Environment Variables Required
```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=DTP Attendance System <noreply@dtp.edu.my>
EMAIL_REPLY_TO=admin@dtp.edu.my
```

### SMTP Provider Options
1. **Gmail (Recommended for development)**
   - Use App Passwords for authentication
   - SMTP Host: `smtp.gmail.com`
   - Port: `587` (TLS) or `465` (SSL)

2. **Outlook/Hotmail**
   - SMTP Host: `smtp-mail.outlook.com`
   - Port: `587`

3. **Custom SMTP Server**
   - Configure with your hosting provider's SMTP settings

### Package Installation
```bash
pnpm add nodemailer
pnpm add -D @types/nodemailer
```

## Success Criteria

- [ ] All organizer management functionality accessible through admin UI
- [ ] Email invitations successfully delivered to organizers via Nodemailer
- [ ] Organizers can be assigned/removed from events seamlessly
- [ ] Organizer portal provides clear session management interface
- [ ] All organizer actions are properly logged and trackable
- [ ] System performance meets requirements (2-second load times)
- [ ] Zero critical bugs in organizer management workflows
