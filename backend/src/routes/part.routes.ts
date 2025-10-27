/**
 * Part Routes
 * เส้นทาง API สำหรับจัดการอะไหล่
 */

import { Router } from 'express';
import {
  getAllParts,
  getLowStockParts,
  getPartById,
  createPart,
  updatePart,
  updateStock,
  deletePart,
} from '../controllers/part.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// GET /api/parts - ดึงรายการอะไหล่ทั้งหมด (ทุกคนเข้าถึงได้)
router.get('/', authenticate, getAllParts);

// GET /api/parts/low-stock - ดึงอะไหล่สต๊อกต่ำ (ทุกคนเข้าถึงได้)
router.get('/low-stock', authenticate, getLowStockParts);

// GET /api/parts/:id - ดึงอะไหล่เดียว (ทุกคนเข้าถึงได้)
router.get('/:id', authenticate, getPartById);

// POST /api/parts - เพิ่มอะไหล่ใหม่ (Admin/Manager only)
router.post('/', authenticate, authorize([Role.ADMIN, Role.MANAGER]), createPart);

// PUT /api/parts/:id - แก้ไขข้อมูล (Admin/Manager only)
router.put(
  '/:id',
  authenticate,
  authorize([Role.ADMIN, Role.MANAGER]),
  updatePart
);

// PATCH /api/parts/:id/stock - ปรับสต๊อก (Admin/Manager/Technician)
router.patch(
  '/:id/stock',
  authenticate,
  authorize([Role.ADMIN, Role.MANAGER, Role.TECHNICIAN]),
  updateStock
);

// DELETE /api/parts/:id - ลบอะไหล่ (Admin only)
router.delete('/:id', authenticate, authorize([Role.ADMIN]), deletePart);

export default router;

