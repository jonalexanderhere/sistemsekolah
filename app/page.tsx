"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Users, Calendar, Bell, Camera, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  nama: string;
  role: 'siswa' | 'guru' | 'admin';
  nisn?: string;
  identitas?: string;
  has_face: boolean;
}

interface Announcement {
  id: string;
  judul: string;
  isi: string;
  tanggal: string;
  users: { nama: string };
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ nisn: '', identitas: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  // Load announcements on mount
  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements/list?limit=5');
      const data = await response.json();
      
      if (data.success) {
        setAnnouncements(data.data);
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
    }
  };

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
          title: "Berhasil Login",
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

  const handleLogout = () => {
    setUser(null);
    setLoginForm({ nisn: '', identitas: '' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <GraduationCap className="h-16 w-16 text-blue-600 mr-4" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900">EduFace Cloud Pro</h1>
                <p className="text-xl text-gray-600">Sistem Informasi Sekolah TJKT 2</p>
              </div>
            </div>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Platform pembelajaran modern dengan teknologi face recognition untuk absensi otomatis
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Login Form */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Login</CardTitle>
                <CardDescription className="text-center">
                  Masukkan NISN (siswa) atau Identitas (guru) untuk masuk
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

            {/* Announcements */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Pengumuman Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcements.length > 0 ? (
                    announcements.map((announcement) => (
                      <div key={announcement.id} className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-sm">{announcement.judul}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {announcement.isi.length > 100 
                            ? announcement.isi.substring(0, 100) + '...'
                            : announcement.isi
                          }
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {announcement.users.nama} • {new Date(announcement.tanggal).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center">Belum ada pengumuman</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="mt-16 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Fitur Unggulan</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <Camera className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Face Recognition</h3>
                  <p className="text-gray-600">
                    Absensi otomatis menggunakan teknologi pengenalan wajah yang akurat dan cepat
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <BookOpen className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Ujian Online</h3>
                  <p className="text-gray-600">
                    Platform ujian online yang terintegrasi dengan sistem absensi
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Manajemen Siswa</h3>
                  <p className="text-gray-600">
                    Kelola data siswa dan guru dengan sistem yang terintegrasi
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold">EduFace Cloud Pro</h1>
                <p className="text-sm text-gray-600">SISFOTJKT2</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium">{user.nama}</p>
                <p className="text-sm text-gray-600 capitalize">{user.role}</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Selamat datang, {user.nama}!
          </h2>
          <p className="text-gray-600">
            {user.role === 'siswa' && `NISN: ${user.nisn}`}
            {user.role === 'guru' && `ID: ${user.identitas}`}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/attendance')}
          >
            <CardContent className="flex items-center p-6">
              <Calendar className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <h3 className="font-semibold">Absensi</h3>
                <p className="text-sm text-gray-600">
                  {user.role === 'siswa' ? 'Lihat absensi' : 'Kelola absensi'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/face-register')}
          >
            <CardContent className="flex items-center p-6">
              <Camera className="h-8 w-8 text-green-600 mr-4" />
              <div>
                <h3 className="font-semibold">Registrasi Wajah</h3>
                <p className="text-sm text-gray-600">
                  {user.has_face ? 'Update wajah' : 'Daftar wajah'}
                </p>
              </div>
            </CardContent>
          </Card>

          {user.role === 'guru' && (
            <>
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push('/users')}
              >
                <CardContent className="flex items-center p-6">
                  <Users className="h-8 w-8 text-purple-600 mr-4" />
                  <div>
                    <h3 className="font-semibold">Data Siswa</h3>
                    <p className="text-sm text-gray-600">Kelola data siswa</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push('/settings')}
              >
                <CardContent className="flex items-center p-6">
                  <Calendar className="h-8 w-8 text-indigo-600 mr-4" />
                  <div>
                    <h3 className="font-semibold">Pengaturan</h3>
                    <p className="text-sm text-gray-600">Atur waktu absensi</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/face-attendance')}
          >
            <CardContent className="flex items-center p-6">
              <Camera className="h-8 w-8 text-orange-600 mr-4" />
              <div>
                <h3 className="font-semibold">Absensi Wajah</h3>
                <p className="text-sm text-gray-600">Absensi dengan wajah</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Status Akun</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span>Status Wajah</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  user.has_face 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.has_face ? 'Terdaftar' : 'Belum Terdaftar'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span>Role</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm capitalize">
                  {user.role}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Pengumuman
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements.length > 0 ? (
                announcements.map((announcement) => (
                  <div key={announcement.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <h4 className="font-semibold">{announcement.judul}</h4>
                    <p className="text-gray-600 mt-1">{announcement.isi}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {announcement.users.nama} • {new Date(announcement.tanggal).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">Belum ada pengumuman</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
