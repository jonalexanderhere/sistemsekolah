"use client"

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  loadFaceApiModels, 
  detectFaces, 
  getFaceDescriptor,
  drawFaceDetections,
  resizeCanvasToMatch,
  captureVideoFrame,
  validateFaceQuality,
  findBestFaceMatch
} from '@/lib/faceapi';
import { Camera, CameraOff, UserCheck, UserPlus, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface FaceRecognitionProps {
  mode: 'register' | 'recognize';
  onFaceRegistered?: (descriptor: number[]) => void;
  onFaceRecognized?: (userId: string, confidence: number) => void;
  knownFaces?: Array<{ id: string; descriptor: number[]; label: string }>;
  className?: string;
  autoRegister?: boolean; // New prop for auto registration
  onAutoAttendance?: (userId: string) => void; // New prop for auto attendance
}

// Camera status types
type CameraStatus = 'idle' | 'requesting' | 'active' | 'error' | 'denied' | 'notfound' | 'notreadable' | 'insecure';

export default function FaceRecognitionFixed({
  mode,
  onFaceRegistered,
  onFaceRecognized,
  knownFaces = [],
  className = '',
  autoRegister = false,
  onAutoAttendance
}: FaceRecognitionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectionInterval, setDetectionInterval] = useState<NodeJS.Timeout | null>(null);
  const [lastDetection, setLastDetection] = useState<any>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [registeredFaceDescriptor, setRegisteredFaceDescriptor] = useState<number[] | null>(null);
  
  const { toast } = useToast();

  // Initialize face-api models
  useEffect(() => {
    const initializeModels = async () => {
      try {
        setIsLoading(true);
        console.log('🤖 Loading face-api.js models...');
        const loaded = await loadFaceApiModels();
        setModelsLoaded(loaded);
        
        if (loaded) {
          console.log('✅ Face-api.js models loaded successfully');
          toast({
            title: "Model Loaded",
            description: "Model face recognition berhasil dimuat. Kamera siap digunakan.",
          });
        } else {
          console.warn('⚠️ Face-api.js models failed to load');
          toast({
            title: "Warning",
            description: "Model face recognition gagal dimuat. Kamera tetap bisa digunakan.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('❌ Error initializing models:', error);
        toast({
          title: "Error",
          description: "Terjadi kesalahan saat memuat model.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeModels();
  }, [toast]);

  // Check camera availability and permissions
  const checkCameraAvailability = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔍 Checking camera availability...');
      
      // Check if we're on HTTPS or localhost (required for camera access)
      const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
      if (!isSecure) {
        throw new Error('HTTPS_REQUIRED');
      }

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('CAMERA_NOT_SUPPORTED');
      }

      // Check available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        throw new Error('NO_CAMERA_FOUND');
      }

      console.log(`📹 Found ${videoDevices.length} camera device(s)`);
      return true;
    } catch (error) {
      console.error('❌ Camera availability check failed:', error);
      return false;
    }
  }, []);

  // Request camera permission explicitly
  const requestCameraPermission = useCallback(async () => {
    try {
      setPermissionRequested(true);
      setCameraStatus('requesting');
      setErrorMessage('');
      
      console.log('🎥 Requesting camera permission...');
      
      // Check camera availability first
      const isAvailable = await checkCameraAvailability();
      if (!isAvailable) {
        throw new Error('Camera tidak tersedia atau tidak didukung');
      }

      // Try to get camera permission with basic config
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      // If successful, stop the stream immediately (we just wanted permission)
      stream.getTracks().forEach(track => track.stop());
      
      console.log('✅ Camera permission granted');
      setCameraStatus('idle');
      return true;
    } catch (error: any) {
      console.error('❌ Camera permission denied:', error);
      setCameraStatus('denied');
      setErrorMessage('Izin kamera ditolak. Silakan izinkan akses kamera dan coba lagi.');
      return false;
    }
  }, [checkCameraAvailability]);

  // Start camera stream with comprehensive error handling
  const startCamera = useCallback(async () => {
    console.log('🎥 Starting camera...');
    console.log('🎥 Models loaded:', modelsLoaded);
    
    try {
      setIsLoading(true);
      setCameraStatus('requesting');
      setErrorMessage('');
      
      // Check camera availability first
      const isAvailable = await checkCameraAvailability();
      if (!isAvailable) {
        throw new Error('Camera tidak tersedia');
      }

      // Stop any existing streams first
      if (streamRef.current) {
        console.log('🎥 Stopping existing stream...');
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Try different camera configurations with robust fallbacks
      const configs = [
        {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        },
        {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }
        },
        {
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: 'user'
          }
        },
        { video: { facingMode: 'user' } },
        { video: true }
      ];

      let stream: MediaStream | null = null;
      let lastError: Error | null = null;

      // Try each configuration
      for (let i = 0; i < configs.length; i++) {
        try {
          console.log(`🎥 Trying camera config ${i + 1}:`, configs[i]);
          stream = await navigator.mediaDevices.getUserMedia(configs[i]);
          console.log(`✅ Camera started with config ${i + 1}`);
          break;
        } catch (error: any) {
          console.warn(`❌ Config ${i + 1} failed:`, error.name, error.message);
          lastError = error;
          
          // Handle specific errors
          if (error.name === 'NotAllowedError') {
            setCameraStatus('denied');
            setErrorMessage('Izin kamera ditolak. Silakan izinkan akses kamera dan coba lagi.');
            throw error;
          } else if (error.name === 'NotFoundError') {
            setCameraStatus('notfound');
            setErrorMessage('Kamera tidak ditemukan. Pastikan kamera terhubung.');
            throw error;
          } else if (error.name === 'NotReadableError') {
            setCameraStatus('notreadable');
            setErrorMessage('Kamera sedang digunakan aplikasi lain. Tutup aplikasi lain dan coba lagi.');
            throw error;
          } else if (error.name === 'OverconstrainedError') {
            // Try next configuration
            continue;
          } else if (error.name === 'SecurityError') {
            setCameraStatus('insecure');
            setErrorMessage('Akses kamera diblokir karena masalah keamanan. Gunakan HTTPS.');
            throw error;
          }
        }
      }

      if (!stream) {
        console.error('🎥 No camera configuration worked');
        throw lastError || new Error('Tidak ada konfigurasi kamera yang berhasil');
      }

      console.log('🎥 Setting up video element...');
      if (videoRef.current) {
        // Clear any existing stream first
        if (videoRef.current.srcObject) {
          console.log('🎥 Clearing existing stream');
          videoRef.current.srcObject = null;
        }
        
        // Set new stream
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        console.log('🎥 Video element configured with stream:', stream);
        
        // Force video to play
        try {
          await videoRef.current.play();
          console.log('🎥 Video started playing successfully');
        } catch (playError) {
          console.error('🎥 Video play failed:', playError);
          // Continue anyway, video might still work
        }
        
        // Add comprehensive error handling for video element
        videoRef.current.onerror = (e) => {
          console.error('❌ Video element error:', e);
          setCameraStatus('error');
          setErrorMessage('Terjadi kesalahan pada video. Coba refresh halaman.');
          toast({
            title: "Error",
            description: "Terjadi kesalahan pada video. Coba refresh halaman.",
            variant: "destructive"
          });
        };
        
        videoRef.current.onloadedmetadata = () => {
          console.log('🎥 Video metadata loaded');
          if (videoRef.current) {
            console.log('🎥 Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
          }
          setCameraStatus('active');
          setIsStreaming(true);
          setIsLoading(false);
          
          // Resize canvas to match video
          if (canvasRef.current && videoRef.current) {
            console.log('🎥 Resizing canvas to match video');
            resizeCanvasToMatch(canvasRef.current, videoRef.current);
          }
          
          // Start face detection (will skip if models not loaded)
          console.log('🎥 Starting face detection');
          startFaceDetection();
        };

        videoRef.current.oncanplay = () => {
          console.log('🎥 Video can play');
        };

        videoRef.current.onplay = () => {
          console.log('🎥 Video started playing');
        };

        videoRef.current.onloadstart = () => {
          console.log('🎥 Video load started');
        };

        videoRef.current.onloadeddata = () => {
          console.log('🎥 Video data loaded');
        };

        videoRef.current.onprogress = () => {
          console.log('🎥 Video loading progress');
        };

        // Set a timeout to handle cases where metadata never loads
        setTimeout(() => {
          if (!isStreaming && streamRef.current) {
            console.warn('🎥 Video metadata loading timeout');
            console.log('🎥 Stream active:', streamRef.current.active);
            if (videoRef.current) {
              console.log('🎥 Video ready state:', videoRef.current.readyState);
              console.log('🎥 Video paused:', videoRef.current.paused);
              console.log('🎥 Video current time:', videoRef.current.currentTime);
            }
            
            // Force set streaming if stream is active
            if (streamRef.current.active) {
              console.log('🎥 Forcing streaming state to true');
              setCameraStatus('active');
              setIsStreaming(true);
              setIsLoading(false);
            } else {
              setCameraStatus('error');
              setIsLoading(false);
              setErrorMessage('Kamera lambat merespons. Coba refresh halaman jika masalah berlanjut.');
              toast({
                title: "Warning",
                description: "Kamera lambat merespons. Coba refresh halaman jika masalah berlanjut.",
                variant: "destructive"
              });
            }
          }
        }, 5000);
      }
    } catch (error: any) {
      console.error('❌ Error starting camera:', error);
      
      let errorMessage = "Gagal mengakses kamera.";
      let status: CameraStatus = 'error';

      if (error.name === 'NotAllowedError') {
        errorMessage = "Izin kamera ditolak. Silakan izinkan akses kamera dan coba lagi.";
        status = 'denied';
      } else if (error.name === 'NotFoundError') {
        errorMessage = "Kamera tidak ditemukan. Pastikan kamera terhubung.";
        status = 'notfound';
      } else if (error.name === 'NotReadableError') {
        errorMessage = "Kamera sedang digunakan aplikasi lain. Tutup aplikasi lain dan coba lagi.";
        status = 'notreadable';
      } else if (error.name === 'SecurityError') {
        errorMessage = "Akses kamera diblokir karena masalah keamanan. Gunakan HTTPS.";
        status = 'insecure';
      } else if (error.message === 'HTTPS_REQUIRED') {
        errorMessage = "Kamera memerlukan HTTPS. Gunakan https://localhost:3000";
        status = 'insecure';
      } else if (error.message === 'CAMERA_NOT_SUPPORTED') {
        errorMessage = "Browser tidak mendukung akses kamera. Gunakan browser modern.";
        status = 'error';
      } else if (error.message === 'NO_CAMERA_FOUND') {
        errorMessage = "Tidak ada kamera yang ditemukan. Pastikan kamera terhubung.";
        status = 'notfound';
      }

      setCameraStatus(status);
      setErrorMessage(errorMessage);
      setIsLoading(false);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [modelsLoaded, checkCameraAvailability, toast]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    console.log('🛑 Stopping camera...');
    
    if (detectionInterval) {
      clearInterval(detectionInterval);
      setDetectionInterval(null);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraStatus('idle');
    setIsStreaming(false);
    setLastDetection(null);
    setErrorMessage('');
  }, [detectionInterval]);

  // Auto registration function
  const handleAutoRegistration = useCallback(async () => {
    if (!videoRef.current || !modelsLoaded || isRegistering) {
      return;
    }

    try {
      setIsRegistering(true);
      console.log('👤 Starting auto registration...');
      
      const detections = await detectFaces(videoRef.current);
      
      if (detections.length === 1) {
        const detection = detections[0];
        const faceDescriptor = await getFaceDescriptor(videoRef.current, detection);
        
        if (faceDescriptor) {
          // Convert Float32Array to number array
          const descriptorArray = Array.from(faceDescriptor);
          setRegisteredFaceDescriptor(descriptorArray);
          setIsRegistered(true);
          
          console.log('✅ Face registered successfully');
          toast({
            title: "Registrasi Berhasil!",
            description: "Wajah berhasil didaftarkan. Anda sekarang dapat melakukan absensi otomatis.",
          });
          
          if (onFaceRegistered) {
            onFaceRegistered(descriptorArray);
          }
          
          // Save face descriptor to localStorage
          const faceData = {
            id: `user-${Date.now()}`,
            descriptor: descriptorArray,
            label: 'User Terdaftar'
          };
          
          // Load existing faces and add new one
          const existingFaces = JSON.parse(localStorage.getItem('registeredFaces') || '[]');
          const updatedFaces = [...existingFaces, faceData];
          localStorage.setItem('registeredFaces', JSON.stringify(updatedFaces));
          
          // Auto mark attendance after registration
          if (onAutoAttendance) {
            console.log('📝 Auto marking attendance after registration...');
            onAutoAttendance(faceData.id);
            setAttendanceMarked(true);
            
            toast({
              title: "Absensi Berhasil!",
              description: "Absensi otomatis berhasil dicatat.",
            });
          }
        }
      } else if (detections.length === 0) {
        toast({
          title: "Wajah Tidak Terdeteksi",
          description: "Posisikan wajah di depan kamera dan coba lagi.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Terlalu Banyak Wajah",
          description: "Pastikan hanya ada satu wajah di depan kamera.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Auto registration error:', error);
      toast({
        title: "Error",
        description: "Gagal melakukan registrasi wajah.",
        variant: "destructive"
      });
    } finally {
      setIsRegistering(false);
    }
  }, [modelsLoaded, isRegistering, onFaceRegistered, onAutoAttendance, toast]);

  // Face detection loop
  const startFaceDetection = useCallback(() => {
    if (detectionInterval) {
      clearInterval(detectionInterval);
    }

    const interval = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || isProcessing) {
        return;
      }
      
      // Skip face detection if models not loaded yet
      if (!modelsLoaded) {
        console.log('🎥 Models not loaded yet, skipping face detection');
        return;
      }

      try {
        const detections = await detectFaces(videoRef.current);
        
        // Clear previous drawings
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        
        if (detections.length > 0) {
          // Draw face detections
          drawFaceDetections(canvasRef.current, detections);
          
          if (mode === 'register') {
            // For registration, we need to capture and process the face
            if (detections.length === 1) {
              const detection = detections[0];
              const faceDescriptor = await getFaceDescriptor(videoRef.current, detection);
              
              if (faceDescriptor && onFaceRegistered) {
                // Convert Float32Array to number array
                const descriptorArray = Array.from(faceDescriptor);
                onFaceRegistered(descriptorArray);
              }
            }
          } else if (mode === 'recognize' && knownFaces.length > 0) {
            // For recognition, compare with known faces
            for (const detection of detections) {
              const faceDescriptor = await getFaceDescriptor(videoRef.current, detection);
              
              if (faceDescriptor) {
                // Convert Float32Array to number array for matching
                const descriptorArray = Array.from(faceDescriptor);
                const match = findBestFaceMatch(descriptorArray, knownFaces);
                
                if (match && onFaceRecognized) {
                  onFaceRecognized(match.id, match.distance);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Face detection error:', error);
      }
    }, 100); // Check every 100ms

    setDetectionInterval(interval);
  }, [mode, modelsLoaded, knownFaces, onFaceRegistered, onFaceRecognized, isProcessing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [detectionInterval]);

  // Show loading state while models are loading
  if (isLoading && !modelsLoaded) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Memuat model face recognition...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {mode === 'register' ? (
            <>
              <UserPlus className="h-5 w-5" />
              Registrasi Wajah
            </>
          ) : (
            <>
              <UserCheck className="h-5 w-5" />
              Pengenalan Wajah
            </>
          )}
        </CardTitle>
        <CardDescription>
          {mode === 'register' 
            ? 'Posisikan wajah di depan kamera dan klik tombol registrasi'
            : 'Sistem akan otomatis mengenali wajah yang terdaftar'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Camera Status Indicator */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
          {cameraStatus === 'idle' && <Camera className="h-5 w-5 text-gray-500" />}
          {cameraStatus === 'requesting' && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
          {cameraStatus === 'active' && <CheckCircle className="h-5 w-5 text-green-500" />}
          {cameraStatus === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
          {cameraStatus === 'denied' && <XCircle className="h-5 w-5 text-red-500" />}
          {cameraStatus === 'notfound' && <XCircle className="h-5 w-5 text-red-500" />}
          {cameraStatus === 'notreadable' && <XCircle className="h-5 w-5 text-red-500" />}
          {cameraStatus === 'insecure' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
          
          <span className="text-sm font-medium">
            {cameraStatus === 'idle' && 'Kamera siap'}
            {cameraStatus === 'requesting' && 'Meminta akses kamera...'}
            {cameraStatus === 'active' && 'Kamera aktif'}
            {cameraStatus === 'error' && 'Kamera error'}
            {cameraStatus === 'denied' && 'Izin kamera ditolak'}
            {cameraStatus === 'notfound' && 'Kamera tidak ditemukan'}
            {cameraStatus === 'notreadable' && 'Kamera sedang digunakan'}
            {cameraStatus === 'insecure' && 'Perlu HTTPS'}
          </span>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}

        {/* Camera View */}
        <div className="relative bg-gray-100 rounded-lg overflow-hidden min-h-[300px]">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-auto"
            style={{ maxHeight: '400px' }}
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 pointer-events-none"
          />
          
          {/* Overlay when camera is not active */}
          {!isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center text-gray-600">
                <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Kamera belum aktif</p>
                <p className="text-sm">Klik "Mulai Kamera" untuk memulai</p>
              </div>
            </div>
          )}
          
          {/* Debug info when camera is active */}
          {isStreaming && (
            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs z-20">
              Camera Active
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2 justify-center flex-wrap">
          {!isStreaming ? (
            <Button 
              onClick={startCamera} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              Mulai Kamera
            </Button>
          ) : (
            <Button 
              onClick={stopCamera}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <CameraOff className="h-4 w-4" />
              Stop Kamera
            </Button>
          )}
          
          {!permissionRequested && (
            <Button 
              onClick={requestCameraPermission}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Minta Izin Kamera
            </Button>
          )}
        </div>

        {/* Registration Status */}
        {isRegistered && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h4 className="font-medium text-green-800">Wajah Terdaftar</h4>
            </div>
            <p className="text-sm text-green-700">
              Wajah Anda sudah terdaftar. Sistem akan otomatis mengenali Anda untuk absensi.
            </p>
            {attendanceMarked && (
              <div className="mt-2 p-2 bg-green-100 rounded text-sm text-green-800">
                ✅ Absensi otomatis berhasil dicatat
              </div>
            )}
          </div>
        )}

        {/* Registration Button */}
        {mode === 'register' && isStreaming && !isRegistered && (
          <div className="text-center">
            <Button 
              onClick={handleAutoRegistration}
              disabled={isRegistering || !modelsLoaded}
              className="flex items-center gap-2 mx-auto"
              size="lg"
            >
              {isRegistering ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <UserPlus className="h-5 w-5" />
              )}
              {isRegistering ? 'Mendaftarkan Wajah...' : 'Daftarkan Wajah Sekarang'}
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              Posisikan wajah di depan kamera dan klik tombol di atas
            </p>
          </div>
        )}

        {/* Camera Setup Guide */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Panduan Setup Kamera</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Pastikan kamera terhubung dan tidak digunakan aplikasi lain</li>
            <li>• Izinkan akses kamera ketika browser meminta</li>
            <li>• Gunakan browser modern (Chrome, Firefox, Safari, Edge)</li>
            <li>• Untuk keamanan, gunakan HTTPS (https://localhost:3000)</li>
            <li>• Jika kamera tidak muncul, coba refresh halaman</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
