"use client"

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Camera, CameraOff, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface CameraDisplayProps {
  onCameraReady?: (stream: MediaStream) => void;
  onCameraError?: (error: string) => void;
  className?: string;
}

type CameraStatus = 'idle' | 'requesting' | 'active' | 'error' | 'denied' | 'notfound' | 'notreadable' | 'insecure';

export default function CameraDisplay({
  onCameraReady,
  onCameraError,
  className = ''
}: CameraDisplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const { toast } = useToast();

  // Check camera availability
  const checkCameraAvailability = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔍 Checking camera availability...');
      
      // Check if we're on HTTPS or localhost
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

  // Start camera with comprehensive error handling
  const startCamera = useCallback(async () => {
    console.log('🎥 Starting camera...');
    
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

      // Try different camera configurations
      const configs = [
        {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          }
        },
        {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        },
        {
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
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
          if (onCameraError) onCameraError('Video element error');
        };
        
        videoRef.current.onloadedmetadata = () => {
          console.log('🎥 Video metadata loaded');
          if (videoRef.current) {
            console.log('🎥 Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
          }
          setCameraStatus('active');
          setIsStreaming(true);
          setIsLoading(false);
          
          if (onCameraReady) onCameraReady(stream);
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
              if (onCameraReady) onCameraReady(stream);
            } else {
              setCameraStatus('error');
              setIsLoading(false);
              setErrorMessage('Kamera lambat merespons. Coba refresh halaman jika masalah berlanjut.');
              if (onCameraError) onCameraError('Camera timeout');
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
      
      if (onCameraError) onCameraError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [checkCameraAvailability, onCameraReady, onCameraError, toast]);

  // Stop camera
  const stopCamera = useCallback(() => {
    console.log('🛑 Stopping camera...');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraStatus('idle');
    setIsStreaming(false);
    setErrorMessage('');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Camera Visual Display Test
        </CardTitle>
        <CardDescription>
          This test verifies that camera stream is properly displayed in video element.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Camera Status */}
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
            {cameraStatus === 'idle' && 'Camera ready'}
            {cameraStatus === 'requesting' && 'Requesting camera access...'}
            {cameraStatus === 'active' && 'Camera active'}
            {cameraStatus === 'error' && 'Camera error'}
            {cameraStatus === 'denied' && 'Camera permission denied'}
            {cameraStatus === 'notfound' && 'Camera not found'}
            {cameraStatus === 'notreadable' && 'Camera in use'}
            {cameraStatus === 'insecure' && 'HTTPS required'}
          </span>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}

        {/* Camera View - Exact same styling as the test page */}
        <div className="relative bg-gray-100 rounded-lg overflow-hidden min-h-[400px] border-2 border-gray-200">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-auto"
            style={{ maxHeight: '500px' }}
          />
          
          {/* Overlay when camera is not active */}
          {!isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center text-gray-600">
                <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Camera not active</p>
                <p className="text-sm">Click "Start Camera" to begin</p>
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
              Start Camera
            </Button>
          ) : (
            <Button 
              onClick={stopCamera}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <CameraOff className="h-4 w-4" />
              Stop Camera
            </Button>
          )}
        </div>

        {/* Camera Setup Guide */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Camera Setup Guide</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Make sure camera is connected and not used by other applications</li>
            <li>• Allow camera access when browser prompts</li>
            <li>• Use modern browser (Chrome, Firefox, Safari, Edge)</li>
            <li>• For security, use HTTPS (https://localhost:3000)</li>
            <li>• If camera doesn't appear, try refreshing the page</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
