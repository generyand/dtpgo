'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { 
  ScanResultProcessor, 
  ScanResultState, 
  ScanResultProcessorConfig, 
  ScanResultEvents,
  createScanResultProcessor,
  processScanResult,
  ScanResultUtils 
} from '@/lib/scanning/result-processor';
import { ScanProcessingResult } from '@/lib/types/scanning';

/**
 * Hook configuration
 */
export interface UseScanResultConfig extends Partial<ScanResultProcessorConfig> {
  /** Show toast notifications */
  showToasts?: boolean;
  /** Toast position */
  toastPosition?: 'top-center' | 'top-left' | 'top-right' | 'bottom-center' | 'bottom-left' | 'bottom-right';
  /** Auto-clear results after duration */
  autoClearResults?: boolean;
  /** Auto-clear duration in milliseconds */
  autoClearDuration?: number;
}

/**
 * Hook return type
 */
export interface UseScanResultReturn {
  // State
  state: ScanResultState;
  isProcessing: boolean;
  hasError: boolean;
  hasSuccess: boolean;
  hasMessage: boolean;
  
  // Actions
  processScan: (qrData: string, sessionId: string, organizerId: string, metadata?: Record<string, unknown>) => Promise<ScanProcessingResult | null>;
  clearResult: () => void;
  clearError: () => void;
  clearMessage: () => void;
  retryLastScan: () => Promise<ScanProcessingResult | null>;
  
  // Data
  getScanStatistics: () => ReturnType<ScanResultProcessor['getScanStatistics']>;
  getRecentScans: (limit?: number) => ScanProcessingResult[];
  getLastScanResult: () => ScanProcessingResult | null;
  
  // Configuration
  updateConfig: (config: Partial<UseScanResultConfig>) => void;
  
