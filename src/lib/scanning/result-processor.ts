import { 
  ScanProcessingResult
} from '@/lib/types/scanning';

/**
 * Scan result processing configuration
 */
export interface ScanResultProcessorConfig {
  /** Auto-retry failed scans */
  autoRetry: boolean;
  /** Maximum retry attempts */
  maxRetries: number;
  /** Retry delay in milliseconds */
  retryDelay: number;
  /** Show success animations */
  showAnimations: boolean;
  /** Success message duration in milliseconds */
  successMessageDuration: number;
  /** Error message duration in milliseconds */
  errorMessageDuration: number;
}

/**
 * Default scan result processor configuration
 */
export const DEFAULT_SCAN_RESULT_CONFIG: ScanResultProcessorConfig = {
  autoRetry: false,
  maxRetries: 3,
  retryDelay: 1000,
  showAnimations: true,
  successMessageDuration: 3000,
  errorMessageDuration: 5000,
};

/**
 * Scan result state
 */
export interface ScanResultState {
  /** Current scan result */
  result: ScanProcessingResult | null;
  /** Processing status */
  status: 'idle' | 'processing' | 'success' | 'error' | 'retrying';
  /** Error message if any */
  error: string | null;
  /** Success message if any */
  message: string | null;
  /** Retry count */
  retryCount: number;
  /** Last scan timestamp */
  lastScanTime: Date | null;
  /** Scan history */
  scanHistory: ScanProcessingResult[];
}

/**
 * Scan result processing events
 */
export interface ScanResultEvents {
  onScanStart?: (qrData: string) => void;
  onScanSuccess?: (result: ScanProcessingResult) => void;
  onScanError?: (error: string, retryCount: number) => void;
  onScanRetry?: (retryCount: number) => void;
  onScanComplete?: (result: ScanProcessingResult | null, error: string | null) => void;
  onStateChange?: (state: ScanResultState) => void;
}

/**
 * Scan result processor class
 */
export class ScanResultProcessor {
  private config: ScanResultProcessorConfig;
  private state: ScanResultState;
  private events: ScanResultEvents;
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(config: Partial<ScanResultProcessorConfig> = {}, events: ScanResultEvents = {}) {
    this.config = { ...DEFAULT_SCAN_RESULT_CONFIG, ...config };
    this.events = events;
    this.state = {
      result: null,
      status: 'idle',
      error: null,
      message: null,
      retryCount: 0,
      lastScanTime: null,
      scanHistory: [],
    };
  }

  /**
   * Get current state
   */
  getState(): ScanResultState {
    return { ...this.state };
  }

  /**
   * Update state and notify listeners
   */
  private updateState(updates: Partial<ScanResultState>): void {
    this.state = { ...this.state, ...updates };
    this.events.onStateChange?.(this.state);
  }

  /**
   * Process a scan result
   */
  async processScan(
    qrData: string,
    sessionId: string,
    organizerId: string,
    metadata?: Record<string, unknown>
  ): Promise<ScanProcessingResult | null> {
    try {
      // Clear any existing retry timeout
      if (this.retryTimeout) {
        clearTimeout(this.retryTimeout);
        this.retryTimeout = null;
      }

      // Update state to processing
      this.updateState({
        status: 'processing',
        error: null,
        message: null,
        lastScanTime: new Date(),
      });

      // Notify scan start
      this.events.onScanStart?.(qrData);

      // Call the scan processing API
      const response = await fetch('/api/scanning/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrData,
          sessionId,
          organizerId,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Scan processing failed');
      }

      const result: ScanProcessingResult = data.result;

      // Update state with success
      this.updateState({
        result,
        status: 'success',
        message: this.generateSuccessMessage(result),
        error: null,
        retryCount: 0,
        scanHistory: [result, ...this.state.scanHistory.slice(0, 9)], // Keep last 10 scans
      });

      // Notify success
      this.events.onScanSuccess?.(result);

      // Auto-clear success message after duration
      if (this.config.successMessageDuration > 0) {
        setTimeout(() => {
          this.updateState({ message: null });
        }, this.config.successMessageDuration);
      }

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Update state with error
      this.updateState({
        status: 'error',
        error: errorMessage,
        message: null,
      });

      // Notify error
      this.events.onScanError?.(errorMessage, this.state.retryCount);

      // Handle retry logic
      if (this.config.autoRetry && this.state.retryCount < this.config.maxRetries) {
        await this.scheduleRetry(qrData, sessionId, organizerId, metadata);
      } else {
        // Auto-clear error message after duration
        if (this.config.errorMessageDuration > 0) {
          setTimeout(() => {
            this.updateState({ error: null });
          }, this.config.errorMessageDuration);
        }
      }

      return null;
    } finally {
      // Notify completion
      this.events.onScanComplete?.(this.state.result, this.state.error);
    }
  }

  /**
   * Schedule a retry
   */
  private async scheduleRetry(
    qrData: string,
    sessionId: string,
    organizerId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const newRetryCount = this.state.retryCount + 1;
    
    this.updateState({
      status: 'retrying',
      retryCount: newRetryCount,
    });

    // Notify retry
    this.events.onScanRetry?.(newRetryCount);

    // Schedule retry
    this.retryTimeout = setTimeout(async () => {
      await this.processScan(qrData, sessionId, organizerId, metadata);
    }, this.config.retryDelay);
  }

