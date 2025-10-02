"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  GraduationCap, 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings,
  Calendar,
  Camera,
  ClipboardList,
  Award,
  Bell
} from 'lucide-react';

interface User {
  id: string;
  nama: string;
  role: 'admin' | 'guru' | 'siswa';
  nisn?: string;
  identitas?: string;
  email?: string;
  class_name?: string;
  has_face?: boolean;
}

interface RoleBasedWelcomeProps {
  user: User;
}

export default function RoleBasedWelcome({ user }: RoleBasedWelcomeProps) {
  const router = useRouter();

  const getRoleIcon = () => {
    switch (user.role) {
      case 'admin':
        return <Shield className="h-8 w-8 text-red-600" />;
      case 'guru':
        return <GraduationCap className="h-8 w-8 text-blue-600" />;
      case 'siswa':
        return <BookOpen className="h-8 w-8 text-green-600" />;
      default:
        return <Users className="h-8 w-8 text-gray-600" />;
    }
  };

  const getRoleColor = () => {
    switch (user.role) {
      case 'admin':
        return 'from-red-500 to-red-600';
      case 'guru':
        return 'from-blue-500 to-blue-600';
      case 'siswa':
        return 'from-green-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getRoleTitle = () => {
    switch (user.role) {
      case 'admin':
        return 'Administrator Dashboard';
      case 'guru':
        return 'Teacher Dashboard';
      case 'siswa':
        return 'Student Portal';
      default:
        return 'User Dashboard';
    }
  };

  const getQuickActions = () => {
    switch (user.role) {
      case 'admin':
        return [
          {
            title: 'Admin Dashboard',
            description: 'System management & monitoring',
            icon: <Shield className="h-6 w-6" />,
            action: () => router.push('/admin-dashboard'),
            color: 'bg-red-100 text-red-600'
          },
          {
            title: 'User Management',
            description: 'Manage users & permissions',
            icon: <Users className="h-6 w-6" />,
            action: () => router.push('/users'),
            color: 'bg-purple-100 text-purple-600'
          },
          {
            title: 'System Settings',
            description: 'Configure system settings',
            icon: <Settings className="h-6 w-6" />,
            action: () => router.push('/settings'),
            color: 'bg-gray-100 text-gray-600'
          },
          {
            title: 'Attendance Reports',
            description: 'View attendance analytics',
            icon: <BarChart3 className="h-6 w-6" />,
            action: () => router.push('/attendance'),
            color: 'bg-blue-100 text-blue-600'
          }
        ];

      case 'guru':
        return [
          {
            title: 'Teacher Dashboard',
            description: 'Teaching tools & analytics',
            icon: <GraduationCap className="h-6 w-6" />,
            action: () => router.push('/teacher-dashboard'),
            color: 'bg-blue-100 text-blue-600'
          },
          {
            title: 'Manage Exams',
            description: 'Create & manage exams',
            icon: <ClipboardList className="h-6 w-6" />,
            action: () => router.push('/teacher-dashboard/exams'),
            color: 'bg-green-100 text-green-600'
          },
          {
            title: 'Student Data',
            description: 'View student information',
            icon: <Users className="h-6 w-6" />,
            action: () => router.push('/users'),
            color: 'bg-purple-100 text-purple-600'
          },
          {
            title: 'Attendance',
            description: 'Monitor student attendance',
            icon: <Calendar className="h-6 w-6" />,
            action: () => router.push('/attendance'),
            color: 'bg-orange-100 text-orange-600'
          }
        ];

      case 'siswa':
        return [
          {
            title: 'My Attendance',
            description: 'View your attendance record',
            icon: <Calendar className="h-6 w-6" />,
            action: () => router.push('/attendance'),
            color: 'bg-blue-100 text-blue-600'
          },
          {
            title: 'Face Registration',
            description: user.has_face ? 'Update face data' : 'Register your face',
            icon: <Camera className="h-6 w-6" />,
            action: () => router.push('/face-register'),
            color: 'bg-green-100 text-green-600'
          },
          {
            title: 'Face Attendance',
            description: 'Mark attendance with face',
            icon: <Camera className="h-6 w-6" />,
            action: () => router.push('/face-attendance'),
            color: 'bg-orange-100 text-orange-600'
          },
          {
            title: 'Announcements',
            description: 'View latest announcements',
            icon: <Bell className="h-6 w-6" />,
            action: () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }),
            color: 'bg-purple-100 text-purple-600'
          }
        ];

      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className={`bg-gradient-to-r ${getRoleColor()} p-6 text-white`}>
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              {getRoleIcon()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{getRoleTitle()}</h1>
              <p className="text-white/90">Selamat datang, {user.nama}!</p>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Role:</span>
              <span className="ml-2 capitalize">{user.role}</span>
            </div>
            {user.nisn && (
              <div>
                <span className="font-medium text-gray-600">
                  {user.role === 'siswa' ? 'NISN:' : 'NIP:'}
                </span>
                <span className="ml-2">{user.nisn}</span>
              </div>
            )}
            {user.email && (
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <span className="ml-2">{user.email}</span>
              </div>
            )}
            {user.class_name && (
              <div>
                <span className="font-medium text-gray-600">Class:</span>
                <span className="ml-2">{user.class_name}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {getQuickActions().map((action, index) => (
            <Card 
              key={index}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 shadow-md"
              onClick={action.action}
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${action.color}`}>
                    {action.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Role-specific Information */}
      {user.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Administrator Privileges
            </CardTitle>
            <CardDescription>
              You have full system access and administrative privileges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <Users className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="font-medium">User Management</p>
                <p className="text-sm text-gray-600">Full control over users</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium">System Analytics</p>
                <p className="text-sm text-gray-600">Complete system insights</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Settings className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium">System Configuration</p>
                <p className="text-sm text-gray-600">Configure all settings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {user.role === 'guru' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Teacher Tools
            </CardTitle>
            <CardDescription>
              Access teaching tools and student management features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <ClipboardList className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium">Exam Management</p>
                <p className="text-sm text-gray-600">Create and manage exams</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium">Student Progress</p>
                <p className="text-sm text-gray-600">Track student performance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {user.role === 'siswa' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              Student Information
            </CardTitle>
            <CardDescription>
              Your academic information and tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-medium">Attendance Status</p>
                <p className="text-sm text-gray-600">
                  Face: {user.has_face ? 'Registered ✓' : 'Not Registered ✗'}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium">Class Information</p>
                <p className="text-sm text-gray-600">{user.class_name || 'Not Assigned'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
