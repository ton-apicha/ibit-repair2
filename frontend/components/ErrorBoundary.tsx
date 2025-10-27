/**
 * Error Boundary Component
 * จัดการ error ที่เกิดขึ้นใน React components
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import logger from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error Boundary Class Component
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error
    logger.error('React Error Boundary caught an error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'ErrorBoundary',
    });

    // Update state with error info
    this.state = {
      hasError: true,
      error,
      errorInfo,
    };

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return <DefaultErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

/**
 * Default Error Fallback Component
 */
interface ErrorFallbackProps {
  error?: Error;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error }) => {
  const handleRetry = () => {
    window.location.reload();
  };

  const handleReportError = () => {
    if (error) {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };

      // Send error report to server
      fetch('/api/error-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorReport),
      }).catch((err) => {
        console.error('Failed to send error report:', err);
      });

      logger.info('Error report sent', errorReport);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          {/* Error Message */}
          <h1 className="text-lg font-semibold text-gray-900 mb-2">
            เกิดข้อผิดพลาด
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && error && (
            <div className="mb-4 p-3 bg-gray-100 rounded-md text-left">
              <details>
                <summary className="cursor-pointer text-sm font-medium text-gray-700">
                  รายละเอียดข้อผิดพลาด
                </summary>
                <div className="mt-2 text-xs text-gray-600">
                  <pre className="whitespace-pre-wrap overflow-auto max-h-32">
                    {error.message}
                    {error.stack && `\n\n${error.stack}`}
                  </pre>
                </div>
              </details>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleRetry}
              className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              ลองใหม่
            </button>
            
            <button
              onClick={handleReportError}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              รายงานข้อผิดพลาด
            </button>

            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              กลับหน้าก่อนหน้า
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-4 text-xs text-gray-500">
            หากปัญหายังคงเกิดขึ้น กรุณาติดต่อผู้ดูแลระบบ
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Hook สำหรับจัดการ error ใน functional components
 */
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: any) => {
    logger.error('Error caught by error handler', {
      error: error.message,
      stack: error.stack,
      errorInfo,
    });
  };

  return { handleError };
};

/**
 * HOC สำหรับ wrap component ด้วย Error Boundary
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorBoundary;
