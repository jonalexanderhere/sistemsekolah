"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Users, Calendar, Bell, Camera, BookOpen, Zap, Shield, Smartphone } from 'lucide-react';
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
  const [loginForm, setLoginForm] = useState({ nisn: '', nip: '', identitas: '' });
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
    
    if (!loginForm.nisn && !loginForm.nip && !loginForm.identitas) {
      toast({
        title: "Error",
        description: "Masukkan NISN/NIP atau Identitas",
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
    setLoginForm({ nisn: '', nip: '', identitas: '' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b border-gray-100 bg-white">
          <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="h-6 w-6 md:h-7 md:w-7 text-white" />
                </div>
                <div className="text-center md:text-left">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">EduFace Cloud Pro</h1>
                  <p className="text-xs md:text-sm text-gray-600 leading-tight">TJKT 2 Smart School System</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Sistem Absensi Pintar dengan
                <span className="text-blue-600 block mt-2">Face Recognition AI</span>
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
                Solusi modern untuk manajemen kehadiran siswa dengan teknologi pengenalan wajah yang akurat dan efisien
              </p>
              
              {/* Feature badges */}
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  Real-time AI
                </span>
                <span className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                  Mobile Ready
                </span>
                <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                  Secure
                </span>
                <span className="px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">
                  Fast
                </span>
              </div>
            </div>

            {/* Login and Announcements */}
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              {/* Login Form */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-semibold">Login</CardTitle>
                  <CardDescription className="text-gray-600">
                    Masukkan NISN (siswa), NIP (guru), atau Identitas untuk masuk
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        NISN (untuk siswa)
                      </label>
                      <Input
                        type="text"
                        placeholder="Masukkan NISN"
                        value={loginForm.nisn}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, nisn: e.target.value, nip: '', identitas: '' }))}
                        className="h-12"
                      />
                    </div>
                    
                    <div className="text-center">
                      <span className="text-sm text-gray-500 bg-white px-4">atau</span>
                      <div className="border-t border-gray-200 -mt-3"></div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        NIP (untuk guru)
                      </label>
                      <Input
                        type="text"
                        placeholder="Masukkan NIP"
                        value={loginForm.nip}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, nip: e.target.value, nisn: '', identitas: '' }))}
                        className="h-12"
                      />
                    </div>
                    
                    <div className="text-center">
                      <span className="text-sm text-gray-500 bg-white px-4">atau</span>
                      <div className="border-t border-gray-200 -mt-3"></div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Identitas (untuk guru)
                      </label>
                      <Input
                        type="text"
                        placeholder="Masukkan email identitas"
                        value={loginForm.identitas}
                        onChange={(e) => setLoginForm(prev => ({ ...prev, identitas: e.target.value, nisn: '', nip: '' }))}
                        className="h-12"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-medium" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Memproses...' : 'Login'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Announcements */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                    <Bell className="h-5 w-5 text-blue-600" />
                    Pengumuman Terbaru
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {announcements.length > 0 ? (
                      announcements.map((announcement) => (
                        <div key={announcement.id} className="border-l-4 border-blue-500 pl-4 py-2">
                          <h4 className="font-semibold text-gray-900 mb-1">{announcement.judul}</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {announcement.isi.length > 120 
                              ? announcement.isi.substring(0, 120) + '...'
                              : announcement.isi
                            }
                          </p>
                          <p className="text-xs text-gray-500">
                            {announcement.users?.nama || 'Unknown'} • {new Date(announcement.tanggal).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Belum ada pengumuman</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Fitur Unggulan</h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Teknologi terdepan untuk sistem pendidikan yang lebih efisien dan modern
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Camera className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">AI Face Recognition</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Absensi otomatis dengan teknologi AI yang akurat dan cepat untuk efisiensi maksimal
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Zap className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Smart Dashboard</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Dashboard pintar dengan laporan real-time dan analisis kehadiran yang komprehensif
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">Secure & Private</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Keamanan tingkat enterprise dengan perlindungan data dan privasi yang terjamin
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-gray-100">
          <div className="container mx-auto px-6 text-center">
            <p className="text-gray-600">
              © 2024 EduFace Cloud Pro - TJKT 2 Smart School System
            </p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">EduFace Cloud Pro</h1>
                <p className="text-xs text-gray-600">TJKT 2 Smart School System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-gray-900">{user.nama}</p>
                <p className="text-sm text-gray-600 capitalize">{user.role}</p>
              </div>
              <Button variant="outline" onClick={handleLogout} className="border-gray-200">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
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
            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 shadow-md"
            onClick={() => router.push('/attendance')}
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Absensi</h3>
                  <p className="text-sm text-gray-600">
                    {user.role === 'siswa' ? 'Lihat absensi' : 'Kelola absensi'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 shadow-md"
            onClick={() => router.push('/face-register')}
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                  <Camera className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Registrasi Wajah</h3>
                  <p className="text-sm text-gray-600">
                    {user.has_face ? 'Update wajah' : 'Daftar wajah'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 shadow-md"
            onClick={() => router.push('/face-attendance')}
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                  <Camera className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Absensi Wajah</h3>
                  <p className="text-sm text-gray-600">Absensi dengan wajah</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {user.role === 'guru' && (
            <>
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 shadow-md"
                onClick={() => router.push('/users')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Data Siswa</h3>
                      <p className="text-sm text-gray-600">Kelola data siswa</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 shadow-md"
                onClick={() => router.push('/settings')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mr-4">
                      <Calendar className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Pengaturan</h3>
                      <p className="text-sm text-gray-600">Atur waktu absensi</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Status Card */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Status Akun</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="font-medium text-gray-700">Status Wajah</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.has_face 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {user.has_face ? 'Terdaftar' : 'Belum Terdaftar'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="font-medium text-gray-700">Role</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium capitalize">
                    {user.role}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Announcements */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <Bell className="h-5 w-5 text-blue-600" />
                  Pengumuman Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {announcements.length > 0 ? (
                    announcements.map((announcement) => (
                      <div key={announcement.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg">
                        <h4 className="font-semibold text-gray-900 mb-1">{announcement.judul}</h4>
                        <p className="text-gray-600 mb-2 leading-relaxed">{announcement.isi}</p>
                        <p className="text-sm text-gray-500">
                          {announcement.users?.nama || 'Unknown'} • {new Date(announcement.tanggal).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">Belum ada pengumuman</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
