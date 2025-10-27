/**
 * Edit Model Page
 * หน้าแก้ไขข้อมูลรุ่นเครื่องขุด
 */

'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

// Types
interface Brand {
  id: string;
  name: string;
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
}

export default function EditModelPage() {
  const router = useRouter();
  const params = useParams();
  const modelId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [model, setModel] = useState<Model | null>(null);
  const [error, setError] = useState('');

  // Form state
  const [brandId, setBrandId] = useState('');
  const [modelName, setModelName] = useState('');
  const [hashrate, setHashrate] = useState('');
  const [powerUsage, setPowerUsage] = useState('');
  const [description, setDescription] = useState('');

  // โหลดข้อมูล
  useEffect(() => {
    fetchData();
  }, [modelId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // ดึงข้อมูลรุ่นและยี่ห้อ
      const [modelRes, brandsRes] = await Promise.all([
        api.get(`/api/models/${modelId}`),
        api.get('/api/brands'),
      ]);

      const modelData = modelRes.data.data;
      setModel(modelData);
      setBrands(brandsRes.data.data);

      // Set form values
      setBrandId(modelData.brandId);
      setModelName(modelData.modelName);
      setHashrate(modelData.hashrate || '');
      setPowerUsage(modelData.powerUsage || '');
      setDescription(modelData.description || '');
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  // Submit แก้ไข
  const handleSubmit = async (e: FormEvent) => {
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
      setSaving(true);
      setError('');

      await api.put(`/api/models/${modelId}`, {
        brandId,
        modelName: modelName.trim(),
        hashrate: hashrate.trim() || null,
        powerUsage: powerUsage.trim() || null,
        description: description.trim() || null,
      });

      alert('แก้ไขรุ่นเครื่องสำเร็จ');
      router.push('/models');
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถแก้ไขรุ่นเครื่องได้');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">กำลังโหลด...</div>
        </div>
      </div>
    );
  }

  if (error && !model) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
        <Link
          href="/models"
          className="inline-block mt-4 text-blue-600 hover:text-blue-700"
        >
          ← กลับไปหน้ารายการ
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/models" className="hover:text-blue-600">
            ยี่ห้อและรุ่นเครื่อง
          </Link>
          <span>/</span>
          <span>แก้ไข</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">แก้ไขรุ่นเครื่องขุด</h1>
        {model && (
          <p className="text-gray-600 mt-1">
            {model.brand.name} - {model.modelName}
          </p>
        )}
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
              placeholder="เช่น Antminer S19 Pro"
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
              placeholder="เช่น 110 TH/s"
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
              placeholder="เช่น 3250W"
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

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
            </button>
            <Link
              href="/models"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
            >
              ยกเลิก
            </Link>
          </div>
        </form>
      </div>

      {/* Info */}
      {model && (
        <div className="bg-gray-50 rounded-lg p-4 mt-6">
          <div className="text-sm text-gray-600">
            <div>
              สร้างเมื่อ:{' '}
              {new Date(model.brand.name).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

