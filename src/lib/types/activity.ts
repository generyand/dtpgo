/**
 * TypeScript type definitions for activity events, logging, and display
 * Complete type definitions for the activity tracking system
 */



// ============================================================================
// CORE ACTIVITY TYPES
// ============================================================================

/**
 * Activity types for categorizing different kinds of activities
 */
export type ActivityType = 
  | 'student_registration'
  | 'qr_generation'
  | 'admin_action'
  | 'system_event'
  | 'authentication'
  | 'data_export'
  | 'data_import'
  | 'maintenance'
  | 'security';

/**
 * Activity categories for grouping related activities
 */
export type ActivityCategory = 
  | 'registration'
  | 'authentication'
  | 'data_management'
  | 'system'
  | 'analytics'
  | 'security'
  | 'maintenance'
  | 'user_management'
  | 'reporting';

/**
 * Activity sources indicating where the activity originated
 */
export type ActivitySource = 
  | 'admin'
  | 'public'
  | 'system'
  | 'api'
  | 'cron'
  | 'webhook'
  | 'cli'
  | 'migration';

/**
 * Activity severity levels for prioritization and filtering
 */
export type ActivitySeverity = 
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'critical'
  | 'debug';

/**
 * Activity status for tracking activity lifecycle
 */
export type ActivityStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'timeout';

// ============================================================================
// ACTIVITY DATA INTERFACES
// ============================================================================

/**
 * Base activity interface
 */
export interface BaseActivity {
  id: string;
  type: ActivityType;
  action: string;
  description: string;
  createdAt: Date;
}

/**
 * Complete activity interface with all fields
 */
export interface Activity extends BaseActivity {
  studentId: string | null;
  adminId: string | null;
  programId: string | null;
  metadata: Record<string, unknown> | null;
  source: ActivitySource;
  severity: ActivitySeverity;
  category: ActivityCategory;
  ipAddress: string | null;
  userAgent: string | null;
  sessionId: string | null;
}

/**
 * Activity with related entity data
 */
export interface ActivityWithRelations extends Activity {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    studentIdNumber: string;
    email: string;
  } | null;
  admin: {
    id: string;
    email: string;
  } | null;
  program: {
    id: string;
    name: string;
    displayName: string;
  } | null;
}

/**
 * Activity input for creating new activities
 */
