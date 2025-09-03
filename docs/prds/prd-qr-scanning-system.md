# Product Requirements Document: QR Scanning System

## Introduction/Overview

The QR Scanning System is a core feature of the DTP Attendance application that enables real-time attendance tracking through QR code scanning. This system allows designated organizers to scan student QR codes using their device's camera to record time-in and time-out attendance for specific event sessions. The system automatically determines whether a scan represents a "Time-In" or "Time-Out" based on configurable time windows, eliminating manual selection and reducing errors.

**Problem Statement:** Traditional attendance tracking methods are time-consuming, error-prone, and difficult to manage for large events. Manual processes create bottlenecks and make it challenging to track attendance in real-time.

**Solution:** A web-based QR scanning system that provides instant attendance recording with automatic time window detection, real-time feedback, and comprehensive admin management tools.

## Goals

1. **Streamline Attendance Tracking:** Reduce attendance recording time by 80% compared to manual methods
2. **Eliminate Human Error:** Automatically determine Time-In vs Time-Out based on configurable time windows
3. **Enable Real-time Monitoring:** Provide instant feedback and live attendance counts during events
4. **Support Multiple Organizers:** Allow concurrent scanning by multiple organizers without conflicts
5. **Ensure Data Integrity:** Prevent duplicate scans and maintain accurate attendance records
6. **Provide Comprehensive Reporting:** Generate detailed CSV exports for attendance analysis

## User Stories

### Organizer Stories
- **As an organizer**, I want to log in with my email and password so that I can access the scanning interface securely
- **As an organizer**, I want to select the specific event and session I'm scanning for so that I can ensure accurate attendance tracking
- **As an organizer**, I want to scan QR codes using my device's camera so that I can quickly record student attendance
- **As an organizer**, I want to receive immediate visual and audio feedback with the student's name so that I can verify the correct student is being scanned
- **As an organizer**, I want to see the current scanning mode (Time-In/Time-Out/Inactive) so that I understand what type of attendance I'm recording
- **As an organizer**, I want to manually enter a student ID if a QR code is unreadable so that I can still record attendance
- **As an organizer**, I want to see real-time attendance counts so that I can monitor event participation

### Admin Stories
- **As an admin**, I want to create and manage events with multiple sessions so that I can organize complex attendance tracking
- **As an admin**, I want to configure time windows for each session so that I can control when Time-In and Time-Out scanning is active
- **As an admin**, I want to assign organizers to specific events so that I can control access and ensure proper coverage
- **As an admin**, I want to view attendance reports for any session so that I can analyze participation data
- **As an admin**, I want to export attendance data to CSV so that I can perform further analysis or share with stakeholders
- **As an admin**, I want to invite new organizers so that I can expand the scanning team as needed

### Student Stories
- **As a student**, I want my QR code to work consistently so that I can easily check in and out of events
- **As a student**, I want to receive confirmation when my attendance is recorded so that I know my participation was tracked

## Functional Requirements

### 1. Authentication & Access Control
1.1. The system must integrate with the existing Supabase Auth system for organizer authentication
1.2. The system must support email/password login for organizers
1.3. The system must provide self-service password reset functionality for organizers
1.4. The system must restrict organizer access to only assigned events and sessions
1.5. The system must require admin invitation for new organizer accounts (no self-registration)
1.6. The system must support multiple organizers scanning simultaneously for the same session

### 2. Event & Session Management
2.1. The system must allow admins to create events with configurable start and end times
2.2. The system must support unlimited sessions per event, potentially spanning multiple days
2.3. The system must allow admins to configure time windows for each session:
   - `startTime`: When the session begins
   - `endTime`: When the session ends
   - `timeInWindowMinutes`: How long before session start Time-In scanning is active
   - `timeOutWindowMinutes`: How long after session end Time-Out scanning is active
2.4. The system must allow admins to assign multiple organizers to any event
2.5. The system must provide a session selection interface for organizers after login

### 3. QR Code Scanning Functionality
3.1. The system must provide a live camera interface for QR code scanning
3.2. The system must support both mobile device cameras and laptop/desktop webcams
3.3. The system must automatically determine scan type (Time-In vs Time-Out) based on current time and configured windows
3.4. The system must process scans in real-time and immediately update the database
3.5. The system must prevent duplicate Time-In or Time-Out scans for the same student in the same session
3.6. The system must validate that scanned QR codes correspond to registered students
3.7. The system must provide manual entry fallback when QR codes are unreadable

### 4. User Interface & Experience
4.1. The system must display a clear, full-screen camera viewfinder optimized for mobile devices
4.2. The system must show current scanning mode with visual indicators:
   - 🟢 SCANNING FOR: TIME-IN (green)
   - 🔵 SCANNING FOR: TIME-OUT (blue)
   - 🔴 SCANNING INACTIVE (red)
4.3. The system must provide immediate visual feedback for scan results:
   - Success (Time-In): Green screen with student name and confirmation message (e.g., "John Doe - Time In Successful")
   - Success (Time-Out): Blue screen with student name and confirmation message (e.g., "John Doe - Time Out Successful")
   - Error/Duplicate: Red screen with clear error message
4.4. The system must provide audio feedback for scan results:
   - Success (Time-In): Positive "beep" sound
   - Success (Time-Out): Distinct "boop" sound
   - Error: Error sound
4.5. The system must display real-time attendance counts during active sessions
4.6. The system must handle camera permission denial gracefully with clear instructions

