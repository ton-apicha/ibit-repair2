/**
 * Assign Technician Modal
 * Modal สำหรับมอบหมายช่างซ่อม
 */

'use client';

import { useState, useEffect, FormEvent } from 'react';

interface Technician {
  id: string;
  fullName: string;
}

interface AssignTechnicianModalProps {
  jobId: string;
  jobNumber: string;
  currentTechnician: Technician | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignTechnicianModal({
  jobId,
  jobNumber,
  currentTechnician,
  onClose,
  onSuccess,
}: AssignTechnicianModalProps) {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [technicianId, setTechnicianId] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTechs, setLoadingTechs] = useState(true);
  const [error, setError] = useState('');

  /**
   * Load technicians
   */
  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        setLoadingTechs(true);
        // Import api
        const api = (await import('@/lib/api')).default;
        
        const response = await api.get('/api/users/technicians');
        setTechnicians(response.data.data || response.data || []);
      } catch (error) {
        console.error('Error loading technicians:', error);
        setError('ไม่สามารถโหลดรายชื่อช่างได้');
      } finally {
        setLoadingTechs(false);
      }
    };

    loadTechnicians();
  }, []);

  /**
   * Handle Submit
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!technicianId) {
      setError('กรุณาเลือกช่าง');
      return;
    }

    try {
      setLoading(true);

      const api = (await import('@/lib/api')).default;
      
      await api.patch(`/api/jobs/${jobId}/assign`, {
        technicianId,
        note: note.trim() || undefined,
      });

      alert('มอบหมายช่างสำเร็จ');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'เกิดข้อผิดพลาดในการมอบหมายช่าง'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            มอบหมายช่างซ่อม
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

          {/* Current Technician */}
          {currentTechnician && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ช่างปัจจุบัน
              </label>
              <div className="px-4 py-2 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">
                  {currentTechnician.fullName}
                </span>
              </div>
            </div>
          )}

          {/* New Technician */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เลือกช่างใหม่ <span className="text-red-500">*</span>
            </label>
            {loadingTechs ? (
              <div className="px-4 py-2 text-sm text-gray-500">
                กำลังโหลดรายชื่อช่าง...
              </div>
            ) : (
              <select
                value={technicianId}
                onChange={(e) => setTechnicianId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={loading}
              >
                <option value="">-- เลือกช่าง --</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.fullName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Note */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หมายเหตุ
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เหตุผลในการมอบหมาย (ถ้ามี)..."
              rows={2}
              maxLength={500}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || loadingTechs}
              className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'กำลังบันทึก...' : '✅ มอบหมาย'}
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


