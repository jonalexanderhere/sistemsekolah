"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Download, FileText, Calendar, Search, Filter } from 'lucide-react';
import { exportAttendanceToExcel, exportAttendanceToPDF, AttendanceData } from '@/lib/export';

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [filteredData, setFilteredData] = useState<AttendanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadAttendanceData();
  }, []);

  useEffect(() => {
    filterData();
  }, [attendanceData, searchTerm, dateFilter, statusFilter, roleFilter]);

  const loadAttendanceData = async () => {
    try {
      setIsLoading(true);
      
      // Get last 30 days of attendance data
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const response = await fetch(`/api/attendance/list?startDate=${startDate}&endDate=${endDate}&limit=1000`);
      const data = await response.json();
      
      if (data.success) {
        setAttendanceData(data.data);
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat data absensi",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterData = () => {
    let filtered = attendanceData;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.users?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.users?.nisn?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(record => record.tanggal === dateFilter);
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    // Role filter
    if (roleFilter) {
      filtered = filtered.filter(record => record.users.role === roleFilter);
    }

    setFilteredData(filtered);
  };

  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada data untuk diekspor",
        variant: "destructive"
      });
      return;
    }

    exportAttendanceToExcel(filteredData);
    toast({
      title: "Berhasil",
      description: "Data berhasil diekspor ke Excel"
    });
  };

  const handleExportPDF = () => {
    if (filteredData.length === 0) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada data untuk diekspor",
        variant: "destructive"
      });
      return;
    }

    exportAttendanceToPDF(filteredData);
    toast({
      title: "Berhasil",
      description: "Laporan berhasil diekspor ke PDF"
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter('');
    setStatusFilter('');
    setRoleFilter('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hadir':
        return 'bg-green-100 text-green-800';
      case 'terlambat':
        return 'bg-yellow-100 text-yellow-800';
      case 'tidak_hadir':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
            
            <h1 className="text-2xl font-bold mb-2">Data Absensi</h1>
            <p className="text-gray-600">
              Kelola dan lihat data absensi siswa dan guru
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
              <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Cari Nama/NISN</label>
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
                  <label className="block text-sm font-medium mb-2">Tanggal</label>
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">Semua Status</option>
                    <option value="hadir">Hadir</option>
                    <option value="terlambat">Terlambat</option>
                    <option value="tidak_hadir">Tidak Hadir</option>
                  </select>
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
                    <p className="text-sm font-medium text-gray-600">Total Absensi</p>
                    <p className="text-2xl font-bold">{filteredData.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hadir</p>
                    <p className="text-2xl font-bold text-green-600">
                      {filteredData.filter(d => d.status === 'hadir').length}
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
                    <p className="text-sm font-medium text-gray-600">Terlambat</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {filteredData.filter(d => d.status === 'terlambat').length}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tidak Hadir</p>
                    <p className="text-2xl font-bold text-red-600">
                      {filteredData.filter(d => d.status === 'tidak_hadir').length}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                    <div className="h-4 w-4 bg-red-600 rounded-full"></div>
                  </div>
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
              <CardTitle>Data Absensi</CardTitle>
              <CardDescription>
                Menampilkan {filteredData.length} dari {attendanceData.length} data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="loading-spinner mx-auto mb-4"></div>
                  <p>Memuat data...</p>
                </div>
              ) : filteredData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">No</th>
                        <th className="text-left p-3 font-semibold">Nama</th>
                        <th className="text-left p-3 font-semibold">Role</th>
                        <th className="text-left p-3 font-semibold">NISN</th>
                        <th className="text-left p-3 font-semibold">Tanggal</th>
                        <th className="text-left p-3 font-semibold">Waktu</th>
                        <th className="text-left p-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((record, index) => (
                        <tr key={record.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{index + 1}</td>
                          <td className="p-3 font-medium">{record.users?.nama || 'Unknown'}</td>
                          <td className="p-3 capitalize">{record.users?.role || 'Unknown'}</td>
                          <td className="p-3">{record.users?.nisn || '-'}</td>
                          <td className="p-3">
                            {new Date(record.tanggal).toLocaleDateString('id-ID')}
                          </td>
                          <td className="p-3">
                            {new Date(record.waktu).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                              {record.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Tidak ada data absensi yang ditemukan</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Coba ubah filter atau periode tanggal
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

