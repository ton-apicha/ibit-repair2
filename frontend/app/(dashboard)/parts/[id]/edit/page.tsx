/**
 * Edit Part Page
 * หน้าแก้ไขข้อมูลอะไหล่
 */

'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
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
}

export default function EditPartPage() {
  const router = useRouter();
  const params = useParams();
  const partId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [part, setPart] = useState<Part | null>(null);
  const [error, setError] = useState('');

  // Form state
  const [partNumber, setPartNumber] = useState('');
  const [partName, setPartName] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [minStockQty, setMinStockQty] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    fetchPart();
  }, [partId]);

  const fetchPart = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await api.get(`/api/parts/${partId}`);
      const data = res.data.data;
      setPart(data);

      // Set form values
      setPartNumber(data.partNumber);
      setPartName(data.partName);
      setDescription(data.description || '');
      setUnitPrice(data.unitPrice.toString());
      setMinStockQty(data.minStockQty.toString());
      setLocation(data.location || '');
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!partNumber.trim() || !partName.trim() || !unitPrice) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    try {
      setSaving(true);
      setError('');

      await api.put(`/api/parts/${partId}`, {
        partNumber: partNumber.trim(),
        partName: partName.trim(),
        description: description.trim() || null,
        unitPrice: parseFloat(unitPrice),
        minStockQty: parseInt(minStockQty),
        location: location.trim() || null,
      });

      alert('แก้ไขอะไหล่สำเร็จ');
      router.push(`/parts/${partId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถแก้ไขอะไหล่ได้');
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

  if (error && !part) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
        <Link
          href="/parts"
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
          <Link href="/parts" className="hover:text-blue-600">
            คลังอะไหล่
          </Link>
          <span>/</span>
          <Link href={`/parts/${partId}`} className="hover:text-blue-600">
            {part?.partNumber}
          </Link>
          <span>/</span>
          <span>แก้ไข</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">แก้ไขข้อมูลอะไหล่</h1>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* รหัสอะไหล่ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รหัสอะไหล่ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* ชื่ออะไหล่ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่ออะไหล่ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* ราคาต่อหน่วย */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ราคาต่อหน่วย (บาท) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* ตำแหน่งจัดเก็บ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ตำแหน่งจัดเก็บ
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="เช่น A-01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* สต๊อกต่ำสุด */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                แจ้งเตือนเมื่อสต๊อกต่ำกว่า
              </label>
              <input
                type="number"
                value={minStockQty}
                onChange={(e) => setMinStockQty(e.target.value)}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* คำอธิบาย */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              คำอธิบาย
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
            </button>
            <Link
              href={`/parts/${partId}`}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
            >
              ยกเลิก
            </Link>
          </div>
        </form>
      </div>

      {/* Info */}
      {part && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="font-medium text-yellow-900 mb-2">⚠️ หมายเหตุ</h3>
          <p className="text-sm text-yellow-800">
            จำนวนสต๊อก ({part.stockQty} ชิ้น) ไม่สามารถแก้ไขที่นี่ได้
            ให้ใช้ฟังก์ชัน "ปรับสต๊อก" ในหน้ารายละเอียดแทน
          </p>
        </div>
      )}
    </div>
  );
}

