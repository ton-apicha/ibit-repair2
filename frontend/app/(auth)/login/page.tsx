/**
 * Login Page
 * หน้าเข้าสู่ระบบ
 */

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation(['auth', 'common']);
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showDebug, setShowDebug] = useState(false);

  // Debug info
  const debugInfo = typeof window !== 'undefined' ? {
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    port: window.location.port,
    apiUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:4000'
      : `http://${window.location.hostname}:4000`,
  } : null;

  /**
   * Handle Login Submit
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // 🐛 DEBUG: แสดงข้อมูลการ login
    console.log('🔐 Login Attempt:');
    console.log('  Username:', username);
    console.log('  Hostname:', window.location.hostname);
    console.log('  Timestamp:', new Date().toISOString());

    // ตรวจสอบว่ากรอกครบหรือไม่
    if (!username || !password) {
      setError(t('auth:invalid_credentials'));
      return;
    }

    try {
      // เรียก login function จาก store
      await login(username, password);

      console.log('✅ Login Success! Redirecting to dashboard...');
      
      // ถ้า login สำเร็จ redirect ไป dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('❌ Login Failed:');
      console.error('  Error Object:', err);
      console.error('  Error Type:', typeof err);
      
      // สร้าง error message ที่ละเอียด
      let errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      
      if (err.response) {
        // มี response จาก server
        errorMessage = err.response.data?.message || errorMessage;
      } else if (err.request) {
        // ไม่ได้รับ response (network error)
        errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
      } else {
        // Error อื่นๆ
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="card p-8">
          {/* Language Switcher */}
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>

          {/* Logo/Icon */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">⚙️</div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('common:app_name')}
            </h1>
            <p className="text-gray-600 mt-2">{t('auth:login.please_login')}</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t('auth:login.username')}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="admin"
                autoComplete="username"
                autoFocus
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t('auth:login.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? t('common:loading') : t('auth:login.login_button')}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-medium mb-2">
              ข้อมูลสำหรับทดสอบ:
            </p>
            <div className="space-y-1 text-xs text-gray-700">
              <div>
                <span className="font-medium">Admin:</span> admin / admin123
              </div>
              <div>
                <span className="font-medium">Technician:</span> technician1 /
                tech123
              </div>
            </div>
          </div>

          {/* Debug Toggle */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showDebug ? '🔼 ซ่อน Debug' : '🐛 Debug Info'}
            </button>
          </div>

          {/* Debug Info */}
          {showDebug && debugInfo && (
            <div className="mt-4 p-4 bg-gray-900 text-gray-100 rounded-lg">
              <div className="font-bold text-yellow-400 mb-2 text-xs">
                🐛 Debug Information
              </div>
              <div className="space-y-1 text-xs font-mono">
                <div>
                  <span className="text-gray-400">Frontend:</span>{' '}
                  {debugInfo.protocol}//{debugInfo.hostname}:
                  {debugInfo.port || '3000'}
                </div>
                <div>
                  <span className="text-gray-400">API URL:</span>{' '}
                  <span className="text-green-400">{debugInfo.apiUrl}</span>
                </div>
                <div className="text-yellow-400 mt-2 pt-2 border-t border-gray-700">
                  💡 เปิด Console (F12) เพื่อดู logs ละเอียด
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Version 1.0.0 - IBIT Repair System
        </p>
      </div>
    </div>
  );
}

