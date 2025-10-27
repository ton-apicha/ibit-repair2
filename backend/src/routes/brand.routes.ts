/**
 * Brand Routes
 * เส้นทาง API สำหรับจัดการยี่ห้อเครื่องขุด
 */

import { Router } from 'express';
import {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../controllers/brand.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// GET /api/brands - ดึงรายการยี่ห้อทั้งหมด (ทุกคนเข้าถึงได้)
router.get('/', authenticate, getAllBrands);

// GET /api/brands/:id - ดึงยี่ห้อเดียว (ทุกคนเข้าถึงได้)
router.get('/:id', authenticate, getBrandById);

// POST /api/brands - สร้างยี่ห้อใหม่ (Admin/Manager only)
router.post(
  '/',
  authenticate,
  authorize([Role.ADMIN, Role.MANAGER]),
  createBrand
);

// PUT /api/brands/:id - แก้ไขยี่ห้อ (Admin/Manager only)
router.put(
  '/:id',
  authenticate,
  authorize([Role.ADMIN, Role.MANAGER]),
  updateBrand
);

// DELETE /api/brands/:id - ลบยี่ห้อ (Admin only)
router.delete('/:id', authenticate, authorize([Role.ADMIN]), deleteBrand);

export default router;

