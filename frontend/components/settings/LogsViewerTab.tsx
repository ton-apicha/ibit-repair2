/**
 * Logs Viewer Tab Component
 * แสดงและค้นหา Activity Logs
 */

'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface ActivityLog {
  id: string;
  action: string;
  description?: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
  };
  job?: {
    id: string;
    jobNumber: string;
  };
  metadata?: any;
}

export default function LogsViewerTab() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(50);

  // Fetch logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      console.log('📊 LogsViewerTab: Fetching logs...');
      const response = await api.get(`/api/dashboard/recent-activity?limit=${limit}`);
      console.log('📊 LogsViewerTab: Logs fetched successfully');
      setLogs(response.data);
    } catch (error: any) {
      console.error('❌ LogsViewerTab: Error fetching logs:', error);
      console.error('  Status:', error.response?.status);
      console.error('  Message:', error.response?.data?.message);
      
      // ไม่แสดง alert ถ้าเป็น authentication error
      if (error.response?.status !== 401) {
        alert('เกิดข้อผิดพลาดในการดึงข้อมูล logs');
      }
      
      // Set empty array instead of showing error
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [limit]);

  // Format date/time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('th-TH'),
      time: date.toLocaleTimeString('th-TH'),
    };
  };

  // Get action badge color
  const getActionBadgeColor = (action: string) => {
    if (action.includes('สร้าง') || action.includes('เพิ่ม')) {
      return 'bg-green-100 text-green-800';
    }
    if (action.includes('แก้ไข') || action.includes('อัพเดท')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (action.includes('ลบ')) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Activity Logs</h2>
          <p className="text-gray-600">ประวัติการทำงานในระบบ</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">แสดง:</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="input text-sm"
          >
            <option value={25}>25 รายการ</option>
            <option value={50}>50 รายการ</option>
            <option value={100}>100 รายการ</option>
            <option value={200}>200 รายการ</option>
          </select>
          <button onClick={fetchLogs} className="btn-secondary text-sm">
            🔄 รีเฟรช
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">กำลังโหลด...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">ไม่พบ logs</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    เวลา
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ผู้ใช้
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    การกระทำ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    รายละเอียด
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    งาน
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => {
                  const { date, time } = formatDateTime(log.createdAt);
                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div>{date}</div>
                        <div className="text-xs text-gray-500">{time}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {log.user.fullName}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadgeColor(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {log.description || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {log.job ? (
                          <span className="text-blue-600 font-medium">
                            {log.job.jobNumber}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-sm text-gray-500 text-center">
        แสดง {logs.length} รายการล่าสุด
      </div>
    </div>
  );
}

