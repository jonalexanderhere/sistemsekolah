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

  // Start camera stream
  const startCamera = useCallback(async () => {
    if (!modelsLoaded) {
      toast({
        title: "Error",
        description: "Model belum dimuat. Tunggu sebentar.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        videoRef.current.onloadedmetadata = () => {
          setIsStreaming(true);
          setIsLoading(false);
          
          // Resize canvas to match video
          if (canvasRef.current && videoRef.current) {
            resizeCanvasToMatch(canvasRef.current, videoRef.current);
          }
          
          // Start face detection
          startFaceDetection();
        };
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      toast({
        title: "Error",
        description: "Gagal mengakses kamera. Pastikan izin kamera telah diberikan.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  }, [modelsLoaded, toast]);

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
      if (!videoRef.current || !canvasRef.current || !modelsLoaded || isProcessing) {
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
        <div className="flex gap-2 justify-center">
          {!isStreaming ? (
            <Button 
              onClick={startCamera} 
              disabled={isLoading || !modelsLoaded}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Mulai Kamera
            </Button>
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

        {/* Status */}
        <div className="text-center text-sm text-muted-foreground">
          {!modelsLoaded && 'Model belum dimuat'}
          {modelsLoaded && !isStreaming && 'Klik "Mulai Kamera" untuk memulai'}
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