  // Utils
  formatScanResult: (result: ScanProcessingResult) => string;
  getScanResultIcon: (result: ScanProcessingResult) => string;
  getScanResultColor: (result: ScanProcessingResult) => string;
  isScanSuccessful: (result: ScanProcessingResult) => boolean;
  getScanResultSummary: (result: ScanProcessingResult) => ReturnType<typeof ScanResultUtils.getScanResultSummary>;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: UseScanResultConfig = {
  showToasts: true,
  toastPosition: 'top-center',
  autoClearResults: true,
  autoClearDuration: 5000,
  autoRetry: false,
  maxRetries: 3,
  retryDelay: 1000,
  showAnimations: true,
  successMessageDuration: 3000,
  errorMessageDuration: 5000,
};

/**
 * Hook for managing scan results
 */
export function useScanResult(config: UseScanResultConfig = {}): UseScanResultReturn {
  const [state, setState] = useState<ScanResultState>({
    result: null,
    status: 'idle',
    error: null,
    message: null,
    retryCount: 0,
    lastScanTime: null,
    scanHistory: [],
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasSuccess, setHasSuccess] = useState(false);
  const [hasMessage, setHasMessage] = useState(false);

  const processorRef = useRef<ScanResultProcessor | null>(null);
  const lastScanParamsRef = useRef<{
    qrData: string;
    sessionId: string;
    organizerId: string;
    metadata?: Record<string, unknown>;
  } | null>(null);
  const autoClearTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Clear result function (defined early to avoid hoisting issues)
  const clearResult = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.clearResult();
    }
    if (autoClearTimeoutRef.current) {
      clearTimeout(autoClearTimeoutRef.current);
      autoClearTimeoutRef.current = null;
    }
  }, []);

  // Initialize processor
  useEffect(() => {
    const events: ScanResultEvents = {
      onStateChange: (newState) => {
        setState(newState);
        setIsProcessing(newState.status === 'processing' || newState.status === 'retrying');
        setHasError(newState.status === 'error' && newState.error !== null);
        setHasSuccess(newState.status === 'success' && newState.result !== null);
        setHasMessage(newState.message !== null);
      },
      onScanStart: () => {
        if (finalConfig.showToasts) {
          toast.loading('Processing scan...', {
            id: 'scan-processing',
            position: finalConfig.toastPosition,
          });
        }
      },
      onScanSuccess: (result) => {
        if (finalConfig.showToasts) {
          toast.dismiss('scan-processing');
          
          const message = ScanResultUtils.formatScanResult(result);
          const icon = ScanResultUtils.getScanResultIcon(result);
          
          toast.success(`${icon} ${message}`, {
            position: finalConfig.toastPosition,
            duration: finalConfig.successMessageDuration,
          });
        }

        // Auto-clear results if enabled
        if (finalConfig.autoClearResults && finalConfig.autoClearDuration) {
          if (autoClearTimeoutRef.current) {
            clearTimeout(autoClearTimeoutRef.current);
          }
          
          autoClearTimeoutRef.current = setTimeout(() => {
            clearResult();
          }, finalConfig.autoClearDuration);
        }
      },
      onScanError: (error, retryCount) => {
        if (finalConfig.showToasts) {
          toast.dismiss('scan-processing');
          
          const retryText = retryCount > 0 ? ` (Retry ${retryCount})` : '';
          toast.error(`Scan failed: ${error}${retryText}`, {
            position: finalConfig.toastPosition,
            duration: finalConfig.errorMessageDuration,
          });
        }
      },
      onScanRetry: (retryCount) => {
        if (finalConfig.showToasts) {
          toast.loading(`Retrying scan... (${retryCount}/${finalConfig.maxRetries})`, {
            id: 'scan-retry',
            position: finalConfig.toastPosition,
          });
        }
      },
      onScanComplete: () => {
        if (finalConfig.showToasts) {
          toast.dismiss('scan-processing');
          toast.dismiss('scan-retry');
        }
      },
    };

    processorRef.current = createScanResultProcessor(finalConfig, events);

    return () => {
      if (processorRef.current) {
        processorRef.current.destroy();
        processorRef.current = null;
      }
      if (autoClearTimeoutRef.current) {
        clearTimeout(autoClearTimeoutRef.current);
        autoClearTimeoutRef.current = null;
      }
    };
  }, [finalConfig, clearResult]);

  // Process scan
  const processScan = useCallback(async (
    qrData: string,
    sessionId: string,
    organizerId: string,
    metadata?: Record<string, unknown>
  ): Promise<ScanProcessingResult | null> => {
    if (!processorRef.current) {
      throw new Error('Scan result processor not initialized');
    }

    // Store parameters for retry
    lastScanParamsRef.current = { qrData, sessionId, organizerId, metadata };

    return await processorRef.current.processScan(qrData, sessionId, organizerId, metadata);
  }, []);


  // Clear error
  const clearError = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.clearError();
    }
  }, []);

  // Clear message
  const clearMessage = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.clearMessage();
    }
  }, []);

  // Retry last scan
  const retryLastScan = useCallback(async (): Promise<ScanProcessingResult | null> => {
    if (!lastScanParamsRef.current) {
      throw new Error('No previous scan to retry');
    }

    const { qrData, sessionId, organizerId, metadata } = lastScanParamsRef.current;
    return await processScan(qrData, sessionId, organizerId, metadata);
  }, [processScan]);

  // Get scan statistics
  const getScanStatistics = useCallback(() => {
    if (!processorRef.current) {
      return {
        totalScans: 0,
        successfulScans: 0,
        failedScans: 0,
        duplicateScans: 0,
        timeInScans: 0,
        timeOutScans: 0,
        lastScanTime: null,
      };
    }
    return processorRef.current.getScanStatistics();
  }, []);

  // Get recent scans
  const getRecentScans = useCallback((limit: number = 10) => {
    if (!processorRef.current) {
      return [];
    }
    return processorRef.current.getRecentScans(limit);
  }, []);

  // Get last scan result
  const getLastScanResult = useCallback(() => {
    return state.result;
  }, [state.result]);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<UseScanResultConfig>) => {
    if (processorRef.current) {
      processorRef.current.updateConfig(newConfig);
    }
  }, []);

  // Utility functions
  const formatScanResult = useCallback((result: ScanProcessingResult) => {
    return ScanResultUtils.formatScanResult(result);
  }, []);

  const getScanResultIcon = useCallback((result: ScanProcessingResult) => {
    return ScanResultUtils.getScanResultIcon(result);
  }, []);

  const getScanResultColor = useCallback((result: ScanProcessingResult) => {
    return ScanResultUtils.getScanResultColor(result);
  }, []);

  const isScanSuccessful = useCallback((result: ScanProcessingResult) => {
    return ScanResultUtils.isScanSuccessful(result);
  }, []);

  const getScanResultSummary = useCallback((result: ScanProcessingResult) => {
    return ScanResultUtils.getScanResultSummary(result);
  }, []);

  return {
    // State
    state,
    isProcessing,
    hasError,
    hasSuccess,
    hasMessage,
    
    // Actions
    processScan,
    clearResult,
    clearError,
    clearMessage,
    retryLastScan,
    
    // Data
    getScanStatistics,
    getRecentScans,
    getLastScanResult,
    
    // Configuration
    updateConfig,
    
    // Utils
    formatScanResult,
    getScanResultIcon,
    getScanResultColor,
    isScanSuccessful,
    getScanResultSummary,
  };
}

