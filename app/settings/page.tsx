"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Clock, Save, Settings } from 'lucide-react';

interface AttendanceSettings {
  id: string;
  name: string;
  jam_masuk: string;
  jam_terlambat: string;
  jam_pulang: string;
  toleransi_menit: number;
  is_active: boolean;
}

interface User {
  id: string;
  nama: string;
  role: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ nisn: '', nip: '', identitas: '' });
  const [settings, setSettings] = useState<AttendanceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    jam_masuk: '',
    jam_terlambat: '',
    jam_pulang: '',
    toleransi_menit: 5
  });

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadSettings();
  }, []);

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

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();

      if (data.success) {
        if (data.user.role !== 'guru' && data.user.role !== 'admin') {
          toast({
            title: "Akses Ditolak",
            description: "Hanya guru yang dapat mengakses pengaturan",
            variant: "destructive"
          });
          return;
        }
        
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
    }
  };

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/attendance/settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
        setFormData({
          name: data.data.name,
          jam_masuk: data.data.jam_masuk,
          jam_terlambat: data.data.jam_terlambat,
          jam_pulang: data.data.jam_pulang,
          toleransi_menit: data.data.toleransi_menit
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Gagal memuat pengaturan",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      setIsSaving(true);
      
      const method = settings?.id && settings.id !== 'default' ? 'PUT' : 'POST';
      const body = method === 'PUT' && settings?.id
        ? { ...formData, id: settings.id }
        : { ...formData, created_by: user.id };

      const response = await fetch('/api/attendance/settings', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
        toast({
          title: "Berhasil",
          description: data.message || "Pengaturan berhasil disimpan"
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Gagal menyimpan pengaturan",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyimpan",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
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
              
              <h1 className="text-2xl font-bold mb-2">Pengaturan Sistem</h1>
              <p className="text-gray-600">
                Login sebagai guru untuk mengakses pengaturan
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Login Guru</CardTitle>
                <CardDescription>
                  Masukkan identitas guru untuk mengakses pengaturan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Identitas Guru
                    </label>
                    <Input
                      type="text"
                      placeholder="Masukkan nomor identitas"
                      value={loginForm.identitas}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, identitas: e.target.value }))}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                </form>
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
            
            <h1 className="text-2xl font-bold mb-2">Pengaturan Sistem</h1>
            <p className="text-gray-600">
              Kelola pengaturan waktu absensi dan sistem
            </p>
          </div>

          {/* User Info */}
          <Card className="mb-6">
            <CardContent className="flex items-center p-6">
              <Settings className="h-8 w-8 text-blue-600 mr-4" />
              <div>
                <h3 className="font-semibold">{user.nama}</h3>
                <p className="text-sm text-gray-600 capitalize">
                  {user.role} • Akses Pengaturan
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pengaturan Waktu Absensi
              </CardTitle>
              <CardDescription>
                Atur waktu masuk, terlambat, dan pulang untuk sistem absensi
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="loading-spinner mx-auto mb-4"></div>
                  <p>Memuat pengaturan...</p>
                </div>
              ) : (
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nama Pengaturan
                    </label>
                    <Input
                      type="text"
                      placeholder="Contoh: Jadwal Reguler"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Jam Masuk
                      </label>
                      <Input
                        type="time"
                        value={formData.jam_masuk}
                        onChange={(e) => setFormData(prev => ({ ...prev, jam_masuk: e.target.value }))}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Waktu mulai absensi masuk
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Batas Terlambat
                      </label>
                      <Input
                        type="time"
                        value={formData.jam_terlambat}
                        onChange={(e) => setFormData(prev => ({ ...prev, jam_terlambat: e.target.value }))}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Setelah jam ini dianggap terlambat
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Jam Pulang
                      </label>
                      <Input
                        type="time"
                        value={formData.jam_pulang}
                        onChange={(e) => setFormData(prev => ({ ...prev, jam_pulang: e.target.value }))}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Waktu pulang sekolah
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Toleransi (Menit)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="30"
                      value={formData.toleransi_menit}
                      onChange={(e) => setFormData(prev => ({ ...prev, toleransi_menit: parseInt(e.target.value) || 0 }))}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Toleransi waktu untuk absensi (dalam menit)
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      type="submit" 
                      disabled={isSaving}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={loadSettings}
                      disabled={isLoading}
                    >
                      Reset
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Current Settings Display */}
          {settings && (
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan Aktif Saat Ini</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Nama:</span>
                      <span className="text-sm">{settings.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Jam Masuk:</span>
                      <span className="text-sm font-mono">{settings.jam_masuk}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Batas Terlambat:</span>
                      <span className="text-sm font-mono">{settings.jam_terlambat}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Jam Pulang:</span>
                      <span className="text-sm font-mono">{settings.jam_pulang}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Toleransi:</span>
                      <span className="text-sm">{settings.toleransi_menit} menit</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        settings.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {settings.is_active ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

