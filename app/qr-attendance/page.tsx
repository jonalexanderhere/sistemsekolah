"use client"

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, QrCode, CheckCircle, Clock, Users, Calendar, Download, Camera } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  userId?: string;
  status: string;
  waktu: string;
  method?: string;
  user: {
    nama: string;
    role: string;
    nisn?: string;
  };
}

interface Student {
  id: string;
  nama: string;
  nisn: string;
  role: string;
  class_name: string;
  qr_code?: string;
}

export default function QRAttendancePage() {
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState<string>('');
  
  const { toast } = useToast();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    loadStudents();
    loadRecentAttendance();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await fetch('/api/users/list');
      const data = await response.json();

      if (data.success) {
        const studentList = data.data.filter((user: any) => user.role === 'siswa');
        setStudents(studentList);
        console.log('📊 Loaded students:', studentList.length);
      }
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const loadRecentAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/attendance/list?date=${today}&limit=10`);
      const data = await response.json();

      if (data.success) {
        const attendance = data.data.map((record: any) => ({
          id: record.id,
          userId: record.user_id,
          status: record.status,
          waktu: record.waktu_masuk || record.created_at,
          method: record.method,
          user: {
            nama: record.users?.nama || 'Unknown',
            role: record.users?.role || 'siswa',
            nisn: record.users?.nisn
          }
        }));
        setRecentAttendance(attendance);
        console.log('📊 Loaded attendance:', attendance.length);
      }
    } catch (error) {
      console.error('Error loading recent attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startQRScanner = async () => {
    try {
      setIsScanning(true);
      setScannerError('');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
            startQRDetection();
          }
        };
      }
    } catch (error) {
      console.error('Error starting camera:', error);
      setScannerError('Gagal mengakses kamera. Pastikan izin kamera diizinkan.');
      setIsScanning(false);
    }
  };

  const stopQRScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    setScannedData(null);
  };

  const startQRDetection = () => {
    const detectQR = () => {
      if (!videoRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // Simple QR detection using canvas data
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // For demo purposes, we'll simulate QR detection
      // In a real implementation, you'd use a QR code library like qr-scanner
      setTimeout(() => {
        // Simulate finding a QR code
        const mockQRData = 'STUDENT_12345';
        if (mockQRData) {
          handleQRScanned(mockQRData);
        }
      }, 2000);
    };

    const interval = setInterval(detectQR, 100);
    
    // Store interval ID for cleanup
    (videoRef.current as any).qrInterval = interval;
  };

  const handleQRScanned = async (qrData: string) => {
    try {
      setScannedData(qrData);
      console.log('📱 QR Code scanned:', qrData);
      
      // Extract student ID from QR data
      const studentId = qrData.replace('STUDENT_', '');
      const student = students.find(s => s.nisn === studentId);
      
      if (!student) {
        toast({
          title: "❌ Error",
          description: "Siswa tidak ditemukan dalam database",
          variant: "destructive"
        });
        return;
      }

      // Mark attendance
      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: student.id,
          status: 'hadir',
          method: 'qr_code',
          waktu_masuk: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "✅ Absensi Berhasil!",
          description: `${student.nama} berhasil melakukan absensi`,
          duration: 5000,
        });

        // Update recent attendance
        const newAttendance: AttendanceRecord = {
          id: result.data.id,
          userId: student.id,
          status: 'hadir',
          waktu: new Date().toISOString(),
          method: 'qr_code',
          user: {
            nama: student.nama,
            role: student.role,
            nisn: student.nisn
          }
        };

        setRecentAttendance(prev => [newAttendance, ...prev.slice(0, 9)]);
        stopQRScanner();
      } else {
        throw new Error(result.error || 'Failed to save attendance');
      }
    } catch (error) {
      console.error('Error processing QR scan:', error);
      toast({
        title: "❌ Error",
        description: "Terjadi kesalahan saat memproses QR code",
        variant: "destructive"
      });
    }
  };

  const generateQRForStudent = (student: Student) => {
    const qrData = `STUDENT_${student.nisn}`;
    return qrData;
  };

  const downloadQRCode = (student: Student) => {
    const qrData = generateQRForStudent(student);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;
    
    canvas.width = 200;
    canvas.height = 200;
    
    // Simple QR code simulation - in real app use qr-code library
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = '#fff';
    ctx.fillRect(10, 10, 180, 180);
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(qrData, 100, 100);
    
    const link = document.createElement('a');
    link.download = `QR_${student.nama}_${student.nisn}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
            
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Absensi QR Code
            </h1>
            <p className="text-gray-600">
              Sistem absensi modern menggunakan QR Code - Cepat, Mudah, dan Akurat
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* QR Scanner */}
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    Scanner QR Code
                  </CardTitle>
                  <CardDescription>
                    Arahkan kamera ke QR Code siswa untuk melakukan absensi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden min-h-[300px]">
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-auto"
                      style={{ maxHeight: '400px' }}
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 pointer-events-none"
                    />
                    
                    {!isScanning && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="text-center text-gray-600">
                          <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">Scanner belum aktif</p>
                          <p className="text-sm">Klik "Mulai Scanner" untuk memulai</p>
                        </div>
                      </div>
                    )}

                    {scannedData && (
                      <div className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-90">
                        <div className="text-center text-white">
                          <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                          <p className="text-lg font-medium">QR Code Terbaca!</p>
                          <p className="text-sm">{scannedData}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {scannerError && (
                    <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-sm text-red-600">{scannerError}</p>
                    </div>
                  )}

                  <div className="flex gap-2 justify-center mt-4">
                    {!isScanning ? (
                      <Button 
                        onClick={startQRScanner}
                        className="flex items-center gap-2"
                      >
                        <Camera className="h-4 w-4" />
                        Mulai Scanner
                      </Button>
                    ) : (
                      <Button 
                        onClick={stopQRScanner}
                        variant="destructive"
                        className="flex items-center gap-2"
                      >
                        <QrCode className="h-4 w-4" />
                        Stop Scanner
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Student QR Codes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    QR Code Siswa
                  </CardTitle>
                  <CardDescription>
                    Download QR Code untuk setiap siswa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {students.map((student) => (
                      <div key={student.id} className="text-center p-3 border rounded-lg hover:bg-gray-50">
                        <div className="w-20 h-20 mx-auto mb-2 bg-gray-200 rounded flex items-center justify-center">
                          <QrCode className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium truncate">{student.nama}</p>
                        <p className="text-xs text-gray-500">{student.nisn}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 text-xs"
                          onClick={() => downloadQRCode(student)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
                      <span className="font-semibold text-green-600">
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
                      <span className="text-sm">Total Siswa</span>
                      <span className="font-semibold text-blue-600">
                        {students.length}
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
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {recentAttendance.length > 0 ? (
                      recentAttendance.map((record) => (
                        <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{record.user?.nama || 'Unknown'}</p>
                            <p className="text-xs text-gray-600">{record.user?.nisn}</p>
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
                      <span className="text-sm">Siswa Terdaftar</span>
                      <span className="font-semibold text-green-600">
                        {students.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Status Scanner</span>
                      <span className={`font-semibold ${isScanning ? 'text-green-600' : 'text-gray-600'}`}>
                        {isScanning ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Sistem</span>
                      <span className="font-semibold text-green-600">
                        Online
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Instructions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Cara Menggunakan Absensi QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Untuk Siswa:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">1</span>
                      <p>Download QR Code personal dari halaman ini</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">2</span>
                      <p>Simpan QR Code di handphone atau cetak</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">3</span>
                      <p>Tunjukkan QR Code ke scanner untuk absensi</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Keuntungan QR Code:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <p><strong>Cepat:</strong> Absensi dalam hitungan detik</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <p><strong>Mudah:</strong> Tidak perlu kamera khusus</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <p><strong>Akurat:</strong> Tidak ada kesalahan identitas</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <p><strong>Offline:</strong> QR Code bisa disimpan offline</p>
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
