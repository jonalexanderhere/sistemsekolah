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
  const [user, setUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ nisn: '', identitas: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginForm.nisn && !loginForm.identitas) {
      toast({
        title: "Error",
        description: "Masukkan NISN atau Identitas",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        toast({
          title: "Login Berhasil",
          description: `Selamat datang, ${data.user.nama}!`
        });
      } else {
        toast({
          title: "Login Gagal",
          description: data.error || "User tidak ditemukan",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat login",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceRegistered = async (faceEmbedding: number[]) => {
    if (!user) return;

    try {
      const response = await fetch('/api/faces/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          faceEmbedding
        })
      });

      const data = await response.json();

      if (data.success) {
        setRegistrationComplete(true);
        setUser(prev => prev ? { ...prev, has_face: true } : null);
        toast({
          title: "Berhasil!",
          description: "Wajah berhasil didaftarkan. Anda sekarang dapat menggunakan absensi wajah.",
        });
      } else {
        toast({
          title: "Gagal",
          description: data.error || "Gagal mendaftarkan wajah",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mendaftarkan wajah",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
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
                Login terlebih dahulu untuk mendaftarkan wajah Anda
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Masukkan NISN (siswa) atau Identitas (guru)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      NISN (untuk siswa)
                    </label>
                    <Input
                      type="text"
                      placeholder="Masukkan NISN"
                      value={loginForm.nisn}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, nisn: e.target.value }))}
                    />
                  </div>
                  
                  <div className="text-center text-sm text-gray-500">atau</div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Identitas (untuk guru)
                    </label>
                    <Input
                      type="text"
                      placeholder="Masukkan nomor identitas"
                      value={loginForm.identitas}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, identitas: e.target.value }))}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Memproses...' : 'Login'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
                <h3 className="font-semibold">{user.nama}</h3>
                <p className="text-sm text-gray-600 capitalize">
                  {user.role} • {user.nisn || user.identitas}
                </p>
                <p className="text-sm">
                  Status: {user.has_face ? (
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

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Petunjuk Registrasi Wajah</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">1</span>
                  <p>Klik tombol "Mulai Kamera" untuk mengaktifkan kamera</p>
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

