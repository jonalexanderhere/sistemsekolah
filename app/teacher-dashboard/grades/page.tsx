"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  BookOpen,
  Users,
  Award,
  Calendar,
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Student {
  id: string;
  nama: string;
  nisn: string;
  class_name?: string;
  email?: string;
}

interface Grade {
  id: string;
  student_id: string;
  assignment_name: string;
  subject: string;
  grade: number;
  max_grade: number;
  date: string;
  notes?: string;
  created_at: string;
  students?: {
    nama: string;
    nisn: string;
    class_name?: string;
  };
}

interface CurrentUser {
  id: string;
  nama: string;
  role: string;
}

export default function GradesPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [filteredGrades, setFilteredGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  
  const [formData, setFormData] = useState({
    student_id: '',
    assignment_name: '',
    subject: '',
    grade: '',
    max_grade: '100',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Check for saved user
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        if (userData.role === 'guru' || userData.role === 'admin') {
          setCurrentUser(userData);
          loadData();
        } else {
          toast({
            title: "Akses Ditolak",
            description: "Hanya guru yang dapat mengakses halaman ini",
            variant: "destructive"
          });
          router.push('/');
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [toast, router]);

  useEffect(() => {
    filterGrades();
  }, [grades, searchTerm, subjectFilter, classFilter]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load students (only students, not teachers or admins)
      const studentsResponse = await fetch('/api/users/list?role=siswa&limit=1000');
      const studentsData = await studentsResponse.json();
      
      if (studentsData.success) {
        setStudents(studentsData.data || []);
      }

      // Load grades from Supabase API
      const gradesResponse = await fetch(`/api/grades/list?teacherId=${currentUser?.id}&limit=1000`);
      const gradesData = await gradesResponse.json();
      
      if (gradesData.success) {
        setGrades(gradesData.data || []);
        console.log('📊 Loaded grades from Supabase:', gradesData.data?.length || 0);
      } else {
        console.error('Error loading grades:', gradesData.error);
        toast({
          title: "Error",
          description: "Gagal memuat data nilai",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterGrades = () => {
    let filtered = grades;

    if (searchTerm) {
      filtered = filtered.filter(grade =>
        grade.assignment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grade.students?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grade.students?.nisn.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (subjectFilter) {
      filtered = filtered.filter(grade => grade.subject === subjectFilter);
    }

    if (classFilter) {
      filtered = filtered.filter(grade => grade.students?.class_name === classFilter);
    }

    setFilteredGrades(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.student_id || !formData.assignment_name || !formData.subject || !formData.grade) {
      toast({
        title: "Error",
        description: "Semua field wajib diisi",
        variant: "destructive"
      });
      return;
    }

    try {
      const requestData = {
        student_id: formData.student_id,
        assignment_name: formData.assignment_name,
        subject: formData.subject,
        grade: formData.grade,
        max_grade: formData.max_grade,
        date: formData.date,
        notes: formData.notes,
        teacher_id: currentUser?.id
      };

      let response;
      if (editingGrade) {
        // Update existing grade
        response = await fetch(`/api/grades/${editingGrade.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        });
      } else {
        // Create new grade
        response = await fetch('/api/grades/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData)
        });
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Berhasil",
          description: editingGrade ? "Nilai berhasil diperbarui" : "Nilai berhasil ditambahkan"
        });

        // Reload data from API
        await loadData();

        setShowAddForm(false);
        setEditingGrade(null);
        setFormData({
          student_id: '',
          assignment_name: '',
          subject: '',
          grade: '',
          max_grade: '100',
          date: new Date().toISOString().split('T')[0],
          notes: ''
        });
      } else {
        throw new Error(result.error || 'Gagal menyimpan nilai');
      }
      
    } catch (error) {
      console.error('Error saving grade:', error);
      toast({
        title: "Error",
        description: "Gagal menyimpan nilai",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (grade: Grade) => {
    setEditingGrade(grade);
    setFormData({
      student_id: grade.student_id,
      assignment_name: grade.assignment_name,
      subject: grade.subject,
      grade: grade.grade.toString(),
      max_grade: grade.max_grade.toString(),
      date: grade.date,
      notes: grade.notes || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (gradeId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus nilai ini?')) return;
    
    try {
      const response = await fetch(`/api/grades/${gradeId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Nilai berhasil dihapus"
        });
        
        // Reload data from API
        await loadData();
      } else {
        throw new Error(result.error || 'Gagal menghapus nilai');
      }
    } catch (error) {
      console.error('Error deleting grade:', error);
      toast({
        title: "Error",
        description: "Gagal menghapus nilai",
        variant: "destructive"
      });
    }
  };

  const getGradeColor = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getUniqueSubjects = () => {
    return [...new Set(grades.map(g => g.subject))];
  };

  const getUniqueClasses = () => {
    return [...new Set(grades.map(g => g.students?.class_name).filter(Boolean))];
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/teacher-dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Dashboard
            </Button>
            
            <h1 className="text-2xl font-bold mb-2">Data Nilai Tugas</h1>
            <p className="text-gray-600">
              Kelola nilai dan tugas siswa
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Siswa</p>
                    <p className="text-2xl font-bold">{students.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Nilai</p>
                    <p className="text-2xl font-bold">{grades.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Mata Pelajaran</p>
                    <p className="text-2xl font-bold">{getUniqueSubjects().length}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Kelas</p>
                    <p className="text-2xl font-bold">{getUniqueClasses().length}</p>
                  </div>
                  <Award className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
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
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Cari Siswa/Tugas</label>
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
                  <label className="block text-sm font-medium mb-2">Mata Pelajaran</label>
                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">Semua Mata Pelajaran</option>
                    {getUniqueSubjects().map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Kelas</label>
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">Semua Kelas</option>
                    {getUniqueClasses().map(className => (
                      <option key={className} value={className}>{className}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    onClick={() => {
                      setSearchTerm('');
                      setSubjectFilter('');
                      setClassFilter('');
                    }}
                    variant="outline" 
                    className="w-full"
                  >
                    Reset Filter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Grade Button */}
          <div className="mb-6">
            <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Tambah Nilai
            </Button>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{editingGrade ? 'Edit Nilai' : 'Tambah Nilai Baru'}</CardTitle>
                <CardDescription>
                  {editingGrade ? 'Perbarui data nilai siswa' : 'Masukkan data nilai siswa'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Siswa *</label>
                      <select
                        value={formData.student_id}
                        onChange={(e) => setFormData(prev => ({ ...prev, student_id: e.target.value }))}
                        className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                        required
                      >
                        <option value="">Pilih Siswa</option>
                        {students.map(student => (
                          <option key={student.id} value={student.id}>
                            {student.nama} ({student.nisn})
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Nama Tugas *</label>
                      <Input
                        type="text"
                        value={formData.assignment_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, assignment_name: e.target.value }))}
                        placeholder="Contoh: Tugas Matematika 1"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Mata Pelajaran *</label>
                      <Input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Contoh: Matematika"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Tanggal</label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Nilai *</label>
                      <Input
                        type="number"
                        value={formData.grade}
                        onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                        placeholder="85"
                        min="0"
                        max="100"
                        step="0.1"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Nilai Maksimal</label>
                      <Input
                        type="number"
                        value={formData.max_grade}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_grade: e.target.value }))}
                        placeholder="100"
                        min="1"
                        step="1"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Catatan</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Catatan tambahan (opsional)"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1">
                      {editingGrade ? 'Update Nilai' : 'Simpan Nilai'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingGrade(null);
                        setFormData({
                          student_id: '',
                          assignment_name: '',
                          subject: '',
                          grade: '',
                          max_grade: '100',
                          date: new Date().toISOString().split('T')[0],
                          notes: ''
                        });
                      }}
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Grades Table */}
          <Card>
            <CardHeader>
              <CardTitle>Data Nilai Siswa</CardTitle>
              <CardDescription>
                Menampilkan {filteredGrades.length} dari {grades.length} data nilai
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Memuat data...</p>
                </div>
              ) : filteredGrades.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">No</th>
                        <th className="text-left p-3 font-semibold">Siswa</th>
                        <th className="text-left p-3 font-semibold">Tugas</th>
                        <th className="text-left p-3 font-semibold">Mata Pelajaran</th>
                        <th className="text-left p-3 font-semibold">Nilai</th>
                        <th className="text-left p-3 font-semibold">Tanggal</th>
                        <th className="text-left p-3 font-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGrades.map((grade, index) => (
                        <tr key={grade.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{index + 1}</td>
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{grade.students?.nama || 'Unknown'}</p>
                              <p className="text-sm text-gray-600">{grade.students?.nisn || '-'}</p>
                            </div>
                          </td>
                          <td className="p-3 font-medium">{grade.assignment_name}</td>
                          <td className="p-3">{grade.subject}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGradeColor(grade.grade, grade.max_grade)}`}>
                                {grade.grade}/{grade.max_grade}
                              </span>
                              <span className="text-sm text-gray-600">
                                ({((grade.grade / grade.max_grade) * 100).toFixed(1)}%)
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            {new Date(grade.date).toLocaleDateString('id-ID')}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleEdit(grade)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDelete(grade.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada data nilai</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Klik &quot;Tambah Nilai&quot; untuk menambahkan data nilai siswa
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
