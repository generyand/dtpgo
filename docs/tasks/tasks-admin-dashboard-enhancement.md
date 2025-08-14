# Task List: Admin Dashboard Enhancement System

**Source:** Admin Dashboard Improvement Strategy (Professional UI/UX Enhancement)

## PRD Traceability Matrix

Map each functional requirement to specific epics:
- **FR-1** Enhanced Metrics & KPIs → Epic 1.0
- **FR-2** Recent Activity Feed → Epic 2.0
- **FR-3** Visual Analytics Dashboard → Epic 3.0
- **FR-4** Quick Actions Panel → Epic 4.0
- **FR-5** System Health Monitoring → Epic 5.0

## Relevant Files

Tech-stack specific file structure for dashboard enhancement:
- `src/app/admin/dashboard/page.tsx` - Main dashboard page layout
- `src/app/api/admin/dashboard/route.ts` - Dashboard API endpoint with caching, error handling, and analytics support
- `prisma/schema.prisma` - Database schema with Activity model for comprehensive activity logging
- `src/components/admin/dashboard/EnhancedMetricCard.tsx` - Enhanced metric card with trend indicators and CVA variants
- `src/components/admin/dashboard/MetricsGrid.tsx` - Responsive metrics container with error boundaries and loading states
- `src/components/admin/dashboard/MetricsCards.tsx` - Enhanced metrics display
- `src/components/admin/dashboard/ActivityItem.tsx` - Individual activity item component with multiple display variants and rich metadata support
- `src/components/admin/dashboard/RecentActivityFeed.tsx` - Comprehensive scrollable activity feed with filtering, search, grouping, and multiple display modes
- `src/components/admin/dashboard/ActivityFeedContainer.tsx` - Data-fetching container with custom hook, real-time updates, and pre-configured variants
- `src/components/admin/dashboard/AnalyticsCharts.tsx` - Visual charts and graphs
- `src/components/admin/dashboard/QuickActions.tsx` - Quick action buttons panel
- `src/components/admin/dashboard/SystemHealth.tsx` - System status monitoring
- `src/lib/db/queries/dashboard.ts` - Dashboard-specific database queries with period comparisons and trend calculations
- `src/lib/db/queries/activity.ts` - Comprehensive activity logging utilities with filtering, analytics, and convenience functions
- `src/lib/utils/metrics.ts` - Comprehensive metrics calculation utilities with trend analysis and growth indicators
- `src/lib/utils/charts.ts` - Chart data processing utilities
- `src/lib/types/dashboard.ts` - Comprehensive TypeScript type definitions for dashboard metrics, trends, analytics, and components
- `src/lib/types/activity.ts` - Complete TypeScript type definitions for activity tracking, logging, display, and analytics
- `src/hooks/use-dashboard-data.ts` - Custom hook for dashboard data management with polling, real-time updates, and error handling
- `src/hooks/use-real-time-activity.ts` - Real-time activity monitoring hook with polling, notifications, and specialized variants

### Testing Notes

- **Component Testing:** Place test files alongside components (`.test.tsx`)
- **API Testing:** Test dashboard API routes using Next.js testing utilities
- **Type Safety:** Leverage TypeScript for compile-time validation
- **Run Tests:** Use `pnpm test` from project root

## Tasks

### Phase 1: Epic Tasks

- [x] **1.0 Epic: Enhanced Metrics & KPIs System** *(FR-1)*
  - Transform basic metrics into actionable KPIs with trends and comparisons
  - Add growth indicators, percentage changes, and time-based comparisons
  - Implement real-time metric updates with optimistic UI
  - **Duration:** 3-4 days
  - **Dependencies:** Existing dashboard structure

- [x] **2.0 Epic: Recent Activity Feed** *(FR-2)*
  - Build comprehensive real-time activity tracking system
  - Display recent student registrations, QR generations, and admin actions
  - Implement live updates with WebSocket or polling mechanism
  - **Duration:** 4-5 days
  - **Dependencies:** Database activity logging, real-time infrastructure

- [ ] **3.0 Epic: Visual Analytics Dashboard** *(FR-3)*
  - Create interactive charts for registration trends and program distribution
  - Implement time-based analytics with filtering capabilities
  - Build responsive chart components with professional styling
  - **Duration:** 5-6 days
  - **Dependencies:** Analytics data collection, charting library integration

