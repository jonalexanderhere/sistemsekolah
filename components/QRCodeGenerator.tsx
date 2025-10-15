"use client"

import React, { useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, QrCode } from 'lucide-react';

interface QRCodeGeneratorProps {
  data: string;
  studentName: string;
  studentNISN: string;
  size?: number;
  className?: string;
}

export default function QRCodeGenerator({ 
  data, 
  studentName, 
  studentNISN, 
  size = 200,
  className = '' 
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Generate QR-like pattern (simplified version)
    const moduleSize = size / 25; // 25x25 grid
    const dataString = data;
    
    // Create a simple QR-like pattern
    ctx.fillStyle = '#000000';
    
    // Position markers (corners)
    drawPositionMarker(ctx, 0, 0, moduleSize);
    drawPositionMarker(ctx, size - 7 * moduleSize, 0, moduleSize);
    drawPositionMarker(ctx, 0, size - 7 * moduleSize, moduleSize);
    
    // Generate data pattern based on string
    for (let i = 0; i < dataString.length; i++) {
      const charCode = dataString.charCodeAt(i);
      const x = (i % 20) * moduleSize + 7 * moduleSize;
      const y = Math.floor(i / 20) * moduleSize + 7 * moduleSize;
      
      if (charCode % 2 === 0) {
        ctx.fillRect(x, y, moduleSize, moduleSize);
      }
    }
    
    // Add timing patterns
    for (let i = 0; i < 25; i++) {
      if (i % 2 === 0) {
        ctx.fillRect(6 * moduleSize, i * moduleSize, moduleSize, moduleSize);
        ctx.fillRect(i * moduleSize, 6 * moduleSize, moduleSize, moduleSize);
      }
    }
  }, [data, size]);

  useEffect(() => {
    generateQRCode();
  }, [generateQRCode]);

  const drawPositionMarker = (ctx: CanvasRenderingContext2D, x: number, y: number, moduleSize: number) => {
    // Outer square
    ctx.fillRect(x, y, 7 * moduleSize, 7 * moduleSize);
    
    // Inner white square
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize);
    
    // Center black square
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
  };

  const downloadQRCode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `QR_${studentName}_${studentNISN}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <QrCode className="h-4 w-4" />
          QR Code
        </CardTitle>
        <CardDescription className="text-xs">
          {studentName} - {studentNISN}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-center">
          <div className="inline-block p-2 bg-white rounded-lg border-2 border-gray-200">
            <canvas
              ref={canvasRef}
              width={size}
              height={size}
              className="block"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 w-full"
            onClick={downloadQRCode}
          >
            <Download className="h-3 w-3 mr-1" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