  /**
   * Generate success message based on scan result
   */
  private generateSuccessMessage(result: ScanProcessingResult): string {
    const { scanType, student, duplicateCheck } = result;
    
    if (!student) {
      return 'Scan processed successfully';
    }

    const studentName = student.fullName;
    const scanTypeText = scanType.type === 'time_in' ? 'Time-In' : 'Time-Out';

    if (duplicateCheck?.isDuplicate) {
      return `${studentName} - ${scanTypeText} (Duplicate prevented)`;
    }

    return `${studentName} - ${scanTypeText} recorded successfully`;
  }

  /**
   * Clear current result and reset state
   */
  clearResult(): void {
    this.updateState({
      result: null,
      status: 'idle',
      error: null,
      message: null,
      retryCount: 0,
    });

    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.updateState({
      error: null,
      status: this.state.result ? 'success' : 'idle',
    });
  }

  /**
   * Clear success message
   */
  clearMessage(): void {
    this.updateState({ message: null });
  }

  /**
   * Get scan statistics
   */
  getScanStatistics(): {
    totalScans: number;
    successfulScans: number;
    failedScans: number;
    duplicateScans: number;
    timeInScans: number;
    timeOutScans: number;
    lastScanTime: Date | null;
  } {
    const history = this.state.scanHistory;
    
    return {
      totalScans: history.length,
      successfulScans: history.filter(scan => !scan.duplicateCheck?.isDuplicate).length,
      failedScans: 0, // Failed scans don't get added to history
      duplicateScans: history.filter(scan => scan.duplicateCheck?.isDuplicate).length,
      timeInScans: history.filter(scan => scan.scanType.type === 'time_in').length,
      timeOutScans: history.filter(scan => scan.scanType.type === 'time_out').length,
      lastScanTime: this.state.lastScanTime,
    };
  }

  /**
   * Get recent scans
   */
  getRecentScans(limit: number = 10): ScanProcessingResult[] {
    return this.state.scanHistory.slice(0, limit);
  }

  /**
   * Check if currently processing
   */
  isProcessing(): boolean {
    return this.state.status === 'processing' || this.state.status === 'retrying';
  }

  /**
   * Check if has error
   */
  hasError(): boolean {
    return this.state.status === 'error' && this.state.error !== null;
  }

  /**
   * Check if has success
   */
  hasSuccess(): boolean {
    return this.state.status === 'success' && this.state.result !== null;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ScanResultProcessorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Update events
   */
  updateEvents(events: Partial<ScanResultEvents>): void {
    this.events = { ...this.events, ...events };
  }

  /**
   * Destroy processor and cleanup
   */
  destroy(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    
    this.updateState({
      result: null,
      status: 'idle',
      error: null,
      message: null,
      retryCount: 0,
      lastScanTime: null,
      scanHistory: [],
    });
  }
}

/**
 * Create a new scan result processor instance
 */
export function createScanResultProcessor(
  config?: Partial<ScanResultProcessorConfig>,
  events?: ScanResultEvents
): ScanResultProcessor {
  return new ScanResultProcessor(config, events);
}

/**
 * Process a single scan with default configuration
 */
export async function processScanResult(
  qrData: string,
  sessionId: string,
  organizerId: string,
  metadata?: Record<string, unknown>
): Promise<ScanProcessingResult | null> {
  const processor = createScanResultProcessor();
  
  try {
    return await processor.processScan(qrData, sessionId, organizerId, metadata);
  } finally {
    processor.destroy();
  }
}

/**
 * Utility functions for scan result processing
 */
export const ScanResultUtils = {
  /**
   * Format scan result for display
   */
  formatScanResult(result: ScanProcessingResult): string {
    if (!result.student) {
      return 'Scan processed';
    }

    const studentName = result.student.fullName;
    const scanType = result.scanType.type === 'time_in' ? 'Time-In' : 'Time-Out';
    const isDuplicate = result.duplicateCheck?.isDuplicate;

    if (isDuplicate) {
      return `${studentName} - ${scanType} (Duplicate)`;
    }

    return `${studentName} - ${scanType}`;
  },

  /**
   * Get scan result icon
   */
  getScanResultIcon(result: ScanProcessingResult): string {
    if (result.duplicateCheck?.isDuplicate) {
      return '⚠️';
    }

    return result.scanType.type === 'time_in' ? '✅' : '🔄';
  },

  /**
   * Get scan result color
   */
  getScanResultColor(result: ScanProcessingResult): string {
    if (result.duplicateCheck?.isDuplicate) {
      return 'text-yellow-600';
    }

    return result.scanType.type === 'time_in' ? 'text-green-600' : 'text-blue-600';
  },

  /**
   * Check if scan result is successful
   */
  isScanSuccessful(result: ScanProcessingResult): boolean {
    return result.student !== null && !result.duplicateCheck?.isDuplicate;
  },

  /**
   * Get scan result summary
   */
  getScanResultSummary(result: ScanProcessingResult): {
    student: string;
    scanType: string;
    isDuplicate: boolean;
    timestamp: Date;
  } {
    return {
      student: result.student?.fullName || 'Unknown',
      scanType: result.scanType.type === 'time_in' ? 'Time-In' : 'Time-Out',
      isDuplicate: result.duplicateCheck?.isDuplicate || false,
      timestamp: new Date(result.metadata.timestamp),
    };
  },
};