- [ ] **4.0 Epic: Quick Actions Panel** *(FR-4)*
  - Design and implement immediate-access administrative tools
  - Create shortcuts for common tasks (register student, export data, etc.)
  - Build contextual action buttons with proper permissions
  - **Duration:** 2-3 days
  - **Dependencies:** Existing admin functionality, routing system

- [ ] **5.0 Epic: System Health Monitoring** *(FR-5)*
  - Implement comprehensive system status monitoring
  - Create health checks for database, API, and external services
  - Build alerting system for critical issues and maintenance notifications
  - **Duration:** 3-4 days
  - **Dependencies:** System infrastructure, monitoring tools

---

**Epic Review Checklist:**
- [ ] All functional requirements (FR-1 through FR-5) are covered
- [ ] No functional requirement spans multiple epics
- [ ] Epic titles clearly indicate the feature boundary
- [ ] Dependencies between epics are identified
- [ ] Epic durations are realistic for implementation

**Next Phase:** After confirming these epics, I'll break each one down into Story-level tasks (Frontend Components, API Endpoints, Database Queries, etc.) for detailed implementation planning.

### Phase 2: Story Tasks

#### Epic 1.0: Enhanced Metrics & KPIs System

- [x] **1.1 Story: Enhanced Metrics Components**
  - Upgrade existing metric cards with trend indicators and comparisons
  - Add percentage changes, growth arrows, and time-based data
  - **Duration:** 1-2 days
  - **Dependencies:** Existing dashboard structure

- [x] **1.2 Story: Metrics Data Processing**
  - Create database queries for historical metric comparisons
  - Build utilities for calculating trends and percentage changes
  - **Duration:** 1-2 days
  - **Dependencies:** Database schema, existing queries

- [x] **1.3 Story: Real-time Metrics Updates**
  - Implement polling or WebSocket updates for live metrics
  - Create optimistic UI updates for immediate feedback
  - **Duration:** 1 day
  - **Dependencies:** Enhanced metrics components

#### Epic 2.0: Recent Activity Feed

- [x] **2.1 Story: Activity Data Model & Queries**
  - Design activity logging schema and database queries
  - Create functions to track registration, QR generation, admin actions
  - **Duration:** 1-2 days
  - **Dependencies:** Database access, existing student operations

- [x] **2.2 Story: Activity Feed Component**
  - Build scrollable, real-time activity feed UI component
  - Implement activity item rendering with icons and timestamps
  - **Duration:** 2-3 days
  - **Dependencies:** Activity data queries

- [x] **2.3 Story: Real-time Activity Updates**
  - Implement live activity updates using polling or WebSocket
  - Create activity event triggers throughout the application
  - **Duration:** 1-2 days
  - **Dependencies:** Activity feed component, data model

#### Epic 3.0: Visual Analytics Dashboard

- [ ] **3.1 Story: Chart Library Integration**
  - Set up and configure charting library (Recharts/Chart.js)
  - Create base chart components with consistent styling
  - **Duration:** 1 day
  - **Dependencies:** Package installation, design system

- [ ] **3.2 Story: Registration Trends Chart**
  - Build line chart component for registration trends over time
  - Implement time period filtering (7 days, 30 days, 90 days)
  - **Duration:** 1-2 days
  - **Dependencies:** Chart library, analytics data queries

- [ ] **3.3 Story: Program Distribution Chart**
  - Create donut/pie chart for program enrollment distribution
  - Add interactive hover states and data labels
  - **Duration:** 1-2 days
  - **Dependencies:** Chart library, program analytics queries

- [ ] **3.4 Story: Analytics Data Queries**
  - Build database queries for chart data aggregation
  - Create time-based filtering and grouping functions
  - **Duration:** 1-2 days
  - **Dependencies:** Database schema, analytics requirements

#### Epic 4.0: Quick Actions Panel

- [ ] **4.1 Story: Quick Actions Component**
  - Design and build quick actions panel with button grid
  - Implement responsive layout for different screen sizes
  - **Duration:** 1 day
  - **Dependencies:** Design system, existing admin routes

- [ ] **4.2 Story: Action Button Integration**
  - Connect quick action buttons to existing admin functionality
  - Implement proper routing and permission checks
  - **Duration:** 1 day
  - **Dependencies:** Quick actions component, admin routes

- [ ] **4.3 Story: Contextual Actions**
  - Add dynamic actions based on current system state
  - Implement action availability logic and disabled states
  - **Duration:** 1 day
  - **Dependencies:** Action button integration, system state

