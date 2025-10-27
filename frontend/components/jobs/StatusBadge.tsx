/**
 * Status Badge Component
 * แสดงสถานะงานซ่อมด้วยสีและไอคอน
 */

import { useTranslation } from 'react-i18next';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { t } = useTranslation(['jobs']);
  
  // กำหนดสีและไอคอนสำหรับแต่ละสถานะ
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: '📥',
          label: t('jobs:status.RECEIVED'),
        };
      case 'DIAGNOSED':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: '🔍',
          label: t('jobs:status.DIAGNOSED'),
        };
      case 'WAITING_APPROVAL':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: '⏳',
          label: t('jobs:status.WAITING_APPROVAL'),
        };
      case 'IN_REPAIR':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: '🔧',
          label: t('jobs:status.IN_REPAIR'),
        };
      case 'WAITING_PARTS':
        return {
          color: 'bg-pink-100 text-pink-800 border-pink-200',
          icon: '📦',
          label: t('jobs:status.WAITING_PARTS'),
        };
      case 'TESTING':
        return {
          color: 'bg-teal-100 text-teal-800 border-teal-200',
          icon: '🧪',
          label: t('jobs:status.TESTING'),
        };
      case 'READY_FOR_PICKUP':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: '✅',
          label: t('jobs:status.READY_FOR_PICKUP'),
        };
      case 'COMPLETED':
        return {
          color: 'bg-green-600 text-white border-green-700',
          icon: '🎉',
          label: t('jobs:status.COMPLETED'),
        };
      case 'CANCELLED':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: '❌',
          label: t('jobs:status.CANCELLED'),
        };
      case 'ON_HOLD':
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '⏸️',
          label: t('jobs:status.ON_HOLD'),
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '❓',
          label: status,
        };
    }
  };

  const config = getStatusConfig(status);

  // กำหนดขนาด
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${config.color} ${sizeClasses[size]}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}

/**
 * ฟังก์ชันช่วยแปลงสถานะเป็นภาษาที่เลือก (สำหรับใช้ที่อื่น)
 */
export function getStatusLabel(status: string, language: string = 'th'): string {
  const config = {
    th: {
      RECEIVED: 'รับเครื่องแล้ว',
      DIAGNOSED: 'วินิจฉัยแล้ว',
      WAITING_APPROVAL: 'รออนุมัติ',
      IN_REPAIR: 'กำลังซ่อม',
      WAITING_PARTS: 'รออะไหล่',
      TESTING: 'ทดสอบ',
      READY_FOR_PICKUP: 'พร้อมส่งมอบ',
      COMPLETED: 'เสร็จสิ้น',
      CANCELLED: 'ยกเลิก',
      ON_HOLD: 'พักไว้',
    },
    en: {
      RECEIVED: 'Received',
      DIAGNOSED: 'Diagnosed',
      WAITING_APPROVAL: 'Waiting Approval',
      IN_REPAIR: 'In Repair',
      WAITING_PARTS: 'Waiting Parts',
      TESTING: 'Testing',
      READY_FOR_PICKUP: 'Ready for Pickup',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
      ON_HOLD: 'On Hold',
    },
    zh: {
      RECEIVED: '已接收',
      DIAGNOSED: '已诊断',
      WAITING_APPROVAL: '等待客户批准',
      IN_REPAIR: '维修中',
      WAITING_PARTS: '等待零件',
      TESTING: '测试中',
      READY_FOR_PICKUP: '准备取货',
      COMPLETED: '已完成',
      CANCELLED: '已取消',
      ON_HOLD: '暂停',
    },
  };

  return config[language as keyof typeof config]?.[status as keyof typeof config.th] || status;
}

/**
 * ฟังก์ชันช่วยดึงสีสำหรับสถานะ (สำหรับใช้กับ chart/graph)
 */
export function getStatusColor(status: string): string {
  const colors = {
    RECEIVED: '#3B82F6', // Blue
    DIAGNOSED: '#A855F7', // Purple
    WAITING_APPROVAL: '#F59E0B', // Yellow
    IN_REPAIR: '#F97316', // Orange
    WAITING_PARTS: '#EC4899', // Pink
    TESTING: '#14B8A6', // Teal
    READY_FOR_PICKUP: '#10B981', // Green
    COMPLETED: '#059669', // Dark Green
    CANCELLED: '#EF4444', // Red
    ON_HOLD: '#6B7280', // Gray
  };

  return colors[status as keyof typeof colors] || '#6B7280';
}


