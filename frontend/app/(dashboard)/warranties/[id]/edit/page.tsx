/**
 * Edit Warranty Page
 * หน้าแก้ไขโปรไฟล์การรับประกัน
 */

'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Warranty {
  id: string;
  name: string;
  durationDays: number;
  description: string | null;
  terms: string | null;
  laborWarranty: boolean;
  partsWarranty: boolean;
  isActive: boolean;
}

export default function EditWarrantyPage() {
  const router = useRouter();
  const params = useParams();
  const warrantyId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [warranty, setWarranty] = useState<Warranty | null>(null);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [description, setDescription] = useState('');
  const [terms, setTerms] = useState('');
  const [laborWarranty, setLaborWarranty] = useState(true);
  const [partsWarranty, setPartsWarranty] = useState(true);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchWarranty();
  }, [warrantyId]);

  const fetchWarranty = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await api.get(`/api/warranties/${warrantyId}`);
      const data = res.data.data;
      setWarranty(data);

      // Set form values
      setName(data.name);
      setDurationDays(data.durationDays.toString());
      setDescription(data.description || '');
      setTerms(data.terms || '');
      setLaborWarranty(data.laborWarranty);
      setPartsWarranty(data.partsWarranty);
      setIsActive(data.isActive);
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

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
      setSaving(true);
      setError('');

      await api.put(`/api/warranties/${warrantyId}`, {
        name: name.trim(),
        durationDays: parseInt(durationDays),
        description: description.trim() || null,
        terms: terms.trim() || null,
        laborWarranty,
        partsWarranty,
        isActive,
      });

      alert('แก้ไขโปรไฟล์สำเร็จ');
      router.push('/warranties');
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถแก้ไขโปรไฟล์ได้');
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

  if (error && !warranty) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
        <Link
          href="/warranties"
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
          <Link href="/warranties" className="hover:text-blue-600">
            โปรไฟล์การรับประกัน
          </Link>
          <span>/</span>
          <span>แก้ไข</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          แก้ไขโปรไฟล์การรับประกัน
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
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* คำอธิบาย */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              คำอธิบาย
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* การครอบคลุม */}
          <div className="mb-4">
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
                <label htmlFor="laborWarranty" className="ml-3 text-sm text-gray-700">
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
                <label htmlFor="partsWarranty" className="ml-3 text-sm text-gray-700">
                  รับประกันอะไหล่
                </label>
              </div>
            </div>
          </div>

          {/* สถานะ */}
          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="ml-3 text-sm text-gray-700">
                เปิดใช้งานโปรไฟล์นี้
              </label>
            </div>
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

