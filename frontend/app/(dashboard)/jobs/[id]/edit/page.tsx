/**
 * Edit Job Page
 * หน้าแก้ไขงานซ่อม
 */

'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Customer {
  id: string;
  fullName: string;
  phone: string;
}

interface MinerModel {
  id: string;
  modelName: string;
}

interface Job {
  id: string;
  jobNumber: string;
  customerId: string;
  minerModelId: string;
  serialNumber: string | null;
  password: string | null;
  status: string;
  priority: number;
  warrantyProfileId: string | null;
  problemDescription: string;
  customerNotes: string | null;
  customer: Customer;
  minerModel: MinerModel;
}

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [serialNumber, setSerialNumber] = useState('');
  const [password, setPassword] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [priority, setPriority] = useState(0);

  /**
   * Load job data
   */
  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/jobs/${params.id}`);
        const jobData = response.data;

        setJob(jobData);
        setSerialNumber(jobData.serialNumber || '');
        setPassword(jobData.password || '');
        setProblemDescription(jobData.problemDescription || '');
        setCustomerNotes(jobData.customerNotes || '');
        setPriority(jobData.priority || 0);
      } catch (error: any) {
        console.error('Error loading job:', error);
        setError('ไม่สามารถโหลดข้อมูลงานได้');
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [params.id]);

  /**
   * Handle Submit
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!problemDescription.trim() || problemDescription.trim().length < 10) {
      setError('กรุณาอธิบายปัญหาอย่างน้อย 10 ตัวอักษร');
      return;
    }

    try {
      setSaving(true);

      await api.put(`/api/jobs/${params.id}`, {
        serialNumber: serialNumber.trim() || null,
        password: password.trim() || null,
        problemDescription: problemDescription.trim(),
        customerNotes: customerNotes.trim() || null,
        priority,
      });

      alert('บันทึกการแก้ไขสำเร็จ');
      router.push(`/jobs/${params.id}`);
    } catch (err: any) {
      console.error('Update job error:', err);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="card">
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              เกิดข้อผิดพลาด
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link href="/jobs" className="btn-secondary inline-block">
              กลับไปหน้ารายการงาน
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/jobs/${job.id}`}
            className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block"
          >
            ← กลับไปหน้ารายละเอียด
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            แก้ไขงาน: {job.jobNumber}
          </h1>
          <p className="text-gray-600 mt-1">
            แก้ไขข้อมูลงานซ่อม (ไม่สามารถเปลี่ยนลูกค้าหรือรุ่นเครื่องได้)
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Non-Editable Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-3">
              ข้อมูลที่ไม่สามารถแก้ไขได้
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">เลขที่งาน:</span>{' '}
                <span className="font-medium">{job.jobNumber}</span>
              </div>
              <div>
                <span className="text-gray-600">ลูกค้า:</span>{' '}
                <span className="font-medium">
                  {job.customer.fullName} ({job.customer.phone})
                </span>
              </div>
              <div className="md:col-span-2">
                <span className="text-gray-600">รุ่นเครื่อง:</span>{' '}
                <span className="font-medium">{job.minerModel.modelName}</span>
              </div>
            </div>
          </div>

          {/* Serial Number */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Serial Number
            </label>
            <input
              type="text"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              className="input-field"
              placeholder="S/N บนตัวเครื่อง (ถ้ามี)"
              disabled={saving}
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รหัสผ่านเครื่อง
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="สำหรับเข้า web interface (ถ้ามี)"
              disabled={saving}
            />
          </div>

          {/* Problem Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รายละเอียดปัญหา <span className="text-red-500">*</span>
            </label>
            <textarea
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              rows={6}
              className="input-field"
              placeholder="อธิบายอาการเสีย, ปัญหาที่พบ..."
              required
              minLength={10}
              maxLength={5000}
              disabled={saving}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>ขั้นต่ำ 10 ตัวอักษร</span>
              <span>{problemDescription.length} / 5000</span>
            </div>
          </div>

          {/* Customer Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หมายเหตุจากลูกค้า
            </label>
            <textarea
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              rows={3}
              className="input-field"
              placeholder="หมายเหตุเพิ่มเติม..."
              maxLength={5000}
              disabled={saving}
            />
          </div>

          {/* Priority */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ความเร่งด่วน <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="priority"
                  value="0"
                  checked={priority === 0}
                  onChange={() => setPriority(0)}
                  className="mr-2"
                  disabled={saving}
                />
                <span className="flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  <span>ปกติ</span>
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="priority"
                  value="1"
                  checked={priority === 1}
                  onChange={() => setPriority(1)}
                  className="mr-2"
                  disabled={saving}
                />
                <span className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <span className="text-orange-600 font-medium">ด่วน</span>
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="priority"
                  value="2"
                  checked={priority === 2}
                  onChange={() => setPriority(2)}
                  className="mr-2"
                  disabled={saving}
                />
                <span className="flex items-center gap-2">
                  <span className="text-2xl">🚨</span>
                  <span className="text-red-600 font-medium">ด่วนมาก</span>
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {saving ? 'กำลังบันทึก...' : '💾 บันทึกการแก้ไข'}
            </button>
            <Link
              href={`/jobs/${job.id}`}
              className="flex-1 btn-secondary text-center"
            >
              ยกเลิก
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

