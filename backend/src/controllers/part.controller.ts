/**
 * Part Controller
 * จัดการสต๊อกอะไหล่
 */

import { Request, Response } from 'express';
import prisma from '../utils/prisma';

/**
 * GET /api/parts
 * ดึงรายการอะไหล่ทั้งหมด (รองรับ pagination, search, filter)
 */
export const getAllParts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { search, lowStock, page = '1', limit = '50' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    // Search by partNumber or partName
    if (search) {
      where.OR = [
        {
          partNumber: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
        {
          partName: {
            contains: search as string,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Filter low stock
    if (lowStock === 'true') {
      where.stockQty = {
        lte: prisma.part.fields.minStockQty,
      };
    }

    // Count total
    const total = await prisma.part.count({ where });

    // Fetch parts
    const parts = await prisma.part.findMany({
      where,
      include: {
        _count: {
          select: {
            jobParts: true,
          },
        },
      },
      orderBy: {
        partName: 'asc',
      },
      skip,
      take: limitNum,
    });

    res.status(200).json({
      message: 'ดึงข้อมูลอะไหล่สำเร็จ',
      data: parts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('❌ Get all parts error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลอะไหล่',
    });
  }
};

/**
 * GET /api/parts/low-stock
 * ดึงอะไหล่ที่สต๊อกต่ำ
 */
export const getLowStockParts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parts = await prisma.part.findMany({
      where: {
        stockQty: {
          lte: prisma.part.fields.minStockQty,
        },
      },
      orderBy: {
        stockQty: 'asc',
      },
    });

    res.status(200).json({
      message: 'ดึงข้อมูลอะไหล่สต๊อกต่ำสำเร็จ',
      data: parts,
      total: parts.length,
    });
  } catch (error) {
    console.error('❌ Get low stock parts error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลอะไหล่สต๊อกต่ำ',
    });
  }
};

/**
 * GET /api/parts/:id
 * ดึงข้อมูลอะไหล่เดียว พร้อมประวัติการใช้
 */
export const getPartById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const part = await prisma.part.findUnique({
      where: { id },
      include: {
        jobParts: {
          include: {
            job: {
              select: {
                id: true,
                jobNumber: true,
                status: true,
                createdAt: true,
                customer: {
                  select: {
                    id: true,
                    fullName: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10, // แสดง 10 รายการล่าสุด
        },
        _count: {
          select: {
            jobParts: true,
          },
        },
      },
    });

    if (!part) {
      res.status(404).json({
        error: 'Not Found',
        message: 'ไม่พบอะไหล่นี้ในระบบ',
      });
      return;
    }

    res.status(200).json({
      message: 'ดึงข้อมูลอะไหล่สำเร็จ',
      data: part,
    });
  } catch (error) {
    console.error('❌ Get part by id error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลอะไหล่',
    });
  }
};

/**
 * POST /api/parts
 * เพิ่มอะไหล่ใหม่
 */
export const createPart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      partNumber,
      partName,
      description,
      unitPrice,
      stockQty,
      minStockQty,
      location,
    } = req.body;

    // Validate
    if (!partNumber || !partName || unitPrice === undefined) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      });
      return;
    }

    // Check duplicate partNumber
    const existing = await prisma.part.findUnique({
      where: { partNumber },
    });

    if (existing) {
      res.status(409).json({
        error: 'Conflict',
        message: 'รหัสอะไหล่นี้มีอยู่ในระบบแล้ว',
      });
      return;
    }

    // Create part
    const part = await prisma.part.create({
      data: {
        partNumber: partNumber.trim(),
        partName: partName.trim(),
        description: description?.trim() || null,
        unitPrice: parseFloat(unitPrice),
        stockQty: parseInt(stockQty) || 0,
        minStockQty: parseInt(minStockQty) || 0,
        location: location?.trim() || null,
      },
    });

    res.status(201).json({
      message: 'เพิ่มอะไหล่สำเร็จ',
      data: part,
    });
  } catch (error) {
    console.error('❌ Create part error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการเพิ่มอะไหล่',
    });
  }
};

/**
 * PUT /api/parts/:id
 * แก้ไขข้อมูลอะไหล่
 */
export const updatePart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      partNumber,
      partName,
      description,
      unitPrice,
      minStockQty,
      location,
    } = req.body;

    // Check if exists
    const existing = await prisma.part.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({
        error: 'Not Found',
        message: 'ไม่พบอะไหล่นี้ในระบบ',
      });
      return;
    }

    // Check duplicate partNumber
    if (partNumber && partNumber !== existing.partNumber) {
      const duplicate = await prisma.part.findUnique({
        where: { partNumber },
      });
      if (duplicate) {
        res.status(409).json({
          error: 'Conflict',
          message: 'รหัสอะไหล่นี้มีอยู่ในระบบแล้ว',
        });
        return;
      }
    }

    // Update part
    const part = await prisma.part.update({
      where: { id },
      data: {
        partNumber: partNumber?.trim(),
        partName: partName?.trim(),
        description: description?.trim() || null,
        unitPrice: unitPrice !== undefined ? parseFloat(unitPrice) : undefined,
        minStockQty:
          minStockQty !== undefined ? parseInt(minStockQty) : undefined,
        location: location?.trim() || null,
      },
    });

    res.status(200).json({
      message: 'แก้ไขอะไหล่สำเร็จ',
      data: part,
    });
  } catch (error) {
    console.error('❌ Update part error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการแก้ไขอะไหล่',
    });
  }
};

/**
 * PATCH /api/parts/:id/stock
 * ปรับสต๊อก (เพิ่ม/ลด)
 */
export const updateStock = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity, type } = req.body; // type: 'add' | 'subtract'

    if (!quantity || !type) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'กรุณาระบุจำนวนและประเภท',
      });
      return;
    }

    const part = await prisma.part.findUnique({ where: { id } });
    if (!part) {
      res.status(404).json({
        error: 'Not Found',
        message: 'ไม่พบอะไหล่นี้ในระบบ',
      });
      return;
    }

    const qty = parseInt(quantity);
    let newStock = part.stockQty;

    if (type === 'add') {
      newStock += qty;
    } else if (type === 'subtract') {
      newStock -= qty;
      if (newStock < 0) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'สต๊อกไม่เพียงพอ',
        });
        return;
      }
    } else {
      res.status(400).json({
        error: 'Bad Request',
        message: 'ประเภทไม่ถูกต้อง (add หรือ subtract)',
      });
      return;
    }

    const updated = await prisma.part.update({
      where: { id },
      data: { stockQty: newStock },
    });

    res.status(200).json({
      message: 'ปรับสต๊อกสำเร็จ',
      data: updated,
    });
  } catch (error) {
    console.error('❌ Update stock error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการปรับสต๊อก',
    });
  }
};

/**
 * DELETE /api/parts/:id
 * ลบอะไหล่
 */
export const deletePart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const part = await prisma.part.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            jobParts: true,
          },
        },
      },
    });

    if (!part) {
      res.status(404).json({
        error: 'Not Found',
        message: 'ไม่พบอะไหล่นี้ในระบบ',
      });
      return;
    }

    if (part._count.jobParts > 0) {
      res.status(409).json({
        error: 'Conflict',
        message: `ไม่สามารถลบได้ เนื่องจากมีงานซ่อม ${part._count.jobParts} งานที่ใช้อะไหล่นี้`,
      });
      return;
    }

    await prisma.part.delete({ where: { id } });

    res.status(200).json({
      message: 'ลบอะไหล่สำเร็จ',
    });
  } catch (error) {
    console.error('❌ Delete part error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการลบอะไหล่',
    });
  }
};

