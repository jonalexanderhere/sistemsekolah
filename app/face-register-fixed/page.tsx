"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import FaceRecognitionFixed from '@/components/FaceRecognitionFixed';
import { ArrowLeft, User, CheckCircle } from 'lucide-react';

interface User {
  id: string;
  nama: string;
  role: string;
  nisn?: string;
  identitas?: string;
  has_face: boolean;
}

export default function FaceRegisterFixedPage() {
  // Demo user untuk testing tanpa login
  const [user, setUser] = useState<User | null>({
    id: 'demo-user',
    nama: 'Demo User',
    role: 'siswa',
    nisn: '1234567890',
    has_face: false
  });
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleFaceRegistered = async (faceEmbedding: number[]) => {
    if (!user) return;

    try {
      console.log('👤 Face registration successful:', { userId: user.id, embeddingLength: faceEmbedding.length });
      
      // Simulate successful registration
      setRegistrationComplete(true);
      setUser(prev => prev ? { ...prev, has_face: true } : null);
      
      toast({
        title: "Berhasil!",
        description: "Wajah berhasil didaftarkan. Anda sekarang dapat menggunakan absensi wajah.",
      });
      
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mendaftarkan wajah",
        variant: "destructive"
      });
    }
  };

  // Success page after registration
  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-600">Registrasi Berhasil!</CardTitle>
                <CardDescription>
                  Wajah Anda telah berhasil didaftarkan dalam sistem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Informasi Registrasi</h3>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Nama:</strong> {user?.nama}</p>
                    <p><strong>Role:</strong> {user?.role}</p>
                    <p><strong>NISN:</strong> {user?.nisn}</p>
                    <p><strong>Status:</strong> Wajah terdaftar</p>
                  </div>
                </div>
                
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => router.push('/face-attendance')} className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Coba Absensi
                  </Button>
                  <Button variant="outline" onClick={() => setRegistrationComplete(false)}>
                    Registrasi Lagi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Registrasi Wajah</h1>
            <p className="text-gray-600 mt-2">
              Daftarkan wajah Anda untuk menggunakan fitur absensi otomatis
            </p>
          </div>

          {/* User Info */}
          <Card className="mb-6">
            <CardContent className="flex items-center p-6">
              <User className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <h3 className="font-semibold">{user?.nama || 'Demo User'}</h3>
                <p className="text-sm text-gray-600 capitalize">
                  {user?.role || 'siswa'} • {user?.nisn || user?.identitas || '1234567890'}
                </p>
                <p className="text-sm">
                  Status: {user?.has_face ? (
                    <span className="text-green-600">Wajah sudah terdaftar</span>
                  ) : (
                    <span className="text-yellow-600">Wajah belum terdaftar</span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Face Registration Component */}
          <FaceRecognitionFixed
            mode="register"
            onFaceRegistered={handleFaceRegistered}
          />

          {/* Instructions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Petunjuk Registrasi Wajah</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <p>Klik tombol <strong>"Mulai Kamera"</strong> untuk mengaktifkan kamera</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <p>Izinkan akses kamera ketika browser meminta</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <p>Posisikan wajah di depan kamera dengan pencahayaan yang baik</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <p>Sistem akan otomatis mendeteksi dan merekam wajah Anda</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">5</div>
                  <p>Setelah berhasil, Anda dapat menggunakan fitur absensi wajah</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
