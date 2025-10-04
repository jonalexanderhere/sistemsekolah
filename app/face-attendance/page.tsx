"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import FaceRecognition from '@/components/FaceRecognition';
import { ArrowLeft, Clock, CheckCircle, Users, Calendar } from 'lucide-react';

interface KnownFace {
  id: string;
  descriptor: number[];
  label: string;
}

interface AttendanceRecord {
  id: string;
  status: string;
  waktu: string;
  user: {
    nama: string;
    role: string;
  };
}

export default function FaceAttendancePage() {
  const [knownFaces, setKnownFaces] = useState<KnownFace[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRecognition, setLastRecognition] = useState<{
    userId: string;
    nama: string;
    confidence: number;
    timestamp: Date;
  } | null>(null);
  
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    loadKnownFaces();
    loadRecentAttendance();
  }, []);

  const loadKnownFaces = async () => {
    try {
      // Load from localStorage or create empty array
      const storedFaces = localStorage.getItem('registeredFaces');
      if (storedFaces) {
        const faces = JSON.parse(storedFaces);
        setKnownFaces(faces);
        console.log('📊 Loaded registered faces from storage:', faces);
      } else {
        setKnownFaces([]);
        console.log('📊 No registered faces found');
      }
    } catch (error) {
      console.error('Error loading known faces:', error);
      setKnownFaces([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentAttendance = async () => {
    try {
      // Load from localStorage or create empty array
      const storedAttendance = localStorage.getItem('attendanceRecords');
      if (storedAttendance) {
        const attendance = JSON.parse(storedAttendance);
        setRecentAttendance(attendance);
        console.log('📊 Loaded attendance from storage:', attendance);
      } else {
        setRecentAttendance([]);
        console.log('📊 No attendance records found');
      }
    } catch (error) {
      console.error('Error loading recent attendance:', error);
      setRecentAttendance([]);
    }
  };

  const handleFaceRecognized = async (userId: string, confidence: number) => {
    // Prevent duplicate recognition within 5 seconds
    if (lastRecognition && 
        lastRecognition.userId === userId && 
        Date.now() - lastRecognition.timestamp.getTime() < 5000) {
      return;
    }

    try {
      console.log('👤 Face recognized:', { userId, confidence });
      
      // Get user info from known faces
      const recognizedFace = knownFaces.find(face => face.id === userId);
      const userName = recognizedFace ? recognizedFace.label : 'User Terdaftar';
      
      setLastRecognition({
        userId,
        nama: userName,
        confidence,
        timestamp: new Date()
      });

      // Mark attendance
      toast({
        title: "Absensi Berhasil!",
        description: `${userName} - Hadir`,
      });
      
      // Add to recent attendance and save to localStorage
      const newAttendance: AttendanceRecord = {
        id: `attendance-${Date.now()}`,
        status: 'hadir',
        waktu: new Date().toISOString(),
        user: {
          nama: userName,
          role: 'siswa'
        }
      };
      
      const updatedAttendance = [newAttendance, ...recentAttendance.slice(0, 9)];
      setRecentAttendance(updatedAttendance);
      
      // Save to localStorage
      localStorage.setItem('attendanceRecords', JSON.stringify(updatedAttendance));
      
    } catch (error) {
      console.error('Error processing face recognition:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memproses pengenalan wajah",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            
            <h1 className="text-2xl font-bold mb-2">Absensi dengan Face Recognition</h1>
            <p className="text-gray-600">
              Sistem akan otomatis mengenali wajah dan mencatat kehadiran
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Face Recognition */}
            <div className="lg:col-span-2">
              <FaceRecognition
                mode="recognize"
                onFaceRecognized={handleFaceRecognized}
                knownFaces={knownFaces}
                className="mb-6"
              />

              {/* Last Recognition */}
              {lastRecognition && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Pengenalan Terakhir
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{lastRecognition.nama}</p>
                        <p className="text-sm text-gray-600">
                          Confidence: {(lastRecognition.confidence * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {lastRecognition.timestamp.toLocaleTimeString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Statistik Hari Ini
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Hadir</span>
                      <span className="font-semibold">
                        {recentAttendance.filter(a => a.status === 'hadir').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Terlambat</span>
                      <span className="font-semibold text-yellow-600">
                        {recentAttendance.filter(a => a.status === 'terlambat').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total Absensi</span>
                      <span className="font-semibold text-blue-600">
                        {recentAttendance.length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Attendance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Absensi Terbaru
                  </CardTitle>
                  <CardDescription>
                    Daftar absensi hari ini
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {recentAttendance.length > 0 ? (
                      recentAttendance.map((record) => (
                        <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{record.user?.nama || 'Unknown'}</p>
                            <p className="text-xs text-gray-600 capitalize">{record.user?.role || 'Unknown'}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              record.status === 'hadir' 
                                ? 'bg-green-100 text-green-800'
                                : record.status === 'terlambat'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {record.status}
                            </span>
                            <p className="text-xs text-gray-600 mt-1">
                              {new Date(record.waktu).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-8">
                        Belum ada absensi hari ini
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Status Sistem
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Wajah Terdaftar</span>
                      <span className="font-semibold text-green-600">
                        {knownFaces.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Status Kamera</span>
                      <span className="font-semibold text-green-600">
                        Aktif
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Model AI</span>
                      <span className="font-semibold text-green-600">
                        Loaded
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Camera Setup Instructions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Panduan Setup Kamera</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Jika Kamera Tidak Bisa Dibuka:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="bg-red-100 text-red-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">1</span>
                      <p>Pastikan menggunakan HTTPS atau localhost</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-red-100 text-red-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">2</span>
                      <p>Klik ikon kamera di address bar dan pilih "Allow"</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-red-100 text-red-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">3</span>
                      <p>Tutup aplikasi lain yang menggunakan kamera</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-red-100 text-red-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">4</span>
                      <p>Gunakan browser modern (Chrome, Firefox, Safari)</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Tips Penggunaan:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <p>Posisikan wajah di tengah frame kamera</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <p>Pastikan pencahayaan cukup terang</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <p>Hindari bayangan pada wajah</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <p>Jangan menggunakan masker atau kacamata gelap</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Cara Menggunakan Absensi Wajah</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Untuk Siswa/Guru:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">1</span>
                      <p>Pastikan wajah sudah terdaftar di sistem</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">2</span>
                      <p>Posisikan wajah di depan kamera</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">3</span>
                      <p>Sistem akan otomatis mengenali dan mencatat absensi</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Ketentuan Absensi:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <p><strong>Hadir:</strong> Absensi sebelum 07:30</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                      <p><strong>Terlambat:</strong> Absensi setelah 07:30</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                      <p><strong>Tidak Hadir:</strong> Tidak melakukan absensi</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

