/**
 * User Management Tab Component
 * แสดงและจัดการข้อมูลผู้ใช้งาน
 */

'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import UserFormModal from './UserFormModal';

interface User {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function UserManagementTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // ดึงข้อมูล users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('📊 UserManagementTab: Fetching users...');
      const response = await api.get('/api/users');
      console.log('📊 UserManagementTab: Users fetched successfully');
      setUsers(response.data.data || response.data || []);
      setFilteredUsers(response.data.data || response.data || []);
    } catch (error: any) {
      console.error('❌ UserManagementTab: Error fetching users:', error);
      console.error('  Status:', error.response?.status);
      console.error('  Message:', error.response?.data?.message);
      
      // ไม่แสดง alert ถ้าเป็น authentication error
      if (error.response?.status !== 401) {
        alert('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
      }
      
      // Set empty array instead of showing error
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users
  useEffect(() => {
    let filtered = users;

    // Filter by role
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  // Handle delete user
  const handleDelete = async (id: string) => {
    if (!confirm('คุณต้องการลบผู้ใช้นี้ใช่หรือไม่?')) return;

    try {
      await api.delete(`/api/users/${id}`);
      alert('ลบผู้ใช้สำเร็จ');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('เกิดข้อผิดพลาดในการลบผู้ใช้');
    }
  };

  // Handle toggle active
  const handleToggleActive = async (id: string) => {
    try {
      await api.patch(`/api/users/${id}/toggle-active`);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling user active:', error);
      alert('เกิดข้อผิดพลาดในการเปิด/ปิดการใช้งาน');
    }
  };

  // Handle reset password
  const handleResetPassword = async (id: string) => {
    const newPassword = prompt('กรุณาระบุรหัสผ่านใหม่:');
    if (!newPassword) return;

    try {
      await api.post(`/api/users/${id}/reset-password`, { newPassword });
      alert('รีเซ็ตรหัสผ่านสำเร็จ');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
    }
  };

  // Role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800';
      case 'TECHNICIAN':
        return 'bg-green-100 text-green-800';
      case 'RECEPTIONIST':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Role label
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'ผู้ดูแลระบบ';
      case 'MANAGER':
        return 'ผู้จัดการ';
      case 'TECHNICIAN':
        return 'ช่างซ่อม';
      case 'RECEPTIONIST':
        return 'พนักงานต้อนรับ';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">จัดการผู้ใช้งาน</h2>
          <p className="text-gray-600">จัดการข้อมูลผู้ใช้งานในระบบ</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          ➕ เพิ่มผู้ใช้ใหม่
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ค้นหา
            </label>
            <input
              type="text"
              placeholder="ค้นหาด้วยชื่อหรือ username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              กรองตามตำแหน่ง
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field"
            >
              <option value="ALL">ทั้งหมด</option>
              <option value="ADMIN">ผู้ดูแลระบบ</option>
              <option value="MANAGER">ผู้จัดการ</option>
              <option value="TECHNICIAN">ช่างซ่อม</option>
              <option value="RECEPTIONIST">พนักงานต้อนรับ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">กำลังโหลด...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">ไม่พบข้อมูลผู้ใช้</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Username
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ชื่อ-นามสกุล
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ตำแหน่ง
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    สถานะ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    วันที่สร้าง
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {user.username}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {user.fullName}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-4 py-3 text-sm text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setIsModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="แก้ไข"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleToggleActive(user.id)}
                        className="text-yellow-600 hover:text-yellow-800"
                        title={user.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                      >
                        {user.isActive ? '🔒' : '🔓'}
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        className="text-purple-600 hover:text-purple-800"
                        title="รีเซ็ตรหัสผ่าน"
                      >
                        🔑
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-800"
                        title="ลบ"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Form Modal */}
      {isModalOpen && (
        <UserFormModal
          user={editingUser}
          onClose={() => {
            setIsModalOpen(false);
            setEditingUser(null);
          }}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingUser(null);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
}

