/**
 * Parts Page
 * หน้าแสดงรายการอะไหล่ และแจ้งเตือนสต๊อกต่ำ
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';

interface Part {
  id: string;
  partNumber: string;
  partName: string;
  description: string | null;
  unitPrice: number;
  stockQty: number;
  minStockQty: number;
  location: string | null;
  _count: {
    jobParts: number;
  };
}

export default function PartsPage() {
  const { t } = useTranslation(['parts', 'common']);
  const user = useAuthStore((state) => state.user);
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  useEffect(() => {
    fetchParts();
  }, [showLowStockOnly]);

  const fetchParts = async () => {
    try {
      setLoading(true);
      setError('');

      const endpoint = showLowStockOnly ? '/api/parts/low-stock' : '/api/parts';
      const res = await api.get(endpoint);
      setParts(res.data.data);
    } catch (err: any) {
      console.error('Error fetching parts:', err);
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ต้องการลบอะไหล่ "${name}" หรือไม่?`)) return;

    try {
      await api.delete(`/api/parts/${id}`);
      alert('ลบอะไหล่สำเร็จ');
      fetchParts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถลบอะไหล่ได้');
    }
  };

  const filteredParts = parts.filter(
    (part) =>
      searchQuery === '' ||
      part.partNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.partName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockParts = parts.filter((p) => p.stockQty <= p.minStockQty);
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
            <h1 className="text-2xl font-bold text-gray-900">{t('parts:title')}</h1>
            <p className="text-gray-600 mt-1">
              {t('parts:part_list')}
            </p>
          </div>

          {canManage && (
            <Link
              href="/parts/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              + {t('parts:new_part')}
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Low Stock Alert */}
      {!showLowStockOnly && lowStockParts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-yellow-900">
                ⚠️ {t('parts:low_stock')}
              </h3>
              <p className="text-sm text-yellow-800 mt-1">
                {lowStockParts.length} {t('common:table.results')}
              </p>
            </div>
            <button
              onClick={() => setShowLowStockOnly(true)}
              className="text-yellow-900 hover:text-yellow-700 text-sm font-medium"
            >
              ดูรายการ →
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`${t('common:search')} ${t('parts:part_name')}...`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="lowStock"
              checked={showLowStockOnly}
              onChange={(e) => setShowLowStockOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="lowStock" className="text-sm text-gray-700">
              {t('parts:low_stock')}
            </label>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">{t('parts:title')}</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {parts.length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">{t('parts:low_stock')}</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">
            {lowStockParts.length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">มูลค่ารวม</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {parts
              .reduce((sum, p) => sum + p.stockQty * p.unitPrice, 0)
              .toLocaleString()}
            ฿
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">ผลการค้นหา</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {filteredParts.length}
          </div>
        </div>
      </div>

      {/* Parts Table */}
      {filteredParts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-gray-500 mb-2">ไม่พบข้อมูล</div>
          {canManage && (
            <Link href="/parts/new" className="text-blue-600 hover:text-blue-700">
              เพิ่มอะไหล่ใหม่
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    {t('parts:part_number')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    {t('parts:part_name')}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    {t('parts:unit_price')}
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    {t('parts:stock_quantity')}
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    {t('common:status')}
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                    {t('common:nav.jobs')}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                    {t('common:actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredParts.map((part) => {
                  const isLowStock = part.stockQty <= part.minStockQty;
                  return (
                    <tr
                      key={part.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/parts/${part.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {part.partNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {part.partName}
                        </div>
                        {part.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            {part.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {part.unitPrice.toLocaleString()}฿
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`font-medium ${
                            isLowStock ? 'text-red-600' : 'text-gray-900'
                          }`}
                        >
                          {part.stockQty}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {' '}
                          / {part.minStockQty}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isLowStock ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            ⚠️ ต่ำ
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ พอเพียง
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700">
                        {part._count.jobParts} ครั้ง
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/parts/${part.id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            ดู
                          </Link>
                          {canManage && (
                            <>
                              <Link
                                href={`/parts/${part.id}/edit`}
                                className="text-blue-600 hover:text-blue-700 text-sm"
                              >
                                แก้ไข
                              </Link>
                              {user?.role === 'ADMIN' && (
                                <button
                                  onClick={() =>
                                    handleDelete(part.id, part.partName)
                                  }
                                  className="text-red-600 hover:text-red-700 text-sm"
                                >
                                  ลบ
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

