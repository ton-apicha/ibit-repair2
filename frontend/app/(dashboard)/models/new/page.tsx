/**
 * New Model Page
 * หน้าเพิ่มยี่ห้อและรุ่นเครื่องขุดใหม่
 */

'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

// Types
interface Brand {
  id: string;
  name: string;
}

export default function NewModelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [error, setError] = useState('');

  // Form state
  const [mode, setMode] = useState<'brand' | 'model'>('model');
  const [brandName, setBrandName] = useState('');
  const [brandId, setBrandId] = useState('');
  const [modelName, setModelName] = useState('');
  const [hashrate, setHashrate] = useState('');
  const [powerUsage, setPowerUsage] = useState('');
  const [description, setDescription] = useState('');

  // โหลดยี่ห้อทั้งหมด
  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await api.get('/api/brands');
      setBrands(res.data.data);
    } catch (err) {
      console.error('Error fetching brands:', err);
    }
  };

  // Submit สร้างยี่ห้อใหม่
  const handleCreateBrand = async (e: FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      setError('กรุณากรอกชื่อยี่ห้อ');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await api.post('/api/brands', {
        name: brandName.trim(),
      });

      alert('สร้างยี่ห้อสำเร็จ');
      
      // Refresh brands และ clear form
      await fetchBrands();
      setBrandName('');
      setMode('model');
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถสร้างยี่ห้อได้');
    } finally {
      setLoading(false);
    }
  };

  // Submit สร้างรุ่นใหม่
  const handleCreateModel = async (e: FormEvent) => {
    e.preventDefault();
    if (!brandId) {
      setError('กรุณาเลือกยี่ห้อ');
      return;
    }
    if (!modelName.trim()) {
      setError('กรุณากรอกชื่อรุ่นเครื่อง');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await api.post('/api/models', {
        brandId,
        modelName: modelName.trim(),
        hashrate: hashrate.trim() || null,
        powerUsage: powerUsage.trim() || null,
        description: description.trim() || null,
      });

      alert('สร้างรุ่นเครื่องสำเร็จ');
      router.push('/models');
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถสร้างรุ่นเครื่องได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/models" className="hover:text-blue-600">
            ยี่ห้อและรุ่นเครื่อง
          </Link>
          <span>/</span>
          <span>เพิ่มใหม่</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          เพิ่มยี่ห้อและรุ่นเครื่องขุด
        </h1>
      </div>

      {/* Mode Selector */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setMode('model')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              mode === 'model'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            เพิ่มรุ่นเครื่อง
          </button>
          <button
            onClick={() => setMode('brand')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              mode === 'brand'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            เพิ่มยี่ห้อใหม่
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Form: สร้างยี่ห้อ */}
        {mode === 'brand' && (
          <form onSubmit={handleCreateBrand}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อยี่ห้อ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="เช่น Bitmain, MicroBT, Canaan"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                ใส่ชื่อยี่ห้อเครื่องขุด (ภาษาอังกฤษ)
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {loading ? 'กำลังสร้าง...' : 'สร้างยี่ห้อ'}
              </button>
              <Link
                href="/models"
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
              >
                ยกเลิก
              </Link>
            </div>
          </form>
        )}

        {/* Form: สร้างรุ่นเครื่อง */}
        {mode === 'model' && (
          <form onSubmit={handleCreateModel}>
            {/* ยี่ห้อ */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ยี่ห้อ <span className="text-red-500">*</span>
              </label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">-- เลือกยี่ห้อ --</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
              {brands.length === 0 && (
                <p className="text-sm text-red-500 mt-1">
                  ยังไม่มียี่ห้อในระบบ กรุณาสร้างยี่ห้อก่อน
                </p>
              )}
            </div>

            {/* ชื่อรุ่น */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อรุ่น <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="เช่น Antminer S19 Pro, Whatsminer M30S++"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Hashrate */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hashrate
              </label>
              <input
                type="text"
                value={hashrate}
                onChange={(e) => setHashrate(e.target.value)}
                placeholder="เช่น 110 TH/s, 9500 MH/s"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Power Usage */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Power Usage
              </label>
              <input
                type="text"
                value={powerUsage}
                onChange={(e) => setPowerUsage(e.target.value)}
                placeholder="เช่น 3250W, 3472W"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* คำอธิบาย */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                คำอธิบาย
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="คำอธิบายเพิ่มเติม..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || brands.length === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {loading ? 'กำลังสร้าง...' : 'สร้างรุ่นเครื่อง'}
              </button>
              <Link
                href="/models"
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
              >
                ยกเลิก
              </Link>
            </div>
          </form>
        )}
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">💡 คำแนะนำ</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• ถ้ายังไม่มียี่ห้อที่ต้องการ ให้เพิ่มยี่ห้อก่อน</li>
          <li>• Hashrate และ Power Usage สามารถกรอกภายหลังได้</li>
          <li>• ชื่อรุ่นควรระบุให้ชัดเจน เช่น S19 Pro, S19j Pro, M30S++</li>
        </ul>
      </div>
    </div>
  );
}

