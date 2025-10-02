"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Users, 
  ClipboardList, 
  BarChart3, 
  Settings, 
  LogOut,
  Plus,
  Eye,
  Edit,
  FileText,
  Calendar,
  Award,
  TrendingUp
} from 'lucide-react';

interface User {
  id: string;
  nama: string;
  role: string;
  nisn: string;
  identitas: string;
}

interface DashboardStats {
  totalStudents: number;
  totalExams: number;
  activeExams: number;
  averageScore: number;
  todayAttendance: number;
}

export default function TeacherDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ nisn: '', nip: '', identitas: '' });
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalExams: 0,
    activeExams: 0,
    averageScore: 0,
    todayAttendance: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginForm.nisn && !loginForm.nip && !loginForm.identitas) {
      toast({
        title: "Error",
        description: "Masukkan NISN/NIP atau identitas guru",
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
        if (data.user.role !== 'guru' && data.user.role !== 'admin') {
          toast({
            title: "Akses Ditolak",
            description: "Halaman ini hanya untuk guru dan admin",
            variant: "destructive"
          });
          return;
        }

        setUser(data.user);
        loadDashboardStats();
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

  const loadDashboardStats = async () => {
    try {
      // Load students count
      const studentsResponse = await fetch('/api/users/list?role=siswa&limit=1000');
      const studentsData = await studentsResponse.json();
      
      // Load exams count
      const examsResponse = await fetch('/api/exams/list');
      const examsData = await examsResponse.json();
      
      // Load today's attendance
      const today = new Date().toISOString().split('T')[0];
      const attendanceResponse = await fetch(`/api/attendance/list?date=${today}&limit=1000`);
      const attendanceData = await attendanceResponse.json();

      setStats({
        totalStudents: studentsData.data?.length || 0,
        totalExams: examsData.data?.length || 0,
        activeExams: examsData.data?.filter((exam: any) => exam.is_active && exam.is_published).length || 0,
        averageScore: 85.5, // Placeholder - calculate from actual results
        todayAttendance: attendanceData.data?.length || 0
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setLoginForm({ nisn: '', nip: '', identitas: '' });
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari sistem"
    });
  };

  const navigateTo = (path: string) => {
    router.push(path);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Dashboard Guru</CardTitle>
            <CardDescription>
              Masukkan kredensial guru untuk mengakses dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  NISN (untuk admin)
                </label>
                <input
                  type="text"
                  placeholder="Masukkan NISN"
                  value={loginForm.nisn}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, nisn: e.target.value, nip: '', identitas: '' }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="text-center">
                <span className="text-sm text-gray-500 bg-white px-4">atau</span>
                <div className="border-t border-gray-200 -mt-3"></div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  NIP (untuk guru)
                </label>
                <input
                  type="text"
                  placeholder="Masukkan NIP"
                  value={loginForm.nip}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, nip: e.target.value, nisn: '', identitas: '' }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="text-center">
                <span className="text-sm text-gray-500 bg-white px-4">atau</span>
                <div className="border-t border-gray-200 -mt-3"></div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Identitas
                </label>
                <input
                  type="text"
                  placeholder="Masukkan email identitas"
                  value={loginForm.identitas}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, identitas: e.target.value, nisn: '', nip: '' }))}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Memuat...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Guru</h1>
              <p className="text-gray-600">Selamat datang, {user.nama}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-gray-900">{user.nama}</p>
                <p className="text-sm text-gray-600 capitalize">{user.role}</p>
              </div>
              <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Siswa</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Ujian</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalExams}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ClipboardList className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ujian Aktif</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeExams}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rata-rata Nilai</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageScore}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Absensi Hari Ini</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.todayAttendance}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Exam Management */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo('/teacher-dashboard/exams')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Kelola Ujian
              </CardTitle>
              <CardDescription>
                Buat, edit, dan kelola ujian online
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Total Ujian: {stats.totalExams}</p>
                  <p className="text-sm text-gray-600">Aktif: {stats.activeExams}</p>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Ujian
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Question Bank */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo('/teacher-dashboard/questions')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Bank Soal
              </CardTitle>
              <CardDescription>
                Kelola koleksi soal dan jawaban
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Soal Tersedia</p>
                  <p className="text-sm text-gray-600">Berbagai Kategori</p>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Soal
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Student Management */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo('/users')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Kelola Siswa
              </CardTitle>
              <CardDescription>
                Lihat dan kelola data siswa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Total: {stats.totalStudents} siswa</p>
                  <p className="text-sm text-gray-600">Semua kelas</p>
                </div>
                <Button size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Lihat Data
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Attendance */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo('/attendance')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                Absensi
              </CardTitle>
              <CardDescription>
                Monitor dan kelola absensi siswa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Hari ini: {stats.todayAttendance}</p>
                  <p className="text-sm text-gray-600">Laporan lengkap</p>
                </div>
                <Button size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Lihat Absensi
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results & Analytics */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo('/teacher-dashboard/results')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-red-600" />
                Hasil & Analisis
              </CardTitle>
              <CardDescription>
                Lihat hasil ujian dan analisis performa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Rata-rata: {stats.averageScore}</p>
                  <p className="text-sm text-gray-600">Analisis detail</p>
                </div>
                <Button size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Lihat Analisis
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo('/settings')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                Pengaturan
              </CardTitle>
              <CardDescription>
                Konfigurasi sistem dan preferensi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">Jam sekolah</p>
                  <p className="text-sm text-gray-600">Konfigurasi sistem</p>
                </div>
                <Button size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Pengaturan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
