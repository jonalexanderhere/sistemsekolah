"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Users, Search, Filter, Download, FileText, UserCheck, UserX } from 'lucide-react';
import { exportUsersToExcel, exportUsersToPDF, UserData } from '@/lib/export';

interface User {
  id: string;
  nama: string;
  role: string;
  nisn?: string;
  identitas?: string;
  has_face: boolean;
  created_at: string;
}

interface CurrentUser {
  id: string;
  nama: string;
  role: string;
}

export default function UsersPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loginForm, setLoginForm] = useState({ identitas: '' });
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [faceFilter, setFaceFilter] = useState('');
  
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      loadUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, faceFilter]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginForm.identitas) {
      toast({
        title: "Error",
        description: "Masukkan identitas guru",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identitas: loginForm.identitas })
      });

      const data = await response.json();

      if (data.success) {
        if (data.user.role !== 'guru' && data.user.role !== 'admin') {
          toast({
            title: "Akses Ditolak",
            description: "Hanya guru yang dapat mengakses data pengguna",
            variant: "destructive"
          });
          return;
        }
        
        setCurrentUser(data.user);
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

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users/list?limit=1000');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat data pengguna",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.nisn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.identitas?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Face filter
    if (faceFilter) {
      const hasFace = faceFilter === 'registered';
      filtered = filtered.filter(user => user.has_face === hasFace);
    }

    setFilteredUsers(filtered);
  };

  const handleExportExcel = () => {
    if (filteredUsers.length === 0) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada data untuk diekspor",
        variant: "destructive"
      });
      return;
    }

    exportUsersToExcel(filteredUsers);
    toast({
      title: "Berhasil",
      description: "Data berhasil diekspor ke Excel"
    });
  };

  const handleExportPDF = () => {
    if (filteredUsers.length === 0) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada data untuk diekspor",
        variant: "destructive"
      });
      return;
    }

    exportUsersToPDF(filteredUsers);
    toast({
      title: "Berhasil",
      description: "Laporan berhasil diekspor ke PDF"
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setFaceFilter('');
  };

  if (!currentUser) {
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
              
              <h1 className="text-2xl font-bold mb-2">Data Pengguna</h1>
              <p className="text-gray-600">
                Login sebagai guru untuk mengakses data pengguna
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Login Guru</CardTitle>
                <CardDescription>
                  Masukkan identitas guru untuk mengakses data
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
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            
            <h1 className="text-2xl font-bold mb-2">Data Pengguna</h1>
            <p className="text-gray-600">
              Kelola data siswa dan guru dalam sistem
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Cari Nama/NISN/ID</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Cari..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">Semua Role</option>
                    <option value="siswa">Siswa</option>
                    <option value="guru">Guru</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Status Wajah</label>
                  <select
                    value={faceFilter}
                    onChange={(e) => setFaceFilter(e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">Semua Status</option>
                    <option value="registered">Terdaftar</option>
                    <option value="not_registered">Belum Terdaftar</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Reset Filter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Pengguna</p>
                    <p className="text-2xl font-bold">{filteredUsers.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Siswa</p>
                    <p className="text-2xl font-bold text-green-600">
                      {filteredUsers.filter(u => u.role === 'siswa').length}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="h-4 w-4 bg-green-600 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Guru</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {filteredUsers.filter(u => u.role === 'guru').length}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <div className="h-4 w-4 bg-purple-600 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Wajah Terdaftar</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {filteredUsers.filter(u => u.has_face).length}
                    </p>
                  </div>
                  <UserCheck className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Buttons */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Button onClick={handleExportExcel} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Excel
                </Button>
                <Button onClick={handleExportPDF} variant="outline" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Data Pengguna</CardTitle>
              <CardDescription>
                Menampilkan {filteredUsers.length} dari {users.length} pengguna
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="loading-spinner mx-auto mb-4"></div>
                  <p>Memuat data...</p>
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">No</th>
                        <th className="text-left p-3 font-semibold">Nama</th>
                        <th className="text-left p-3 font-semibold">Role</th>
                        <th className="text-left p-3 font-semibold">NISN/ID</th>
                        <th className="text-left p-3 font-semibold">Status Wajah</th>
                        <th className="text-left p-3 font-semibold">Tgl Daftar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user, index) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{index + 1}</td>
                          <td className="p-3 font-medium">{user.nama}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                              user.role === 'siswa' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-sm">
                            {user.nisn || user.identitas || '-'}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {user.has_face ? (
                                <>
                                  <UserCheck className="h-4 w-4 text-green-600" />
                                  <span className="text-sm text-green-600">Terdaftar</span>
                                </>
                              ) : (
                                <>
                                  <UserX className="h-4 w-4 text-red-600" />
                                  <span className="text-sm text-red-600">Belum Terdaftar</span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-sm">
                            {new Date(user.created_at).toLocaleDateString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Tidak ada data pengguna yang ditemukan</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Coba ubah filter pencarian
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

