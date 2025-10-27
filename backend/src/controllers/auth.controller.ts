/**
 * Authentication Controller
 * จัดการ Login, Logout, และ Refresh Token
 */

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { generateToken, generateRefreshToken, TokenPayload } from '../utils/jwt';

/**
 * Login - ตรวจสอบ username/password และออก JWT token
 * POST /api/auth/login
 * Body: { username: string, password: string }
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // 🐛 DEBUG: แสดงข้อมูล request
    console.log('🔐 Login Request:', {
      username,
      origin: req.headers.origin,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.socket.remoteAddress,
      timestamp: new Date().toISOString(),
    });

    // 1. ตรวจสอบว่ามี username และ password หรือไม่
    if (!username || !password) {
      console.log('❌ Login Failed: Missing credentials');
      res.status(400).json({
        error: 'Bad Request',
        message: 'Please provide username and password',
      });
      return;
    }

    // 2. ค้นหา user จาก database
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        fullName: true,
        role: true,
        isActive: true,
      },
    });

    // 3. ตรวจสอบว่า user มีอยู่หรือไม่
    if (!user) {
      console.log('❌ Login Failed: User not found -', username);
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid username or password',
      });
      return;
    }

    // 4. ตรวจสอบว่า user ถูก active หรือไม่
    if (!user.isActive) {
      console.log('❌ Login Failed: User inactive -', username);
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Account is inactive. Please contact administrator',
      });
      return;
    }

    // 5. ตรวจสอบ password (เปรียบเทียบ password ที่กรอกกับ hash ในฐานข้อมูล)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('❌ Login Failed: Invalid password -', username);
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid username or password',
      });
      return;
    }

    // 6. สร้าง JWT tokens
    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };
    
    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    console.log('✅ Login Success:', {
      userId: user.id,
      username: user.username,
      role: user.role,
      tokenExpiresIn: '30 minutes',
      refreshTokenExpiresIn: '7 days',
    });

    // 7. ส่ง response พร้อม tokens และข้อมูล user (ไม่ส่ง password)
    res.status(200).json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      refreshToken,
      expiresIn: 1800, // 30 นาที (วินาที)
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
    });
  }
};

/**
 * Get Current User - ดึงข้อมูล user ที่ login อยู่
 * GET /api/auth/me
 * Headers: Authorization: Bearer <token>
 */
export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // req.user ถูกตั้งค่าโดย authenticate middleware
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'กรุณา login ก่อนเข้าใช้งาน',
      });
      return;
    }

    // ดึงข้อมูล user จากฐานข้อมูล (เพื่อให้ได้ข้อมูลล่าสุด)
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        error: 'Not Found',
        message: 'ไม่พบข้อมูลผู้ใช้',
      });
      return;
    }

    // ส่งข้อมูล user กลับไป
    res.status(200).json(user);
  } catch (error) {
    console.error('❌ Get current user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้',
    });
  }
};

/**
 * Logout - ออกจากระบบ
 * POST /api/auth/logout
 * 
 * หมายเหตุ: สำหรับ JWT ไม่มีการ logout จริงๆ บน server
 * Client จะลบ token ออกจาก localStorage
 * ถ้าต้องการ implement blacklist token สามารถเพิ่มได้ในอนาคต
 */
/**
 * Refresh Token - ใช้ refresh token เพื่อสร้าง access token ใหม่
 * POST /api/auth/refresh
 * Body: { refreshToken: string }
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Please provide refresh token',
      });
      return;
    }

    // ตรวจสอบ refresh token
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET) as TokenPayload;
    } catch (error) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired refresh token',
      });
      return;
    }

    // ตรวจสอบว่า user ยังคง active อยู่หรือไม่
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Account is inactive',
      });
      return;
    }

    // สร้าง access token ใหม่
    const newToken = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    console.log('✅ Token Refreshed:', {
      userId: user.id,
      username: user.username,
    });

    res.status(200).json({
      message: 'สร้าง token ใหม่สำเร็จ',
      token: newToken,
      expiresIn: 1800, // 30 นาที
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('❌ Refresh token error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการสร้าง token ใหม่',
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // สำหรับ JWT ปกติจะให้ client ลบ token เอง
    // แต่เราอาจจะบันทึก logout event ลง database (optional)
    
    res.status(200).json({
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to logout',
    });
  }
};

/**
 * Update Language Preference
 * PUT /api/auth/language
 * Body: { language: string }
 */
export const updateLanguage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { language } = req.body;
    const userId = req.user?.id;

    if (!['en', 'th', 'zh'].includes(language)) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid language code',
      });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { language },
    });

    res.status(200).json({
      message: 'Language updated successfully',
      data: { language },
    });
  } catch (error) {
    console.error('Update language error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update language',
    });
  }
};

