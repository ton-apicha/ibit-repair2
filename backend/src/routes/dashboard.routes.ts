/**
 * Dashboard Routes
 * API routes สำหรับ Dashboard
 */

import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getStatistics,
  getRecentJobs,
  getLowStockParts,
  getJobsByStatus,
  getTechnicianPerformance,
  getRecentActivity,
} from '../controllers/dashboard.controller';

const router = express.Router();

// ใช้ authentication สำหรับทุก route
router.use(authenticate);

// GET /api/dashboard/statistics - สถิติรวม
router.get('/statistics', getStatistics);

// GET /api/dashboard/recent-jobs - งานล่าสุด
router.get('/recent-jobs', getRecentJobs);

// GET /api/dashboard/low-stock - อะไหล่สต๊อกต่ำ
router.get('/low-stock', getLowStockParts);

// GET /api/dashboard/jobs-by-status - งานตามสถานะ
router.get('/jobs-by-status', getJobsByStatus);

// GET /api/dashboard/technician-performance - ประสิทธิภาพช่าง
router.get('/technician-performance', getTechnicianPerformance);

// GET /api/dashboard/recent-activity - กิจกรรมล่าสุด
router.get('/recent-activity', getRecentActivity);

export default router;


