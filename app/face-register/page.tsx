"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import FaceRecognition from '@/components/FaceRecognition';
import { ArrowLeft, User, CheckCircle } from 'lucide-react';

interface User {
  id: string;
  nama: string;
  role: string;
  nisn?: string;
  identitas?: string;
  has_face: boolean;
}

export default function FaceRegisterPage() {
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
      // For demo purposes, simulate successful registration
      console.log('👤 Face registration successful:', { userId: user.id, embeddingLength: faceEmbedding.length });
      
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

  // Skip login, go directly to registration

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/')}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Dashboard
            </Button>

            <Card className="text-center">
              <CardContent className="pt-8 pb-8">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
                <h2 className="text-2xl font-bold mb-4">Registrasi Berhasil!</h2>
                <p className="text-gray-600 mb-6">
                  Wajah Anda telah berhasil didaftarkan dalam sistem. 
                  Sekarang Anda dapat menggunakan fitur absensi dengan pengenalan wajah.
                </p>
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => router.push('/face-attendance')}
                    className="w-full"
                  >
                    Coba Absensi Wajah
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/')}
                    className="w-full"
                  >
                    Kembali ke Dashboard
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
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            
            <h1 className="text-2xl font-bold mb-2">Registrasi Wajah</h1>
            <p className="text-gray-600">
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
          <FaceRecognition
            mode="register"
            onFaceRegistered={handleFaceRegistered}
            className="mb-6"
          />

          {/* Camera Setup Instructions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Panduan Setup Kamera</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Jika Kamera Tidak Bisa Dibuka:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="bg-red-100 text-red-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">1</span>
                      <p>Pastikan menggunakan HTTPS atau localhost</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-red-100 text-red-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">2</span>
                      <p>Klik ikon kamera di address bar dan pilih "Allow"</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-red-100 text-red-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">3</span>
                      <p>Tutup aplikasi lain yang menggunakan kamera</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-red-100 text-red-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">4</span>
                      <p>Gunakan browser modern (Chrome, Firefox, Safari)</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Tips Penggunaan:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <p>Posisikan wajah di tengah frame kamera</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <p>Pastikan pencahayaan cukup terang</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <p>Hindari bayangan pada wajah</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <p>Jangan menggunakan masker atau kacamata gelap</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Petunjuk Registrasi Wajah</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">1</span>
                  <p>Klik tombol "Mulai Kamera" atau "Minta Izin Kamera" untuk mengaktifkan kamera</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">2</span>
                  <p>Posisikan wajah Anda di tengah frame kamera dengan pencahayaan yang cukup</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">3</span>
                  <p>Pastikan wajah terdeteksi (ditandai dengan kotak hijau)</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">4</span>
                  <p>Klik tombol "Daftarkan Wajah" ketika wajah sudah terdeteksi dengan baik</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">5</span>
                  <p>Tunggu proses registrasi selesai</p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Tips untuk Registrasi yang Baik:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Pastikan pencahayaan cukup terang</li>
                  <li>• Hindari bayangan pada wajah</li>
                  <li>• Posisikan wajah menghadap langsung ke kamera</li>
                  <li>• Jangan menggunakan masker atau kacamata gelap</li>
                  <li>• Pastikan wajah terlihat jelas tanpa halangan</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

