# PRD: Supabase Authentication System

## Introduction/Overview

This PRD outlines the implementation of a complete authentication system using Supabase Auth to replace the current hybrid authentication approach. The new system will provide secure, role-based authentication for admins and organizers in the DTP Attendance system, while students remain as data entities without login capabilities.

**Problem Statement:** The current authentication system uses a mix of environment variables, custom API routes, and partial Supabase integration, creating security vulnerabilities and maintenance complexity.

**Goal:** Implement a secure, scalable authentication system using Supabase Auth with proper role-based access control and modern authentication patterns.

## Goals

1. **Replace Current Auth System:** Completely migrate from the current hybrid authentication to Supabase Auth
2. **Implement Role-Based Access Control:** Distinguish between Admin and Organizer permissions
3. **Enhance Security:** Use Supabase's built-in security features and best practices
4. **Improve Developer Experience:** Use official Supabase packages and established patterns
5. **Streamline User Management:** Centralize all user management through Supabase

## User Stories

### Admin User Stories
- **As an Admin**, I want to log in with my email and password so that I can access the full admin dashboard
- **As an Admin**, I want to reset my password if I forget it so that I can regain access to my account
- **As an Admin**, I want my session to be automatically managed so that I don't have to re-login frequently
- **As an Admin**, I want to have full access to all system features including user management, analytics, and system settings

### Organizer User Stories
- **As an Organizer**, I want to log in with my email and password so that I can access scanning features
- **As an Organizer**, I want to reset my password if I forget it so that I can regain access to my account
- **As an Organizer**, I want my access to be limited to scanning and basic attendance functions so that system security is maintained
- **As an Organizer**, I want to be automatically logged out after a period of inactivity for security

### System User Stories
- **As the System**, I want to automatically redirect unauthorized users to the login page so that protected routes remain secure
- **As the System**, I want to validate user roles on every request so that users only access features they're authorized to use

## Functional Requirements

### Authentication Core (FR-001 to FR-010)
1. **FR-001:** The system must allow users to log in using email and password through Supabase Auth
2. **FR-002:** The system must provide a "Forgot Password" feature that sends reset emails via Supabase
3. **FR-003:** The system must automatically manage user sessions using Supabase session handling
4. **FR-004:** The system must provide a secure logout function that clears all session data
5. **FR-005:** The system must redirect unauthenticated users to the login page when accessing protected routes
6. **FR-006:** The system must redirect authenticated users away from the login page to their appropriate dashboard
7. **FR-007:** The system must validate user authentication status on every protected route request
8. **FR-008:** The system must handle session refresh automatically to maintain user sessions
9. **FR-009:** The system must provide clear error messages for authentication failures
10. **FR-010:** The system must log authentication events for security monitoring

### Role-Based Access Control (FR-011 to FR-020)
11. **FR-011:** The system must support two user roles: "admin" and "organizer"
12. **FR-012:** The system must store user roles in Supabase user metadata
13. **FR-013:** Admin users must have access to all system features including user management, analytics, settings, and student management
14. **FR-014:** Organizer users must have access only to attendance scanning features and basic attendance viewing
15. **FR-015:** The system must enforce role-based route protection in middleware
16. **FR-016:** The system must display different navigation menus based on user roles
17. **FR-017:** The system must validate user roles on API endpoints to prevent unauthorized access
18. **FR-018:** The system must redirect users to appropriate dashboards based on their roles after login
19. **FR-019:** The system must prevent role escalation attempts through client-side manipulation
20. **FR-020:** The system must provide role-based component rendering throughout the application

### Integration & Migration (FR-021 to FR-030)
21. **FR-021:** The system must completely remove the current custom authentication code
22. **FR-022:** The system must remove environment variable-based authentication
23. **FR-023:** The system must remove the custom admin login API route
24. **FR-024:** The system must update the middleware to use Supabase session validation
25. **FR-025:** The system must refactor AuthProvider to use Supabase Auth helpers
26. **FR-026:** The system must update all protected routes to use new authentication patterns
27. **FR-027:** The system must remove bcrypt dependencies and custom password handling
28. **FR-028:** The system must remove the Admin model from Prisma schema
29. **FR-029:** The system must update TypeScript types to match Supabase Auth patterns
30. **FR-030:** The system must use `@supabase/ssr` for all authentication operations

## Non-Goals (Out of Scope)

1. **Student Authentication:** Students will not have login capabilities - they remain as data entities only
2. **Social Login:** No OAuth providers (Google, GitHub, etc.) - email/password only
3. **Multi-Factor Authentication:** Not included in this initial implementation
4. **User Registration UI:** Admin-managed user creation only, no public registration
5. **Email Verification:** Basic email/password login without email verification requirement
6. **Custom Email Templates:** Use default Supabase email templates
7. **Advanced Session Management:** No custom session duration or "remember me" functionality
8. **User Profile Management:** Basic role assignment only, no extended user profiles
9. **Migration of Existing Users:** Start fresh, no migration of current admin accounts

## Design Considerations

### UI/UX Requirements
- **Login Form:** Clean, simple email/password form matching current design system
- **Error Handling:** Clear, user-friendly error messages for authentication failures
- **Loading States:** Proper loading indicators during authentication operations
- **Responsive Design:** Mobile-friendly authentication forms
- **Role-Based Navigation:** Different navigation menus for admin vs organizer users

### Component Structure
- Refactor `AuthProvider` to use Supabase Auth helpers
- Update `LoginForm` to use Supabase authentication
- Modify `AdminGuard` to work with new authentication system
- Create role-based route protection components

## Technical Considerations

### Dependencies
- Install `@supabase/ssr` package (official Next.js SSR package)
- Remove `@supabase/supabase-js` and `@supabase/auth-helpers-nextjs` (deprecated)
- Remove `bcryptjs` dependency
- Update middleware to use Supabase SSR session validation

### Database Changes
- Remove `Admin` model from Prisma schema
- Clean up admin-related database tables
- Update any foreign key references to admin users

### Configuration
- Configure Supabase Auth settings in Supabase dashboard
- Set up password reset email templates
- Configure session duration and refresh settings
- Update environment variables for Supabase Auth

### Security Considerations
- Implement proper role validation in middleware
- Secure API routes with role-based access control
- Use Supabase RLS (Row Level Security) where applicable
- Implement proper CORS settings for Supabase

## Success Metrics

1. **Security Improvement:** Elimination of environment variable-based authentication
2. **Code Reduction:** 50%+ reduction in custom authentication code
3. **Reliability:** Zero authentication-related bugs in first month of deployment
4. **Performance:** Login/logout operations complete within 2 seconds
5. **User Experience:** Clear role-based access with appropriate error messaging
6. **Maintainability:** Use of standard Supabase patterns for easier future maintenance

## Open Questions

1. **Admin User Creation:** How will the first admin user be created? Through Supabase dashboard or a setup script?
2. **Organizer Management:** Should admins be able to create/manage organizer accounts through the UI?
3. **Session Duration:** What should be the default session duration for different user types?
4. **Password Requirements:** Should we enforce specific password complexity requirements?
5. **Rate Limiting:** Should we implement rate limiting for login attempts?
6. **Audit Logging:** Do we need to track authentication events in our database for audit purposes?

## Implementation Notes

This PRD assumes the use of Next.js 15 App Router patterns and the latest Supabase Auth helpers. The implementation should follow the project's existing TypeScript and component structure guidelines while completely replacing the current authentication system.

The refactoring will touch multiple areas of the codebase including middleware, providers, components, and API routes. A phased implementation approach is recommended to ensure system stability during the transition.
