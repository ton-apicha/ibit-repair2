/**
 * Warranties Page
 * หน้าแสดงรายการโปรไฟล์การรับประกัน
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';

// Types
interface Warranty {
  id: string;
  name: string;
  durationDays: number;
  description: string | null;
  terms: string | null;
  laborWarranty: boolean;
  partsWarranty: boolean;
  isActive: boolean;
  _count: {
    jobs: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function WarrantiesPage() {
  const { t } = useTranslation(['warranties', 'common']);
  const user = useAuthStore((state) => state.user);
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // โหลดข้อมูล
  useEffect(() => {
    fetchWarranties();
  }, []);

  const fetchWarranties = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await api.get('/api/warranties');
      setWarranties(res.data.data);
    } catch (err: any) {
      console.error('Error fetching warranties:', err);
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  // ลบโปรไฟล์
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ต้องการลบโปรไฟล์ "${name}" หรือไม่?`)) {
      return;
    }

    try {
      await api.delete(`/api/warranties/${id}`);
      alert('ลบโปรไฟล์สำเร็จ');
      fetchWarranties();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถลบโปรไฟล์ได้');
    }
  };

  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">กำลังโหลด...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('warranties:title')}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('warranties:warranty_list')}
            </p>
          </div>

          {canManage && (
            <Link
              href="/warranties/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              + {t('warranties:new_warranty')}
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">โปรไฟล์ทั้งหมด</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {warranties.length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">ใช้งานอยู่</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {warranties.filter((w) => w.isActive).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">จำนวนงานที่ใช้</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {warranties.reduce((sum, w) => sum + w._count.jobs, 0)}
          </div>
        </div>
      </div>

      {/* Warranties List */}
      {warranties.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-gray-500 mb-2">{t('common:table.no_data')}</div>
          {canManage && (
            <Link
              href="/warranties/new"
              className="text-blue-600 hover:text-blue-700"
            >
              + {t('warranties:new_warranty')}
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {warranties.map((warranty) => (
            <div
              key={warranty.id}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:border-blue-300 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {warranty.name}
                  </h3>
                  {warranty.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {warranty.description}
                    </p>
                  )}
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    warranty.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {warranty.isActive ? 'ใช้งาน' : 'ปิด'}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                {/* Duration */}
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 text-sm">{t('warranties:duration')}:</span>
                  <span className="font-medium text-gray-900">
                    {warranty.durationDays === 0
                      ? 'ไม่รับประกัน'
                      : `${warranty.durationDays} วัน`}
                  </span>
                </div>

                {/* Coverage */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">ค่าแรง:</span>
                    <span
                      className={`text-sm font-medium ${
                        warranty.laborWarranty
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {warranty.laborWarranty ? '✓ รับ' : '✗ ไม่รับ'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">อะไหล่:</span>
                    <span
                      className={`text-sm font-medium ${
                        warranty.partsWarranty
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {warranty.partsWarranty ? '✓ รับ' : '✗ ไม่รับ'}
                    </span>
                  </div>
                </div>

                {/* Terms */}
                {warranty.terms && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-700 italic">
                      {warranty.terms}
                    </p>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  ใช้ในงานซ่อม:{' '}
                  <span className="font-medium text-gray-900">
                    {warranty._count.jobs} งาน
                  </span>
                </div>

                {canManage && (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/warranties/${warranty.id}/edit`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      แก้ไข
                    </Link>
                    {user?.role === 'ADMIN' && (
                      <button
                        onClick={() => handleDelete(warranty.id, warranty.name)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        ลบ
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

