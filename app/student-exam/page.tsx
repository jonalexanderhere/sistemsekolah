"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Clock, BookOpen, CheckCircle, AlertCircle, Play, Pause, RotateCcw } from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  description: string;
  subject: string;
  duration_minutes: number;
  total_questions: number;
  max_score: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: any;
  correct_answer: string;
  points: number;
  order_index: number;
}

interface User {
  id: string;
  nama: string;
  role: string;
  nisn: string;
  class_name: string;
}

export default function StudentExamPage() {
  const [user, setUser] = useState<User | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isExamCompleted, setIsExamCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadUserData();
    loadExams();
  }, []);

  useEffect(() => {
    if (isExamStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isExamStarted, timeLeft]);

  const loadUserData = async () => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      router.push('/');
    }
  };

  const loadExams = async () => {
    try {
      const response = await fetch('/api/exams/list');
      const data = await response.json();
      
      if (data.success) {
        setExams(data.data || []);
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat data ujian",
          variant: "destructive"
        });
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

  const loadExamQuestions = async (examId: string) => {
    try {
      const response = await fetch(`/api/exams/${examId}`);
      const data = await response.json();
      
      if (data.success) {
        setQuestions(data.questions || []);
        setTimeLeft(selectedExam?.duration_minutes || 60);
        setIsExamStarted(true);
      } else {
        toast({
          title: "Error",
          description: "Gagal memuat soal ujian",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading exam questions:', error);
      toast({
        title: "Error",
        description: "Gagal memuat soal ujian",
        variant: "destructive"
      });
    }
  };

  const startExam = (exam: Exam) => {
    setSelectedExam(exam);
    loadExamQuestions(exam.id);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitExam = async () => {
    if (!selectedExam || !user) return;

    try {
      const response = await fetch('/api/exam-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exam_id: selectedExam.id,
          user_id: user.id,
          answers: answers,
          time_taken_minutes: (selectedExam.duration_minutes || 60) - timeLeft
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsExamCompleted(true);
        toast({
          title: "Berhasil",
          description: "Ujian berhasil disubmit!",
        });
      } else {
        toast({
          title: "Error",
          description: "Gagal submit ujian",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast({
        title: "Error",
        description: "Gagal submit ujian",
        variant: "destructive"
      });
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (isExamCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ujian Selesai!</h1>
            <p className="text-gray-600 mb-8">Terima kasih telah mengerjakan ujian.</p>
            <Button onClick={() => {
              setSelectedExam(null);
              setQuestions([]);
              setCurrentQuestionIndex(0);
              setAnswers({});
              setIsExamStarted(false);
              setIsExamCompleted(false);
            }}>
              Kembali ke Daftar Ujian
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isExamStarted && selectedExam) {
    const currentQuestion = questions[currentQuestionIndex];
    
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedExam.title}</h1>
                <p className="text-gray-600">{selectedExam.subject}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Clock className="h-5 w-5 text-red-600" />
                  <span className={timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Soal {currentQuestionIndex + 1} dari {questions.length}
                </p>
              </div>
            </div>
          </div>

          {/* Question */}
          {currentQuestion && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                    {currentQuestionIndex + 1}
                  </span>
                  Soal {currentQuestionIndex + 1}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <p className="text-lg text-gray-900 mb-4">{currentQuestion.question_text}</p>
                  
                  {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options && (
                    <div className="space-y-3">
                      {Object.entries(currentQuestion.options).map(([key, value]) => (
                        <label key={key} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name={`question_${currentQuestion.id}`}
                            value={key}
                            checked={answers[currentQuestion.id] === key}
                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-gray-900">{key}. {String(value)}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={prevQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    Sebelumnya
                  </Button>
                  
                  <div className="flex gap-2">
                    {questions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`w-8 h-8 rounded-full text-sm font-medium ${
                          index === currentQuestionIndex
                            ? 'bg-blue-600 text-white'
                            : answers[questions[index].id]
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  {currentQuestionIndex === questions.length - 1 ? (
                    <Button onClick={handleSubmitExam} className="bg-green-600 hover:bg-green-700">
                      Submit Ujian
                    </Button>
                  ) : (
                    <Button onClick={nextQuestion}>
                      Selanjutnya
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ujian Online</h1>
            <p className="text-gray-600">Pilih ujian yang ingin dikerjakan</p>
          </div>
        </div>

        {/* Exams List */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada ujian</h3>
              <p className="text-gray-600">Tidak ada ujian yang tersedia saat ini.</p>
            </div>
          ) : (
            exams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    {exam.title}
                  </CardTitle>
                  <CardDescription>{exam.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Mata Pelajaran:</span>
                      <span>{exam.subject}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{exam.duration_minutes} menit</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Jumlah Soal:</span>
                      <span>{exam.total_questions} soal</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="font-medium">Nilai Maksimal:</span>
                      <span>{exam.max_score}</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => startExam(exam)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!exam.is_active}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Mulai Ujian
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
