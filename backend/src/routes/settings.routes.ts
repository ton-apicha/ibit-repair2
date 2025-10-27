/**
 * Settings Routes
 * เส้นทาง API สำหรับการตั้งค่าระบบ
 */

import { Router } from 'express';
import {
  getSettings,
  updateSettings,
  uploadLogo,
  upload,
} from '../controllers/settings.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/settings
 * ดึงการตั้งค่าระบบ
 */
router.get('/', authenticate, getSettings);

/**
 * PUT /api/settings
 * อัพเดทการตั้งค่าระบบ
 */
router.put('/', authenticate, updateSettings);

/**
 * POST /api/settings/logo
 * อัปโหลดโลโก้ร้าน
 */
router.post('/logo', authenticate, upload.single('logo'), uploadLogo);

export default router;

