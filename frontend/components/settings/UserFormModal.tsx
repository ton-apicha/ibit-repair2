/**
 * User Form Modal Component
 * Modal สำหรับเพิ่ม/แก้ไขผู้ใช้
 */

'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface User {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: string;
  isActive: boolean;
}

interface UserFormModalProps {
  user: User | null; // null = สร้างใหม่, มีค่า = แก้ไข
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserFormModal({
  user,
  onClose,
  onSuccess,
}: UserFormModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'TECHNICIAN',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // โหมดแก้ไข
      setFormData({
        username: user.username,
        password: '', // ไม่แสดงรหัสผ่านเดิม
        fullName: user.fullName,
        email: user.email || '',
        phone: user.phone || '',
        role: user.role,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        // แก้ไข
        await api.put(`/api/users/${user.id}`, {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
        });
        alert('อัพเดทข้อมูลผู้ใช้สำเร็จ');
      } else {
        // สร้างใหม่
        if (!formData.password) {
          alert('กรุณาระบุรหัสผ่าน');
          setLoading(false);
          return;
        }
        await api.post('/api/users', formData);
        alert('สร้างผู้ใช้สำเร็จ');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Error saving user:', error);
      alert(
        error.response?.data?.message ||
          'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            {user ? 'แก้ไขข้อมูลผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}
          </h3>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              disabled={!!user} // ไม่สามารถแก้ไข username ได้
              required
              className="input-field"
            />
            {user && (
              <p className="text-xs text-gray-500 mt-1">
                ไม่สามารถแก้ไข username ได้
              </p>
            )}
          </div>

          {/* Password (เฉพาะสร้างใหม่) */}
          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รหัสผ่าน <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                minLength={6}
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร
              </p>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อ-นามสกุล <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              required
              className="input-field"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              อีเมล
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="input-field"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เบอร์โทรศัพท์
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="input-field"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ตำแหน่ง <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              required
              className="input-field"
            >
              <option value="ADMIN">ผู้ดูแลระบบ (ADMIN)</option>
              <option value="MANAGER">ผู้จัดการ (MANAGER)</option>
              <option value="TECHNICIAN">ช่างซ่อม (TECHNICIAN)</option>
              <option value="RECEPTIONIST">
                พนักงานต้อนรับ (RECEPTIONIST)
              </option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

