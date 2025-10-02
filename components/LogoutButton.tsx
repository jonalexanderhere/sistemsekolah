"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface LogoutButtonProps {
  onLogout?: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showText?: boolean;
}

export default function LogoutButton({ 
  onLogout, 
  variant = 'outline', 
  size = 'default',
  className = '',
  showText = true 
}: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Log system activity
      await logSystemActivity('user_logout', 'User logged out');

      // Clear all user data from localStorage and sessionStorage
      localStorage.removeItem('user');
      localStorage.removeItem('loginData');
      localStorage.removeItem('authToken');
      localStorage.removeItem('userSession');
      sessionStorage.clear();

      // Clear any cached data
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // Call parent logout handler
      if (onLogout) {
        onLogout();
      }

      toast({
        title: "Logout Berhasil",
        description: "Anda telah keluar dari sistem dengan aman.",
      });

      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);

    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat logout. Akan redirect ke halaman utama.",
        variant: "destructive"
      });
      
      // Force redirect even if error occurs
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } finally {
      setIsLoggingOut(false);
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
          entity_type: 'user_session',
          ip_address: await getUserIP(),
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }),
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  // Get user IP address
  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      return 'unknown';
    }
  };

  if (size === 'icon') {
    return (
      <Button
        onClick={handleLogout}
        disabled={isLoggingOut}
        variant={variant}
        size={size}
        className={className}
        title="Logout"
      >
        {isLoggingOut ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoggingOut}
      variant={variant}
      size={size}
      className={`${className} flex items-center gap-2`}
    >
      {isLoggingOut ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      {showText && (isLoggingOut ? 'Logging out...' : 'Logout')}
    </Button>
  );
}
