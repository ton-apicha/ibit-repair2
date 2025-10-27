/**
 * User Routes
 * เส้นทาง API สำหรับจัดการข้อมูลผู้ใช้
 */

import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  getTechnicians,
  createUser,
  updateUser,
  deleteUser,
  toggleUserActive,
  resetPassword,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/users
 * ดึงรายการผู้ใช้ทั้งหมด (สามารถ filter by role)
 * Query: ?role=TECHNICIAN
 */
router.get('/', authenticate, getAllUsers);

/**
 * GET /api/users/technicians
 * ดึงรายการช่างเท่านั้น
 * Note: ต้องอยู่ก่อน /:id เพื่อไม่ให้ถูกจับเป็น :id
 */
router.get('/technicians', authenticate, getTechnicians);

/**
 * GET /api/users/:id
 * ดึงข้อมูลผู้ใช้เดียว
 */
router.get('/:id', authenticate, getUserById);

/**
 * POST /api/users
 * สร้างผู้ใช้ใหม่
 */
router.post('/', authenticate, createUser);

/**
 * PUT /api/users/:id
 * แก้ไขข้อมูลผู้ใช้
 */
router.put('/:id', authenticate, updateUser);

/**
 * DELETE /api/users/:id
 * ลบผู้ใช้ (Soft delete)
 */
router.delete('/:id', authenticate, deleteUser);

/**
 * PATCH /api/users/:id/toggle-active
 * เปิด/ปิดการใช้งานผู้ใช้
 */
router.patch('/:id/toggle-active', authenticate, toggleUserActive);

/**
 * POST /api/users/:id/reset-password
 * รีเซ็ตรหัสผ่าน
 */
router.post('/:id/reset-password', authenticate, resetPassword);

export default router;
