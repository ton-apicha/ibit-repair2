/**
 * Model Controller
 * จัดการข้อมูลรุ่นเครื่องขุด (Antminer S19 Pro, Whatsminer M30S++, etc.)
 */

import { Request, Response } from 'express';
import prisma from '../utils/prisma';

/**
 * GET /api/models
 * ดึงรายการรุ่นเครื่องทั้งหมด (สามารถ filter by brandId)
 */
export const getAllModels = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { brandId } = req.query;

    const where = brandId
      ? {
          brandId: brandId as string,
        }
      : {};

    const models = await prisma.minerModel.findMany({
      where,
      include: {
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            jobs: true,
          },
        },
      },
      orderBy: [
        {
          brand: {
            name: 'asc',
          },
        },
        {
          modelName: 'asc',
        },
      ],
    });

    res.status(200).json({
      message: 'ดึงข้อมูลรุ่นเครื่องสำเร็จ',
      data: models,
      total: models.length,
    });
  } catch (error) {
    console.error('❌ Get all models error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรุ่นเครื่อง',
    });
  }
};

/**
 * GET /api/models/:id
 * ดึงข้อมูลรุ่นเครื่องเดียว พร้อมข้อมูลยี่ห้อ
 */
export const getModelById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const model = await prisma.minerModel.findUnique({
      where: { id },
      include: {
        brand: true,
        _count: {
          select: {
            jobs: true,
          },
        },
      },
    });

    if (!model) {
      res.status(404).json({
        error: 'Not Found',
        message: 'ไม่พบรุ่นเครื่องนี้ในระบบ',
      });
      return;
    }

    res.status(200).json({
      message: 'ดึงข้อมูลรุ่นเครื่องสำเร็จ',
      data: model,
    });
  } catch (error) {
    console.error('❌ Get model by id error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรุ่นเครื่อง',
    });
  }
};

/**
 * POST /api/models
 * สร้างรุ่นเครื่องใหม่ (Admin/Manager only)
 */
export const createModel = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { brandId, modelName, hashrate, powerUsage, description } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!brandId || !modelName) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'กรุณากรอกยี่ห้อและชื่อรุ่นเครื่อง',
      });
      return;
    }

    // ตรวจสอบว่ามียี่ห้อนี้หรือไม่
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!brand) {
      res.status(404).json({
        error: 'Not Found',
        message: 'ไม่พบยี่ห้อนี้ในระบบ',
      });
      return;
    }

    // ตรวจสอบว่ามีรุ่นนี้ซ้ำในยี่ห้อเดียวกันหรือไม่
    const existingModel = await prisma.minerModel.findFirst({
      where: {
        brandId,
        modelName: {
          equals: modelName.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (existingModel) {
      res.status(409).json({
        error: 'Conflict',
        message: 'รุ่นเครื่องนี้มีอยู่ในระบบแล้ว',
      });
      return;
    }

    // สร้างรุ่นเครื่องใหม่
    const model = await prisma.minerModel.create({
      data: {
        brandId,
        modelName: modelName.trim(),
        hashrate: hashrate?.trim() || null,
        powerUsage: powerUsage?.trim() || null,
        description: description?.trim() || null,
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'สร้างรุ่นเครื่องสำเร็จ',
      data: model,
    });
  } catch (error) {
    console.error('❌ Create model error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการสร้างรุ่นเครื่อง',
    });
  }
};

/**
 * PUT /api/models/:id
 * แก้ไขข้อมูลรุ่นเครื่อง (Admin/Manager only)
 */
export const updateModel = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { brandId, modelName, hashrate, powerUsage, description } = req.body;

    // ตรวจสอบว่ามีรุ่นเครื่องนี้หรือไม่
    const existingModel = await prisma.minerModel.findUnique({
      where: { id },
    });

    if (!existingModel) {
      res.status(404).json({
        error: 'Not Found',
        message: 'ไม่พบรุ่นเครื่องนี้ในระบบ',
      });
      return;
    }

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!brandId || !modelName) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'กรุณากรอกยี่ห้อและชื่อรุ่นเครื่อง',
      });
      return;
    }

    // ตรวจสอบว่ามียี่ห้อนี้หรือไม่
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!brand) {
      res.status(404).json({
        error: 'Not Found',
        message: 'ไม่พบยี่ห้อนี้ในระบบ',
      });
      return;
    }

    // ตรวจสอบว่ามีชื่อซ้ำกับรุ่นอื่นในยี่ห้อเดียวกันหรือไม่
    const duplicateModel = await prisma.minerModel.findFirst({
      where: {
        brandId,
        modelName: {
          equals: modelName.trim(),
          mode: 'insensitive',
        },
        id: {
          not: id,
        },
      },
    });

    if (duplicateModel) {
      res.status(409).json({
        error: 'Conflict',
        message: 'ชื่อรุ่นเครื่องนี้มีอยู่ในระบบแล้ว',
      });
      return;
    }

    // แก้ไขรุ่นเครื่อง
    const model = await prisma.minerModel.update({
      where: { id },
      data: {
        brandId,
        modelName: modelName.trim(),
        hashrate: hashrate?.trim() || null,
        powerUsage: powerUsage?.trim() || null,
        description: description?.trim() || null,
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      message: 'แก้ไขรุ่นเครื่องสำเร็จ',
      data: model,
    });
  } catch (error) {
    console.error('❌ Update model error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการแก้ไขรุ่นเครื่อง',
    });
  }
};

/**
 * DELETE /api/models/:id
 * ลบรุ่นเครื่อง (Admin only)
 * หมายเหตุ: ไม่สามารถลบได้ถ้ามีงานซ่อมอยู่
 */
export const deleteModel = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // ตรวจสอบว่ามีรุ่นเครื่องนี้หรือไม่
    const model = await prisma.minerModel.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            jobs: true,
          },
        },
      },
    });

    if (!model) {
      res.status(404).json({
        error: 'Not Found',
        message: 'ไม่พบรุ่นเครื่องนี้ในระบบ',
      });
      return;
    }

    // ตรวจสอบว่ามีงานซ่อมที่ใช้รุ่นนี้หรือไม่
    if (model._count.jobs > 0) {
      res.status(409).json({
        error: 'Conflict',
        message: `ไม่สามารถลบได้ เนื่องจากมีงานซ่อม ${model._count.jobs} งานที่เชื่อมโยงอยู่`,
      });
      return;
    }

    // ลบรุ่นเครื่อง
    await prisma.minerModel.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'ลบรุ่นเครื่องสำเร็จ',
    });
  } catch (error) {
    console.error('❌ Delete model error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการลบรุ่นเครื่อง',
    });
  }
};

