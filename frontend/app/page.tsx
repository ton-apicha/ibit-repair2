/**
 * Homepage
 * หน้าแรกของระบบ - Redirect ไป dashboard (ถ้า login แล้ว) หรือ login
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Auto redirect
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="text-center space-y-6 p-8">
        {/* Logo/Icon */}
        <div className="text-6xl mb-4">⚙️</div>
        
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          ระบบซ่อมเครื่องขุด ASIC
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          ระบบจัดการซ่อมเครื่องขุดบิทคอยน์แบบครบวงจร
          <br />
          ตั้งแต่รับเครื่อง ติดตามสถานะ จัดการอะไหล่ ไปจนถึงส่งคืนลูกค้า
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link
            href="/login"
            className="btn-primary text-lg px-8 py-3"
          >
            เข้าสู่ระบบ
          </Link>
          
          <Link
            href="/dashboard"
            className="btn-secondary text-lg px-8 py-3"
          >
            Dashboard (Demo)
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="card text-center">
            <div className="text-3xl mb-2">📋</div>
            <h3 className="font-semibold mb-2">จัดการงานซ่อม</h3>
            <p className="text-sm text-gray-600">
              ติดตามสถานะงานซ่อมแบบ Real-time
            </p>
          </div>

          <div className="card text-center">
            <div className="text-3xl mb-2">📦</div>
            <h3 className="font-semibold mb-2">จัดการอะไหล่</h3>
            <p className="text-sm text-gray-600">
              ระบบสต็อกอะไหล่และแจ้งเตือนอัตโนมัติ
            </p>
          </div>

          <div className="card text-center">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold mb-2">รายงานและสถิติ</h3>
            <p className="text-sm text-gray-600">
              วิเคราะห์ข้อมูลการซ่อมและรายงานครบถ้วน
            </p>
          </div>
        </div>

        {/* Version Info */}
        <div className="mt-12 text-sm text-gray-500">
          Version 1.0.0 - Powered by Next.js 14
        </div>
      </div>
    </div>
  );
}