#### Epic 5.0: System Health Monitoring

- [ ] **5.1 Story: Health Check Infrastructure**
  - Create health check functions for database, API, external services
  - Build system status data collection and aggregation
  - **Duration:** 1-2 days
  - **Dependencies:** System infrastructure access

- [ ] **5.2 Story: System Health Component**
  - Build system health display component with status indicators
  - Implement color-coded status badges and detailed information
  - **Duration:** 1-2 days
  - **Dependencies:** Health check infrastructure

- [ ] **5.3 Story: Health Monitoring API**
  - Create API endpoints for system health data
  - Implement caching and performance optimization
  - **Duration:** 1 day
  - **Dependencies:** Health check functions

---

**Story Review Checklist:**
- [ ] Stories align with Next.js 15 + TypeScript + Tailwind tech stack
- [ ] Each story represents a cohesive implementation domain
- [ ] Dependencies between stories are clearly identified
- [ ] Stories can be worked on by different developers simultaneously
- [ ] Story durations are realistic (1-3 days each)

**Next Phase:** Ready for Atomic-level task breakdown with specific file paths and acceptance criteria.

### Phase 3: Atomic Tasks

#### Epic 1.0: Enhanced Metrics & KPIs System

##### Story 1.1: Enhanced Metrics Components

- [x] **1.1.1 Atomic:** Create enhanced metrics card component with trend indicators
  - **Files:** `src/components/admin/dashboard/EnhancedMetricCard.tsx`
  - **Dependencies:** Existing UI components, Lucide icons
  - **Acceptance:** Component displays metric value, percentage change, trend arrow (up/down), comparison period
  - **Tech:** React component with TypeScript, Tailwind CSS, CVA for variants
  - **Duration:** 3-4 hours

- [x] **1.1.2 Atomic:** Create metrics container component for dashboard layout
  - **Files:** `src/components/admin/dashboard/MetricsGrid.tsx`
  - **Dependencies:** EnhancedMetricCard component
  - **Acceptance:** Responsive grid layout, handles loading states, error boundaries
  - **Tech:** CSS Grid with Tailwind, React Suspense, error handling
  - **Duration:** 2-3 hours

- [x] **1.1.3 Atomic:** Update dashboard page to use enhanced metrics
  - **Files:** `src/app/admin/dashboard/page.tsx`
  - **Dependencies:** MetricsGrid component, dashboard data queries
  - **Acceptance:** Dashboard displays enhanced metrics with real data, proper loading states
  - **Tech:** Next.js server component, async data fetching, TypeScript
  - **Duration:** 2-3 hours

##### Story 1.2: Metrics Data Processing

- [x] **1.2.1 Atomic:** Create dashboard-specific database queries
  - **Files:** `src/lib/db/queries/dashboard.ts`
  - **Dependencies:** Prisma client, existing student queries
  - **Acceptance:** Functions for current/previous period metrics, percentage calculations
  - **Tech:** Prisma queries with date filtering, TypeScript interfaces
  - **Duration:** 4-5 hours

- [x] **1.2.2 Atomic:** Create metrics calculation utilities
  - **Files:** `src/lib/utils/metrics.ts`
  - **Dependencies:** Dashboard queries
  - **Acceptance:** Functions for trend calculation, percentage change, growth indicators
  - **Tech:** Pure TypeScript functions, proper error handling, unit testable
  - **Duration:** 3-4 hours

- [x] **1.2.3 Atomic:** Create TypeScript types for dashboard metrics
  - **Files:** `src/lib/types/dashboard.ts`
  - **Dependencies:** None
  - **Acceptance:** Complete type definitions for metrics, trends, dashboard data
  - **Tech:** TypeScript interfaces and types, proper exports
  - **Duration:** 2 hours

##### Story 1.3: Real-time Metrics Updates

- [x] **1.3.1 Atomic:** Create dashboard data hook with polling
  - **Files:** `src/hooks/use-dashboard-data.ts`
  - **Dependencies:** Dashboard queries, metrics utilities
  - **Acceptance:** Hook provides real-time data updates, loading states, error handling
  - **Tech:** Custom React hook, useEffect with cleanup, SWR or React Query
  - **Duration:** 4-5 hours

