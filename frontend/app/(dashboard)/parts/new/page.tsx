/**
 * New Part Page
 * หน้าเพิ่มอะไหล่ใหม่
 */

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function NewPartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [partNumber, setPartNumber] = useState('');
  const [partName, setPartName] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [stockQty, setStockQty] = useState('0');
  const [minStockQty, setMinStockQty] = useState('0');
  const [location, setLocation] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!partNumber.trim() || !partName.trim() || !unitPrice) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await api.post('/api/parts', {
        partNumber: partNumber.trim(),
        partName: partName.trim(),
        description: description.trim() || null,
        unitPrice: parseFloat(unitPrice),
        stockQty: parseInt(stockQty),
        minStockQty: parseInt(minStockQty),
        location: location.trim() || null,
      });

      alert('เพิ่มอะไหล่สำเร็จ');
      router.push('/parts');
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถเพิ่มอะไหล่ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Link href="/parts" className="hover:text-blue-600">
            คลังอะไหล่
          </Link>
          <span>/</span>
          <span>เพิ่มใหม่</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">เพิ่มอะไหล่ใหม่</h1>
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
                placeholder="เช่น HB-S19PRO-01"
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
                placeholder="เช่น S19 Pro Hash Board"
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
                placeholder="0.00"
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
                placeholder="เช่น A-01, B-02"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* จำนวนสต๊อก */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                จำนวนสต๊อกเริ่มต้น
              </label>
              <input
                type="number"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* สต๊อกต่ำสุด */}
            <div>
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
              placeholder="คำอธิบายเพิ่มเติมเกี่ยวกับอะไหล่"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
            <Link
              href="/parts"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
            >
              ยกเลิก
            </Link>
          </div>
        </form>
      </div>

      {/* Help */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h3 className="font-medium text-blue-900 mb-2">💡 คำแนะนำ</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• รหัสอะไหล่ควรไม่ซ้ำกันในระบบ</li>
          <li>• ตั้งค่า "แจ้งเตือนเมื่อสต๊อกต่ำกว่า" เพื่อจัดการสต๊อก</li>
          <li>• ตำแหน่งจัดเก็บช่วยในการหาอะไหล่ในคลัง</li>
        </ul>
      </div>
    </div>
  );
}

