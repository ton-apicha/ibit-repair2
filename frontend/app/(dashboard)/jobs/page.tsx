/**
 * Jobs List Page
 * หน้ารายการงานซ่อมทั้งหมด
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import StatusBadge from '@/components/jobs/StatusBadge';

// Interface
interface Customer {
  id: string;
  fullName: string;
  phone: string;
}

interface Brand {
  id: string;
  name: string;
}

interface MinerModel {
  id: string;
  modelName: string;
  brand: Brand;
}

interface Technician {
  id: string;
  fullName: string;
}

interface Job {
  id: string;
  jobNumber: string;
  customer: Customer;
  minerModel: MinerModel;
  serialNumber: string | null;
  status: string;
  priority: number;
  technician: Technician | null;
  receivedDate: string;
  createdAt: string;
  _count: {
    repairRecords: number;
    jobParts: number;
    images: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function JobsPage() {
  const router = useRouter();
  const { t } = useTranslation(['jobs', 'common']);
  
  // State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [technicianFilter, setTechnicianFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [technicians, setTechnicians] = useState<Technician[]>([]);

  /**
   * ดึงข้อมูลงานซ่อม
   */
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/jobs', {
        params: {
          search: search || undefined,
          status: statusFilter || undefined,
          technician: technicianFilter || undefined,
          priority: priorityFilter || undefined,
          page,
          limit: 20,
        },
      });

      setJobs(response.data.data);
      setPagination(response.data.pagination);
      if (response.data.filters?.availableTechnicians) {
        setTechnicians(response.data.filters.availableTechnicians);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch jobs เมื่อ filters เปลี่ยน
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 300); // Debounce 300ms

    return () => clearTimeout(timer);
  }, [search, statusFilter, technicianFilter, priorityFilter, page]);

  /**
   * Reset filters
   */
  const resetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setTechnicianFilter('');
    setPriorityFilter('');
    setPage(1);
  };

  /**
   * Priority badge
   */
  const getPriorityBadge = (priority: number) => {
    if (priority === 2) {
      return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">ด่วนมาก</span>;
    }
    if (priority === 1) {
      return <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">ด่วน</span>;
    }
    return null;
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {t('jobs:title')}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('common:app_name')}
            </p>
          </div>

          <Link
            href="/jobs/new"
            className="btn-primary mt-4 md:mt-0 text-center"
          >
            + {t('jobs:new_job')}
          </Link>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('common:search')}
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="เลขที่งาน, ลูกค้า, S/N..."
                className="input-field"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('common:status')}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="input-field"
              >
                <option value="">ทั้งหมด</option>
                <option value="RECEIVED">รับเครื่องแล้ว</option>
                <option value="DIAGNOSED">วินิจฉัยแล้ว</option>
                <option value="WAITING_APPROVAL">รออนุมัติ</option>
                <option value="IN_REPAIR">กำลังซ่อม</option>
                <option value="WAITING_PARTS">รออะไหล่</option>
                <option value="TESTING">ทดสอบ</option>
                <option value="READY_FOR_PICKUP">พร้อมส่งมอบ</option>
                <option value="COMPLETED">เสร็จสิ้น</option>
                <option value="CANCELLED">ยกเลิก</option>
                <option value="ON_HOLD">พักไว้</option>
              </select>
            </div>

            {/* Technician Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('jobs:technician')}
              </label>
              <select
                value={technicianFilter}
                onChange={(e) => {
                  setTechnicianFilter(e.target.value);
                  setPage(1);
                }}
                className="input-field"
              >
                <option value="">ทั้งหมด</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('jobs:priority')}
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value);
                  setPage(1);
                }}
                className="input-field"
              >
                <option value="">ทั้งหมด</option>
                <option value="0">ปกติ</option>
                <option value="1">ด่วน</option>
                <option value="2">ด่วนมาก</option>
              </select>
            </div>
          </div>

          {/* Reset Button */}
          {(search || statusFilter || technicianFilter || priorityFilter) && (
            <button
              onClick={resetFilters}
              className="mt-4 text-sm text-gray-600 hover:text-gray-900"
            >
              ล้างการกรอง
            </button>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="card">
            <div className="text-center py-12">
              <div className="inline-block animate-spin text-4xl mb-4">⚙️</div>
              <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        ) : jobs.length === 0 ? (
          /* Empty State */
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('common:table.no_data')}
            </h3>
            <p className="text-gray-600 mb-6">
              {search || statusFilter || technicianFilter || priorityFilter
                ? t('common:table.no_data')
                : t('jobs:new_job')}
            </p>
            <Link href="/jobs/new" className="btn-primary inline-block">
              + {t('jobs:new_job')}
            </Link>
          </div>
        ) : (
          <>
            {/* Jobs Table (Desktop) */}
            <div className="hidden md:block card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('jobs:job_number')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('jobs:customer')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('models:title')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('common:status')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('jobs:technician')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('jobs:received_date')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('common:actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {jobs.map((job) => (
                      <tr
                        key={job.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => router.push(`/jobs/${job.id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {job.jobNumber}
                            </span>
                            {getPriorityBadge(job.priority)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {job.customer.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {job.customer.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {job.minerModel.modelName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {job.minerModel.brand.name}
                            </div>
                            {job.serialNumber && (
                              <div className="text-xs text-gray-400">
                                S/N: {job.serialNumber}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={job.status} size="sm" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {job.technician ? (
                            <span className="text-gray-900">
                              {job.technician.fullName}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              ยังไม่มอบหมาย
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(job.receivedDate || job.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            href={`/jobs/${job.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-primary-600 hover:text-primary-900 font-medium"
                          >
                            {t('jobs:actions.view_details')} →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Jobs Cards (Mobile) */}
            <div className="md:hidden space-y-4">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="card block hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-bold text-lg text-gray-900 mb-1">
                        {job.jobNumber}
                      </div>
                      <div className="text-sm text-gray-600">
                        {job.customer.fullName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {job.customer.phone}
                      </div>
                    </div>
                    {getPriorityBadge(job.priority)}
                  </div>

                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-900">
                      {job.minerModel.brand.name} {job.minerModel.modelName}
                    </div>
                    {job.serialNumber && (
                      <div className="text-xs text-gray-500">
                        S/N: {job.serialNumber}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <StatusBadge status={job.status} size="sm" />
                    <div className="text-xs text-gray-500">
                      {formatDate(job.receivedDate || job.createdAt)}
                    </div>
                  </div>

                  {job.technician && (
                    <div className="mt-2 text-xs text-gray-600">
                      👨‍🔧 {job.technician.fullName}
                    </div>
                  )}

                  <div className="mt-3 flex gap-3 text-xs text-gray-500">
                    <span>📝 {job._count.repairRecords} บันทึก</span>
                    <span>🔧 {job._count.jobParts} อะไหล่</span>
                    <span>📸 {job._count.images} รูป</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  แสดง {(page - 1) * pagination.limit + 1} -{' '}
                  {Math.min(page * pagination.limit, pagination.total)} จาก{' '}
                  {pagination.total} รายการ
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← ก่อนหน้า
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === pagination.totalPages ||
                          Math.abs(p - page) <= 1
                      )
                      .map((p, idx, arr) => (
                        <div key={p}>
                          {idx > 0 && arr[idx - 1] !== p - 1 && (
                            <span className="px-2 py-2 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => setPage(p)}
                            className={`px-4 py-2 border rounded-lg ${
                              p === page
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {p}
                          </button>
                        </div>
                      ))}
                  </div>

                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ถัดไป →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