- [x] **1.3.2 Atomic:** Create dashboard API endpoint for real-time data
  - **Files:** `src/app/api/admin/dashboard/route.ts`
  - **Dependencies:** Dashboard queries
  - **Acceptance:** GET endpoint returns current dashboard metrics, proper caching headers
  - **Tech:** Next.js API route, JSON response, error handling, caching
  - **Duration:** 3-4 hours

#### Epic 2.0: Recent Activity Feed

##### Story 2.1: Activity Data Model & Queries

- [x] **2.1.1 Atomic:** Extend Prisma schema with Activity model
  - **Files:** `prisma/schema.prisma`
  - **Dependencies:** Existing Student and Admin models
  - **Acceptance:** Activity model with type, message, timestamp, user relations
  - **Tech:** Prisma schema definition, proper relationships, indexes
  - **Duration:** 2-3 hours

- [x] **2.1.2 Atomic:** Create activity logging utilities
  - **Files:** `src/lib/db/queries/activity.ts`
  - **Dependencies:** Prisma client, Activity model
  - **Acceptance:** Functions to log activities, fetch recent activities, pagination
  - **Tech:** Prisma queries, TypeScript, proper error handling
  - **Duration:** 4-5 hours

- [x] **2.1.3 Atomic:** Create activity types and interfaces
  - **Files:** `src/lib/types/activity.ts`
  - **Dependencies:** None
  - **Acceptance:** TypeScript types for activity events, logging, display
  - **Tech:** TypeScript interfaces, enums for activity types
  - **Duration:** 2 hours

##### Story 2.2: Activity Feed Component

- [x] **2.2.1 Atomic:** Create activity item component
  - **Files:** `src/components/admin/dashboard/ActivityItem.tsx`
  - **Dependencies:** Activity types, Lucide icons
  - **Acceptance:** Displays activity with icon, message, timestamp, user info
  - **Tech:** React component, conditional rendering, time formatting
  - **Duration:** 3-4 hours

- [x] **2.2.2 Atomic:** Create scrollable activity feed component
  - **Files:** `src/components/admin/dashboard/RecentActivityFeed.tsx`
  - **Dependencies:** ActivityItem component, activity queries
  - **Acceptance:** Scrollable list, loading states, empty states, real-time updates
  - **Tech:** React component with virtualization, infinite scroll, Tailwind styling
  - **Duration:** 5-6 hours

- [x] **2.2.3 Atomic:** Create activity feed container with data fetching
  - **Files:** `src/components/admin/dashboard/ActivityFeedContainer.tsx`
  - **Dependencies:** RecentActivityFeed, activity hooks
  - **Acceptance:** Handles data fetching, error states, refresh functionality
  - **Tech:** React component with data fetching, error boundaries
  - **Duration:** 3-4 hours

##### Story 2.3: Real-time Activity Updates

- [x] **2.3.1 Atomic:** Create real-time activity hook
  - **Files:** `src/hooks/use-real-time-activity.ts`
  - **Dependencies:** Activity queries
  - **Acceptance:** Hook provides live activity updates, WebSocket or polling
  - **Tech:** Custom React hook, real-time updates, cleanup on unmount
  - **Duration:** 4-5 hours

- [x] **2.3.2 Atomic:** Add activity logging to registration endpoints
  - **Files:** `src/app/api/admin/register/route.ts`, `src/app/api/public/register/route.ts`
  - **Dependencies:** Activity logging utilities
  - **Acceptance:** Log registration activities with proper metadata
  - **Tech:** Add logging calls to existing endpoints, proper error handling
  - **Duration:** 2-3 hours

- [x] **2.3.3 Atomic:** Add activity logging to QR generation
  - **Files:** `src/app/api/students/[id]/qr/route.ts`
  - **Dependencies:** Activity logging utilities
  - **Acceptance:** Log QR code generation activities
  - **Tech:** Add logging to QR generation endpoint
  - **Duration:** 2 hours

#### Epic 3.0: Visual Analytics Dashboard

##### Story 3.1: Chart Library Integration

- [ ] **3.1.1 Atomic:** Install and configure Recharts library
  - **Files:** `package.json`, `src/lib/utils/charts.ts`
  - **Dependencies:** None
  - **Acceptance:** Recharts installed, base chart utilities created
  - **Tech:** npm/pnpm install, TypeScript configuration
  - **Duration:** 2 hours