### 5. Error Handling & Edge Cases
5.1. The system must reject scans outside configured time windows with appropriate error messages
5.2. The system must handle network connectivity issues with retry mechanisms
5.3. The system must provide clear error messages for invalid QR codes
5.4. The system must prevent scanning for inactive sessions
5.5. The system must handle camera access denial with fallback to manual entry

### 6. Data Management & Reporting
6.1. The system must create attendance records with timestamps for each successful scan
6.2. The system must maintain one attendance record per student per session
6.3. The system must provide admin dashboard views for attendance data
6.4. The system must support CSV export with the following fields:
   - Student ID
   - First Name
   - Last Name
   - Email
   - Program
   - Year
   - Time In Timestamp
   - Time Out Timestamp
   - Session Name
   - Event Name
6.5. The system must display real-time attendance counts for active sessions

### 7. Technical Integration
7.1. The system must integrate with the existing student registration database
7.2. The system must reuse existing admin dashboard UI components for consistency
7.3. The system must support latest stable versions of Chrome, Safari, Firefox, and Edge browsers
7.4. The system must be fully responsive across mobile and desktop devices

## Non-Goals (Out of Scope)

1. **Offline Capability:** The system will not support offline scanning or data synchronization
2. **Advanced Analytics:** Trend analysis, predictive insights, and advanced reporting features are excluded
3. **QR Code Generation:** The system will not generate QR codes (assumes they exist from registration)
4. **External System Integration:** No synchronization with external attendance or student management systems
5. **Self-Registration for Organizers:** All organizer accounts must be created by admins
6. **Multi-language Support:** The system will be English-only for V1
7. **Advanced Security Features:** QR code encryption, expiration dates, or anti-tampering measures
8. **Bulk Operations:** Mass attendance updates or batch processing features

## Design Considerations

### UI/UX Requirements
- **Mobile-First Design:** Optimize for mobile devices while maintaining desktop functionality
- **Consistent Branding:** Reuse existing design system components and styling
- **Accessibility:** Ensure proper contrast ratios and screen reader compatibility
- **Intuitive Navigation:** Clear, simple interface that requires minimal training

### Camera Interface
- **Full-Screen Viewfinder:** Maximize scanning area for better QR code detection
- **Visual Overlay:** Clear scanning target area with appropriate sizing
- **Responsive Layout:** Adapt to different screen sizes and orientations

### Feedback Systems
- **Immediate Response:** Visual and audio feedback within 200ms of scan
- **Student Name Verification:** Display student name prominently to confirm correct person is being scanned
- **Clear Status Indicators:** Unambiguous mode indicators and error messages
- **Consistent Color Coding:** Green (success/time-in), Blue (time-out), Red (error/inactive)

## Technical Considerations

### Browser Compatibility
- **WebRTC Support:** Required for camera access across all target browsers
- **Responsive Design:** CSS Grid and Flexbox for layout adaptation
- **Progressive Enhancement:** Graceful degradation for older browsers

### Performance Requirements
- **Real-time Processing:** API responses within 500ms for scan validation
- **Efficient Camera Usage:** Optimize video stream quality for QR detection
- **Minimal Resource Usage:** Lightweight implementation for mobile devices

### Security Considerations
- **Authentication Integration:** Leverage existing Supabase Auth infrastructure
- **Role-Based Access:** Enforce organizer permissions at API level
- **Data Validation:** Server-side validation for all scan data

### Database Integration
- **Existing Schema:** Utilize current student and event data models
- **Atomic Operations:** Ensure data consistency for concurrent scanning
- **Audit Trail:** Maintain scan history for troubleshooting

## Success Metrics

### Primary Metrics
1. **Scan Success Rate:** >95% successful QR code recognition and processing
2. **Response Time:** <500ms average API response time for scan validation
3. **User Adoption:** 100% of assigned organizers actively using the system within 2 weeks
4. **Data Accuracy:** 0% duplicate attendance records per session
5. **Identity Verification:** 100% of successful scans display correct student name for organizer verification

### Secondary Metrics
1. **Time Savings:** 80% reduction in attendance recording time compared to manual methods
2. **Error Reduction:** 90% reduction in attendance tracking errors
3. **User Satisfaction:** >4.5/5 rating from organizers on system usability
4. **System Uptime:** >99% availability during active event sessions

### Operational Metrics
1. **Support Tickets:** <5% of sessions require technical support intervention
2. **Training Time:** <30 minutes required for new organizer onboarding
3. **Export Usage:** >80% of events result in CSV data export

## Open Questions

1. **QR Code Format Validation:** Should the system validate QR code format beyond checking for valid student ID numbers?
2. **Session Overlap Handling:** How should the system handle scenarios where multiple sessions have overlapping time windows?
3. **Organizer Notification System:** Should organizers receive notifications for session start/end times or time window changes?
4. **Backup Scanning Methods:** Should there be additional fallback methods beyond manual entry for camera failures?
5. **Data Retention Policy:** How long should attendance scan history be retained in the system?
6. **Performance Monitoring:** What specific metrics should be tracked for system performance and user experience?
7. **Multi-Event Scanning:** Should organizers be able to switch between different active sessions during a single login session?

---

**Document Version:** 1.0  
**Created:** [Current Date]  
**Target Implementation:** Phase 1 of DTP Attendance System  
**Estimated Development Time:** 4-6 weeks  
**Priority:** High (Core Feature)
