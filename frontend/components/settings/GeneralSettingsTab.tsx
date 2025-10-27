/**
 * General Settings Tab Component
 * ตั้งค่าทั่วไปของร้าน
 */

'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Settings {
  id: string;
  shopName: string;
  address?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  logoUrl?: string;
  updatedAt: string;
}

export default function GeneralSettingsTab() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [formData, setFormData] = useState({
    shopName: '',
    address: '',
    phone: '',
    email: '',
    taxId: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/settings');
      const data = response.data.data;
      setSettings(data);
      setFormData({
        shopName: data.shopName || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        taxId: data.taxId || '',
      });
      if (data.logoUrl) {
        setLogoPreview(`${api.defaults.baseURL}${data.logoUrl}`);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      alert('เกิดข้อผิดพลาดในการดึงการตั้งค่า');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put('/api/settings', formData);
      alert('บันทึกการตั้งค่าสำเร็จ');
      fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
    } finally {
      setSaving(false);
    }
  };

  // Handle logo file change
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ตรวจสอบ file type
    if (!file.type.startsWith('image/')) {
      alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
      return;
    }

    // ตรวจสอบ file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB');
      return;
    }

    setLogoFile(file);

    // สร้าง preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle logo upload
  const handleLogoUpload = async () => {
    if (!logoFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);

      await api.post('/api/settings/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('อัปโหลดโลโก้สำเร็จ');
      setLogoFile(null);
      fetchSettings();
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('เกิดข้อผิดพลาดในการอัปโหลดโลโก้');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-4xl mb-4">⚙️</div>
          <p className="text-gray-600">กำลังโหลดการตั้งค่า...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">ตั้งค่าทั่วไป</h2>
        <p className="text-gray-600">จัดการข้อมูลร้านและการตั้งค่าระบบ</p>
      </div>

      {/* Logo Upload Section */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">🖼️ โลโก้ร้าน</h3>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Logo Preview */}
          <div className="flex-shrink-0">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo Preview"
                className="w-32 h-32 object-contain border-2 border-gray-200 rounded-lg p-2"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-4xl">🏢</span>
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เลือกไฟล์โลโก้
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                รองรับไฟล์: JPEG, PNG, GIF, WebP (ขนาดไม่เกิน 5MB)
              </p>
            </div>

            {logoFile && (
              <button
                onClick={handleLogoUpload}
                disabled={uploading}
                className="btn-primary"
              >
                {uploading ? 'กำลังอัปโหลด...' : '📤 อัปโหลดโลโก้'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Shop Information Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <h3 className="text-lg font-semibold mb-4">🏪 ข้อมูลร้าน</h3>

        {/* Shop Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ชื่อร้าน <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.shopName}
            onChange={(e) =>
              setFormData({ ...formData, shopName: e.target.value })
            }
            required
            className="input-field"
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ที่อยู่
          </label>
          <textarea
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            rows={3}
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

        {/* Tax ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            เลขผู้เสียภาษี
          </label>
          <input
            type="text"
            value={formData.taxId}
            onChange={(e) =>
              setFormData({ ...formData, taxId: e.target.value })
            }
            className="input-field"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'กำลังบันทึก...' : '💾 บันทึกการตั้งค่า'}
          </button>
        </div>
      </form>

      {/* Last Updated */}
      {settings && (
        <div className="text-sm text-gray-500 text-center">
          อัพเดทล่าสุด:{' '}
          {new Date(settings.updatedAt).toLocaleString('th-TH')}
        </div>
      )}
    </div>
  );
}

