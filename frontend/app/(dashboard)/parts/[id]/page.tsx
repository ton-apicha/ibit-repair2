/**
 * Part Detail Page
 * หน้ารายละเอียดอะไหล่ พร้อมประวัติการใช้
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface JobPart {
  id: string;
  quantity: number;
  unitPrice: number;
  createdAt: string;
  job: {
    id: string;
    jobNumber: string;
    status: string;
    createdAt: string;
    customer: {
      id: string;
      fullName: string;
    };
  };
}

interface Part {
  id: string;
  partNumber: string;
  partName: string;
  description: string | null;
  unitPrice: number;
  stockQty: number;
  minStockQty: number;
  location: string | null;
  jobParts: JobPart[];
  _count: {
    jobParts: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function PartDetailPage() {
  const params = useParams();
  const partId = params.id as string;
  const user = useAuthStore((state) => state.user);

  const [part, setPart] = useState<Part | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');

  useEffect(() => {
    fetchPart();
  }, [partId]);

  const fetchPart = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await api.get(`/api/parts/${partId}`);
      setPart(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async () => {
    if (!adjustQty || parseInt(adjustQty) <= 0) {
      alert('กรุณาระบุจำนวน');
      return;
    }

    try {
      setAdjusting(true);
      await api.patch(`/api/parts/${partId}/stock`, {
        quantity: parseInt(adjustQty),
        type: adjustType,
      });

      alert('ปรับสต๊อกสำเร็จ');
      setAdjustQty('');
      fetchPart();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ไม่สามารถปรับสต๊อกได้');
    } finally {
      setAdjusting(false);
    }
  };

  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const isLowStock = part && part.stockQty <= part.minStockQty;

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">กำลังโหลด...</div>
        </div>
      </div>
    );
  }

  if (error || !part) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'ไม่พบข้อมูล'}
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
    <div className="p-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <Link href="/parts" className="hover:text-blue-600">
          คลังอะไหล่
        </Link>
        <span>/</span>
        <span>{part.partNumber}</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{part.partName}</h1>
          <p className="text-gray-600 mt-1">รหัส: {part.partNumber}</p>
        </div>
        {canManage && (
          <Link
            href={`/parts/${part.id}/edit`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            แก้ไข
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* รายละเอียด */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              รายละเอียดอะไหล่
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">รหัสอะไหล่</div>
                <div className="font-medium text-gray-900 mt-1">
                  {part.partNumber}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">ชื่ออะไหล่</div>
                <div className="font-medium text-gray-900 mt-1">
                  {part.partName}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">ราคาต่อหน่วย</div>
                <div className="font-medium text-gray-900 mt-1">
                  {part.unitPrice.toLocaleString()}฿
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">ตำแหน่งจัดเก็บ</div>
                <div className="font-medium text-gray-900 mt-1">
                  {part.location || '-'}
                </div>
              </div>
            </div>

            {part.description && (
              <div className="mt-4 pt-4 border-t">
                <div className="text-sm text-gray-600">คำอธิบาย</div>
                <div className="text-gray-900 mt-1">{part.description}</div>
              </div>
            )}
          </div>

          {/* ประวัติการใช้ */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              ประวัติการใช้ ({part._count.jobParts} ครั้ง)
            </h2>

            {part.jobParts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                ยังไม่มีประวัติการใช้
              </div>
            ) : (
              <div className="space-y-3">
                {part.jobParts.map((jobPart) => (
                  <div
                    key={jobPart.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <Link
                        href={`/jobs/${jobPart.job.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {jobPart.job.jobNumber}
                      </Link>
                      <div className="text-sm text-gray-600 mt-1">
                        ลูกค้า: {jobPart.job.customer.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(jobPart.createdAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {jobPart.quantity} ชิ้น
                      </div>
                      <div className="text-sm text-gray-600">
                        {jobPart.unitPrice.toLocaleString()}฿/ชิ้น
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Stock Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">สต๊อก</h2>

            <div className="text-center py-4">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {part.stockQty}
              </div>
              <div className="text-sm text-gray-600">ชิ้น</div>
            </div>

            <div className="border-t pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">สต๊อกต่ำสุด:</span>
                <span className="font-medium">{part.minStockQty} ชิ้น</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">สถานะ:</span>
                {isLowStock ? (
                  <span className="font-medium text-red-600">⚠️ ต่ำ</span>
                ) : (
                  <span className="font-medium text-green-600">✓ พอเพียง</span>
                )}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">มูลค่า:</span>
                <span className="font-medium">
                  {(part.stockQty * part.unitPrice).toLocaleString()}฿
                </span>
              </div>
            </div>
          </div>

          {/* Adjust Stock */}
          {canManage && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                ปรับสต๊อก
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ประเภท
                  </label>
                  <select
                    value={adjustType}
                    onChange={(e) =>
                      setAdjustType(e.target.value as 'add' | 'subtract')
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="add">เพิ่มสต๊อก</option>
                    <option value="subtract">ลดสต๊อก</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    จำนวน
                  </label>
                  <input
                    type="number"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    min="1"
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleAdjustStock}
                  disabled={adjusting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {adjusting ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">สถิติ</h2>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">ใช้ไปทั้งหมด:</span>
                <span className="font-medium text-gray-900">
                  {part.jobParts.reduce((sum, jp) => sum + jp.quantity, 0)}{' '}
                  ชิ้น
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">งานที่ใช้:</span>
                <span className="font-medium text-gray-900">
                  {part._count.jobParts} งาน
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

