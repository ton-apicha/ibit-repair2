/**
 * Authentication Routes
 * เส้นทาง API สำหรับ Authentication
 */

import { Router } from 'express';
import { login, getCurrentUser, logout, refreshToken, updateLanguage } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/auth/login
 * เข้าสู่ระบบ - ไม่ต้อง authenticate
 * Body: { username: string, password: string }
 * Response: { token: string, user: object }
 */
router.post('/login', login);

/**
 * GET /api/auth/me
 * ดึงข้อมูล user ปัจจุบัน - ต้อง authenticate
 * Headers: Authorization: Bearer <token>
 * Response: { user: object }
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * POST /api/auth/refresh
 * สร้าง access token ใหม่จาก refresh token
 * Body: { refreshToken: string }
 * Response: { token: string, user: object }
 */
router.post('/refresh', refreshToken);

/**
 * POST /api/auth/logout
 * ออกจากระบบ
 * Response: { message: string }
 */
router.post('/logout', logout);

/**
 * PUT /api/auth/language
 * อัพเดทภาษาที่ต้องการ
 * Body: { language: string }
 * Response: { message: string, data: { language: string } }
 */
router.put('/language', authenticate, updateLanguage);

export default router;

