/**
 * Settings Page
 * หน้าตั้งค่าระบบ (เฉพาะ ADMIN)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import UserManagementTab from '@/components/settings/UserManagementTab';
import SystemMonitorTab from '@/components/settings/SystemMonitorTab';
import LogsViewerTab from '@/components/settings/LogsViewerTab';
import GeneralSettingsTab from '@/components/settings/GeneralSettingsTab';

type TabType = 'users' | 'monitor' | 'logs' | 'general';

export default function SettingsPage() {
  const router = useRouter();
  const { t } = useTranslation(['settings', 'common']);
  const { user, checkAuth } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [loading, setLoading] = useState(true);

  // ตรวจสอบสิทธิ์ - เฉพาะ ADMIN เท่านั้น
  useEffect(() => {
    // ตรวจสอบ user จาก localStorage โดยตรง ไม่เรียก API
    if (!user) {
      console.log('🔒 Settings: No user found, redirecting to login');
      router.push('/login');
      return;
    }

    if (user.role !== 'ADMIN') {
      console.log('🚫 Settings: User is not ADMIN, redirecting to dashboard');
      alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
      router.push('/dashboard');
      return;
    }

    console.log('✅ Settings: User is ADMIN, loading page');
    setLoading(false);
  }, [user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚙️</div>
          <p className="text-gray-600">{t('common:loading')}</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'ADMIN') {
    return null; // จะถูก redirect ไปแล้ว
  }

  // Tab configuration
  const tabs = [
    { id: 'users' as TabType, label: `👥 ${t('settings:tabs.users')}`, icon: '👥' },
    { id: 'monitor' as TabType, label: `📊 ${t('settings:tabs.system')}`, icon: '📊' },
    { id: 'logs' as TabType, label: `📝 ${t('settings:tabs.logs')}`, icon: '📝' },
    { id: 'general' as TabType, label: `⚙️ ${t('settings:tabs.general')}`, icon: '⚙️' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">⚙️ {t('settings:title')}</h1>
        <p className="text-gray-600 mt-1">
          {t('common:app_name')}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        {/* Desktop Tabs */}
        <div className="hidden md:flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as TabType)}
            className="input w-full"
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'users' && <UserManagementTab />}
        {activeTab === 'monitor' && <SystemMonitorTab />}
        {activeTab === 'logs' && <LogsViewerTab />}
        {activeTab === 'general' && <GeneralSettingsTab />}
      </div>
    </div>
  );
}