export interface ActivityInput {
  type: ActivityType;
  action: string;
  description: string;
  studentId?: string;
  adminId?: string;
  programId?: string;
  metadata?: Record<string, unknown>;
  source?: ActivitySource;
  severity?: ActivitySeverity;
  category: ActivityCategory;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

/**
 * Activity update input for modifying existing activities
 */
export interface ActivityUpdateInput {
  description?: string;
  metadata?: Record<string, unknown>;
  severity?: ActivitySeverity;
  status?: ActivityStatus;
}

// ============================================================================
// FILTERING AND QUERYING TYPES
// ============================================================================

/**
 * Activity filter options for querying activities
 */
export interface ActivityFilter {
  type?: ActivityType | ActivityType[];
  category?: ActivityCategory | ActivityCategory[];
  source?: ActivitySource | ActivitySource[];
  severity?: ActivitySeverity | ActivitySeverity[];
  status?: ActivityStatus | ActivityStatus[];
  studentId?: string;
  adminId?: string;
  programId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
  limit?: number;
  offset?: number;
  sortBy?: ActivitySortField;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Fields that can be used for sorting activities
 */
export type ActivitySortField = 
  | 'createdAt'
  | 'type'
  | 'category'
  | 'severity'
  | 'source'
  | 'action';

/**
 * Activity query result with pagination info
 */
export interface ActivityQueryResult {
  activities: ActivityWithRelations[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

// ============================================================================
// DISPLAY AND UI TYPES
// ============================================================================

/**
 * Activity display configuration for UI components
 */
export interface ActivityDisplayConfig {
  showIcons: boolean;
  showTimestamps: boolean;
  showMetadata: boolean;
  showRelatedEntities: boolean;
  compactMode: boolean;
  groupByDate: boolean;
  maxDescriptionLength?: number;
}

/**
 * Activity item for display in UI components
 */
export interface ActivityDisplayItem extends ActivityWithRelations {
  icon: string; // Icon name for display
  color: string; // Color theme for the activity
  relativeTime: string; // Human-readable time (e.g., "2 hours ago")
  formattedDescription: string; // Processed description for display
  entityName?: string; // Name of the primary entity involved
  entityType?: 'student' | 'admin' | 'program';
}

/**
 * Activity group for date-based grouping
 */
export interface ActivityGroup {
  date: string; // ISO date string (YYYY-MM-DD)
  displayDate: string; // Human-readable date
  activities: ActivityDisplayItem[];
  count: number;
}

/**
 * Activity feed configuration
 */
export interface ActivityFeedConfig {
  autoRefresh: boolean;
  refreshInterval: number; // milliseconds
  maxItems: number;
  showFilters: boolean;
  defaultFilter: ActivityFilter;
  displayConfig: ActivityDisplayConfig;
}

// ============================================================================
// ANALYTICS AND REPORTING TYPES
// ============================================================================

/**
 * Activity analytics summary
 */
export interface ActivityAnalytics {
  totalActivities: number;
  activitiesByType: Array<{ type: ActivityType; count: number; percentage: number }>;
  activitiesByCategory: Array<{ category: ActivityCategory; count: number; percentage: number }>;
  activitiesBySource: Array<{ source: ActivitySource; count: number; percentage: number }>;
  activitiesBySeverity: Array<{ severity: ActivitySeverity; count: number; percentage: number }>;
  dailyActivity: Array<{ date: string; count: number }>;
  topUsers: Array<{ userId: string; userType: 'admin' | 'student'; count: number; name: string }>;
  recentTrends: {
    totalGrowth: number; // percentage change
    typeGrowth: Record<ActivityType, number>;
    categoryGrowth: Record<ActivityCategory, number>;
  };
}

/**
 * Activity report configuration
 */
export interface ActivityReportConfig {
  title: string;
  description?: string;
  dateRange: {
    from: Date;
    to: Date;
  };
  filters: ActivityFilter;
  includeAnalytics: boolean;
  includeCharts: boolean;
  format: 'json' | 'csv' | 'pdf';
  groupBy?: 'date' | 'type' | 'category' | 'source' | 'user';
}

/**
 * Activity report result
 */
export interface ActivityReport {
  config: ActivityReportConfig;
  data: ActivityWithRelations[];
  analytics?: ActivityAnalytics;
  generatedAt: Date;
  totalRecords: number;
  summary: {
    dateRange: string;
    mostActiveDay: string;
    mostCommonType: ActivityType;
    mostCommonCategory: ActivityCategory;
    errorRate: number;
  };
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

/**
 * Activity feed component props
 */
export interface ActivityFeedProps {
  activities?: ActivityWithRelations[];
  loading?: boolean;
  error?: string;
  config?: Partial<ActivityFeedConfig>;
  onActivityClick?: (activity: ActivityWithRelations) => void;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  className?: string;
}

/**
 * Activity item component props
 */
export interface ActivityItemProps {
  activity: ActivityDisplayItem;
  config: ActivityDisplayConfig;
  onClick?: (activity: ActivityWithRelations) => void;
  className?: string;
}

/**
 * Activity filter component props
 */
export interface ActivityFilterProps {
  filter: ActivityFilter;
  onFilterChange: (filter: Partial<ActivityFilter>) => void;
  availableTypes?: ActivityType[];
  availableCategories?: ActivityCategory[];
  availableSources?: ActivitySource[];
  className?: string;
}

/**
 * Activity analytics component props
 */
export interface ActivityAnalyticsProps {
  analytics: ActivityAnalytics;
  loading?: boolean;
  error?: string;
  dateRange?: { from: Date; to: Date };
  onDateRangeChange?: (range: { from: Date; to: Date }) => void;
  className?: string;
}

// ============================================================================
// API TYPES
// ============================================================================

/**
 * Activity API response
 */
export interface ActivityApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  pagination?: {
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  };
}

/**
 * Activity list API response
 */
export interface ActivityListResponse extends ActivityApiResponse<ActivityWithRelations[]> {
  pagination: {
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  };
}

/**
 * Activity analytics API response
 */
export interface ActivityAnalyticsResponse extends ActivityApiResponse<ActivityAnalytics> {
  dateRange: {
    from: string;
    to: string;
  };
}

// ============================================================================
// HOOK TYPES
// ============================================================================

/**
 * Activity hook configuration
 */
export interface UseActivityConfig {
  autoFetch?: boolean;
  pollingInterval?: number;
  filter?: ActivityFilter;
  onError?: (error: Error) => void;
  onSuccess?: (data: ActivityQueryResult) => void;
}

/**
 * Activity hook return type
 */
export interface UseActivityReturn {
  // Data
  activities: ActivityWithRelations[];
  total: number;
  hasMore: boolean;
  
  // State
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Actions
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  setFilter: (filter: Partial<ActivityFilter>) => void;
  
  // Current state
  filter: ActivityFilter;
  isPolling: boolean;
  startPolling: () => void;
  stopPolling: () => void;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Activity icon mapping
 */
export interface ActivityIconMap {
  [key: string]: {
    icon: string;
    color: string;
    bgColor: string;
  };
}

/**
 * Activity color scheme
 */
export interface ActivityColorScheme {
  severity: Record<ActivitySeverity, string>;
  category: Record<ActivityCategory, string>;
  type: Record<ActivityType, string>;
  source: Record<ActivitySource, string>;
}

/**
 * Activity formatting options
 */
export interface ActivityFormattingOptions {
  dateFormat: 'relative' | 'absolute' | 'both';
  showSeconds: boolean;
  truncateDescription: number;
  showMetadata: boolean;
  highlightKeywords: string[];
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Activity validation rules
 */
export interface ActivityValidationRules {
  requiredFields: (keyof ActivityInput)[];
  maxDescriptionLength: number;
  allowedTypes: ActivityType[];
  allowedCategories: ActivityCategory[];
  allowedSources: ActivitySource[];
  allowedSeverities: ActivitySeverity[];
  metadataSchema?: Record<string, unknown>;
}

/**
 * Activity validation result
 */
export interface ActivityValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

// ============================================================================
// EXPORT GROUPED TYPES
// ============================================================================

/**
 * All activity core types
 */
export type ActivityCoreTypes = 
  | ActivityType
  | ActivityCategory
  | ActivitySource
  | ActivitySeverity
  | ActivityStatus;

/**
 * All activity data types
 */
export type ActivityDataTypes = 
  | BaseActivity
  | Activity
  | ActivityWithRelations
  | ActivityInput
  | ActivityUpdateInput;

/**
 * All activity query types
 */
export type ActivityQueryTypes = 
  | ActivityFilter
  | ActivityQueryResult
  | ActivitySortField;

/**
 * All activity display types
 */
export type ActivityDisplayTypes = 
  | ActivityDisplayConfig
  | ActivityDisplayItem
  | ActivityGroup
  | ActivityFeedConfig;

/**
 * All activity analytics types
 */
export type ActivityAnalyticsTypes = 
  | ActivityAnalytics
  | ActivityReportConfig
  | ActivityReport;

/**
 * All activity component prop types
 */
export type ActivityComponentTypes = 
  | ActivityFeedProps
  | ActivityItemProps
  | ActivityFilterProps
  | ActivityAnalyticsProps;

/**
 * All activity API types
 */
export type ActivityApiTypes = 
  | ActivityApiResponse
  | ActivityListResponse
  | ActivityAnalyticsResponse;

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for Activity
 */
export function isActivity(obj: unknown): obj is Activity {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Record<string, unknown>).id === 'string' &&
    typeof (obj as Record<string, unknown>).type === 'string' &&
    typeof (obj as Record<string, unknown>).action === 'string' &&
    typeof (obj as Record<string, unknown>).description === 'string' &&
    (obj as Record<string, unknown>).createdAt instanceof Date
  );
}

/**
 * Type guard for ActivityWithRelations
 */
export function isActivityWithRelations(obj: unknown): obj is ActivityWithRelations {
  return (
    isActivity(obj) &&
    ((obj as unknown as Record<string, unknown>).student === null || typeof (obj as unknown as Record<string, unknown>).student === 'object') &&
    ((obj as unknown as Record<string, unknown>).admin === null || typeof (obj as unknown as Record<string, unknown>).admin === 'object') &&
    ((obj as unknown as Record<string, unknown>).program === null || typeof (obj as unknown as Record<string, unknown>).program === 'object')
  );
}

/**
 * Type guard for ActivityInput
 */
export function isActivityInput(obj: unknown): obj is ActivityInput {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Record<string, unknown>).type === 'string' &&
    typeof (obj as Record<string, unknown>).action === 'string' &&
    typeof (obj as Record<string, unknown>).description === 'string' &&
    typeof (obj as Record<string, unknown>).category === 'string'
  );
}

/**
 * Type guard for ActivityFilter
 */
export function isActivityFilter(obj: unknown): obj is ActivityFilter {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    // All fields are optional, so just check it's an object
    true
  );
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default activity display configuration
 */
export const DEFAULT_ACTIVITY_DISPLAY_CONFIG: ActivityDisplayConfig = {
  showIcons: true,
  showTimestamps: true,
  showMetadata: false,
  showRelatedEntities: true,
  compactMode: false,
  groupByDate: true,
  maxDescriptionLength: 100,
};

/**
 * Default activity feed configuration
 */
export const DEFAULT_ACTIVITY_FEED_CONFIG: ActivityFeedConfig = {
  autoRefresh: true,
  refreshInterval: 30000, // 30 seconds
  maxItems: 50,
  showFilters: true,
  defaultFilter: {
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  displayConfig: DEFAULT_ACTIVITY_DISPLAY_CONFIG,
};

/**
 * Activity type labels for display
 */
export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  student_registration: 'Student Registration',
  qr_generation: 'QR Generation',
  admin_action: 'Admin Action',
  system_event: 'System Event',
  authentication: 'Authentication',
  data_export: 'Data Export',
  data_import: 'Data Import',
  maintenance: 'Maintenance',
  security: 'Security',
};

/**
 * Activity category labels for display
 */
export const ACTIVITY_CATEGORY_LABELS: Record<ActivityCategory, string> = {
  registration: 'Registration',
  authentication: 'Authentication',
  data_management: 'Data Management',
  system: 'System',
  analytics: 'Analytics',
  security: 'Security',
  maintenance: 'Maintenance',
  user_management: 'User Management',
  reporting: 'Reporting',
};

/**
 * Activity severity labels for display
 */
export const ACTIVITY_SEVERITY_LABELS: Record<ActivitySeverity, string> = {
  info: 'Info',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
  critical: 'Critical',
  debug: 'Debug',
};
