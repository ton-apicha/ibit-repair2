/**
 * Dashboard Page
 * หน้า Dashboard หลักหลัง Login
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import { getRoleLabel, formatDate } from '@/lib/utils';
import api from '@/lib/api';
import StatusBadge from '@/components/jobs/StatusBadge';

// Interfaces
interface Statistics {
  jobs: {
    total: number;
    active: number;
    inRepair: number;
    readyForPickup: number;
    completed: number;
  };
  lowStockParts: number;
  totalCustomers: number;
  totalParts: number;
}

interface RecentJob {
  id: string;
  jobNumber: string;
  status: string;
  createdAt: string;
  customer: {
    fullName: string;
  };
  technician: {
    fullName: string;
  } | null;
}

interface LowStockPart {
  id: string;
  partName: string;
  partNumber: string;
  stockQty: number;
  minStockQty: number;
  shortage: number;
}

export default function DashboardPage() {
  const { t } = useTranslation(['dashboard', 'common']);
  const user = useAuthStore((state) => state.user);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [lowStockParts, setLowStockParts] = useState<LowStockPart[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Load dashboard data
   */
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, jobsRes, partsRes] = await Promise.all([
          api.get('/api/dashboard/statistics'),
          api.get('/api/dashboard/recent-jobs?limit=5'),
          api.get('/api/dashboard/low-stock'),
        ]);

        setStatistics(statsRes.data);
        setRecentJobs(jobsRes.data);
        setLowStockParts(partsRes.data);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('dashboard:title')}</h1>
          <p className="text-gray-600 mt-2">
            {t('common:welcome')} {t('common:app_name')}
          </p>
        </div>

        {/* User Info Card */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">ข้อมูลผู้ใช้</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">ชื่อผู้ใช้</p>
              <p className="font-medium">{user?.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ชื่อ-นามสกุล</p>
              <p className="font-medium">{user?.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">อีเมล</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">บทบาท</p>
              <p className="font-medium">
                {user?.role && getRoleLabel(user.role)}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : statistics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link href="/jobs" className="card bg-blue-50 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">📋</div>
              <h3 className="text-sm text-gray-600 mb-1">{t('dashboard:stats.total_jobs')}</h3>
              <p className="text-2xl font-bold text-blue-700">
                {statistics.jobs.total.toLocaleString()}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {t('dashboard:stats.active_jobs')}: {statistics.jobs.active}
              </p>
            </Link>

            <Link href="/jobs?status=IN_REPAIR" className="card bg-orange-50 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">🔧</div>
              <h3 className="text-sm text-gray-600 mb-1">{t('dashboard:stats.in_repair')}</h3>
              <p className="text-2xl font-bold text-orange-700">
                {statistics.jobs.inRepair.toLocaleString()}
              </p>
            </Link>

            <Link href="/jobs?status=READY_FOR_PICKUP" className="card bg-green-50 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">✅</div>
              <h3 className="text-sm text-gray-600 mb-1">{t('dashboard:stats.ready_for_pickup')}</h3>
              <p className="text-2xl font-bold text-green-700">
                {statistics.jobs.readyForPickup.toLocaleString()}
              </p>
            </Link>

            <Link href="/parts?lowStock=true" className="card bg-purple-50 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">📦</div>
              <h3 className="text-sm text-gray-600 mb-1">{t('dashboard:stats.low_stock_parts')}</h3>
              <p className="text-2xl font-bold text-purple-700">
                {statistics.lowStockParts.toLocaleString()}
              </p>
            </Link>
          </div>
        ) : null}

        {/* Recent Jobs */}
        {!loading && recentJobs.length > 0 && (
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{t('dashboard:recent_activity')}</h2>
              <Link href="/jobs" className="text-sm text-primary-600 hover:text-primary-700">
                {t('common:actions')} →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      {t('jobs:job_number')}
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      {t('jobs:customer')}
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      {t('common:status')}
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      {t('jobs:technician')}
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      {t('common:date')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentJobs.map((job) => (
                    <tr
                      key={job.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => (window.location.href = `/jobs/${job.id}`)}
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="font-medium text-primary-600 hover:text-primary-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {job.jobNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{job.customer.fullName}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={job.status} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        {job.technician?.fullName || (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(job.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Low Stock Alerts */}
        {!loading && lowStockParts.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span>⚠️</span>
                <span>{t('dashboard:stats.low_stock_parts')}</span>
              </h2>
              <Link href="/parts?lowStock=true" className="text-sm text-primary-600 hover:text-primary-700">
                {t('common:actions')} →
              </Link>
            </div>
            <div className="space-y-2">
              {lowStockParts.slice(0, 5).map((part) => (
                <Link
                  key={part.id}
                  href={`/parts/${part.id}`}
                  className="flex items-center justify-between p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                >
                  <div>
                    <div className="font-medium text-gray-900">{part.partName}</div>
                    <div className="text-sm text-gray-600">{part.partNumber}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-orange-700 font-medium">
                      {t('parts:stock_quantity')}: {part.stockQty} / {part.minStockQty}
                    </div>
                    <div className="text-xs text-orange-600">
                      {t('parts:low_stock')}: {part.shortage}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

