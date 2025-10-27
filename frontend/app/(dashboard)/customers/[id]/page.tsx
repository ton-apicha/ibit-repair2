/**
 * Customer Detail Page
 * หน้ารายละเอียดลูกค้า พร้อมประวัติงานซ่อม
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDate, getStatusLabel, getStatusColor } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

// Interfaces
interface Job {
  id: string;
  jobNumber: string;
  status: string;
  symptoms: string;
  receivedAt: string;
  completedAt: string | null;
  model: {
    id: string;
    modelName: string;
    brand: {
      id: string;
      name: string;
    };
  };
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  jobs: Job[];
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  /**
   * ดึงข้อมูลลูกค้า
   */
  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/customers/${params.id}`);
      setCustomer(response.data);
    } catch (error: any) {
      console.error('Error fetching customer:', error);
      if (error.response?.status === 404) {
        router.push('/customers');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [params.id]);

  /**
   * ลบลูกค้า
   */
  const handleDelete = async () => {
    if (!customer) return;

    const confirmed = confirm(
      `ต้องการลบลูกค้า "${customer.name}" ใช่หรือไม่?`
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      await api.delete(`/api/customers/${customer.id}`);
      router.push('/customers');
    } catch (error: any) {
      alert(
        error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบข้อมูล'
      );
      setDeleting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // Not found
  if (!customer) {
    return (
      <div className="p-4 md:p-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😕</div>
          <h3 className="text-xl font-semibold mb-2">ไม่พบข้อมูลลูกค้า</h3>
          <Link href="/customers" className="btn-primary mt-4 inline-block">
            กลับหน้ารายการ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/customers"
            className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block"
          >
            ← กลับ
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {customer.name}
              </h1>
              <p className="text-gray-600 mt-1">
                ลูกค้าตั้งแต่ {formatDate(customer.createdAt, 'dd MMM yyyy')}
              </p>
            </div>

            <div className="flex gap-2 mt-4 md:mt-0">
              <Link
                href={`/customers/${customer.id}/edit`}
                className="btn-secondary"
              >
                ✏️ แก้ไข
              </Link>
              {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                <button
                  onClick={handleDelete}
                  disabled={deleting || customer.jobs.length > 0}
                  className="btn-secondary text-red-600 hover:bg-red-50 disabled:opacity-50"
                  title={
                    customer.jobs.length > 0
                      ? 'ไม่สามารถลบได้เนื่องจากมีงานซ่อม'
                      : 'ลบลูกค้า'
                  }
                >
                  {deleting ? '⏳' : '🗑️'} ลบ
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Customer Info Card */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">ข้อมูลลูกค้า</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">เบอร์โทรศัพท์</p>
              <p className="font-medium">📞 {customer.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">อีเมล</p>
              <p className="font-medium">
                {customer.email ? `📧 ${customer.email}` : '-'}
              </p>
            </div>
            {customer.address && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">ที่อยู่</p>
                <p className="font-medium">📍 {customer.address}</p>
              </div>
            )}
            {customer.notes && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">หมายเหตุ</p>
                <p className="font-medium">📝 {customer.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Job History */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              ประวัติงานซ่อม ({customer.jobs.length})
            </h2>
            <Link
              href={`/jobs/new?customerId=${customer.id}`}
              className="btn-primary text-sm"
            >
              + สร้างงานซ่อมใหม่
            </Link>
          </div>

          {customer.jobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-gray-600 mb-4">ยังไม่มีประวัติงานซ่อม</p>
              <Link
                href={`/jobs/new?customerId=${customer.id}`}
                className="btn-primary inline-block"
              >
                + สร้างงานซ่อมแรก
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {customer.jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {job.jobNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {job.model.brand.name} {job.model.modelName}
                      </p>
                    </div>
                    <span
                      className={`badge ${getStatusColor(job.status)}`}
                    >
                      {getStatusLabel(job.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    อาการ: {job.symptoms}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>
                      รับเข้า: {formatDate(job.receivedAt, 'dd/MM/yyyy')}
                    </span>
                    {job.completedAt && (
                      <span>
                        เสร็จ: {formatDate(job.completedAt, 'dd/MM/yyyy')}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

