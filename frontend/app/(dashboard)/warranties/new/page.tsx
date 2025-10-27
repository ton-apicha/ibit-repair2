/**
 * New Warranty Page
 * หน้าเพิ่มโปรไฟล์การรับประกันใหม่
 */

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function NewWarrantyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [description, setDescription] = useState('');
  const [terms, setTerms] = useState('');
  const [laborWarranty, setLaborWarranty] = useState(true);
  const [partsWarranty, setPartsWarranty] = useState(true);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('กรุณากรอกชื่อโปรไฟล์');
      return;
    }
    if (!durationDays || parseInt(durationDays) < 0) {
      setError('กรุณาระบุระยะเวลารับประกัน');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await api.post('/api/warranties', {
        name: name.trim(),
        durationDays: parseInt(durationDays),
        description: description.trim() || null,
        terms: terms.trim() || null,
        laborWarranty,
        partsWarranty,
      });

      alert('สร้างโปรไฟล์การรับประกันสำเร็จ');
      router.push('/warranties');
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถสร้างโปรไฟล์ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/warranties" className="hover:text-blue-600">
            โปรไฟล์การรับประกัน
          </Link>
          <span>/</span>
          <span>เพิ่มใหม่</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          เพิ่มโปรไฟล์การรับประกัน
        </h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ชื่อโปรไฟล์ */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อโปรไฟล์ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น รับประกัน 30 วัน, ไม่รับประกัน"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* ระยะเวลา */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ระยะเวลารับประกัน (วัน) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              placeholder="0 = ไม่รับประกัน"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              ใส่ 0 สำหรับไม่รับประกัน
            </p>
          </div>

          {/* คำอธิบาย */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              คำอธิบาย
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="คำอธิบายสั้นๆ เกี่ยวกับโปรไฟล์นี้"
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* เงื่อนไขการรับประกัน */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เงื่อนไขการรับประกัน
            </label>
            <textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="ระบุเงื่อนไขและข้อกำหนดการรับประกัน"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* การครอบคลุม */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              การครอบคลุม
            </label>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="laborWarranty"
                  checked={laborWarranty}
                  onChange={(e) => setLaborWarranty(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="laborWarranty"
                  className="ml-3 text-sm text-gray-700"
                >
                  รับประกันค่าแรง
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="partsWarranty"
                  checked={partsWarranty}
                  onChange={(e) => setPartsWarranty(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="partsWarranty"
                  className="ml-3 text-sm text-gray-700"
                >
                  รับประกันอะไหล่
                </label>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {loading ? 'กำลังสร้าง...' : 'สร้างโปรไฟล์'}
            </button>
            <Link
              href="/warranties"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
            >
              ยกเลิก
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

