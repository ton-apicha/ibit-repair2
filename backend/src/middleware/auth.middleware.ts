/**
 * Authentication Middleware
 * ใช้สำหรับตรวจสอบว่าผู้ใช้ login แล้วหรือยัง และมีสิทธิ์เข้าถึง API หรือไม่
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

// ขยาย Request type เพื่อเพิ่ม property user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        role: Role;
      };
    }
  }
}

/**
 * Interface สำหรับข้อมูลที่เก็บใน JWT Token
 */
interface JwtPayload {
  id: string;
  username: string;
  role: Role;
}

/**
 * Middleware ตรวจสอบ JWT Token
 * ต้อง attach token ใน header: Authorization: Bearer <token>
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // 1. ดึง Authorization header
    const authHeader = req.headers.authorization;

    // 2. ตรวจสอบว่ามี header และเป็นรูปแบบ Bearer token หรือไม่
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'กรุณา login ก่อนเข้าใช้งาน (ไม่พบ token)',
      });
      return;
    }

    // 3. แยกเอา token ออกมา (ตัด "Bearer " ออก)
    const token = authHeader.substring(7);

    // 4. Verify token ด้วย JWT_SECRET
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // 5. เก็บข้อมูล user ไว้ใน req.user เพื่อให้ controller ใช้งาน
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };

    // 6. ถ้าผ่านทุกอย่าง ให้ไปต่อ
    next();
  } catch (error) {
    // Token ไม่ถูกต้องหรือหมดอายุ
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token ไม่ถูกต้อง',
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token หมดอายุแล้ว กรุณา login ใหม่',
      });
      return;
    }

    // Error อื่นๆ
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์',
    });
  }
};

/**
 * Middleware ตรวจสอบสิทธิ์ตาม Role
 * ใช้หลังจาก authenticate middleware
 * 
 * ตัวอย่าง: authorize([Role.ADMIN, Role.MANAGER])
 */
export const authorize = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // ตรวจสอบว่ามีข้อมูล user หรือไม่ (ควรผ่าน authenticate มาก่อน)
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'กรุณา login ก่อนเข้าใช้งาน',
      });
      return;
    }

    // ตรวจสอบว่า role ของ user อยู่ใน allowedRoles หรือไม่
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้',
        requiredRoles: allowedRoles,
        yourRole: req.user.role,
      });
      return;
    }

    // ถ้าผ่านทุกอย่าง ให้ไปต่อ
    next();
  };
};

/**
 * ตัวอย่างการใช้งาน:
 * 
 * // ต้อง login เท่านั้น
 * router.get('/profile', authenticate, getProfile);
 * 
 * // ต้อง login และเป็น ADMIN หรือ MANAGER เท่านั้น
 * router.delete('/users/:id', authenticate, authorize([Role.ADMIN, Role.MANAGER]), deleteUser);
 * 
 * // ต้อง login และเป็น ADMIN เท่านั้น
 * router.post('/settings', authenticate, authorize([Role.ADMIN]), updateSettings);
 */

