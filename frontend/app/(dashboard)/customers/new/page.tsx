/**
 * New Customer Page
 * หน้าเพิ่มลูกค้าใหม่
 */

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function NewCustomerPage() {
  const router = useRouter();

  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handle Submit
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // ตรวจสอบข้อมูล
    if (!fullName.trim() || !phone.trim()) {
      setError('กรุณากรอกชื่อและเบอร์โทรศัพท์');
      return;
    }

    // ตรวจสอบเบอร์โทร (10 หลัก เริ่มต้นด้วย 0)
    const phonePattern = /^0[0-9]{9}$/;
    if (!phonePattern.test(phone.trim())) {
      setError('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก เริ่มต้นด้วย 0');
      return;
    }

    try {
      setLoading(true);

      // เรียก API สร้างลูกค้า
      await api.post('/api/customers', {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        address: address.trim() || null,
        notes: notes.trim() || null,
      });

      // Redirect ไปหน้ารายการลูกค้า
      router.push('/customers');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
      );
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/customers"
            className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block"
          >
            ← กลับ
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            เพิ่มลูกค้าใหม่
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* ชื่อ-นามสกุล */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อ-นามสกุล <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
              placeholder="นาย สมชาย ใจดี"
              required
              disabled={loading}
            />
          </div>

          {/* เบอร์โทรศัพท์ */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เบอร์โทรศัพท์ <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field"
              placeholder="0812345678"
              pattern="[0-9]{10}"
              title="ตัวเลข 10 หลัก เริ่มต้นด้วย 0"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              ตัวเลข 10 หลัก เช่น 0812345678
            </p>
          </div>

          {/* อีเมล */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              อีเมล
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="example@email.com"
              disabled={loading}
            />
          </div>

          {/* ที่อยู่ */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ที่อยู่
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-field"
              rows={3}
              placeholder="123 ถนน... ตำบล... อำเภอ... จังหวัด..."
              disabled={loading}
            />
          </div>

          {/* หมายเหตุ */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หมายเหตุ
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              rows={2}
              placeholder="บันทึกเพิ่มเติม..."
              disabled={loading}
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse md:flex-row gap-3">
            <Link
              href="/customers"
              className="btn-secondary text-center"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

