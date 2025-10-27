/**
 * Repair Record Modal
 * Modal สำหรับเพิ่มบันทึกการซ่อม
 */

'use client';

import { useState, FormEvent } from 'react';

interface RepairRecordModalProps {
  jobId: string;
  jobNumber: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RepairRecordModal({
  jobId,
  jobNumber,
  onClose,
  onSuccess,
}: RepairRecordModalProps) {
  const [description, setDescription] = useState('');
  const [findings, setFindings] = useState('');
  const [actions, setActions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handle Submit
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!description.trim() || description.trim().length < 10) {
      setError('กรุณาอธิบายการซ่อมอย่างน้อย 10 ตัวอักษร');
      return;
    }

    try {
      setLoading(true);

      const api = (await import('@/lib/api')).default;
      
      await api.post(`/api/jobs/${jobId}/records`, {
        description: description.trim(),
        findings: findings.trim() || undefined,
        actions: actions.trim() || undefined,
      });

      alert('บันทึกการซ่อมสำเร็จ');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึก'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            เพิ่มบันทึกการซ่อม
          </h2>
          <p className="text-sm text-gray-600 mt-1">{jobNumber}</p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              คำอธิบายการซ่อม <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="อธิบายการซ่อมที่ทำ..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
              disabled={loading}
              minLength={10}
              maxLength={5000}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>ขั้นต่ำ 10 ตัวอักษร</span>
              <span>{description.length} / 5000</span>
            </div>
          </div>

          {/* Findings */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              สิ่งที่พบ / อาการที่ตรวจพบ
            </label>
            <textarea
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              placeholder="สิ่งที่พบระหว่างการตรวจสอบ..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={loading}
              maxLength={5000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {findings.length} / 5000
            </p>
          </div>

          {/* Actions Taken */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              การแก้ไข / ขั้นตอนที่ทำ
            </label>
            <textarea
              value={actions}
              onChange={(e) => setActions(e.target.value)}
              placeholder="ขั้นตอนการแก้ไขที่ทำ..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={loading}
              maxLength={5000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {actions.length} / 5000
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'กำลังบันทึก...' : '✅ บันทึก'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


