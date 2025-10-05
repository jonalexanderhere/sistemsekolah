"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Log to system logs if available
    if (typeof window !== 'undefined') {
      // Try to log to API
      fetch('/api/system/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: 'error',
          message: `Frontend Error: ${error.message}`,
          details: {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack
          }
        })
      }).catch(logError => {
        console.error('Failed to log error:', logError);
      });
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-600">Terjadi Kesalahan</CardTitle>
              <CardDescription>
                Maaf, terjadi kesalahan yang tidak terduga. Sistem akan mencoba memperbaikinya.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-600 font-medium">Error Details:</p>
                <p className="text-sm text-red-500 mt-1">
                  {this.state.error?.message || 'Unknown error occurred'}
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={this.handleReset} variant="outline" className="flex-1">
                  Coba Lagi
                </Button>
                <Button onClick={this.handleReload} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Muat Ulang
                </Button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                Jika masalah berlanjut, silakan hubungi administrator sistem.
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo);

    // Log to system
    if (typeof window !== 'undefined') {
      fetch('/api/system/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: 'error',
          message: `Hook Error: ${error.message}`,
          details: {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo?.componentStack
          }
        })
      }).catch(logError => {
        console.error('Failed to log error:', logError);
      });
    }
  };
}
