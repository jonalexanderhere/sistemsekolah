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
import { Camera, CameraOff, UserCheck, UserPlus, Loader2 } from 'lucide-react';

interface FaceRecognitionProps {
  mode: 'register' | 'recognize';
  onFaceRegistered?: (descriptor: number[]) => void;
  onFaceRecognized?: (userId: string, confidence: number) => void;
  knownFaces?: Array<{ id: string; descriptor: number[]; label: string }>;
  className?: string;
}

export default function FaceRecognition({
  mode,
  onFaceRegistered,
  onFaceRecognized,
  knownFaces = [],
  className = ''
}: FaceRecognitionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectionInterval, setDetectionInterval] = useState<NodeJS.Timeout | null>(null);
  const [lastDetection, setLastDetection] = useState<any>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [permissionRequested, setPermissionRequested] = useState(false);
  
  const { toast } = useToast();

  // Initialize face-api models
  useEffect(() => {
    const initializeModels = async () => {
      try {
        setIsLoading(true);
        const loaded = await loadFaceApiModels();
        setModelsLoaded(loaded);
        
        if (!loaded) {
          toast({
            title: "Error",
            description: "Gagal memuat model face recognition. Pastikan file model tersedia.",
            variant: "destructive"
          });
        } else {
          // Models loaded successfully, show success message
          toast({
            title: "Model Loaded",
            description: "Model face recognition berhasil dimuat. Kamera siap digunakan.",
          });
        }
      } catch (error) {
        console.error('Error initializing models:', error);
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

  // Request camera permission explicitly
  const requestCameraPermission = useCallback(async () => {
    try {
      setPermissionRequested(true);
      setCameraError(null);
      
      // Check if we're on HTTPS (required for camera access)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        throw new Error('HTTPS_REQUIRED');
      }

      // Check if camera API is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('CAMERA_NOT_SUPPORTED');
      }

      // Try to get camera permission with basic config
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      // If successful, stop the stream immediately (we just wanted permission)
      stream.getTracks().forEach(track => track.stop());
      
      toast({
        title: "Izin Kamera Diberikan",
        description: "Kamera siap digunakan. Klik 'Mulai Kamera' untuk memulai.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Permission request failed:', error);
      setCameraError(error.message || error.name || 'UNKNOWN_ERROR');
      return false;
    }
  }, [toast]);

  // Check camera availability and permissions
  const checkCameraAvailability = useCallback(async () => {
    // Check if we're on HTTPS (required for camera access)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      throw new Error('HTTPS_REQUIRED');
    }

    // Check if camera API is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('CAMERA_NOT_SUPPORTED');
    }

    // Check if camera permissions are already granted
    try {
      const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
      if (permissions.state === 'denied') {
        throw new Error('PERMISSION_DENIED');
      }
    } catch (err) {
      // Permission API not supported, continue with normal flow
      console.log('Permission API not supported, continuing...');
    }

    return true;
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    console.log('🎥 Starting camera...');
    console.log('🎥 Models loaded:', modelsLoaded);
    
    // Allow camera to start even if models are not loaded yet
    if (!modelsLoaded) {
      console.log('🎥 Models not loaded yet, but starting camera anyway...');
      toast({
        title: "Info",
        description: "Memulai kamera, model akan dimuat di background.",
      });
    }

    try {
      setIsLoading(true);
      setCameraError(null);
      
      console.log('🎥 Checking camera availability...');
      
      // Check camera availability first
      await checkCameraAvailability();
      
      console.log('🎥 Camera availability check passed');
      
      // Stop any existing streams first
      if (streamRef.current) {
        console.log('🎥 Stopping existing stream...');
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Try different camera configurations with more robust fallbacks
      const configs = [
        {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
            frameRate: { ideal: 30, max: 30 }
          }
        },
        {
          video: {
            width: { min: 320, ideal: 640, max: 1280 },
            height: { min: 240, ideal: 480, max: 720 },
            facingMode: 'user',
            frameRate: { ideal: 15, max: 30 }
          }
        },
        {
          video: {
            width: 640,
            height: 480,
            facingMode: 'user'
          }
        },
        {
          video: {
            width: 320,
            height: 240,
            facingMode: 'user'
          }
        },
        {
          video: {
            facingMode: 'user'
          }
        },
        {
          video: {
            facingMode: 'environment' // Try back camera as fallback
          }
        },
        {
          video: true // Most basic fallback
        }
      ];

      let stream = null;
      let lastError = null;

      for (const config of configs) {
        try {
          console.log('🎥 Trying camera config:', config);
          stream = await navigator.mediaDevices.getUserMedia(config);
          console.log('🎥 Camera stream obtained successfully');
          break;
        } catch (err) {
          lastError = err;
          console.warn('🎥 Camera config failed:', config, err);
        }
      }

      if (!stream) {
        console.error('🎥 No camera configuration worked');
        throw lastError || new Error('No camera configuration worked');
      }

      console.log('🎥 Setting up video element...');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        console.log('🎥 Video element configured');
        
        // Add error handling for video element
        videoRef.current.onerror = (e) => {
          console.error('Video element error:', e);
          toast({
            title: "Error",
            description: "Terjadi kesalahan pada video. Coba refresh halaman.",
            variant: "destructive"
          });
        };
        
        videoRef.current.onloadedmetadata = () => {
          console.log('🎥 Video metadata loaded');
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

        // Set a timeout to handle cases where metadata never loads
        setTimeout(() => {
          if (!isStreaming && streamRef.current) {
            console.warn('Video metadata loading timeout');
            setIsLoading(false);
            toast({
              title: "Warning",
              description: "Kamera lambat merespons. Coba refresh halaman jika masalah berlanjut.",
              variant: "destructive"
            });
          }
        }, 10000);
      }
    } catch (error: any) {
      console.error('Error starting camera:', error);
      
      let errorMessage = "Gagal mengakses kamera.";
      let errorTitle = "Error Kamera";
      
      if (error.message === 'HTTPS_REQUIRED') {
        errorTitle = "HTTPS Diperlukan";
        errorMessage = "Akses kamera memerlukan koneksi HTTPS. Silakan akses aplikasi melalui HTTPS atau gunakan localhost untuk development.";
      } else if (error.message === 'CAMERA_NOT_SUPPORTED') {
        errorTitle = "Kamera Tidak Didukung";
        errorMessage = "Browser Anda tidak mendukung akses kamera. Silakan gunakan browser modern seperti Chrome, Firefox, atau Safari.";
      } else if (error.message === 'PERMISSION_DENIED') {
        errorTitle = "Izin Kamera Ditolak";
        errorMessage = "Izin kamera telah ditolak. Silakan:\n• Klik ikon kamera di address bar\n• Pilih 'Allow' untuk memberikan izin\n• Refresh halaman";
      } else if (error.name === 'NotAllowedError') {
        errorTitle = "Izin Kamera Ditolak";
        errorMessage = "Izin kamera ditolak. Silakan:\n• Klik ikon kamera di address bar\n• Pilih 'Allow' untuk memberikan izin\n• Refresh halaman";
      } else if (error.name === 'NotFoundError') {
        errorTitle = "Kamera Tidak Ditemukan";
        errorMessage = "Kamera tidak ditemukan. Pastikan:\n• Kamera terhubung dengan benar\n• Tidak ada aplikasi lain yang menggunakan kamera\n• Driver kamera sudah terinstall";
      } else if (error.name === 'NotReadableError') {
        errorTitle = "Kamera Tidak Dapat Diakses";
        errorMessage = "Kamera tidak dapat diakses. Coba:\n• Tutup aplikasi lain yang menggunakan kamera\n• Restart browser\n• Periksa driver kamera\n• Gunakan browser yang berbeda";
      } else if (error.name === 'OverconstrainedError') {
        errorTitle = "Konfigurasi Kamera Tidak Didukung";
        errorMessage = "Kamera tidak mendukung konfigurasi yang diminta. Coba gunakan browser yang berbeda.";
      } else if (error.name === 'SecurityError') {
        errorTitle = "Error Keamanan";
        errorMessage = "Akses kamera diblokir karena alasan keamanan. Pastikan menggunakan HTTPS.";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
      setIsLoading(false);
    }
  }, [modelsLoaded, toast, isStreaming]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (detectionInterval) {
      clearInterval(detectionInterval);
      setDetectionInterval(null);
    }
    
    setIsStreaming(false);
    setLastDetection(null);
  }, [detectionInterval]);

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
          const detection = detections[0]; // Use first detected face
          setLastDetection(detection);
          
          // Draw face detection
          drawFaceDetections(canvasRef.current, [detection], {
            drawBox: true,
            drawLandmarks: false,
            color: '#00ff00'
          });

          // Auto-recognize in recognize mode
          if (mode === 'recognize' && knownFaces.length > 0) {
            await handleAutoRecognition(detection);
          }
        } else {
          setLastDetection(null);
        }
      } catch (error) {
        console.error('Error in face detection:', error);
      }
    }, 100); // 10 FPS

    setDetectionInterval(interval);
  }, [modelsLoaded, isProcessing, mode, knownFaces]);

  // Auto recognition for recognize mode
  const handleAutoRecognition = useCallback(async (detection: any) => {
    if (!videoRef.current || isProcessing) return;

    try {
      const descriptor = await getFaceDescriptor(videoRef.current, detection);
      if (!descriptor) return;

      const match = findBestFaceMatch(descriptor, knownFaces);
      
      if (match && onFaceRecognized) {
        // Draw recognition result
        if (canvasRef.current) {
          drawFaceDetections(canvasRef.current, [detection], {
            drawBox: true,
            label: `${match.label} (${(1 - match.distance).toFixed(2)})`,
            color: '#00ff00'
          });
        }
        
        onFaceRecognized(match.id, 1 - match.distance);
      }
    } catch (error) {
      console.error('Error in auto recognition:', error);
    }
  }, [isProcessing, knownFaces, onFaceRecognized]);

  // Manual face registration
  const handleRegisterFace = useCallback(async () => {
    if (!videoRef.current || !lastDetection || isProcessing) {
      toast({
        title: "Error",
        description: "Tidak ada wajah yang terdeteksi. Pastikan wajah terlihat jelas.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Validate face quality
      const validation = validateFaceQuality(lastDetection);
      if (!validation.isValid) {
        toast({
          title: "Kualitas Wajah Kurang",
          description: validation.message,
          variant: "destructive"
        });
        return;
      }

      // Get face descriptor
      const descriptor = await getFaceDescriptor(videoRef.current, lastDetection);
      
      if (!descriptor) {
        toast({
          title: "Error",
          description: "Gagal mengekstrak fitur wajah. Coba lagi.",
          variant: "destructive"
        });
        return;
      }

      // Convert to array for storage
      const descriptorArray = Array.from(descriptor);
      
      if (onFaceRegistered) {
        onFaceRegistered(descriptorArray);
      }

      toast({
        title: "Berhasil",
        description: "Wajah berhasil didaftarkan!",
      });

    } catch (error) {
      console.error('Error registering face:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mendaftarkan wajah.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [lastDetection, isProcessing, onFaceRegistered, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

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
        {/* Camera View */}
        <div className="relative bg-black rounded-lg overflow-hidden">
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
          
          {!isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center text-white">
                <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Kamera belum aktif</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2 justify-center flex-wrap">
          {!isStreaming ? (
            <>
              <Button 
                onClick={startCamera} 
                disabled={isLoading || !modelsLoaded}
                className="flex items-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Mulai Kamera
              </Button>
              
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
            </>
          ) : (
            <Button 
              onClick={stopCamera} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <CameraOff className="h-4 w-4" />
              Hentikan Kamera
            </Button>
          )}

          {mode === 'register' && isStreaming && (
            <Button
              onClick={handleRegisterFace}
              disabled={!lastDetection || isProcessing}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {isProcessing ? 'Memproses...' : 'Daftarkan Wajah'}
            </Button>
          )}
        </div>

        {/* Error Display */}
        {cameraError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">Error Kamera</h4>
            <div className="text-sm text-red-700">
              {cameraError === 'HTTPS_REQUIRED' && (
                <p>Akses kamera memerlukan koneksi HTTPS. Silakan akses aplikasi melalui HTTPS atau gunakan localhost untuk development.</p>
              )}
              {cameraError === 'CAMERA_NOT_SUPPORTED' && (
                <p>Browser Anda tidak mendukung akses kamera. Silakan gunakan browser modern seperti Chrome, Firefox, atau Safari.</p>
              )}
              {cameraError === 'PERMISSION_DENIED' && (
                <div>
                  <p>Izin kamera telah ditolak. Silakan:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Klik ikon kamera di address bar</li>
                    <li>Pilih 'Allow' untuk memberikan izin</li>
                    <li>Refresh halaman</li>
                  </ul>
                </div>
              )}
              {cameraError === 'NotAllowedError' && (
                <div>
                  <p>Izin kamera ditolak. Silakan:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Klik ikon kamera di address bar</li>
                    <li>Pilih 'Allow' untuk memberikan izin</li>
                    <li>Refresh halaman</li>
                  </ul>
                </div>
              )}
              {cameraError === 'NotFoundError' && (
                <div>
                  <p>Kamera tidak ditemukan. Pastikan:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Kamera terhubung dengan benar</li>
                    <li>Tidak ada aplikasi lain yang menggunakan kamera</li>
                    <li>Driver kamera sudah terinstall</li>
                  </ul>
                </div>
              )}
              {cameraError === 'NotReadableError' && (
                <div>
                  <p>Kamera tidak dapat diakses. Coba:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Tutup aplikasi lain yang menggunakan kamera</li>
                    <li>Restart browser</li>
                    <li>Periksa driver kamera</li>
                    <li>Gunakan browser yang berbeda</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="text-center text-sm text-muted-foreground">
          {!modelsLoaded && 'Model belum dimuat'}
          {modelsLoaded && !isStreaming && !cameraError && 'Klik "Mulai Kamera" untuk memulai'}
          {modelsLoaded && !isStreaming && cameraError && 'Perbaiki error kamera di atas'}
          {isStreaming && !lastDetection && 'Mencari wajah...'}
          {isStreaming && lastDetection && (
            <span className="text-green-600">
              ✓ Wajah terdeteksi
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

