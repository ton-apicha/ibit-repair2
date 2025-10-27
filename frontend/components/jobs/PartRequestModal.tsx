/**
 * Part Request Modal
 * Modal สำหรับเบิกอะไหล่จากคลัง
 */

'use client';

import { useState, useEffect, FormEvent } from 'react';

interface Part {
  id: string;
  partName: string;
  partNumber: string;
  stockQty: number;
  minStockQty: number;
  unitPrice: number;
}

interface PartRequestModalProps {
  jobId: string;
  jobNumber: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PartRequestModal({
  jobId,
  jobNumber,
  onClose,
  onSuccess,
}: PartRequestModalProps) {
  const [parts, setParts] = useState<Part[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartId, setSelectedPartId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingParts, setLoadingParts] = useState(true);
  const [error, setError] = useState('');

  /**
   * Load parts
   */
  useEffect(() => {
    const loadParts = async () => {
      try {
        setLoadingParts(true);
        const api = (await import('@/lib/api')).default;
        
        const response = await api.get('/api/parts?limit=1000');
        setParts(response.data.parts || response.data.data || response.data);
      } catch (error) {
        console.error('Error loading parts:', error);
        setError('ไม่สามารถโหลดรายการอะไหล่ได้');
      } finally {
        setLoadingParts(false);
      }
    };

    loadParts();
  }, []);

  // Get selected part
  const selectedPart = parts.find((p) => p.id === selectedPartId);

  // Filter parts by search
  const filteredParts = searchTerm
    ? parts.filter(
        (p) =>
          p.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.partNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : parts;

  // Auto-fill unit price when part selected
  useEffect(() => {
    if (selectedPart) {
      setUnitPrice(Number(selectedPart.unitPrice));
    }
  }, [selectedPart]);

  /**
   * Handle Submit
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedPartId) {
      setError('กรุณาเลือกอะไหล่');
      return;
    }

    if (quantity < 1) {
      setError('จำนวนต้องมากกว่า 0');
      return;
    }

    if (selectedPart && quantity > selectedPart.stockQty) {
      setError(`สต๊อกไม่เพียงพอ (มีเพียง ${selectedPart.stockQty} ชิ้น)`);
      return;
    }

    if (unitPrice <= 0) {
      setError('ราคาต้องมากกว่า 0');
      return;
    }

    try {
      setLoading(true);

      const api = (await import('@/lib/api')).default;
      
      await api.post(`/api/jobs/${jobId}/parts`, {
        partId: selectedPartId,
        quantity,
        unitPrice,
        notes: notes.trim() || undefined,
      });

      alert('เบิกอะไหล่สำเร็จ');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'เกิดข้อผิดพลาดในการเบิกอะไหล่'
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
          <h2 className="text-xl font-semibold text-gray-900">เบิกอะไหล่</h2>
          <p className="text-sm text-gray-600 mt-1">{jobNumber}</p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Search Parts */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ค้นหาอะไหล่
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ชื่ออะไหล่ หรือรหัสอะไหล่..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={loadingParts}
            />
          </div>

          {/* Select Part */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เลือกอะไหล่ <span className="text-red-500">*</span>
            </label>
            {loadingParts ? (
              <div className="px-4 py-2 text-sm text-gray-500">
                กำลังโหลดรายการอะไหล่...
              </div>
            ) : (
              <select
                value={selectedPartId}
                onChange={(e) => setSelectedPartId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={loading}
              >
                <option value="">-- เลือกอะไหล่ --</option>
                {filteredParts.map((part) => (
                  <option key={part.id} value={part.id}>
                    {part.partName} ({part.partNumber}) - สต๊อก: {part.stockQty}{' '}
                    ชิ้น - {Number(part.unitPrice).toLocaleString()} ฿
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selected Part Info */}
          {selectedPart && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">ชื่อ:</span>{' '}
                  <span className="font-medium">{selectedPart.partName}</span>
                </div>
                <div>
                  <span className="text-gray-600">รหัส:</span>{' '}
                  <span className="font-medium">{selectedPart.partNumber}</span>
                </div>
                <div>
                  <span className="text-gray-600">สต๊อกคงเหลือ:</span>{' '}
                  <span className="font-medium">{selectedPart.stockQty} ชิ้น</span>
                </div>
                <div>
                  <span className="text-gray-600">ราคา:</span>{' '}
                  <span className="font-medium">
                    {Number(selectedPart.unitPrice).toLocaleString()} ฿
                  </span>
                </div>
              </div>

              {/* Low stock warning */}
              {selectedPart.stockQty - quantity < selectedPart.minStockQty && (
                <div className="mt-2 text-xs text-orange-600">
                  ⚠️ เบิกแล้วสต๊อกจะต่ำกว่าค่าขั้นต่ำ
                </div>
              )}
            </div>
          )}

          {/* Quantity */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              จำนวน <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              min="1"
              max={selectedPart?.stockQty || 999}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
              disabled={loading || !selectedPartId}
            />
            {selectedPart && (
              <p className="text-xs text-gray-500 mt-1">
                สต๊อกคงเหลือ: {selectedPart.stockQty} ชิ้น
              </p>
            )}
          </div>

          {/* Unit Price */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ราคาต่อหน่วย (฿) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={unitPrice}
              onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
              disabled={loading || !selectedPartId}
            />
            <p className="text-xs text-gray-500 mt-1">
              สามารถแก้ไขราคาได้ถ้าต้องการ
            </p>
          </div>

          {/* Total Price */}
          {selectedPart && quantity > 0 && unitPrice > 0 && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">ราคารวม:</span>
                <span className="text-xl font-bold text-green-700">
                  {(quantity * unitPrice).toLocaleString()} ฿
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              หมายเหตุ
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="หมายเหตุเพิ่มเติม..."
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
              disabled={loading || loadingParts}
              className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'กำลังบันทึก...' : '✅ เบิกอะไหล่'}
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