- [ ] **3.1.2 Atomic:** Create base chart component with consistent styling
  - **Files:** `src/components/admin/dashboard/BaseChart.tsx`
  - **Dependencies:** Recharts, Tailwind theme
  - **Acceptance:** Reusable chart wrapper with admin theme colors, responsive design
  - **Tech:** React component wrapper, Tailwind CSS variables, responsive breakpoints
  - **Duration:** 3-4 hours

##### Story 3.2: Registration Trends Chart

- [ ] **3.2.1 Atomic:** Create registration trends data processing
  - **Files:** `src/lib/utils/chart-data.ts`
  - **Dependencies:** Dashboard queries
  - **Acceptance:** Functions to process registration data for line charts
  - **Tech:** Data transformation functions, date grouping, TypeScript
  - **Duration:** 3-4 hours

- [ ] **3.2.2 Atomic:** Build registration trends line chart component
  - **Files:** `src/components/admin/dashboard/RegistrationTrendsChart.tsx`
  - **Dependencies:** BaseChart, chart data utilities, Recharts
  - **Acceptance:** Interactive line chart with time period filtering, tooltips
  - **Tech:** Recharts LineChart, responsive design, interactive features
  - **Duration:** 4-5 hours

- [ ] **3.2.3 Atomic:** Add time period filter controls
  - **Files:** `src/components/admin/dashboard/ChartFilters.tsx`
  - **Dependencies:** UI components
  - **Acceptance:** Filter buttons for 7/30/90 days, active state styling
  - **Tech:** React component with state management, Tailwind styling
  - **Duration:** 2-3 hours

##### Story 3.3: Program Distribution Chart

- [ ] **3.3.1 Atomic:** Create program distribution data queries
  - **Files:** `src/lib/db/queries/analytics.ts` (extend existing)
  - **Dependencies:** Existing analytics queries
  - **Acceptance:** Query for program enrollment counts with percentages
  - **Tech:** Extend existing Prisma queries, add percentage calculations
  - **Duration:** 2-3 hours

- [ ] **3.3.2 Atomic:** Build program distribution donut chart
  - **Files:** `src/components/admin/dashboard/ProgramDistributionChart.tsx`
  - **Dependencies:** BaseChart, analytics queries, Recharts
  - **Acceptance:** Interactive donut chart with hover states, data labels
  - **Tech:** Recharts PieChart, custom styling, interactive features
  - **Duration:** 4-5 hours

##### Story 3.4: Analytics Data Queries

- [ ] **3.4.1 Atomic:** Create time-based analytics API endpoint
  - **Files:** `src/app/api/admin/analytics/trends/route.ts`
  - **Dependencies:** Analytics queries, chart data utilities
  - **Acceptance:** API endpoint for chart data with time filtering
  - **Tech:** Next.js API route, query parameters, JSON response
  - **Duration:** 3-4 hours

- [ ] **3.4.2 Atomic:** Create analytics data hook
  - **Files:** `src/hooks/use-analytics-data.ts`
  - **Dependencies:** Analytics API endpoint
  - **Acceptance:** Hook for fetching and caching analytics data
  - **Tech:** Custom React hook, data fetching, caching strategy
  - **Duration:** 3-4 hours

#### Epic 4.0: Quick Actions Panel

##### Story 4.1: Quick Actions Component

- [ ] **4.1.1 Atomic:** Create quick action button component
  - **Files:** `src/components/admin/dashboard/QuickActionButton.tsx`
  - **Dependencies:** UI components, Lucide icons
  - **Acceptance:** Reusable button with icon, label, loading states
  - **Tech:** React component with variants, Tailwind styling, accessibility
  - **Duration:** 2-3 hours

- [ ] **4.1.2 Atomic:** Build quick actions panel layout
  - **Files:** `src/components/admin/dashboard/QuickActionsPanel.tsx`
  - **Dependencies:** QuickActionButton component
  - **Acceptance:** Responsive grid layout for action buttons
  - **Tech:** CSS Grid, responsive design, proper spacing
  - **Duration:** 3-4 hours

##### Story 4.2: Action Button Integration

- [ ] **4.2.1 Atomic:** Create quick actions configuration
  - **Files:** `src/lib/config/quick-actions.ts`
  - **Dependencies:** None
  - **Acceptance:** Configuration object for all quick actions with routes, permissions
  - **Tech:** TypeScript configuration, action definitions
  - **Duration:** 2 hours

