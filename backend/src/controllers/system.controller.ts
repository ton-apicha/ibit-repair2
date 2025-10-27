/**
 * System Controller
 * จัดการข้อมูลเกี่ยวกับระบบ เช่น Health Check, System Metrics, Database Stats
 */

import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import * as si from 'systeminformation';
import * as os from 'os';

/**
 * GET /api/system/health
 * ตรวจสอบสถานะของระบบ (Database connection, API status)
 */
export const getHealth = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const startTime = Date.now();
    
    // ทดสอบการเชื่อมต่อ Database
    await prisma.$queryRaw`SELECT 1`;
    
    const dbResponseTime = Date.now() - startTime;
    
    // คำนวณ uptime
    const uptime = process.uptime();
    
    res.status(200).json({
      status: 'OK',
      message: 'System is healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        responseTime: `${dbResponseTime}ms`,
      },
      api: {
        status: 'running',
        uptime: `${Math.floor(uptime / 60)} minutes`,
        uptimeSeconds: uptime,
      },
    });
  } catch (error) {
    console.error('❌ Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'System health check failed',
      timestamp: new Date().toISOString(),
      database: {
        status: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });
  }
};

/**
 * GET /api/system/metrics
 * ดึงข้อมูล System Metrics แบบ Real-time (CPU, Memory, Disk)
 */
export const getMetrics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // ดึงข้อมูล CPU
    const cpuLoad = await si.currentLoad();
    
    // ดึงข้อมูล Memory
    const mem = await si.mem();
    
    // ดึงข้อมูล Disk
    const fsSize = await si.fsSize();
    
    // ดึงข้อมูล OS
    const osInfo = await si.osInfo();
    
    // คำนวณ Memory ที่ใช้
    const memUsedPercent = ((mem.used / mem.total) * 100).toFixed(2);
    
    // คำนวณ Disk ที่ใช้ (รวมทุก partition)
    const totalDiskSize = fsSize.reduce((sum, disk) => sum + disk.size, 0);
    const totalDiskUsed = fsSize.reduce((sum, disk) => sum + disk.used, 0);
    const diskUsedPercent = ((totalDiskUsed / totalDiskSize) * 100).toFixed(2);
    
    res.status(200).json({
      timestamp: new Date().toISOString(),
      cpu: {
        usage: parseFloat(cpuLoad.currentLoad.toFixed(2)),
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || 'Unknown',
      },
      memory: {
        total: formatBytes(mem.total),
        used: formatBytes(mem.used),
        free: formatBytes(mem.free),
        usagePercent: parseFloat(memUsedPercent),
        totalBytes: mem.total,
        usedBytes: mem.used,
      },
      disk: {
        total: formatBytes(totalDiskSize),
        used: formatBytes(totalDiskUsed),
        free: formatBytes(totalDiskSize - totalDiskUsed),
        usagePercent: parseFloat(diskUsedPercent),
        partitions: fsSize.map(disk => ({
          mount: disk.mount,
          fs: disk.fs,
          type: disk.type,
          size: formatBytes(disk.size),
          used: formatBytes(disk.used),
          usagePercent: parseFloat(disk.use.toFixed(2)),
        })),
      },
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        arch: osInfo.arch,
        hostname: os.hostname(),
        uptime: Math.floor(os.uptime()),
      },
    });
  } catch (error) {
    console.error('❌ Get metrics error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล metrics',
    });
  }
};

/**
 * GET /api/system/stats
 * ดึงสถิติของระบบ (จำนวน records ในแต่ละตาราง)
 */
export const getSystemStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const [
      usersCount,
      customersCount,
      jobsCount,
      partsCount,
      brandsCount,
      modelsCount,
      warrantiesCount,
      activityLogsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.customer.count(),
      prisma.job.count(),
      prisma.part.count(),
      prisma.brand.count(),
      prisma.minerModel.count(),
      prisma.warrantyProfile.count(),
      prisma.activityLog.count(),
    ]);

    res.status(200).json({
      timestamp: new Date().toISOString(),
      records: {
        users: usersCount,
        customers: customersCount,
        jobs: jobsCount,
        parts: partsCount,
        brands: brandsCount,
        models: modelsCount,
        warranties: warrantiesCount,
        activityLogs: activityLogsCount,
      },
      total: usersCount + customersCount + jobsCount + partsCount + 
             brandsCount + modelsCount + warrantiesCount + activityLogsCount,
    });
  } catch (error) {
    console.error('❌ Get system stats error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการดึงสถิติระบบ',
    });
  }
};

/**
 * GET /api/system/database-info
 * ดึงข้อมูลเกี่ยวกับ Database (version, size, connections)
 */
export const getDatabaseInfo = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // ดึง PostgreSQL version
    const versionResult = await prisma.$queryRaw<Array<{ version: string }>>`
      SELECT version()
    `;
    
    // ดึง Database size
    const sizeResult = await prisma.$queryRaw<Array<{ size: string }>>`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `;
    
    // ดึงจำนวน connections ปัจจุบัน
    const connectionsResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*) as count FROM pg_stat_activity WHERE datname = current_database()
    `;

    // ดึงจำนวน tables
    const tablesResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT count(*) as count FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `;

    res.status(200).json({
      timestamp: new Date().toISOString(),
      version: versionResult[0]?.version || 'Unknown',
      databaseName: process.env.DATABASE_URL?.split('/').pop()?.split('?')[0] || 'Unknown',
      size: sizeResult[0]?.size || 'Unknown',
      connections: Number(connectionsResult[0]?.count || 0),
      tables: Number(tablesResult[0]?.count || 0),
    });
  } catch (error) {
    console.error('❌ Get database info error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล database',
    });
  }
};

/**
 * Helper function: แปลง bytes เป็น human-readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

