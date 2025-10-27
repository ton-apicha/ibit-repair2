/**
 * Customers List Page
 * หน้ารายการลูกค้าทั้งหมด
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

// Interface สำหรับข้อมูลลูกค้า
interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  _count: {
    jobs: number;
  };
}

export default function CustomersPage() {
  const { t } = useTranslation(['customers', 'common']);
  
  // State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /**
   * ดึงข้อมูลลูกค้า
   */
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/customers', {
        params: {
          search: search || undefined,
          page,
          limit: 20,
        },
      });

      setCustomers(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customers เมื่อ component mount หรือ search/page เปลี่ยน
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300); // Debounce 300ms

    return () => clearTimeout(timer);
  }, [search, page]);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {t('customers:title')}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('customers:customer_list')}
            </p>
          </div>

          <Link
            href="/customers/new"
            className="btn-primary mt-4 md:mt-0 text-center"
          >
            + {t('customers:new_customer')}
          </Link>
        </div>

        {/* Search Bar */}
        <div className="card mb-6">
          <input
            type="text"
            placeholder={`${t('common:search')}...`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to page 1 when searching
            }}
            className="input-field"
          />
        </div>

        {/* Customer List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">กำลังโหลด...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {search ? t('common:table.no_data') : t('customers:title')}
            </h3>
            <p className="text-gray-600 mb-6">
              {search
                ? 'ลองค้นหาด้วยคำอื่น'
                : 'เริ่มต้นโดยเพิ่มลูกค้าใหม่'}
            </p>
            {!search && (
              <Link href="/customers/new" className="btn-primary inline-block">
                + {t('customers:new_customer')}
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block card overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('customers:full_name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('customers:phone_number')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('customers:email_address')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('common:nav.jobs')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('common:date')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      {t('common:actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="font-medium text-primary-600 hover:text-primary-700"
                        >
                          {customer.fullName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {customer.phone}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {customer.email || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {customer._count.jobs} งาน
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {formatDate(customer.createdAt, 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/customers/${customer.id}/edit`}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          แก้ไข
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden space-y-4">
              {customers.map((customer) => (
                <Link
                  key={customer.id}
                  href={`/customers/${customer.id}`}
                  className="card block"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {customer.fullName}
                    </h3>
                    <span className="badge badge-received">
                      {customer._count.jobs} งาน
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>📞 {customer.phone}</p>
                    {customer.email && <p>📧 {customer.email}</p>}
                    <p className="text-xs text-gray-500">
                      สร้างเมื่อ {formatDate(customer.createdAt, 'dd/MM/yyyy')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="btn-secondary disabled:opacity-50"
                >
                  ก่อนหน้า
                </button>
                <span className="text-sm text-gray-600">
                  หน้า {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="btn-secondary disabled:opacity-50"
                >
                  ถัดไป
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

