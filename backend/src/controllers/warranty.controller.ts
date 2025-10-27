/**
 * Warranty Controller
 * จัดการโปรไฟล์การรับประกัน
 */

import { Request, Response } from 'express';
import prisma from '../utils/prisma';

/**
 * GET /api/warranties
 * ดึงรายการโปรไฟล์การรับประกันทั้งหมด
 */
export const getAllWarranties = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const warranties = await prisma.warrantyProfile.findMany({
      include: {
        _count: {
          select: {
            jobs: true,
          },
        },
      },
      orderBy: {
        durationDays: 'asc',
      },
    });

    res.status(200).json({
      message: 'ดึงข้อมูลโปรไฟล์การรับประกันสำเร็จ',
      data: warranties,
      total: warranties.length,
    });
  } catch (error) {
    console.error('❌ Get all warranties error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์การรับประกัน',
    });
  }
};

/**
 * GET /api/warranties/:id
 * ดึงข้อมูลโปรไฟล์การรับประกันเดียว
 */
export const getWarrantyById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const warranty = await prisma.warrantyProfile.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            jobs: true,
          },
        },
      },
    });

    if (!warranty) {
      res.status(404).json({
        error: 'Not Found',
        message: 'ไม่พบโปรไฟล์การรับประกันนี้ในระบบ',
      });
      return;
    }

    res.status(200).json({
      message: 'ดึงข้อมูลโปรไฟล์การรับประกันสำเร็จ',
      data: warranty,
    });
  } catch (error) {
    console.error('❌ Get warranty by id error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์การรับประกัน',
    });
  }
};

/**
 * POST /api/warranties
 * สร้างโปรไฟล์การรับประกันใหม่ (Admin/Manager only)
 */
export const createWarranty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      durationDays,
      description,
      terms,
      laborWarranty,
      partsWarranty,
    } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!name || name.trim() === '') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'กรุณากรอกชื่อโปรไฟล์',
      });
      return;
    }

    if (durationDays === undefined || durationDays < 0) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'กรุณาระบุระยะเวลารับประกัน (วัน)',
      });
      return;
    }

    // ตรวจสอบว่ามีชื่อซ้ำหรือไม่
    const existingWarranty = await prisma.warrantyProfile.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (existingWarranty) {
      res.status(409).json({
        error: 'Conflict',
        message: 'โปรไฟล์นี้มีอยู่ในระบบแล้ว',
      });
      return;
    }

    // สร้างโปรไฟล์ใหม่
    const warranty = await prisma.warrantyProfile.create({
      data: {
        name: name.trim(),
        durationDays: parseInt(durationDays),
        description: description?.trim() || null,
        terms: terms?.trim() || null,
        laborWarranty: laborWarranty === true,
        partsWarranty: partsWarranty === true,
        isActive: true,
      },
    });

    res.status(201).json({
      message: 'สร้างโปรไฟล์การรับประกันสำเร็จ',
      data: warranty,
    });
  } catch (error) {
    console.error('❌ Create warranty error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการสร้างโปรไฟล์การรับประกัน',
    });
  }
};

/**
 * PUT /api/warranties/:id
 * แก้ไขโปรไฟล์การรับประกัน (Admin/Manager only)
 */
export const updateWarranty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      durationDays,
      description,
      terms,
      laborWarranty,
      partsWarranty,
      isActive,
    } = req.body;

    // ตรวจสอบว่ามีโปรไฟล์นี้หรือไม่
    const existingWarranty = await prisma.warrantyProfile.findUnique({
      where: { id },
    });

    if (!existingWarranty) {
      res.status(404).json({
        error: 'Not Found',
        message: 'ไม่พบโปรไฟล์การรับประกันนี้ในระบบ',
      });
      return;
    }

    // ตรวจสอบข้อมูล
    if (!name || name.trim() === '') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'กรุณากรอกชื่อโปรไฟล์',
      });
      return;
    }

    if (durationDays === undefined || durationDays < 0) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'กรุณาระบุระยะเวลารับประกัน (วัน)',
      });
      return;
    }

    // ตรวจสอบว่ามีชื่อซ้ำกับโปรไฟล์อื่นหรือไม่
    const duplicateWarranty = await prisma.warrantyProfile.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive',
        },
        id: {
          not: id,
        },
      },
    });

    if (duplicateWarranty) {
      res.status(409).json({
        error: 'Conflict',
        message: 'ชื่อโปรไฟล์นี้มีอยู่ในระบบแล้ว',
      });
      return;
    }

    // แก้ไขโปรไฟล์
    const warranty = await prisma.warrantyProfile.update({
      where: { id },
      data: {
        name: name.trim(),
        durationDays: parseInt(durationDays),
        description: description?.trim() || null,
        terms: terms?.trim() || null,
        laborWarranty: laborWarranty === true,
        partsWarranty: partsWarranty === true,
        isActive: isActive !== undefined ? isActive === true : undefined,
      },
    });

    res.status(200).json({
      message: 'แก้ไขโปรไฟล์การรับประกันสำเร็จ',
      data: warranty,
    });
  } catch (error) {
    console.error('❌ Update warranty error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการแก้ไขโปรไฟล์การรับประกัน',
    });
  }
};

/**
 * DELETE /api/warranties/:id
 * ลบโปรไฟล์การรับประกัน (Admin only)
 * หมายเหตุ: ไม่สามารถลบได้ถ้ามีงานใช้อยู่
 */
export const deleteWarranty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // ตรวจสอบว่ามีโปรไฟล์นี้หรือไม่
    const warranty = await prisma.warrantyProfile.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            jobs: true,
          },
        },
      },
    });

    if (!warranty) {
      res.status(404).json({
        error: 'Not Found',
        message: 'ไม่พบโปรไฟล์การรับประกันนี้ในระบบ',
      });
      return;
    }

    // ตรวจสอบว่ามีงานที่ใช้โปรไฟล์นี้หรือไม่
    if (warranty._count.jobs > 0) {
      res.status(409).json({
        error: 'Conflict',
        message: `ไม่สามารถลบได้ เนื่องจากมีงานซ่อม ${warranty._count.jobs} งานที่ใช้โปรไฟล์นี้`,
      });
      return;
    }

    // ลบโปรไฟล์
    await prisma.warrantyProfile.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'ลบโปรไฟล์การรับประกันสำเร็จ',
    });
  } catch (error) {
    console.error('❌ Delete warranty error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการลบโปรไฟล์การรับประกัน',
    });
  }
};

