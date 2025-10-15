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
  FileText,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react';

interface Question {
  id: string;
  exam_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  options?: string[];
  correct_answer: string;
  points: number;
  explanation?: string;
  is_active: boolean;
  created_at: string;
}

interface Exam {
  id: string;
  judul: string;
  mata_pelajaran: string;
  kelas: string;
}

interface CurrentUser {
  id: string;
  nama: string;
  role: string;
}

export default function ExamQuestionsPage({ params }: { params: { id: string } }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'multiple_choice' as Question['question_type'],
    options: [''],
    correct_answer: '',
    points: '1',
    explanation: ''
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
          loadExamAndQuestions();
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
    filterQuestions();
  }, [questions, searchTerm, typeFilter]);

  const loadExamAndQuestions = async () => {
    try {
      setIsLoading(true);

      // Load exam data from localStorage (in real app, this would be from API)
      const savedExams = localStorage.getItem('teacherExams');
      if (savedExams) {
        const examsData = JSON.parse(savedExams);
        const currentExam = examsData.find((e: Exam) => e.id === params.id);
        if (currentExam) {
          setExam(currentExam);
        }
      }

      // Load questions for this exam from localStorage
      const savedQuestions = localStorage.getItem('examQuestions');
      if (savedQuestions) {
        const questionsData = JSON.parse(savedQuestions);
        const examQuestions = questionsData.filter((q: Question) => q.exam_id === params.id);
        setQuestions(examQuestions);
      }

    } catch (error) {
      console.error('Error loading exam and questions:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = questions;

    if (searchTerm) {
      filtered = filtered.filter(question =>
        question.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.correct_answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter) {
      filtered = filtered.filter(question => question.question_type === typeFilter);
    }

    setFilteredQuestions(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.question_text || !formData.correct_answer || !formData.points) {
      toast({
        title: "Error",
        description: "Semua field wajib diisi",
        variant: "destructive"
      });
      return;
    }

    try {
      const questionData: Question = {
        id: editingQuestion ? editingQuestion.id : `question-${Date.now()}`,
        exam_id: params.id,
        question_text: formData.question_text,
        question_type: formData.question_type,
        options: formData.question_type === 'multiple_choice' ? formData.options.filter(opt => opt.trim() !== '') : undefined,
        correct_answer: formData.correct_answer,
        points: parseFloat(formData.points),
        explanation: formData.explanation || undefined,
        is_active: true,
        created_at: editingQuestion ? editingQuestion.created_at : new Date().toISOString()
      };

      let updatedQuestions;
      if (editingQuestion) {
        updatedQuestions = questions.map(q => q.id === editingQuestion.id ? questionData : q);
      } else {
        updatedQuestions = [questionData, ...questions];
      }

      setQuestions(updatedQuestions);

      // Save to localStorage (in real app, this would be API call)
      const savedQuestions = localStorage.getItem('examQuestions');
      const allQuestions = savedQuestions ? JSON.parse(savedQuestions) : [];
      const filteredQuestions = allQuestions.filter((q: Question) => q.exam_id !== params.id);
      const updatedAllQuestions = [...filteredQuestions, ...updatedQuestions];
      localStorage.setItem('examQuestions', JSON.stringify(updatedAllQuestions));

      toast({
        title: "Berhasil",
        description: editingQuestion ? "Soal berhasil diperbarui" : "Soal berhasil ditambahkan ke ujian"
      });

      setShowAddForm(false);
      setEditingQuestion(null);
      setFormData({
        question_text: '',
        question_type: 'multiple_choice',
        options: [''],
        correct_answer: '',
        points: '1',
        explanation: ''
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan soal",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      question_text: question.question_text,
      question_type: question.question_type,
      options: question.options || [''],
      correct_answer: question.correct_answer,
      points: question.points.toString(),
      explanation: question.explanation || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = (questionId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus soal ini dari ujian?')) return;

    const updatedQuestions = questions.filter(q => q.id !== questionId);
    setQuestions(updatedQuestions);

    // Update localStorage
    const savedQuestions = localStorage.getItem('examQuestions');
    if (savedQuestions) {
      const allQuestions = JSON.parse(savedQuestions);
      const filteredQuestions = allQuestions.filter((q: Question) => q.id !== questionId);
      localStorage.setItem('examQuestions', JSON.stringify(filteredQuestions));
    }

    toast({
      title: "Berhasil",
      description: "Soal berhasil dihapus dari ujian"
    });
  };

  const toggleQuestionStatus = (questionId: string) => {
    const updatedQuestions = questions.map(q =>
      q.id === questionId ? { ...q, is_active: !q.is_active } : q
    );
    setQuestions(updatedQuestions);

    // Update localStorage
    const savedQuestions = localStorage.getItem('examQuestions');
    if (savedQuestions) {
      const allQuestions = JSON.parse(savedQuestions);
      const updatedAllQuestions = allQuestions.map((q: Question) =>
        q.id === questionId ? { ...q, is_active: !q.is_active } : q
      );
      localStorage.setItem('examQuestions', JSON.stringify(updatedAllQuestions));
    }
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 1) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const getQuestionTypeLabel = (type: Question['question_type']) => {
    const labels = {
      multiple_choice: 'Pilihan Ganda',
      true_false: 'Benar/Salah',
      short_answer: 'Jawaban Singkat',
      essay: 'Essay'
    };
    return labels[type] || type;
  };

  const getQuestionTypeColor = (type: Question['question_type']) => {
    const colors = {
      multiple_choice: 'bg-blue-100 text-blue-600',
      true_false: 'bg-green-100 text-green-600',
      short_answer: 'bg-yellow-100 text-yellow-600',
      essay: 'bg-purple-100 text-purple-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
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
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/teacher-dashboard/exams')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Ujian
              </Button>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Kelola Soal</span>
            </div>

            {exam && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h1 className="text-2xl font-bold mb-2">{exam.judul}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Mata Pelajaran: {exam.mata_pelajaran}</span>
                  <span>•</span>
                  <span>Kelas: {exam.kelas}</span>
                  <span>•</span>
                  <span>Total Soal: {questions.length}</span>
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Soal</p>
                    <p className="text-2xl font-bold">{questions.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Aktif</p>
                    <p className="text-2xl font-bold">{questions.filter(q => q.is_active).length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Poin</p>
                    <p className="text-2xl font-bold">
                      {questions.reduce((sum, q) => sum + q.points, 0)}
                    </p>
                  </div>
                  <BookOpen className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tipe Soal</p>
                    <p className="text-2xl font-bold">
                      {[...new Set(questions.map(q => q.question_type))].length}
                    </p>
                  </div>
                  <BookOpen className="h-8 w-8 text-orange-600" />
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
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Cari Soal</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Cari pertanyaan atau jawaban..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tipe Soal</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">Semua Tipe</option>
                    <option value="multiple_choice">Pilihan Ganda</option>
                    <option value="true_false">Benar/Salah</option>
                    <option value="short_answer">Jawaban Singkat</option>
                    <option value="essay">Essay</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setTypeFilter('');
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

          {/* Add Question Button */}
          <div className="mb-6">
            <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Tambah Soal ke Ujian
            </Button>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{editingQuestion ? 'Edit Soal' : 'Tambah Soal ke Ujian'}</CardTitle>
                <CardDescription>
                  {editingQuestion ? 'Perbarui soal dalam ujian' : 'Tambahkan soal baru ke ujian ini'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Pertanyaan *</label>
                      <textarea
                        value={formData.question_text}
                        onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Masukkan pertanyaan..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Tipe Soal *</label>
                      <select
                        value={formData.question_type}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          question_type: e.target.value as Question['question_type']
                        }))}
                        className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                        required
                      >
                        <option value="multiple_choice">Pilihan Ganda</option>
                        <option value="true_false">Benar/Salah</option>
                        <option value="short_answer">Jawaban Singkat</option>
                        <option value="essay">Essay</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Poin *</label>
                      <Input
                        type="number"
                        value={formData.points}
                        onChange={(e) => setFormData(prev => ({ ...prev, points: e.target.value }))}
                        min="0"
                        step="0.5"
                        required
                      />
                    </div>
                  </div>

                  {/* Options for multiple choice */}
                  {formData.question_type === 'multiple_choice' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Pilihan Jawaban</label>
                      <div className="space-y-2">
                        {formData.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(index, e.target.value)}
                              placeholder={`Pilihan ${index + 1}`}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeOption(index)}
                              disabled={formData.options.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button type="button" variant="outline" onClick={addOption}>
                          <Plus className="h-4 w-4 mr-2" />
                          Tambah Pilihan
                        </Button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">Jawaban Benar *</label>
                    {formData.question_type === 'multiple_choice' ? (
                      <select
                        value={formData.correct_answer}
                        onChange={(e) => setFormData(prev => ({ ...prev, correct_answer: e.target.value }))}
                        className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                        required
                      >
                        <option value="">Pilih jawaban benar</option>
                        {formData.options.map((option, index) => (
                          <option key={index} value={option}>
                            {option || `Pilihan ${index + 1}`}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        type="text"
                        value={formData.correct_answer}
                        onChange={(e) => setFormData(prev => ({ ...prev, correct_answer: e.target.value }))}
                        placeholder="Masukkan jawaban benar"
                        required
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Penjelasan (Opsional)</label>
                    <textarea
                      value={formData.explanation}
                      onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Penjelasan jawaban..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1">
                      {editingQuestion ? 'Update Soal' : 'Tambah ke Ujian'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddForm(false);
                        setEditingQuestion(null);
                        setFormData({
                          question_text: '',
                          question_type: 'multiple_choice',
                          options: [''],
                          correct_answer: '',
                          points: '1',
                          explanation: ''
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

          {/* Questions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Soal dalam Ujian</CardTitle>
              <CardDescription>
                Menampilkan {filteredQuestions.length} dari {questions.length} soal
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Memuat data...</p>
                </div>
              ) : filteredQuestions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">No</th>
                        <th className="text-left p-3 font-semibold">Pertanyaan</th>
                        <th className="text-left p-3 font-semibold">Tipe</th>
                        <th className="text-left p-3 font-semibold">Poin</th>
                        <th className="text-left p-3 font-semibold">Status</th>
                        <th className="text-left p-3 font-semibold">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredQuestions.map((question, index) => (
                        <tr key={question.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{index + 1}</td>
                          <td className="p-3">
                            <div className="max-w-xs truncate" title={question.question_text}>
                              {question.question_text}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getQuestionTypeColor(question.question_type)}`}>
                              {getQuestionTypeLabel(question.question_type)}
                            </span>
                          </td>
                          <td className="p-3">{question.points}</td>
                          <td className="p-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleQuestionStatus(question.id)}
                              className="flex items-center gap-1"
                            >
                              {question.is_active ? (
                                <>
                                  <Eye className="h-4 w-4 text-green-600" />
                                  <span className="text-green-600">Aktif</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-400">Nonaktif</span>
                                </>
                              )}
                            </Button>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(question)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(question.id)}
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
                  <p className="text-gray-500">Belum ada soal dalam ujian ini</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Klik &quot;Tambah Soal ke Ujian&quot; untuk menambahkan soal
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
