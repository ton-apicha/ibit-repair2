/**
 * Brand Controller
 * จัดการข้อมูลยี่ห้อเครื่องขุด (Bitmain, MicroBT, Canaan, etc.)
 */

import { Request, Response } from 'express';
import prisma from '../utils/prisma';

/**
 * GET /api/brands
 * ดึงรายการยี่ห้อทั้งหมด พร้อมจำนวนรุ่นเครื่องของแต่ละยี่ห้อ
 */
export const getAllBrands = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        models: {
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            models: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // แปลงข้อมูลให้อ่านง่าย
    const brandsWithCount = brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      modelsCount: brand._count.models,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
    }));

    res.status(200).json({
      message: 'ดึงข้อมูลยี่ห้อสำเร็จ',
      data: brandsWithCount,
      total: brandsWithCount.length,
    });
  } catch (error) {
    console.error('❌ Get all brands error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลยี่ห้อ',
    });
  }
};

/**
 * GET /api/brands/:id
 * ดึงข้อมูลยี่ห้อเดียว พร้อมรุ่นเครื่องทั้งหมด
 */
export const getBrandById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        models: {
          orderBy: {
            modelName: 'asc',
          },
        },
      },
    });

    if (!brand) {
      res.status(404).json({
        error: 'Not Found',
        message: 'ไม่พบยี่ห้อนี้ในระบบ',
      });
      return;
    }

    res.status(200).json({
      message: 'ดึงข้อมูลยี่ห้อสำเร็จ',
      data: brand,
    });
  } catch (error) {
    console.error('❌ Get brand by id error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลยี่ห้อ',
    });
  }
};

/**
 * POST /api/brands
 * สร้างยี่ห้อใหม่ (Admin/Manager only)
 */
export const createBrand = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name } = req.body;

    // ตรวจสอบข้อมูล
    if (!name || name.trim() === '') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'กรุณากรอกชื่อยี่ห้อ',
      });
      return;
    }

    // ตรวจสอบว่ามีชื่อซ้ำหรือไม่
    const existingBrand = await prisma.brand.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive', // case-insensitive
        },
      },
    });

    if (existingBrand) {
      res.status(409).json({
        error: 'Conflict',
        message: 'ยี่ห้อนี้มีอยู่ในระบบแล้ว',
      });
      return;
    }

    // สร้างยี่ห้อใหม่
    const brand = await prisma.brand.create({
      data: {
        name: name.trim(),
      },
    });

    res.status(201).json({
      message: 'สร้างยี่ห้อสำเร็จ',
      data: brand,
    });
  } catch (error) {
    console.error('❌ Create brand error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการสร้างยี่ห้อ',
    });
  }
};

/**
 * PUT /api/brands/:id
 * แก้ไขข้อมูลยี่ห้อ (Admin/Manager only)
 */
export const updateBrand = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // ตรวจสอบข้อมูล
    if (!name || name.trim() === '') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'กรุณากรอกชื่อยี่ห้อ',
      });
      return;
    }

    // ตรวจสอบว่ามียี่ห้อนี้หรือไม่
    const existingBrand = await prisma.brand.findUnique({
      where: { id },
    });

    if (!existingBrand) {
      res.status(404).json({
        error: 'Not Found',
        message: 'ไม่พบยี่ห้อนี้ในระบบ',
      });
      return;
    }

    // ตรวจสอบว่ามีชื่อซ้ำกับยี่ห้ออื่นหรือไม่
    const duplicateBrand = await prisma.brand.findFirst({
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

    if (duplicateBrand) {
      res.status(409).json({
        error: 'Conflict',
        message: 'ชื่อยี่ห้อนี้มีอยู่ในระบบแล้ว',
      });
      return;
    }

    // แก้ไขยี่ห้อ
    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name: name.trim(),
      },
    });

    res.status(200).json({
      message: 'แก้ไขยี่ห้อสำเร็จ',
      data: brand,
    });
  } catch (error) {
    console.error('❌ Update brand error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการแก้ไขยี่ห้อ',
    });
  }
};

/**
 * DELETE /api/brands/:id
 * ลบยี่ห้อ (Admin only)
 * หมายเหตุ: ไม่สามารถลบได้ถ้ามีรุ่นเครื่องอยู่
 */
export const deleteBrand = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // ตรวจสอบว่ามียี่ห้อนี้หรือไม่
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            models: true,
          },
        },
      },
    });

    if (!brand) {
      res.status(404).json({
        error: 'Not Found',
        message: 'ไม่พบยี่ห้อนี้ในระบบ',
      });
      return;
    }

    // ตรวจสอบว่ามีรุ่นเครื่องอยู่หรือไม่
    if (brand._count.models > 0) {
      res.status(409).json({
        error: 'Conflict',
        message: `ไม่สามารถลบได้ เนื่องจากมีรุ่นเครื่อง ${brand._count.models} รุ่นที่เชื่อมโยงอยู่`,
      });
      return;
    }

    // ลบยี่ห้อ
    await prisma.brand.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'ลบยี่ห้อสำเร็จ',
    });
  } catch (error) {
    console.error('❌ Delete brand error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการลบยี่ห้อ',
    });
  }
};

