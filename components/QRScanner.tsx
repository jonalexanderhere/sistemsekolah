"use client"

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { QrCode, Camera, CameraOff, CheckCircle, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';

interface QRScannerProps {
  onQRScanned: (data: string) => void;
  className?: string;
}

type ScannerStatus = 'idle' | 'requesting' | 'active' | 'error' | 'denied' | 'notfound';

export default function QRScanner({ onQRScanned, className = '' }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [scannerStatus, setScannerStatus] = useState<ScannerStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  
  const { toast } = useToast();

  const startScanner = useCallback(async () => {
    try {
      setIsScanning(true);
      setScannerStatus('requesting');
      setErrorMessage('');
      
      console.log('🎥 Starting QR scanner...');
      
      // Check if we're on HTTPS or localhost
      const isSecure = location.protocol === 'https:' || 
                      location.hostname === 'localhost' || 
                      location.hostname === '127.0.0.1';
      
      if (!isSecure) {
        throw new Error('HTTPS_REQUIRED');
      }

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('CAMERA_NOT_SUPPORTED');
      }

      // Try different camera configurations
      const configs = [
        { video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } },
        { video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } },
        { video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } },
        { video: { facingMode: 'environment' } },
        { video: true }
      ];

      let stream: MediaStream | null = null;
      let lastError: Error | null = null;

      for (let i = 0; i < configs.length; i++) {
        try {
          console.log(`🎥 Trying camera config ${i + 1}:`, configs[i]);
          stream = await navigator.mediaDevices.getUserMedia(configs[i]);
          console.log(`✅ Camera started with config ${i + 1}`);
          break;
        } catch (error: any) {
          console.warn(`❌ Config ${i + 1} failed:`, error.name, error.message);
          lastError = error;
          
          if (error.name === 'NotAllowedError') {
            setScannerStatus('denied');
            setErrorMessage('Izin kamera ditolak. Silakan izinkan akses kamera dan coba lagi.');
            throw error;
          } else if (error.name === 'NotFoundError') {
            setScannerStatus('notfound');
            setErrorMessage('Kamera tidak ditemukan. Pastikan kamera terhubung.');
            throw error;
          } else if (error.name === 'NotReadableError') {
            setErrorMessage('Kamera sedang digunakan aplikasi lain. Tutup aplikasi lain dan coba lagi.');
            throw error;
          }
        }
      }

      if (!stream) {
        throw lastError || new Error('Tidak ada konfigurasi kamera yang berhasil');
      }

      // Set up video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
            setScannerStatus('active');
            startQRDetection();
          }
        };

        videoRef.current.onerror = () => {
          setScannerStatus('error');
          setErrorMessage('Terjadi kesalahan pada video. Coba refresh halaman.');
        };
      }

    } catch (error: any) {
      console.error('❌ Error starting scanner:', error);
      
      let errorMessage = "Gagal mengakses kamera.";
      let status: ScannerStatus = 'error';

      if (error.message === 'HTTPS_REQUIRED') {
        errorMessage = "Kamera memerlukan HTTPS. Gunakan https://localhost:3000";
        status = 'error';
      } else if (error.message === 'CAMERA_NOT_SUPPORTED') {
        errorMessage = "Browser tidak mendukung akses kamera. Gunakan browser modern.";
        status = 'error';
      } else if (error.name === 'NotAllowedError') {
        errorMessage = "Izin kamera ditolak. Silakan izinkan akses kamera dan coba lagi.";
        status = 'denied';
      } else if (error.name === 'NotFoundError') {
        errorMessage = "Kamera tidak ditemukan. Pastikan kamera terhubung.";
        status = 'notfound';
      } else if (error.name === 'NotReadableError') {
        errorMessage = "Kamera sedang digunakan aplikasi lain. Tutup aplikasi lain dan coba lagi.";
        status = 'error';
      }

      setScannerStatus(status);
      setErrorMessage(errorMessage);
      setIsScanning(false);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [toast]);

  const stopScanner = useCallback(() => {
    console.log('🛑 Stopping QR scanner...');
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setScannerStatus('idle');
    setIsScanning(false);
    setErrorMessage('');
  }, []);

  const startQRDetection = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }

    const detectQR = () => {
      if (!videoRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      // Set canvas size to match video
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // Real QR detection using jsQR library
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Use jsQR library for actual QR code detection
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      const qrData = code ? code.data : null;
      
      if (qrData && Date.now() - lastScanTime > 2000) { // Prevent duplicate scans
        setLastScanTime(Date.now());
        console.log('📱 QR Code detected:', qrData);
        onQRScanned(qrData);
      }
    };

    const interval = setInterval(detectQR, 100);
    scanIntervalRef.current = interval;
  }, [onQRScanned, lastScanTime]);


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Code Scanner
        </CardTitle>
        <CardDescription>
          Arahkan kamera ke QR Code untuk melakukan absensi
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Scanner Status */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
          {scannerStatus === 'idle' && <QrCode className="h-5 w-5 text-gray-500" />}
          {scannerStatus === 'requesting' && <Camera className="h-5 w-5 text-blue-500 animate-pulse" />}
          {scannerStatus === 'active' && <CheckCircle className="h-5 w-5 text-green-500" />}
          {scannerStatus === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
          {scannerStatus === 'denied' && <AlertCircle className="h-5 w-5 text-red-500" />}
          {scannerStatus === 'notfound' && <AlertCircle className="h-5 w-5 text-red-500" />}
          
          <span className="text-sm font-medium">
            {scannerStatus === 'idle' && 'Scanner siap'}
            {scannerStatus === 'requesting' && 'Meminta akses kamera...'}
            {scannerStatus === 'active' && 'Scanner aktif - Arahkan ke QR Code'}
            {scannerStatus === 'error' && 'Scanner error'}
            {scannerStatus === 'denied' && 'Izin kamera ditolak'}
            {scannerStatus === 'notfound' && 'Kamera tidak ditemukan'}
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
          
          {/* Overlay when scanner is not active */}
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center text-gray-600">
                <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Scanner belum aktif</p>
                <p className="text-sm">Klik &quot;Mulai Scanner&quot; untuk memulai</p>
              </div>
            </div>
          )}

          {/* Scanning indicator */}
          {isScanning && scannerStatus === 'active' && (
            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
              Scanning...
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2 justify-center">
          {!isScanning ? (
            <Button 
              onClick={startScanner}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Mulai Scanner
            </Button>
          ) : (
            <Button 
              onClick={stopScanner}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <CameraOff className="h-4 w-4" />
              Stop Scanner
            </Button>
          )}
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Cara Menggunakan Scanner</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Pastikan QR Code dalam kondisi baik dan tidak rusak</li>
            <li>• Arahkan kamera ke QR Code dengan jarak yang tepat</li>
            <li>• Pastikan pencahayaan cukup terang</li>
            <li>• Tunggu hingga QR Code terdeteksi secara otomatis</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