/**
 * Hook for processing a single scan with default configuration
 */
export function useSingleScanResult() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ScanProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processScan = useCallback(async (
    qrData: string,
    sessionId: string,
    organizerId: string,
    metadata?: Record<string, unknown>
  ): Promise<ScanProcessingResult | null> => {
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const scanResult = await processScanResult(qrData, sessionId, organizerId, metadata);
      setResult(scanResult);
      return scanResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    isProcessing,
    result,
    error,
    processScan,
    clearResult,
  };
}

/**
 * Hook for managing scan result history
 */
export function useScanResultHistory(limit: number = 50) {
  const [history, setHistory] = useState<ScanProcessingResult[]>([]);
  const [statistics, setStatistics] = useState({
    totalScans: 0,
    successfulScans: 0,
    failedScans: 0,
    duplicateScans: 0,
    timeInScans: 0,
    timeOutScans: 0,
  });

  const addScanResult = useCallback((result: ScanProcessingResult) => {
    setHistory(prev => {
      const newHistory = [result, ...prev].slice(0, limit);
      
      // Update statistics
      const newStats = {
        totalScans: newHistory.length,
        successfulScans: newHistory.filter(scan => !scan.duplicateCheck?.isDuplicate).length,
        failedScans: 0, // Failed scans don't get added to history
        duplicateScans: newHistory.filter(scan => scan.duplicateCheck?.isDuplicate).length,
        timeInScans: newHistory.filter(scan => scan.scanType.type === 'time_in').length,
        timeOutScans: newHistory.filter(scan => scan.scanType.type === 'time_out').length,
      };
      
      setStatistics(newStats);
      return newHistory;
    });
  }, [limit]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setStatistics({
      totalScans: 0,
      successfulScans: 0,
      failedScans: 0,
      duplicateScans: 0,
      timeInScans: 0,
      timeOutScans: 0,
    });
  }, []);

  const getRecentScans = useCallback((count: number = 10) => {
    return history.slice(0, count);
  }, [history]);

  const getScansByStudent = useCallback((studentId: string) => {
    return history.filter(scan => scan.student?.id === studentId);
  }, [history]);

  const getScansByType = useCallback((scanType: 'time_in' | 'time_out') => {
    return history.filter(scan => scan.scanType.type === scanType);
  }, [history]);

  return {
    history,
    statistics,
    addScanResult,
    clearHistory,
    getRecentScans,
    getScansByStudent,
    getScansByType,
  };
}
