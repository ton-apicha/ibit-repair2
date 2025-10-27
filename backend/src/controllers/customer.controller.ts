/**
 * Customer Controller
 * จัดการ CRUD ลูกค้า
 */

import { Request, Response } from 'express';
import prisma from '../utils/prisma';

/**
 * Get All Customers - ดึงรายการลูกค้าทั้งหมด
 * GET /api/customers
 * Query params: search, page, limit
 */
export const getAllCustomers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { search, page = '1', limit = '20' } = req.query;

    // แปลง query params เป็นตัวเลข
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // สร้าง where condition สำหรับค้นหา
    const where = search
      ? {
          OR: [
            { fullName: { contains: search as string, mode: 'insensitive' as const } },
            { phone: { contains: search as string } },
            { email: { contains: search as string, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // ดึงข้อมูลลูกค้า พร้อมนับจำนวนงานซ่อม
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: {
            select: { jobs: true }, // นับจำนวนงานซ่อม
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.customer.count({ where }),
    ]);

    // ส่ง response
    res.status(200).json({
      data: customers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('❌ Get all customers error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve customers',
    });
  }
};

/**
 * Get Customer By ID - ดึงข้อมูลลูกค้าตาม ID
 * GET /api/customers/:id
 */
export const getCustomerById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // ดึงข้อมูลลูกค้า พร้อมประวัติงานซ่อม
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        jobs: {
          include: {
            minerModel: {
              include: {
                brand: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10, // แสดง 10 งานล่าสุด
        },
      },
    });

    // ตรวจสอบว่าพบลูกค้าหรือไม่
    if (!customer) {
      res.status(404).json({
        error: 'Not Found',
        message: 'ไม่พบข้อมูลลูกค้า',
      });
      return;
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error('❌ Get customer by ID error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve customers',
    });
  }
};

/**
 * Create Customer - สร้างลูกค้าใหม่
 * POST /api/customers
 * Body: { name, phone, email?, address?, notes? }
 */
export const createCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { fullName, phone, email, address, notes } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!fullName || !phone) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'กรุณากรอกชื่อและเบอร์โทรศัพท์',
      });
      return;
    }

    // ตรวจสอบเบอร์โทร (10 หลัก เริ่มต้นด้วย 0)
    const phonePattern = /^0[0-9]{9}$/;
    if (!phonePattern.test(phone.trim())) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก เริ่มต้นด้วย 0',
      });
      return;
    }

    // ตรวจสอบว่าเบอร์โทรซ้ำหรือไม่
    const existingCustomer = await prisma.customer.findFirst({
      where: { phone: phone.trim() },
    });

    if (existingCustomer) {
      res.status(409).json({
        error: 'Conflict',
        message: 'เบอร์โทรศัพท์นี้มีอยู่ในระบบแล้ว',
      });
      return;
    }

    // สร้างลูกค้าใหม่
    const customer = await prisma.customer.create({
      data: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email?.trim() || null,
        address: address?.trim() || null,
        notes: notes?.trim() || null,
      },
    });

    res.status(201).json({
      message: 'สร้างข้อมูลลูกค้าสำเร็จ',
      data: customer,
    });
  } catch (error) {
    console.error('❌ Create customer error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการสร้างข้อมูลลูกค้า',
    });
  }
};

/**
 * Update Customer - แก้ไขข้อมูลลูกค้า
 * PUT /api/customers/:id
 * Body: { name?, phone?, email?, address?, notes? }
 */
export const updateCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { fullName, phone, email, address, notes } = req.body;

    // ตรวจสอบว่ามีลูกค้าอยู่จริงหรือไม่
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      res.status(404).json({
        error: 'Not Found',
        message: 'ไม่พบข้อมูลลูกค้า',
      });
      return;
    }

    // ตรวจสอบเบอร์โทร (ถ้ามี)
    if (phone) {
      const phonePattern = /^0[0-9]{9}$/;
      if (!phonePattern.test(phone.trim())) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก เริ่มต้นด้วย 0',
        });
        return;
      }

      // ถ้ามีการเปลี่ยนเบอร์โทร ต้องตรวจสอบว่าซ้ำกับคนอื่นหรือไม่
      if (phone.trim() !== existingCustomer.phone) {
        const duplicatePhone = await prisma.customer.findFirst({
          where: {
            phone: phone.trim(),
            id: { not: id }, // ไม่ใช่ลูกค้าคนนี้
          },
        });

        if (duplicatePhone) {
          res.status(409).json({
            error: 'Conflict',
            message: 'เบอร์โทรศัพท์นี้มีอยู่ในระบบแล้ว',
          });
          return;
        }
      }
    }

    // อัพเดทข้อมูล
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(fullName && { fullName: fullName.trim() }),
        ...(phone && { phone: phone.trim() }),
        ...(email !== undefined && { email: email?.trim() || null }),
        ...(address !== undefined && { address: address?.trim() || null }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
      },
    });

    res.status(200).json({
      message: 'แก้ไขข้อมูลลูกค้าสำเร็จ',
      data: customer,
    });
  } catch (error) {
    console.error('❌ Update customer error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลลูกค้า',
    });
  }
};

/**
 * Delete Customer - ลบลูกค้า
 * DELETE /api/customers/:id
 */
export const deleteCustomer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // ตรวจสอบว่ามีลูกค้าอยู่จริงหรือไม่
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: { jobs: true },
        },
      },
    });

    if (!customer) {
      res.status(404).json({
        error: 'Not Found',
        message: 'ไม่พบข้อมูลลูกค้า',
      });
      return;
    }

    // ตรวจสอบว่ามีงานซ่อมหรือไม่ (ไม่ควรลบถ้ามีงานซ่อม)
    if (customer._count.jobs > 0) {
      res.status(400).json({
        error: 'Bad Request',
        message: `ไม่สามารถลบลูกค้าได้ เนื่องจากมีงานซ่อม ${customer._count.jobs} งาน`,
      });
      return;
    }

    // ลบลูกค้า
    await prisma.customer.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'ลบข้อมูลลูกค้าสำเร็จ',
    });
  } catch (error) {
    console.error('❌ Delete customer error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการลบข้อมูลลูกค้า',
    });
  }
};

