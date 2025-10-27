/**
 * Job Routes
 * API routes สำหรับงานซ่อม
 */

import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  changeStatus,
  assignTechnician,
  addRepairRecord,
  addJobPart,
  removeJobPart,
  uploadImages,
  deleteImage,
  getActivityLog,
  getJobStatistics,
} from '../controllers/job.controller';

const router = express.Router();

// ใช้ authentication middleware สำหรับทุก route
router.use(authenticate);

/**
 * Job CRUD Routes
 */

// GET /api/jobs - ดึงรายการงานทั้งหมด
router.get('/', getAllJobs);

// GET /api/jobs/stats - ดึงสถิติงาน
router.get('/stats', getJobStatistics);

// GET /api/jobs/:id - ดึงข้อมูลงานตาม ID
router.get('/:id', getJobById);

// POST /api/jobs - สร้างงานใหม่ (เฉพาะ Admin, Manager, Receptionist)
router.post(
  '/',
  authorize(['ADMIN', 'MANAGER', 'RECEPTIONIST']),
  createJob
);

// PUT /api/jobs/:id - แก้ไขงาน (เฉพาะ Admin, Manager)
router.put('/:id', authorize(['ADMIN', 'MANAGER']), updateJob);

// DELETE /api/jobs/:id - ลบงาน (เฉพาะ Admin)
router.delete('/:id', authorize(['ADMIN']), deleteJob);

/**
 * Job Actions Routes
 */

// PATCH /api/jobs/:id/status - เปลี่ยนสถานะงาน
router.patch('/:id/status', changeStatus);

// PATCH /api/jobs/:id/assign - มอบหมายช่าง (เฉพาะ Admin, Manager)
router.patch('/:id/assign', authorize(['ADMIN', 'MANAGER']), assignTechnician);

/**
 * Repair Records Routes
 */

// POST /api/jobs/:id/records - เพิ่มบันทึกการซ่อม (Admin, Manager, Technician)
router.post(
  '/:id/records',
  authorize(['ADMIN', 'MANAGER', 'TECHNICIAN']),
  addRepairRecord
);

/**
 * Parts Routes
 */

// POST /api/jobs/:id/parts - เบิกอะไหล่ (Admin, Manager, Technician)
router.post(
  '/:id/parts',
  authorize(['ADMIN', 'MANAGER', 'TECHNICIAN']),
  addJobPart
);

// DELETE /api/jobs/:id/parts/:partId - ลบอะไหล่ (Admin, Manager)
router.delete(
  '/:id/parts/:partId',
  authorize(['ADMIN', 'MANAGER']),
  removeJobPart
);

/**
 * Images Routes
 */

// POST /api/jobs/:id/images - อัพโหลดรูปภาพ
// Note: ต้อง setup multer middleware ก่อน
router.post('/:id/images', uploadImages);

// DELETE /api/jobs/:id/images/:imageId - ลบรูปภาพ
router.delete('/:id/images/:imageId', deleteImage);

/**
 * Activity Log Routes
 */

// GET /api/jobs/:id/activity - ดึงประวัติการทำงาน
router.get('/:id/activity', getActivityLog);

export default router;


