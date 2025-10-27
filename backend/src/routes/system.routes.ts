/**
 * System Routes
 * เส้นทาง API สำหรับข้อมูลระบบ
 */

import { Router } from 'express';
import {
  getHealth,
  getMetrics,
  getSystemStats,
  getDatabaseInfo,
} from '../controllers/system.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/system/health
 * ตรวจสอบสถานะของระบบ
 */
router.get('/health', authenticate, getHealth);

/**
 * GET /api/system/metrics
 * ดึงข้อมูล System Metrics (CPU, Memory, Disk)
 */
router.get('/metrics', authenticate, getMetrics);

/**
 * GET /api/system/stats
 * ดึงสถิติของระบบ (จำนวน records)
 */
router.get('/stats', authenticate, getSystemStats);

/**
 * GET /api/system/database-info
 * ดึงข้อมูล Database
 */
router.get('/database-info', authenticate, getDatabaseInfo);

export default router;

