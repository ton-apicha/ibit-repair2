/**
 * System Monitor Tab Component
 * แสดงข้อมูล System Health, Metrics และ Statistics
 */

'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface HealthData {
  status: string;
  timestamp: string;
  database: {
    status: string;
    responseTime: string;
  };
  api: {
    status: string;
    uptime: string;
    uptimeSeconds: number;
  };
}

interface MetricsData {
  timestamp: string;
  cpu: {
    usage: number;
    cores: number;
    model: string;
  };
  memory: {
    total: string;
    used: string;
    free: string;
    usagePercent: number;
    totalBytes: number;
    usedBytes: number;
  };
  disk: {
    total: string;
    used: string;
    free: string;
    usagePercent: number;
  };
  os: {
    platform: string;
    distro: string;
    release: string;
    arch: string;
    hostname: string;
    uptime: number;
  };
}

interface StatsData {
  timestamp: string;
  records: {
    users: number;
    customers: number;
    jobs: number;
    parts: number;
    brands: number;
    models: number;
    warranties: number;
    activityLogs: number;
  };
  total: number;
}

interface DatabaseInfo {
  timestamp: string;
  version: string;
  databaseName: string;
  size: string;
  connections: number;
  tables: number;
}

export default function SystemMonitorTab() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch all data
  const fetchData = async () => {
    try {
      console.log('📊 SystemMonitorTab: Fetching system data...');
      const [healthRes, metricsRes, statsRes, dbInfoRes] = await Promise.all([
        api.get('/api/system/health'),
        api.get('/api/system/metrics'),
        api.get('/api/system/stats'),
        api.get('/api/system/database-info'),
      ]);

      console.log('📊 SystemMonitorTab: System data fetched successfully');
      setHealth(healthRes.data);
      setMetrics(metricsRes.data);
      setStats(statsRes.data);
      setDbInfo(dbInfoRes.data);
      setLastUpdated(new Date());
    } catch (error: any) {
      console.error('❌ SystemMonitorTab: Error fetching system data:', error);
      console.error('  Status:', error.response?.status);
      console.error('  Message:', error.response?.data?.message);
      
      // ไม่แสดง error ถ้าเป็น authentication error
      if (error.response?.status !== 401) {
        console.error('System monitoring data unavailable');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Progress bar color based on percentage
  const getProgressColor = (percent: number) => {
    if (percent < 60) return 'bg-green-500';
    if (percent < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Format uptime
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days} วัน ${hours} ชั่วโมง`;
    if (hours > 0) return `${hours} ชั่วโมง ${minutes} นาที`;
    return `${minutes} นาที`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-4xl mb-4">⚙️</div>
          <p className="text-gray-600">กำลังโหลดข้อมูลระบบ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">System Monitor</h2>
          <p className="text-gray-600">
            ตรวจสอบสถานะและประสิทธิภาพของระบบ
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh (30s)
          </label>
          <button onClick={fetchData} className="btn-secondary text-sm">
            🔄 รีเฟรช
          </button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-gray-500">
        อัพเดทล่าสุด: {lastUpdated.toLocaleTimeString('th-TH')}
      </div>

      {/* Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Database Status */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">🗄️ Database</h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                health?.database.status === 'connected'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {health?.database.status === 'connected'
                ? 'เชื่อมต่อแล้ว'
                : 'ไม่เชื่อมต่อ'}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Response Time:</span>
              <span className="font-medium">{health?.database.responseTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Database:</span>
              <span className="font-medium">{dbInfo?.databaseName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Size:</span>
              <span className="font-medium">{dbInfo?.size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Connections:</span>
              <span className="font-medium">{dbInfo?.connections}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tables:</span>
              <span className="font-medium">{dbInfo?.tables}</span>
            </div>
          </div>
        </div>

        {/* API Status */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">🚀 API Server</h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                health?.status === 'OK'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {health?.status === 'OK' ? 'ทำงานปกติ' : 'มีปัญหา'}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium">{health?.api.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Uptime:</span>
              <span className="font-medium">
                {health?.api.uptimeSeconds
                  ? formatUptime(health.api.uptimeSeconds)
                  : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform:</span>
              <span className="font-medium">{metrics?.os.platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Hostname:</span>
              <span className="font-medium">{metrics?.os.hostname}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">OS Uptime:</span>
              <span className="font-medium">
                {metrics?.os.uptime ? formatUptime(metrics.os.uptime) : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">📊 System Metrics</h3>
        <div className="space-y-6">
          {/* CPU Usage */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                🖥️ CPU Usage ({metrics?.cpu.cores} cores)
              </span>
              <span className="text-sm font-bold text-gray-900">
                {metrics?.cpu.usage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${getProgressColor(
                  metrics?.cpu.usage || 0
                )}`}
                style={{ width: `${metrics?.cpu.usage || 0}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{metrics?.cpu.model}</p>
          </div>

          {/* Memory Usage */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                💾 Memory Usage
              </span>
              <span className="text-sm font-bold text-gray-900">
                {metrics?.memory.used} / {metrics?.memory.total} (
                {metrics?.memory.usagePercent.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${getProgressColor(
                  metrics?.memory.usagePercent || 0
                )}`}
                style={{ width: `${metrics?.memory.usagePercent || 0}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Free: {metrics?.memory.free}
            </p>
          </div>

          {/* Disk Usage */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                💿 Disk Usage
              </span>
              <span className="text-sm font-bold text-gray-900">
                {metrics?.disk.used} / {metrics?.disk.total} (
                {metrics?.disk.usagePercent.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${getProgressColor(
                  metrics?.disk.usagePercent || 0
                )}`}
                style={{ width: `${metrics?.disk.usagePercent || 0}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Free: {metrics?.disk.free}
            </p>
          </div>
        </div>
      </div>

      {/* Database Statistics */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">📈 Database Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">
              {stats?.records.users}
            </div>
            <div className="text-sm text-gray-600 mt-1">👤 Users</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              {stats?.records.customers}
            </div>
            <div className="text-sm text-gray-600 mt-1">👥 Customers</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {stats?.records.jobs}
            </div>
            <div className="text-sm text-gray-600 mt-1">📋 Jobs</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-3xl font-bold text-yellow-600">
              {stats?.records.parts}
            </div>
            <div className="text-sm text-gray-600 mt-1">📦 Parts</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600">
              {stats?.records.brands}
            </div>
            <div className="text-sm text-gray-600 mt-1">🏷️ Brands</div>
          </div>
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <div className="text-3xl font-bold text-indigo-600">
              {stats?.records.models}
            </div>
            <div className="text-sm text-gray-600 mt-1">⚙️ Models</div>
          </div>
          <div className="text-center p-4 bg-pink-50 rounded-lg">
            <div className="text-3xl font-bold text-pink-600">
              {stats?.records.warranties}
            </div>
            <div className="text-sm text-gray-600 mt-1">🛡️ Warranties</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-600">
              {stats?.records.activityLogs}
            </div>
            <div className="text-sm text-gray-600 mt-1">📝 Activity Logs</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <span className="text-sm text-gray-600">Total Records: </span>
          <span className="text-lg font-bold text-gray-900">{stats?.total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

