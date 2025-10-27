/**
 * User Controller
 * จัดการข้อมูลผู้ใช้ (Users)
 */

import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import prisma from '../utils/prisma';
import bcrypt from 'bcrypt';

/**
 * GET /api/users
 * ดึงรายการผู้ใช้ทั้งหมด (สามารถ filter by role)
 */
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { role } = req.query;

    const where = role
      ? {
          role: role as Role,
        }
      : {};

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        fullName: 'asc',
      },
    });

    res.status(200).json({
      message: 'ดึงข้อมูลผู้ใช้สำเร็จ',
      data: users,
      total: users.length,
    });
  } catch (error) {
    console.error('❌ Get all users error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้',
    });
  }
};

/**
 * GET /api/users/:id
 * ดึงข้อมูลผู้ใช้เดียว
 */
export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        error: 'Not Found',
        message: 'ไม่พบผู้ใช้นี้ในระบบ',
      });
      return;
    }

    res.status(200).json({
      message: 'ดึงข้อมูลผู้ใช้สำเร็จ',
      data: user,
    });
  } catch (error) {
    console.error('❌ Get user by id error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้',
    });
  }
};

/**
 * GET /api/users/technicians
 * ดึงรายการช่างเท่านั้น
 */
export const getTechnicians = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const technicians = await prisma.user.findMany({
      where: {
        role: 'TECHNICIAN',
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        fullName: 'asc',
      },
    });

    res.status(200).json({
      message: 'ดึงข้อมูลช่างสำเร็จ',
      data: technicians,
      total: technicians.length,
    });
  } catch (error) {
    console.error('❌ Get technicians error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลช่าง',
    });
  }
};

/**
 * POST /api/users
 * สร้างผู้ใช้ใหม่
 */
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, password, fullName, email, phone, role } = req.body;

    // ตรวจสอบว่า username ซ้ำหรือไม่
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Username นี้มีในระบบแล้ว',
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // สร้าง user ใหม่
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        fullName,
        email,
        phone,
        role: role || 'TECHNICIAN',
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({
      message: 'สร้างผู้ใช้สำเร็จ',
      data: newUser,
    });
  } catch (error) {
    console.error('❌ Create user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการสร้างผู้ใช้',
    });
  }
};

/**
 * PUT /api/users/:id
 * แก้ไขข้อมูลผู้ใช้
 */
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, role } = req.body;

    // ตรวจสอบว่ามี user นี้หรือไม่
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      res.status(404).json({
        error: 'Not Found',
        message: 'ไม่พบผู้ใช้นี้ในระบบ',
      });
      return;
    }

    // อัพเดทข้อมูล
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        fullName,
        email,
        phone,
        role,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      message: 'อัพเดทข้อมูลผู้ใช้สำเร็จ',
      data: updatedUser,
    });
  } catch (error) {
    console.error('❌ Update user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการอัพเดทข้อมูลผู้ใช้',
    });
  }
};

/**
 * DELETE /api/users/:id
 * ลบผู้ใช้ (Soft delete - ปิดการใช้งาน)
 */
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // ตรวจสอบว่ามี user นี้หรือไม่
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      res.status(404).json({
        error: 'Not Found',
        message: 'ไม่พบผู้ใช้นี้ในระบบ',
      });
      return;
    }

    // Soft delete - ปิดการใช้งาน
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    res.status(200).json({
      message: 'ลบผู้ใช้สำเร็จ',
    });
  } catch (error) {
    console.error('❌ Delete user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการลบผู้ใช้',
    });
  }
};

/**
 * PATCH /api/users/:id/toggle-active
 * เปิด/ปิดการใช้งานผู้ใช้
 */
export const toggleUserActive = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // ตรวจสอบว่ามี user นี้หรือไม่
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      res.status(404).json({
        error: 'Not Found',
        message: 'ไม่พบผู้ใช้นี้ในระบบ',
      });
      return;
    }

    // Toggle isActive
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !existingUser.isActive },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      message: `${updatedUser.isActive ? 'เปิด' : 'ปิด'}การใช้งานผู้ใช้สำเร็จ`,
      data: updatedUser,
    });
  } catch (error) {
    console.error('❌ Toggle user active error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการเปิด/ปิดการใช้งานผู้ใช้',
    });
  }
};

/**
 * POST /api/users/:id/reset-password
 * รีเซ็ตรหัสผ่าน
 */
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'กรุณาระบุรหัสผ่านใหม่',
      });
      return;
    }

    // ตรวจสอบว่ามี user นี้หรือไม่
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      res.status(404).json({
        error: 'Not Found',
        message: 'ไม่พบผู้ใช้นี้ในระบบ',
      });
      return;
    }

    // Hash password ใหม่
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // อัพเดทรหัสผ่าน
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    res.status(200).json({
      message: 'รีเซ็ตรหัสผ่านสำเร็จ',
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน',
    });
  }
};
