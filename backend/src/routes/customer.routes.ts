/**
 * Customer Routes
 * เส้นทาง API สำหรับจัดการลูกค้า
 */

import { Router } from 'express';
import {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customer.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// ทุก route ต้อง authenticate (login) ก่อน
router.use(authenticate);

/**
 * GET /api/customers
 * ดึงรายการลูกค้าทั้งหมด (รองรับ search และ pagination)
 * Query: ?search=xxx&page=1&limit=20
 */
router.get('/', getAllCustomers);

/**
 * GET /api/customers/:id
 * ดึงข้อมูลลูกค้าตาม ID พร้อมประวัติงานซ่อม
 */
router.get('/:id', getCustomerById);

/**
 * POST /api/customers
 * สร้างลูกค้าใหม่
 * Body: { name, phone, email?, address?, notes? }
 */
router.post('/', createCustomer);

/**
 * PUT /api/customers/:id
 * แก้ไขข้อมูลลูกค้า
 * Body: { name?, phone?, email?, address?, notes? }
 */
router.put('/:id', updateCustomer);

/**
 * DELETE /api/customers/:id
 * ลบลูกค้า (เฉพาะ Admin และ Manager)
 */
router.delete('/:id', authorize([Role.ADMIN, Role.MANAGER]), deleteCustomer);

export default router;

