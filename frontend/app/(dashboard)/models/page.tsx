/**
 * Models Page
 * หน้าแสดงรายการยี่ห้อและรุ่นเครื่องขุด
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';

// Types
interface Brand {
  id: string;
  name: string;
  modelsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Model {
  id: string;
  brandId: string;
  modelName: string;
  hashrate: string | null;
  powerUsage: string | null;
  description: string | null;
  brand: {
    id: string;
    name: string;
  };
  _count: {
    jobs: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ModelsPage() {
  const { t } = useTranslation(['models', 'common']);
  const user = useAuthStore((state) => state.user);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // โหลดข้อมูล
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // ดึงยี่ห้อและรุ่นพร้อมกัน
      const [brandsRes, modelsRes] = await Promise.all([
        api.get('/api/brands'),
        api.get('/api/models'),
      ]);

      setBrands(brandsRes.data.data);
      setModels(modelsRes.data.data);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  // ลบยี่ห้อ
  const handleDeleteBrand = async (brandId: string, brandName: string) => {
    if (!confirm(`ต้องการลบยี่ห้อ "${brandName}" หรือไม่?`)) {
      return;
    }

    try {
      await api.delete(`/api/brands/${brandId}`);
      alert('ลบยี่ห้อสำเร็จ');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถลบยี่ห้อได้');
    }
  };

  // ลบรุ่น
  const handleDeleteModel = async (modelId: string, modelName: string) => {
    if (!confirm(`ต้องการลบรุ่น "${modelName}" หรือไม่?`)) {
      return;
    }

    try {
      await api.delete(`/api/models/${modelId}`);
      alert('ลบรุ่นเครื่องสำเร็จ');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถลบรุ่นเครื่องได้');
    }
  };

  // Filter รุ่นตามยี่ห้อที่เลือก
  const filteredModels = models.filter((model) => {
    const matchBrand =
      selectedBrandId === 'all' || model.brandId === selectedBrandId;
    const matchSearch =
      searchQuery === '' ||
      model.modelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.brand.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchBrand && matchSearch;
  });

  // Group รุ่นตามยี่ห้อ
  const groupedModels = filteredModels.reduce((acc, model) => {
    if (!acc[model.brand.name]) {
      acc[model.brand.name] = [];
    }
    acc[model.brand.name].push(model);
    return acc;
  }, {} as Record<string, Model[]>);

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
              {t('models:title')}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('models:model_list')}
            </p>
          </div>

          {canManage && (
            <Link
              href="/models/new"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              + เพิ่มยี่ห้อ/รุ่น
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('common:search')}
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`${t('common:search')}...`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Brand Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              กรองตามยี่ห้อ
            </label>
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t('common:filter')}</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name} ({brand.modelsCount} รุ่น)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">{t('models:brand')}</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {brands.length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">{t('models:title')}</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {models.length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-600">{t('common:table.results')}</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {filteredModels.length}
          </div>
        </div>
      </div>

      {/* Models List (Grouped by Brand) */}
      {Object.keys(groupedModels).length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-gray-500 mb-2">ไม่พบข้อมูล</div>
          {canManage && (
            <Link
              href="/models/new"
              className="text-blue-600 hover:text-blue-700"
            >
              + {t('models:new_model')}
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedModels)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([brandName, brandModels]) => (
              <div key={brandName} className="bg-white rounded-lg shadow-sm p-6">
                {/* Brand Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <h2 className="text-xl font-bold text-gray-900">
                    {brandName}
                  </h2>
                  <span className="text-sm text-gray-600">
                    {brandModels.length} รุ่น
                  </span>
                </div>

                {/* Models Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          รุ่น
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Hashrate
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Power
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          งานซ่อม
                        </th>
                        {canManage && (
                          <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                            จัดการ
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {brandModels.map((model) => (
                        <tr
                          key={model.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">
                              {model.modelName}
                            </div>
                            {model.description && (
                              <div className="text-sm text-gray-500 mt-1">
                                {model.description}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {model.hashrate || '-'}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {model.powerUsage || '-'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {model._count.jobs} งาน
                            </span>
                          </td>
                          {canManage && (
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/models/${model.id}/edit`}
                                  className="text-blue-600 hover:text-blue-700 text-sm"
                                >
                                  แก้ไข
                                </Link>
                                {user?.role === 'ADMIN' && (
                                  <button
                                    onClick={() =>
                                      handleDeleteModel(
                                        model.id,
                                        model.modelName
                                      )
                                    }
                                    className="text-red-600 hover:text-red-700 text-sm"
                                  >
                                    ลบ
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

