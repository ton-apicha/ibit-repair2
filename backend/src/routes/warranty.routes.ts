/**
 * Warranty Routes
 * เส้นทาง API สำหรับจัดการโปรไฟล์การรับประกัน
 */

import { Router } from 'express';
import {
  getAllWarranties,
  getWarrantyById,
  createWarranty,
  updateWarranty,
  deleteWarranty,
} from '../controllers/warranty.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// GET /api/warranties - ดึงรายการโปรไฟล์ทั้งหมด (ทุกคนเข้าถึงได้)
router.get('/', authenticate, getAllWarranties);

// GET /api/warranties/:id - ดึงโปรไฟล์เดียว (ทุกคนเข้าถึงได้)
router.get('/:id', authenticate, getWarrantyById);

// POST /api/warranties - สร้างโปรไฟล์ใหม่ (Admin/Manager only)
router.post(
  '/',
  authenticate,
  authorize([Role.ADMIN, Role.MANAGER]),
  createWarranty
);

// PUT /api/warranties/:id - แก้ไขโปรไฟล์ (Admin/Manager only)
router.put(
  '/:id',
  authenticate,
  authorize([Role.ADMIN, Role.MANAGER]),
  updateWarranty
);

// DELETE /api/warranties/:id - ลบโปรไฟล์ (Admin only)
router.delete('/:id', authenticate, authorize([Role.ADMIN]), deleteWarranty);

export default router;