- [ ] **4.2.2 Atomic:** Implement action handlers and routing
  - **Files:** `src/components/admin/dashboard/QuickActionsPanel.tsx` (extend)
  - **Dependencies:** Quick actions config, Next.js router
  - **Acceptance:** Buttons navigate to correct routes, handle external actions
  - **Tech:** Next.js navigation, action handlers, proper routing
  - **Duration:** 3-4 hours

##### Story 4.3: Contextual Actions

- [ ] **4.3.1 Atomic:** Create system state hook for contextual actions
  - **Files:** `src/hooks/use-system-state.ts`
  - **Dependencies:** Dashboard data
  - **Acceptance:** Hook provides system state for enabling/disabling actions
  - **Tech:** Custom React hook, state management, computed properties
  - **Duration:** 3-4 hours

- [ ] **4.3.2 Atomic:** Implement dynamic action availability
  - **Files:** `src/components/admin/dashboard/QuickActionsPanel.tsx` (extend)
  - **Dependencies:** System state hook
  - **Acceptance:** Actions disabled/enabled based on system state
  - **Tech:** Conditional rendering, disabled states, visual feedback
  - **Duration:** 2-3 hours

#### Epic 5.0: System Health Monitoring

##### Story 5.1: Health Check Infrastructure

- [ ] **5.1.1 Atomic:** Create database health check function
  - **Files:** `src/lib/health/database.ts`
  - **Dependencies:** Prisma client
  - **Acceptance:** Function checks database connectivity, response time
  - **Tech:** Prisma connection test, error handling, timeout management
  - **Duration:** 2-3 hours

- [ ] **5.1.2 Atomic:** Create system health aggregation utilities
  - **Files:** `src/lib/health/system.ts`
  - **Dependencies:** Database health check
  - **Acceptance:** Aggregate health checks, overall system status
  - **Tech:** Health check orchestration, status aggregation, TypeScript
  - **Duration:** 3-4 hours

- [ ] **5.1.3 Atomic:** Create health check types and interfaces
  - **Files:** `src/lib/types/health.ts`
  - **Dependencies:** None
  - **Acceptance:** TypeScript types for health status, checks, responses
  - **Tech:** TypeScript interfaces, status enums
  - **Duration:** 2 hours

##### Story 5.2: System Health Component

- [ ] **5.2.1 Atomic:** Create health status indicator component
  - **Files:** `src/components/admin/dashboard/HealthStatusBadge.tsx`
  - **Dependencies:** Health types, UI components
  - **Acceptance:** Color-coded status badge with tooltip details
  - **Tech:** React component, conditional styling, tooltip integration
  - **Duration:** 2-3 hours

- [ ] **5.2.2 Atomic:** Build system health dashboard component
  - **Files:** `src/components/admin/dashboard/SystemHealthPanel.tsx`
  - **Dependencies:** HealthStatusBadge, health utilities
  - **Acceptance:** Panel showing all system health checks with details
  - **Tech:** React component, grid layout, real-time updates
  - **Duration:** 4-5 hours

##### Story 5.3: Health Monitoring API

- [ ] **5.3.1 Atomic:** Create health check API endpoint
  - **Files:** `src/app/api/admin/health/route.ts`
  - **Dependencies:** System health utilities
  - **Acceptance:** GET endpoint returns system health status, caching headers
  - **Tech:** Next.js API route, health check execution, caching
  - **Duration:** 3-4 hours

- [ ] **5.3.2 Atomic:** Create health monitoring hook
  - **Files:** `src/hooks/use-system-health.ts`
  - **Dependencies:** Health API endpoint
  - **Acceptance:** Hook provides real-time health data with polling
  - **Tech:** Custom React hook, polling mechanism, error handling
  - **Duration:** 3-4 hours

---

**Phase 3 Complete!** All atomic tasks with detailed implementation specs have been created.

**📁 Atomic Tasks Summary:** 42 atomic tasks created across all 5 epics, each with:
- Exact file paths for implementation
- 2-8 hour completion estimates for junior developers  
- Detailed acceptance criteria and tech specifications
- Clear dependency chains for proper sequencing

**🎯 Atomic Review Checklist:**
- [ ] Task can be completed by a junior developer in 2-8 hours
- [ ] Specific file paths are provided
- [ ] Acceptance criteria are testable and specific
- [ ] Tech requirements specify exact tools/patterns from our stack
- [ ] Dependencies are clearly stated

**🚀 Ready for Development:** Your admin dashboard enhancement now has a complete three-tier task breakdown ready for immediate implementation!

