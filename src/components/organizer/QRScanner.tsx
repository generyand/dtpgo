'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Camera, X, CheckCircle, User, Hash, Zap, Scan, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface QRScannerProps {
  sessionId: string;
  eventId: string;
  onScan: (qrData: string, updateResult: (data: Partial<ScanResult>) => void) => Promise<void>;
  onError?: (error: string) => void;
}

interface ScanResult {
  studentId: string;
  studentIdNumber: string;
  firstName: string;
  lastName: string;
  timestamp: string;
  isDuplicate?: boolean;
}

export function QRScanner({ sessionId: _sessionId, eventId: _eventId, onScan, onError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraId, setCameraId] = useState<string | null>(null);
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanAnimation, setScanAnimation] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isMountedRef = useRef(true);
  const lastScanTimeRef = useRef<number>(0);
  const successAudioRef = useRef<HTMLAudioElement | null>(null);
  const dialogTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize success sound
  useEffect(() => {
    successAudioRef.current = new Audio();
    successAudioRef.current.src = 'data:audio/wav;base64,UklGRhIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==';
    successAudioRef.current.volume = 0.3;

    return () => {
      if (successAudioRef.current) {
        successAudioRef.current = null;
      }
    };
  }, []);

  // Initialize scanner
  useEffect(() => {
    isMountedRef.current = true;

    // Get available cameras
    Html5Qrcode.getCameras().then(cameras => {
      if (cameras && cameras.length > 0) {
        // Prefer back camera
        const backCamera = cameras.find(cam => 
          cam.label.toLowerCase().includes('back') || 
          cam.label.toLowerCase().includes('rear') ||
          cam.label.toLowerCase().includes('environment')
        );
        setCameraId(backCamera?.id || cameras[0].id);
        console.log('📷 Found cameras:', cameras.length, 'Using:', backCamera?.label || cameras[0].label);
      }
    }).catch(err => {
      console.error('Error getting cameras:', err);
    });

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const startScanning = useCallback(async () => {
    if (!cameraId) {
      toast.error('No camera available');
      return;
    }

    try {
      // Create scanner instance if not exists
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader');
      }

      console.log('🎬 Starting QR scanner...');

      await scannerRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: function(viewfinderWidth, viewfinderHeight) {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdge * 0.75);
            return {
              width: qrboxSize,
              height: qrboxSize
            };
          },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          // Debounce scans
          const now = Date.now();
          if (now - lastScanTimeRef.current < 2000) {
            console.log('⏳ Debouncing scan...');
            return;
          }
          lastScanTimeRef.current = now;

          console.log('✅ QR Code detected:', decodedText);
          setScanAnimation(true);
          setIsProcessing(true);

          setTimeout(() => setScanAnimation(false), 1000);

          try {
            let studentData: {
              studentId: string;
              studentIdNumber?: string;
              firstName?: string;
              lastName?: string;
            };

            // Parse QR data
            try {
              const parsed = JSON.parse(decodedText);
              studentData = parsed;
            } catch {
              console.log('📝 Plain text QR code detected, treating as student ID:', decodedText);
              studentData = {
                studentId: decodedText.trim(),
                studentIdNumber: decodedText.trim(),
              };
            }

            // Play success sound
            if (successAudioRef.current) {
              successAudioRef.current.currentTime = 0;
              successAudioRef.current.play().catch(err => console.warn('Could not play sound:', err));
            }

            // Set temporary scan result and show dialog
            setLastScanResult({
              studentId: studentData.studentId,
              studentIdNumber: studentData.studentIdNumber || studentData.studentId,
              firstName: studentData.firstName || 'Processing',
              lastName: studentData.lastName || '...',
              timestamp: new Date().toISOString()
            });
            
            // Show result dialog
            setShowResultDialog(true);
            
            // Auto-dismiss dialog after 3 seconds
            if (dialogTimerRef.current) {
              clearTimeout(dialogTimerRef.current);
            }
            dialogTimerRef.current = setTimeout(() => {
              setShowResultDialog(false);
            }, 3000);

            // Call the onScan callback
            try {
              await onScan(decodedText, (updatedData) => {
                setLastScanResult(prev => prev ? { ...prev, ...updatedData } : null);
              });
              console.log('✅ onScan callback completed successfully');
            } catch (callbackErr) {
              console.error('❌ Error in onScan callback:', callbackErr);
              toast.error('Recording Failed', {
                description: callbackErr instanceof Error ? callbackErr.message : 'Failed to record attendance'
              });
            }

          } catch (err) {
            console.error('❌ Error processing QR data:', err);
            toast.error('Scan Error', {
              description: err instanceof Error ? err.message : 'Failed to process QR code'
            });
          } finally {
            setIsProcessing(false);
            console.log('🔄 Processing state reset to false');
          }
        },
        (errorMessage) => {
          if (!errorMessage.includes('NotFoundException')) {
            console.warn('Scanner error:', errorMessage);
          }
        }
      );

      setIsScanning(true);
      console.log('✅ Scanner started successfully');
    } catch (err) {
      console.error('Error starting scanner:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to start scanner';
      toast.error(errorMsg);
      onError?.(errorMsg);
    }
  }, [cameraId, onScan, onError]);

  const stopScanning = useCallback(async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        console.log('🛑 Scanner stopped');
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  }, [isScanning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current.clear();
      }
      if (dialogTimerRef.current) {
        clearTimeout(dialogTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Success Result Dialog - Celebratory Popup */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="sm:max-w-md border-0 bg-transparent shadow-none p-0" showCloseButton={false}>
          {/* Screen reader only title for accessibility */}
          <DialogTitle className="sr-only">
            {lastScanResult?.isDuplicate ? 'Duplicate Scan Result' : 'Successful Scan Result'}
          </DialogTitle>
          
          <div className={`relative overflow-hidden rounded-3xl backdrop-blur-xl border-2 ${
            lastScanResult?.isDuplicate 
              ? 'bg-gradient-to-br from-amber-500/30 to-orange-500/30 border-amber-500/50' 
              : 'bg-gradient-to-br from-emerald-500/30 to-green-500/30 border-emerald-500/50'
          } shadow-2xl ${
            lastScanResult?.isDuplicate ? 'shadow-amber-500/30' : 'shadow-emerald-500/30'
          } animate-in zoom-in-95 duration-300`}>
            
            {/* Animated background sparkles */}
            <div className="absolute inset-0 overflow-hidden">
              <div className={`absolute top-0 left-1/4 w-2 h-2 ${
                lastScanResult?.isDuplicate ? 'bg-amber-400' : 'bg-emerald-400'
              } rounded-full animate-ping`}></div>
              <div className={`absolute top-1/4 right-1/4 w-1 h-1 ${
                lastScanResult?.isDuplicate ? 'bg-orange-400' : 'bg-green-400'
              } rounded-full animate-ping delay-75`}></div>
              <div className={`absolute bottom-1/4 left-1/3 w-1.5 h-1.5 ${
                lastScanResult?.isDuplicate ? 'bg-amber-300' : 'bg-emerald-300'
              } rounded-full animate-ping delay-150`}></div>
            </div>

            <div className="relative p-8 text-center space-y-6">
              {/* Icon with glow */}
              <div className="relative inline-block">
                <div className={`absolute inset-0 ${
                  lastScanResult?.isDuplicate ? 'bg-amber-500' : 'bg-emerald-500'
                } rounded-full blur-2xl opacity-50 animate-pulse`}></div>
                <div className={`relative p-6 rounded-full ${
                  lastScanResult?.isDuplicate 
                    ? 'bg-gradient-to-br from-amber-500 to-orange-500' 
                    : 'bg-gradient-to-br from-emerald-500 to-green-500'
                }`}>
                  {lastScanResult?.isDuplicate ? (
                    <Zap className="h-16 w-16 text-white" />
                  ) : (
                    <CheckCircle className="h-16 w-16 text-white" />
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <h2 className={`text-3xl font-bold mb-2 ${
                  lastScanResult?.isDuplicate ? 'text-amber-100' : 'text-emerald-100'
                }`}>
                  {lastScanResult?.isDuplicate ? 'Already Recorded!' : 'Success!'}
                </h2>
                {!lastScanResult?.isDuplicate && (
                  <div className="flex items-center justify-center gap-2 text-emerald-200/80">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm">Attendance Recorded</span>
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Student Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3 text-white">
                  <User className="h-6 w-6 text-white/80" />
                  <span className="font-bold text-2xl">
                    {lastScanResult?.firstName} {lastScanResult?.lastName}
                  </span>
                </div>
                
                <div className="flex items-center justify-center gap-3 text-white/90">
                  <Hash className="h-5 w-5 text-white/70" />
                  <span className="font-mono text-xl">
                    {lastScanResult?.studentIdNumber}
                  </span>
                </div>
              </div>

              {/* Timestamp */}
              <div className={`text-sm ${
                lastScanResult?.isDuplicate ? 'text-amber-200/60' : 'text-emerald-200/60'
              }`}>
                {lastScanResult?.isDuplicate 
                  ? `Previously scanned at ${lastScanResult ? new Date(lastScanResult.timestamp).toLocaleTimeString() : ''}`
                  : `Scanned at ${lastScanResult ? new Date(lastScanResult.timestamp).toLocaleTimeString() : ''}`
                }
              </div>

              {/* Auto-dismiss indicator with tap-to-close hint */}
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-white/40 text-xs">
                  <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse"></div>
                  <span>Auto-closing in 3 seconds</span>
                </div>
                <button
                  onClick={() => setShowResultDialog(false)}
                  className="text-white/30 hover:text-white/60 text-xs underline transition-colors"
                >
                  Tap to close now
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modern Scanner Styles */}
      <style jsx global>{`
        #qr-reader video {
          transform: scaleX(-1) !important;
          -webkit-transform: scaleX(-1) !important;
          border-radius: 1rem;
          object-fit: cover;
        }
        
        #qr-reader__dashboard_section_swaplink {
          display: none !important;
        }
        
        /* Futuristic scanning box with animated corners */
        #qr-shaded-region {
          border: none !important;
          box-shadow: 0 0 0 4000px rgba(0, 0, 0, 0.7) !important;
          position: relative !important;
        }
        
        #qr-shaded-region::before,
        #qr-shaded-region::after {
          content: '';
          position: absolute;
          width: 60px;
          height: 60px;
          border: 3px solid #3b82f6;
          border-radius: 8px;
          animation: pulse-border 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        #qr-shaded-region::before {
          top: -3px;
          left: -3px;
          border-right: none;
          border-bottom: none;
        }
        
        #qr-shaded-region::after {
          bottom: -3px;
          right: -3px;
          border-left: none;
          border-top: none;
        }
        
        @keyframes pulse-border {
          0%, 100% {
            opacity: 1;
            filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.8));
          }
          50% {
            opacity: 0.6;
            filter: drop-shadow(0 0 12px rgba(59, 130, 246, 1));
          }
        }
        
        /* Scanning animation line */
        #qr-reader__scan_region {
          position: relative !important;
        }
        
        #qr-reader__scan_region::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #3b82f6, transparent);
          animation: scan-line 2s linear infinite;
          opacity: 0.8;
          box-shadow: 0 0 10px #3b82f6;
        }
        
        @keyframes scan-line {
          0% {
            top: 0;
          }
          100% {
            top: 100%;
          }
        }
      `}</style>

      {/* Processing Indicator - Animated */}
      {isProcessing && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-2 border-blue-500/40">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10 animate-pulse"></div>
          <Alert className="border-0 bg-transparent relative">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-lg opacity-50 animate-ping"></div>
                <Scan className="h-5 w-5 text-blue-400 relative animate-spin" />
              </div>
              <AlertDescription className="text-blue-200 font-medium">
                Processing QR code...
              </AlertDescription>
            </div>
          </Alert>
        </div>
      )}

      {/* Scanner Container - Premium Look */}
      <div className="relative group">
        <div
          id="qr-reader"
          className={`w-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
            isScanning ? 'shadow-blue-500/50 ring-2 ring-blue-500/30' : ''
          } ${scanAnimation ? 'scale-[1.02]' : 'scale-100'}`}
          style={{ 
            minHeight: '400px',
            maxHeight: '600px',
            maxWidth: '600px',
            margin: '0 auto'
          }}
        />
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-indigo-900/95 rounded-2xl backdrop-blur-sm">
            <div className="text-center text-white px-4">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-6 shadow-2xl">
                  <Camera className="h-12 w-12 text-white" />
                </div>
              </div>
              <p className="text-xl font-semibold mb-2">Ready to Scan</p>
              <p className="text-sm text-blue-200/70">Click start to begin scanning</p>
            </div>
          </div>
        )}
        
        {/* Scanning Tips - Elegant */}
        {isScanning && !lastScanResult && !isProcessing && (
          <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <Camera className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-200 mb-2">Scanning Tips</h4>
                <ul className="text-xs text-blue-300/80 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                    Position QR code within the blue corners
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                    Hold steady for 1-2 seconds
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                    Ensure good lighting
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls - Modern Action Buttons */}
      <div className="flex gap-3">
        {!isScanning ? (
          <Button
            onClick={startScanning}
            disabled={!cameraId}
            className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg shadow-blue-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="mr-2 h-5 w-5" />
            Start Scanner
          </Button>
        ) : (
          <Button
            onClick={stopScanning}
            variant="outline"
            className="flex-1 h-14 border-2 border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500 font-semibold text-lg rounded-xl transition-all duration-300 hover:scale-[1.02]"
          >
            <X className="mr-2 h-5 w-5" />
            Stop Scanner
          </Button>
        )}
      </div>
    </div>
  );
}