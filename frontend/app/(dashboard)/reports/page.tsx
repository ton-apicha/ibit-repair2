/**
 * Reports Page
 * หน้ารายงานและสถิติ
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';

export default function ReportsPage() {
  const router = useRouter();
  const { t } = useTranslation(['reports', 'common']);
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(false);
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-600">{t('common:loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">📊 {t('reports:title')}</h1>
        <p className="text-gray-600 mt-1">
          {t('common:app_name')}
        </p>
      </div>

      {/* Coming Soon */}
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          หน้ารายงานกำลังพัฒนา
        </h2>
        <p className="text-gray-600 mb-4">
          ฟีเจอร์นี้จะเปิดใช้งานในเร็วๆ นี้
        </p>
        <div className="text-sm text-gray-500">
          รายงานที่จะมี: สถิติงานซ่อม, รายได้, การใช้อะไหล่, ประสิทธิภาพช่าง
        </div>
      </div>
    </div>
  );
}
