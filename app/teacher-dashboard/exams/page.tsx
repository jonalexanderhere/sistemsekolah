"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Users, 
  CheckCircle,
  XCircle,
  Calendar
} from 'lucide-react';

interface Exam {
  id: string;
  judul: string;
  deskripsi: string;
  mata_pelajaran: string;
  kelas: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  durasi_menit: number;
  max_attempts: number;
  passing_score: number;
  is_active: boolean;
  is_published: boolean;
  created_at: string;
}

export default function ExamManagement() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    mata_pelajaran: '',
    kelas: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    durasi_menit: 60,
    max_attempts: 1,
    passing_score: 60,
    is_active: true,
    is_published: false
  });

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/exams/list');
      const data = await response.json();
      
      if (data.success) {
        setExams(data.data || []);
      }
    } catch (error) {
      console.error('Error loading exams:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data ujian",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.judul || !formData.mata_pelajaran) {
      toast({
        title: "Error",
        description: "Judul dan mata pelajaran harus diisi",
        variant: "destructive"
      });
      return;
    }

    try {
      const url = editingExam ? `/api/exams/${editingExam.id}` : '/api/exams/create';
      const method = editingExam ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Berhasil",
          description: editingExam ? "Ujian berhasil diperbarui" : "Ujian berhasil dibuat"
        });
        
        setShowCreateForm(false);
        setEditingExam(null);
        setFormData({
          judul: '',
          deskripsi: '',
          mata_pelajaran: '',
          kelas: '',
          tanggal_mulai: '',
          tanggal_selesai: '',
          durasi_menit: 60,
          max_attempts: 1,
          passing_score: 60,
          is_active: true,
          is_published: false
        });
        loadExams();
      } else {
        toast({
          title: "Error",
          description: data.error || "Gagal menyimpan ujian",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menyimpan ujian",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      judul: exam.judul,
      deskripsi: exam.deskripsi,
      mata_pelajaran: exam.mata_pelajaran,
      kelas: exam.kelas,
      tanggal_mulai: exam.tanggal_mulai.split('T')[0],
      tanggal_selesai: exam.tanggal_selesai.split('T')[0],
      durasi_menit: exam.durasi_menit,
      max_attempts: exam.max_attempts,
      passing_score: exam.passing_score,
      is_active: exam.is_active,
      is_published: exam.is_published
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (examId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus ujian ini?')) return;

    try {
      const response = await fetch(`/api/exams/${examId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Berhasil",
          description: "Ujian berhasil dihapus"
        });
        loadExams();
      } else {
        toast({
          title: "Error",
          description: data.error || "Gagal menghapus ujian",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus ujian",
        variant: "destructive"
      });
    }
  };

  const togglePublish = async (exam: Exam) => {
    try {
      const response = await fetch(`/api/exams/${exam.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...exam,
          is_published: !exam.is_published
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Berhasil",
          description: `Ujian ${exam.is_published ? 'disembunyikan' : 'dipublikasi'}`
        });
        loadExams();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengubah status publikasi",
        variant: "destructive"
      });
    }
  };

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowCreateForm(false);
                setEditingExam(null);
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <h1 className="text-2xl font-bold">
              {editingExam ? 'Edit Ujian' : 'Buat Ujian Baru'}
            </h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Ujian</CardTitle>
              <CardDescription>
                Isi form berikut untuk {editingExam ? 'mengedit' : 'membuat'} ujian
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Judul Ujian *
                    </label>
                    <input
                      type="text"
                      value={formData.judul}
                      onChange={(e) => setFormData(prev => ({ ...prev, judul: e.target.value }))}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Masukkan judul ujian"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Mata Pelajaran *
                    </label>
                    <input
                      type="text"
                      value={formData.mata_pelajaran}
                      onChange={(e) => setFormData(prev => ({ ...prev, mata_pelajaran: e.target.value }))}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: Matematika"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Kelas
                    </label>
                    <input
                      type="text"
                      value={formData.kelas}
                      onChange={(e) => setFormData(prev => ({ ...prev, kelas: e.target.value }))}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: X IPA 1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Durasi (menit)
                    </label>
                    <input
                      type="number"
                      value={formData.durasi_menit}
                      onChange={(e) => setFormData(prev => ({ ...prev, durasi_menit: parseInt(e.target.value) }))}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      value={formData.tanggal_mulai}
                      onChange={(e) => setFormData(prev => ({ ...prev, tanggal_mulai: e.target.value }))}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tanggal Selesai
                    </label>
                    <input
                      type="date"
                      value={formData.tanggal_selesai}
                      onChange={(e) => setFormData(prev => ({ ...prev, tanggal_selesai: e.target.value }))}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Maksimal Percobaan
                    </label>
                    <input
                      type="number"
                      value={formData.max_attempts}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_attempts: parseInt(e.target.value) }))}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nilai Kelulusan
                    </label>
                    <input
                      type="number"
                      value={formData.passing_score}
                      onChange={(e) => setFormData(prev => ({ ...prev, passing_score: parseFloat(e.target.value) }))}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.deskripsi}
                    onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Deskripsi ujian (opsional)"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">Ujian Aktif</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_published}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">Publikasikan Ujian</span>
                  </label>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    {editingExam ? 'Update Ujian' : 'Buat Ujian'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingExam(null);
                    }}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/teacher-dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Kelola Ujian</h1>
              <p className="text-gray-600">Buat dan kelola ujian online</p>
            </div>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Buat Ujian Baru
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data ujian...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada ujian</h3>
                <p className="text-gray-600 mb-4">Mulai dengan membuat ujian pertama Anda</p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Ujian Pertama
                </Button>
              </div>
            ) : (
              exams.map((exam) => (
                <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{exam.judul}</CardTitle>
                        <CardDescription className="mt-1">
                          {exam.mata_pelajaran} {exam.kelas && `• ${exam.kelas}`}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        {exam.is_published ? (
                          <div title="Dipublikasi">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                        ) : (
                          <div title="Belum dipublikasi">
                            <XCircle className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {exam.deskripsi && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {exam.deskripsi}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {exam.durasi_menit} menit
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {exam.max_attempts}x percobaan
                        </div>
                      </div>

                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(exam.tanggal_mulai).toLocaleDateString('id-ID')} - 
                          {new Date(exam.tanggal_selesai).toLocaleDateString('id-ID')}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEdit(exam)}
                          className="flex-1"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => router.push(`/teacher-dashboard/exams/${exam.id}/questions`)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Soal
                        </Button>
                        <Button 
                          size="sm" 
                          variant={exam.is_published ? "secondary" : "default"}
                          onClick={() => togglePublish(exam)}
                        >
                          {exam.is_published ? 'Sembunyikan' : 'Publikasi'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDelete(exam.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
