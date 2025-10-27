/**
 * Change Status Modal
 * Modal สำหรับเปลี่ยนสถานะงานซ่อม
 */

'use client';

import { useState, FormEvent } from 'react';
import StatusBadge, { getStatusLabel } from './StatusBadge';

interface ChangeStatusModalProps {
  jobId: string;
  jobNumber: string;
  currentStatus: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ChangeStatusModal({
  jobId,
  jobNumber,
  currentStatus,
  onClose,
  onSuccess,
}: ChangeStatusModalProps) {
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // รายการสถานะที่เปลี่ยนได้
  const allStatuses = [
    'RECEIVED',
    'DIAGNOSED',
    'WAITING_APPROVAL',
    'IN_REPAIR',
    'WAITING_PARTS',
    'TESTING',
    'READY_FOR_PICKUP',
    'COMPLETED',
    'CANCELLED',
    'ON_HOLD',
  ];

  /**
   * Handle Submit
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newStatus) {
      setError('กรุณาเลือกสถานะใหม่');
      return;
    }

    if (newStatus === currentStatus) {
      setError('สถานะเหมือนเดิม');
      return;
    }

    try {
      setLoading(true);

      // Import api dynamically
      const api = (await import('@/lib/api')).default;
      
      await api.patch(`/api/jobs/${jobId}/status`, {
        newStatus,
        note: note.trim() || undefined,
      });

      alert('เปลี่ยนสถานะสำเร็จ');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            เปลี่ยนสถานะงาน
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

          {/* Current Status */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              สถานะปัจจุบัน
            </label>
            <div>
              <StatusBadge status={currentStatus} />
            </div>
          </div>

          {/* New Status */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              สถานะใหม่ <span className="text-red-500">*</span>
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
              disabled={loading}
            >
              <option value="">-- เลือกสถานะ --</option>
              {allStatuses
                .filter((status) => status !== currentStatus)
                .map((status) => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
            </select>
          </div>

          {/* Note/Reason */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หมายเหตุ / เหตุผล
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เหตุผลในการเปลี่ยนสถานะ (ถ้ามี)..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {note.length} / 500 ตัวอักษร
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'กำลังบันทึก...' : '✅ เปลี่ยนสถานะ'}
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


