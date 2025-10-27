/**
 * Image Upload Modal
 * Modal สำหรับอัพโหลดรูปภาพหลายไฟล์
 */

'use client';

import { useState, FormEvent, ChangeEvent } from 'react';

interface ImageUploadModalProps {
  jobId: string;
  jobNumber: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImageUploadModal({
  jobId,
  jobNumber,
  onClose,
  onSuccess,
}: ImageUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<string>('BEFORE');
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const MAX_FILES = 10;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  /**
   * Handle File Selection
   */
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError('');
    const files = Array.from(e.target.files || []);

    // Validate number of files
    if (files.length + selectedFiles.length > MAX_FILES) {
      setError(`สามารถอัพโหลดได้สูงสุด ${MAX_FILES} ไฟล์`);
      return;
    }

    // Validate each file
    for (const file of files) {
      // Check file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(`ไฟล์ ${file.name} ไม่ใช่รูปภาพ (รองรับ JPG, PNG, WEBP)`);
        return;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setError(
          `ไฟล์ ${file.name} มีขนาดใหญ่เกิน 5MB (${(file.size / 1024 / 1024).toFixed(2)}MB)`
        );
        return;
      }
    }

    // Create previews
    const newPreviews: string[] = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === files.length) {
          setPreviews([...previews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setSelectedFiles([...selectedFiles, ...files]);
  };

  /**
   * Remove File
   */
  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  /**
   * Handle Submit
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedFiles.length === 0) {
      setError('กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์');
      return;
    }

    if (!category) {
      setError('กรุณาเลือกประเภทรูปภาพ');
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(0);

      // Create FormData
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });
      formData.append('category', category);

      // Upload with progress
      const api = (await import('@/lib/api')).default;
      
      await api.post(`/api/jobs/${jobId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          }
        },
      });

      alert(`อัพโหลดรูปภาพสำเร็จ (${selectedFiles.length} ไฟล์)`);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(
        err.response?.data?.message || 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ'
      );
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">
            อัพโหลดรูปภาพ
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

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ประเภทรูปภาพ <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { value: 'BEFORE', label: '📸 ก่อนซ่อม', color: 'blue' },
                { value: 'DURING', label: '🔧 ระหว่างซ่อม', color: 'orange' },
                { value: 'AFTER', label: '✅ หลังซ่อม', color: 'green' },
                { value: 'PROBLEM', label: '❌ รูปปัญหา', color: 'red' },
                { value: 'OTHER', label: '📁 อื่นๆ', color: 'gray' },
              ].map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
                    category === cat.value
                      ? `border-${cat.color}-500 bg-${cat.color}-50 text-${cat.color}-700`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={loading}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* File Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เลือกไฟล์ <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="imageInput"
                disabled={loading || selectedFiles.length >= MAX_FILES}
              />
              <label
                htmlFor="imageInput"
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="text-4xl mb-2">📤</div>
                <p className="text-sm text-gray-600 mb-1">
                  คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
                </p>
                <p className="text-xs text-gray-500">
                  JPG, PNG, WEBP สูงสุด 5MB ต่อไฟล์ (สูงสุด {MAX_FILES} ไฟล์)
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  เลือกแล้ว: {selectedFiles.length} / {MAX_FILES} ไฟล์
                </p>
              </label>
            </div>
          </div>

          {/* Preview Grid */}
          {selectedFiles.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ตัวอย่างรูปภาพ ({selectedFiles.length} ไฟล์)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={previews[index]}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={loading}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {loading && uploadProgress > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>กำลังอัพโหลด...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading || selectedFiles.length === 0}
              className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'กำลังอัพโหลด...' : `📤 อัพโหลด (${selectedFiles.length} ไฟล์)`}
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

