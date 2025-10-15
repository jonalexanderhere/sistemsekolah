"use client"

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { ArrowLeft, QrCode, Download, CheckCircle, Info } from 'lucide-react';

interface User {
  id: string;
  nama: string;
  role: string;
  nisn: string;
  class_name: string;
}

export default function StudentQRPage() {
  const [user, setUser] = useState<User | null>(null);
  const [qrData, setQrData] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();
  const router = useRouter();

  const loadUserData = useCallback(async () => {
    try {
      // Get user from localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (userData.role === 'siswa') {
          setUser(userData);
          setQrData(`STUDENT_${userData.nisn}`);
          setIsLoading(false);
          return;
        }
      }

      // If no user found, redirect to login
      router.push('/');
    } catch (error) {
      console.error('Error loading user data:', error);
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const downloadQRCode = () => {
    if (!user) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    canvas.width = 300;
    canvas.height = 300;
    
    // Create a more detailed QR code simulation
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 300, 300);
    
    // Draw QR-like pattern
    ctx.fillStyle = '#000000';
    const moduleSize = 12; // 25x25 grid
    
    // Position markers (corners)
    drawPositionMarker(ctx, 0, 0, moduleSize);
    drawPositionMarker(ctx, 300 - 7 * moduleSize, 0, moduleSize);
    drawPositionMarker(ctx, 0, 300 - 7 * moduleSize, moduleSize);
    
    // Generate data pattern based on QR data
    for (let i = 0; i < qrData.length; i++) {
      const charCode = qrData.charCodeAt(i);
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
    
    const link = document.createElement('a');
    link.download = `QR_${user.nama}_${user.nisn}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    toast({
      title: "✅ QR Code Downloaded!",
      description: "QR code berhasil didownload. Simpan di handphone atau cetak untuk absensi.",
    });
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p>Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">Akses Ditolak</h2>
            <p className="text-gray-600 mb-4">Halaman ini hanya untuk siswa</p>
            <Button onClick={() => router.push('/')}>
              Kembali ke Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              QR Code Personal
            </h1>
            <p className="text-gray-600">
              Download QR code personal Anda untuk absensi
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* QR Code Display */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    QR Code Anda
                  </CardTitle>
                  <CardDescription>
                    Tunjukkan QR code ini ke guru untuk absensi
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-6">
                    <QRCodeGenerator
                      data={qrData}
                      studentName={user.nama}
                      studentNISN={user.nisn}
                      size={250}
                      className="mx-auto"
                    />
                  </div>
                  
                  <Button 
                    onClick={downloadQRCode}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Download QR Code
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Student Info & Instructions */}
            <div className="space-y-6">
              {/* Student Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Informasi Siswa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Nama:</span>
                      <span>{user.nama}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">NISN:</span>
                      <span className="font-mono">{user.nisn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Kelas:</span>
                      <span className="font-semibold text-blue-600">{user.class_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">QR Data:</span>
                      <span className="font-mono text-xs">{qrData}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    Cara Menggunakan QR Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">1</span>
                      <p>Download QR code dengan mengklik tombol &quot;Download QR Code&quot;</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">2</span>
                      <p>Simpan QR code di handphone atau cetak di kertas</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">3</span>
                      <p>Tunjukkan QR code ke guru saat absensi</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">4</span>
                      <p>QR code bisa digunakan berulang kali setiap hari</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Keuntungan QR Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <p><strong>Cepat:</strong> Absensi dalam hitungan detik</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <p><strong>Mudah:</strong> Tinggal tunjukkan QR code</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <p><strong>Akurat:</strong> Tidak ada kesalahan identitas</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <p><strong>Reusable:</strong> Bisa dipakai berulang kali</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <p><strong>Offline:</strong> Tidak perlu internet saat absensi</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Important Notes */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-orange-600">⚠️ Catatan Penting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>• QR code ini adalah identitas personal Anda untuk absensi</p>
                <p>• Jangan bagikan QR code kepada orang lain</p>
                <p>• QR code bisa digunakan berulang kali setiap hari</p>
                <p>• Jika QR code hilang, download ulang dari halaman ini</p>
                <p>• Pastikan QR code dalam kondisi baik dan tidak rusak</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
