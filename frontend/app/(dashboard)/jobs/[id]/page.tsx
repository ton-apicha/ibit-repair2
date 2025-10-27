/**
 * Job Detail Page  
 * หน้ารายละเอียดงานซ่อม พร้อม Tabs
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import StatusBadge, { getStatusLabel } from '@/components/jobs/StatusBadge';
import ChangeStatusModal from '@/components/jobs/ChangeStatusModal';
import AssignTechnicianModal from '@/components/jobs/AssignTechnicianModal';
import RepairRecordModal from '@/components/jobs/RepairRecordModal';
import PartRequestModal from '@/components/jobs/PartRequestModal';
import ImageUploadModal from '@/components/jobs/ImageUploadModal';

// Simplified interfaces
interface Job {
  id: string;
  jobNumber: string;
  status: string;
  priority: number;
  serialNumber: string | null;
  password: string | null;
  problemDescription: string;
  customerNotes: string | null;
  receivedDate: string;
  estimatedDoneDate: string | null;
  completedDate: string | null;
  createdAt: string;
  customer: {
    id: string;
    fullName: string;
    phone: string;
    email: string | null;
    address: string | null;
  };
  minerModel: {
    id: string;
    modelName: string;
    hashrate: string | null;
    powerUsage: string | null;
    brand: {
      name: string;
    };
  };
  technician: {
    id: string;
    fullName: string;
  } | null;
  warrantyProfile: {
    id: string;
    name: string;
    partsWarranty: number;
    laborWarranty: number;
  } | null;
  createdBy: {
    fullName: string;
  };
  repairRecords: any[];
  jobParts: any[];
  images: any[];
  quotations: any[];
  transactions: any[];
  activityLogs: any[];
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation(['jobs', 'common']);

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  
  // Modals state
  const [showChangeStatus, setShowChangeStatus] = useState(false);
  const [showAssignTech, setShowAssignTech] = useState(false);
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [showAddPart, setShowAddPart] = useState(false);
  const [showUploadImage, setShowUploadImage] = useState(false);

  /**
   * Fetch job data
   */
  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/jobs/${params.id}`);
      setJob(response.data);
    } catch (error: any) {
      console.error('Error fetching job:', error);
      if (error.response?.status === 404) {
        router.push('/jobs');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [params.id]);

  // Loading state
  if (loading || !job) {
    return (
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="card text-center py-12">
            <div className="inline-block animate-spin text-4xl mb-4">⚙️</div>
            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'details', label: 'รายละเอียด', icon: '📋' },
    { id: 'records', label: 'บันทึกการซ่อม', icon: '📝', count: job.repairRecords?.length },
    { id: 'parts', label: 'อะไหล่', icon: '🔧', count: job.jobParts?.length },
    { id: 'images', label: 'รูปภาพ', icon: '📸', count: job.images?.length },
    { id: 'quotations', label: 'ใบเสนอราคา', icon: '💰', count: job.quotations?.length },
    { id: 'payments', label: 'การชำระเงิน', icon: '💳', count: job.transactions?.length },
    { id: 'activity', label: 'ประวัติ', icon: '📜', count: job.activityLogs?.length },
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/jobs"
            className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block"
          >
            ← กลับ
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {job.jobNumber}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={job.status} />
                {job.priority > 0 && (
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      job.priority === 2
                        ? 'bg-red-100 text-red-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {job.priority === 2 ? '🔥 ด่วนมาก' : '⚡ ด่วน'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                onClick={() => setShowChangeStatus(true)}
                className="btn-secondary text-sm"
              >
                🔄 {t('jobs:actions.change_status')}
              </button>
              <button
                onClick={() => setShowAssignTech(true)}
                className="btn-secondary text-sm"
              >
                👨‍🔧 {t('jobs:actions.assign_technician')}
              </button>
              <Link
                href={`/jobs/${job.id}/edit`}
                className="btn-secondary text-sm"
              >
                ✏️ {t('common:edit')}
              </Link>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Customer Card */}
          <div className="card">
            <div className="text-sm text-gray-500 mb-2">👤 ลูกค้า</div>
            <Link
              href={`/customers/${job.customer.id}`}
              className="font-semibold text-gray-900 hover:text-primary-600"
            >
              {job.customer.fullName}
            </Link>
            <div className="text-sm text-gray-600 mt-1">
              📞 {job.customer.phone}
            </div>
            {job.customer.email && (
              <div className="text-sm text-gray-600">✉️ {job.customer.email}</div>
            )}
          </div>

          {/* Miner Card */}
          <div className="card">
            <div className="text-sm text-gray-500 mb-2">⚙️ เครื่องขุด</div>
            <div className="font-semibold text-gray-900">
              {job.minerModel.brand.name} {job.minerModel.modelName}
            </div>
            {job.minerModel.hashrate && (
              <div className="text-xs text-gray-600 mt-1">
                ⚡ {job.minerModel.hashrate} TH/s
              </div>
            )}
            {job.serialNumber && (
              <div className="text-xs text-gray-600">S/N: {job.serialNumber}</div>
            )}
          </div>

          {/* Technician Card */}
          <div className="card">
            <div className="text-sm text-gray-500 mb-2">👨‍🔧 ช่างผู้รับผิดชอบ</div>
            {job.technician ? (
              <div className="font-semibold text-gray-900">
                {job.technician.fullName}
              </div>
            ) : (
              <div className="text-gray-400">ยังไม่มอบหมาย</div>
            )}
            {job.warrantyProfile && (
              <div className="text-xs text-gray-600 mt-2">
                🛡️ {job.warrantyProfile.name}
              </div>
            )}
          </div>

          {/* Timeline Card */}
          <div className="card">
            <div className="text-sm text-gray-500 mb-2">📅 ระยะเวลา</div>
            <div className="text-xs space-y-1">
              <div>
                <span className="text-gray-600">รับเครื่อง:</span>{' '}
                <span className="font-medium">
                  {formatDate(job.receivedDate || job.createdAt)}
                </span>
              </div>
              {job.estimatedDoneDate && (
                <div>
                  <span className="text-gray-600">คาดว่าเสร็จ:</span>{' '}
                  <span className="font-medium">
                    {formatDate(job.estimatedDoneDate)}
                  </span>
                </div>
              )}
              {job.completedDate && (
                <div>
                  <span className="text-gray-600">เสร็จสิ้น:</span>{' '}
                  <span className="font-medium text-green-600">
                    {formatDate(job.completedDate)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          {/* Tab Headers */}
          <div className="flex overflow-x-auto border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    คำอธิบายปัญหา
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {job.problemDescription}
                  </p>
                </div>

                {job.customerNotes && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      หมายเหตุจากลูกค้า
                    </h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {job.customerNotes}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <div className="text-sm text-gray-500">สร้างโดย</div>
                    <div className="font-medium">{job.createdBy.fullName}</div>
                    <div className="text-xs text-gray-500">
                      {formatDate(job.createdAt)}
                    </div>
                  </div>
                  {job.password && (
                    <div>
                      <div className="text-sm text-gray-500">รหัสผ่านเครื่อง</div>
                      <div className="font-medium font-mono">{job.password}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Repair Records Tab */}
            {activeTab === 'records' && (
              <div>
                {job.repairRecords && job.repairRecords.length > 0 ? (
                  <div className="space-y-4">
                    {job.repairRecords.map((record: any) => (
                      <div
                        key={record.id}
                        className="border-l-4 border-primary-500 pl-4 py-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm text-gray-500">
                              {formatDate(record.createdAt)}
                            </div>
                            <p className="text-gray-900 mt-1">
                              {record.description}
                            </p>
                            {record.findings && (
                              <div className="mt-2">
                                <span className="text-sm font-medium text-gray-700">
                                  สิ่งที่พบ:
                                </span>
                                <p className="text-sm text-gray-600">
                                  {record.findings}
                                </p>
                              </div>
                            )}
                            {record.actions && (
                              <div className="mt-2">
                                <span className="text-sm font-medium text-gray-700">
                                  การแก้ไข:
                                </span>
                                <p className="text-sm text-gray-600">
                                  {record.actions}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📝</div>
                    <p>ยังไม่มีบันทึกการซ่อม</p>
                    <button
                      onClick={() => setShowAddRecord(true)}
                      className="mt-4 btn-secondary text-sm"
                    >
                      + {t('jobs:actions.add_repair_record')}
                    </button>
                  </div>
                )}
                
                {/* Add Record Button (when have records) */}
                {job.repairRecords && job.repairRecords.length > 0 && (
                  <button
                    onClick={() => setShowAddRecord(true)}
                    className="mt-4 btn-primary text-sm w-full"
                  >
                    + {t('jobs:actions.add_repair_record')}
                  </button>
                )}
              </div>
            )}

            {/* Parts Tab */}
            {activeTab === 'parts' && (
              <div>
                {job.jobParts && job.jobParts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                            อะไหล่
                          </th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                            จำนวน
                          </th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                            ราคา/ชิ้น
                          </th>
                          <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                            รวม
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {job.jobParts.map((jp: any) => (
                          <tr key={jp.id}>
                            <td className="px-4 py-3">
                              <div className="font-medium">{jp.part.partName}</div>
                              <div className="text-xs text-gray-500">
                                {jp.part.partNumber}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {jp.quantity}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {Number(jp.unitPrice).toLocaleString()} ฿
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              {(jp.quantity * Number(jp.unitPrice)).toLocaleString()} ฿
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 font-semibold">
                          <td colSpan={3} className="px-4 py-3 text-right">
                            รวมทั้งสิ้น
                          </td>
                          <td className="px-4 py-3 text-right">
                            {job.jobParts
                              .reduce(
                                (sum: number, jp: any) =>
                                  sum + jp.quantity * Number(jp.unitPrice),
                                0
                              )
                              .toLocaleString()}{' '}
                            ฿
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🔧</div>
                    <p>ยังไม่มีการเบิกอะไหล่</p>
                    <button
                      onClick={() => setShowAddPart(true)}
                      className="mt-4 btn-secondary text-sm"
                    >
                      + เบิกอะไหล่
                    </button>
                  </div>
                )}
                
                {/* Add Part Button (when have parts) */}
                {job.jobParts && job.jobParts.length > 0 && (
                  <button
                    onClick={() => setShowAddPart(true)}
                    className="mt-4 btn-primary text-sm w-full"
                  >
                    + เบิกอะไหล่เพิ่ม
                  </button>
                )}
              </div>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <div>
                {job.images && job.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {job.images.map((image: any) => (
                      <div
                        key={image.id}
                        className="border rounded-lg overflow-hidden"
                      >
                        <div className="aspect-square bg-gray-100 flex items-center justify-center">
                          <div className="text-4xl">🖼️</div>
                        </div>
                        <div className="p-2">
                          <div className="text-xs text-gray-500">
                            {image.imageType}
                          </div>
                          {image.caption && (
                            <div className="text-xs text-gray-700 truncate">
                              {image.caption}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📸</div>
                    <p>ยังไม่มีรูปภาพ</p>
                    <button
                      onClick={() => setShowUploadImage(true)}
                      className="mt-4 btn-secondary text-sm"
                    >
                      + {t('jobs:actions.upload_images')}
                    </button>
                  </div>
                )}
                
                {/* Add Image Button (when have images) */}
                {job.images && job.images.length > 0 && (
                  <button
                    onClick={() => setShowUploadImage(true)}
                    className="mt-4 btn-primary text-sm w-full"
                  >
                    + {t('jobs:actions.upload_images')}
                  </button>
                )}
              </div>
            )}

            {/* Quotations Tab */}
            {activeTab === 'quotations' && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">💰</div>
                <p>ฟีเจอร์ใบเสนอราคายังไม่พร้อมใช้งาน</p>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">💳</div>
                <p>ฟีเจอร์การชำระเงินยังไม่พร้อมใช้งาน</p>
              </div>
            )}

            {/* Activity Log Tab */}
            {activeTab === 'activity' && (
              <div>
                {job.activityLogs && job.activityLogs.length > 0 ? (
                  <div className="space-y-3">
                    {job.activityLogs.map((log: any) => (
                      <div
                        key={log.id}
                        className="flex gap-3 text-sm"
                      >
                        <div className="text-gray-400 shrink-0 w-32">
                          {formatDate(log.createdAt)}
                        </div>
                        <div className="flex-1">
                          <span className="font-medium text-gray-900">
                            {log.user?.fullName || 'System'}
                          </span>
                          <span className="text-gray-600"> {log.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">📜</div>
                    <p>ยังไม่มีประวัติการทำงาน</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {showChangeStatus && (
          <ChangeStatusModal
            jobId={job.id}
            jobNumber={job.jobNumber}
            currentStatus={job.status}
            onClose={() => setShowChangeStatus(false)}
            onSuccess={fetchJob}
          />
        )}

        {showAssignTech && (
          <AssignTechnicianModal
            jobId={job.id}
            jobNumber={job.jobNumber}
            currentTechnician={job.technician}
            onClose={() => setShowAssignTech(false)}
            onSuccess={fetchJob}
          />
        )}

        {showAddRecord && (
          <RepairRecordModal
            jobId={job.id}
            jobNumber={job.jobNumber}
            onClose={() => setShowAddRecord(false)}
            onSuccess={fetchJob}
          />
        )}

        {showAddPart && (
          <PartRequestModal
            jobId={job.id}
            jobNumber={job.jobNumber}
            onClose={() => setShowAddPart(false)}
            onSuccess={fetchJob}
          />
        )}

        {showUploadImage && (
          <ImageUploadModal
            jobId={job.id}
            jobNumber={job.jobNumber}
            onClose={() => setShowUploadImage(false)}
            onSuccess={fetchJob}
          />
        )}
      </div>
    </div>
  );
}

