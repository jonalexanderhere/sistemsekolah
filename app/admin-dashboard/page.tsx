"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import LogoutButton from '@/components/LogoutButton';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  ClipboardList, 
  TrendingUp, 
  Activity,
  Shield,
  Database,
  Globe,
  Monitor,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Settings,
  BarChart3
} from 'lucide-react';

interface User {
  id: string;
  nama: string;
  role: string;
  nisn?: string;
  identitas?: string;
  is_active: boolean;
  last_login?: string;
  login_count?: number;
}

interface SystemLog {
  id: string;
  action: string;
  description: string;
  entity_type: string;
  ip_address: string;
  user_agent: string;
  status: string;
  created_at: string;
  users?: {
    nama: string;
    role: string;
    nisn: string;
  };
}

interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalAdmins: number;
  totalExams: number;
  totalAttendanceToday: number;
  systemHealth: string;
  activeUsers: number;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ nisn: '', nip: '', identitas: '' });
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [logFilters, setLogFilters] = useState({
    action: '',
    user_id: '',
    entity_type: '',
    start_date: '',
    end_date: ''
  });

  const { toast } = useToast();

  // Check if user is logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      if (userData.role === 'admin') {
        setUser(userData);
        fetchDashboardData();
        fetchSystemLogs();
      } else {
        toast({
          title: "Access Denied",
          description: "Hanya admin yang dapat mengakses dashboard ini.",
          variant: "destructive"
        });
      }
    }
    setIsLoading(false);
  }, [toast]);

  // Handle admin login
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
      setIsLoading(true);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();

      if (response.ok && data.user) {
        if (data.user.role !== 'admin') {
          toast({
            title: "Access Denied",
            description: "Hanya admin yang dapat mengakses dashboard ini.",
            variant: "destructive"
          });
          return;
        }

        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Log admin login
        await logSystemActivity('admin_login', `Admin ${data.user.nama} logged in`);
        
        toast({
          title: "Login Berhasil",
          description: `Selamat datang, ${data.user.nama}!`,
        });

        fetchDashboardData();
        fetchSystemLogs();
      } else {
        toast({
          title: "Login Gagal",
          description: data.error || "NISN/NIP atau identitas tidak valid",
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

  // Fetch dashboard statistics
  const fetchDashboardData = async () => {
    try {
      const [usersRes, examsRes, attendanceRes] = await Promise.all([
        fetch('/api/users/list'),
        fetch('/api/exams/list'),
        fetch(`/api/attendance/list?startDate=${new Date().toISOString().split('T')[0]}&endDate=${new Date().toISOString().split('T')[0]}`)
      ]);

      const [users, exams, attendance] = await Promise.all([
        usersRes.json(),
        examsRes.json(),
        attendanceRes.json()
      ]);

      const stats: DashboardStats = {
        totalUsers: users.users?.length || 0,
        totalStudents: users.users?.filter((u: User) => u.role === 'siswa').length || 0,
        totalTeachers: users.users?.filter((u: User) => u.role === 'guru').length || 0,
        totalAdmins: users.users?.filter((u: User) => u.role === 'admin').length || 0,
        totalExams: exams.exams?.length || 0,
        totalAttendanceToday: attendance.attendance?.length || 0,
        systemHealth: 'Good',
        activeUsers: users.users?.filter((u: User) => u.is_active).length || 0
      };

      setStats(stats);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  // Fetch system logs
  const fetchSystemLogs = async () => {
    try {
      const params = new URLSearchParams({
        limit: '100',
        ...Object.fromEntries(Object.entries(logFilters).filter(([_, v]) => v))
      });

      const response = await fetch(`/api/system/log?${params}`);
      const data = await response.json();

      if (response.ok) {
        setSystemLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch system logs:', error);
    }
  };

  // Log system activity
  const logSystemActivity = async (action: string, description: string) => {
    try {
      await fetch('/api/system/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          description,
          entity_type: 'admin_dashboard',
          user_id: user?.id,
          ip_address: await getUserIP(),
          user_agent: navigator.userAgent
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  // Get user IP
  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setLoginForm({ nisn: '', nip: '', identitas: '' });
    setStats(null);
    setSystemLogs([]);
  };

  // Apply log filters
  const applyLogFilters = () => {
    fetchSystemLogs();
  };

  // Clear log filters
  const clearLogFilters = () => {
    setLogFilters({
      action: '',
      user_id: '',
      entity_type: '',
      start_date: '',
      end_date: ''
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto bg-red-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
            <CardDescription>
              Masukkan kredensial admin untuk melanjutkan
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NISN (untuk siswa admin)
                </label>
                <Input
                  type="text"
                  placeholder="Masukkan NISN"
                  value={loginForm.nisn}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, nisn: e.target.value, nip: '', identitas: '' }))}
                  className="h-12"
                />
              </div>

              <div className="text-center text-gray-500">atau</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIP (untuk guru admin)
                </label>
                <Input
                  type="text"
                  placeholder="Masukkan NIP"
                  value={loginForm.nip}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, nip: e.target.value, nisn: '', identitas: '' }))}
                  className="h-12"
                />
              </div>

              <div className="text-center text-gray-500">atau</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Identitas (untuk admin)
                </label>
                <Input
                  type="text"
                  placeholder="Masukkan nomor identitas"
                  value={loginForm.identitas}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, identitas: e.target.value, nisn: '', nip: '' }))}
                  className="h-12"
                />
              </div>

              <Button type="submit" className="w-full h-12" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login as Admin'}
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
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.nama} ({user.role})
              </span>
              <LogoutButton onLogout={handleLogout} />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              System Logs
            </button>
            <button
              onClick={() => setActiveTab('monitoring')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'monitoring'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Monitor className="h-4 w-4 inline mr-2" />
              System Monitoring
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <GraduationCap className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Students</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalStudents || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BookOpen className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Teachers</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalTeachers || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <ClipboardList className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Exams</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalExams || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Overall Status</span>
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Good
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Active Users</span>
                      <span className="font-semibold">{stats?.activeUsers || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Today's Attendance</span>
                      <span className="font-semibold">{stats?.totalAttendanceToday || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.open('/users', '_blank')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Manage Users
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.open('/teacher-dashboard', '_blank')}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Teacher Dashboard
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => window.open('/attendance', '_blank')}
                    >
                      <ClipboardList className="h-4 w-4 mr-2" />
                      View Attendance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6">
            {/* Log Filters */}
            <Card>
              <CardHeader>
                <CardTitle>System Logs Filter</CardTitle>
                <CardDescription>Filter and search system activity logs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                  <Input
                    placeholder="Action"
                    value={logFilters.action}
                    onChange={(e) => setLogFilters(prev => ({ ...prev, action: e.target.value }))}
                  />
                  <Input
                    placeholder="Entity Type"
                    value={logFilters.entity_type}
                    onChange={(e) => setLogFilters(prev => ({ ...prev, entity_type: e.target.value }))}
                  />
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={logFilters.start_date}
                    onChange={(e) => setLogFilters(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={logFilters.end_date}
                    onChange={(e) => setLogFilters(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <Button onClick={applyLogFilters} size="sm">Apply</Button>
                    <Button onClick={clearLogFilters} variant="outline" size="sm">Clear</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Logs Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  System Activity Logs ({systemLogs.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Time</th>
                        <th className="text-left p-2">User</th>
                        <th className="text-left p-2">Action</th>
                        <th className="text-left p-2">Description</th>
                        <th className="text-left p-2">IP Address</th>
                        <th className="text-left p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {systemLogs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1 text-gray-400" />
                              {formatDate(log.created_at)}
                            </div>
                          </td>
                          <td className="p-2">
                            {log.users ? (
                              <div>
                                <div className="font-medium">{log.users.nama}</div>
                                <div className="text-xs text-gray-500">{log.users.role}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">System</span>
                            )}
                          </td>
                          <td className="p-2">
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {log.action}
                            </code>
                          </td>
                          <td className="p-2 max-w-xs truncate" title={log.description}>
                            {log.description}
                          </td>
                          <td className="p-2">
                            <div className="flex items-center">
                              <Globe className="h-3 w-3 mr-1 text-gray-400" />
                              {log.ip_address}
                            </div>
                          </td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(log.status)}`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {systemLogs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No system logs found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Monitor className="h-5 w-5 mr-2" />
                  System Monitoring
                </CardTitle>
                <CardDescription>Real-time system status and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Database Status</p>
                        <p className="text-2xl font-bold text-green-900">Online</p>
                      </div>
                      <Database className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">API Status</p>
                        <p className="text-2xl font-bold text-blue-900">Active</p>
                      </div>
                      <Activity className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Face Recognition</p>
                        <p className="text-2xl font-bold text-purple-900">Ready</p>
                      </div>
                      <Eye className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">System Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Browser:</span>
                      <span className="ml-2 font-mono">{navigator.userAgent.split(' ')[0]}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Platform:</span>
                      <span className="ml-2 font-mono">{navigator.platform}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Language:</span>
                      <span className="ml-2 font-mono">{navigator.language}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Online:</span>
                      <span className="ml-2 font-mono">{navigator.onLine ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
