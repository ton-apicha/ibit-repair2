/**
 * Model Routes
 * เส้นทาง API สำหรับจัดการรุ่นเครื่องขุด
 */

import { Router } from 'express';
import {
  getAllModels,
  getModelById,
  createModel,
  updateModel,
  deleteModel,
} from '../controllers/model.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// GET /api/models - ดึงรายการรุ่นทั้งหมด (ทุกคนเข้าถึงได้)
router.get('/', authenticate, getAllModels);

// GET /api/models/:id - ดึงรุ่นเดียว (ทุกคนเข้าถึงได้)
router.get('/:id', authenticate, getModelById);

// POST /api/models - สร้างรุ่นใหม่ (Admin/Manager only)
router.post(
  '/',
  authenticate,
  authorize([Role.ADMIN, Role.MANAGER]),
  createModel
);

// PUT /api/models/:id - แก้ไขรุ่น (Admin/Manager only)
router.put(
  '/:id',
  authenticate,
  authorize([Role.ADMIN, Role.MANAGER]),
  updateModel
);

// DELETE /api/models/:id - ลบรุ่น (Admin only)
router.delete('/:id', authenticate, authorize([Role.ADMIN]), deleteModel);

export default router;

