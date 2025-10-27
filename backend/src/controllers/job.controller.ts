/**
 * Job Controller
 * จัดการงานซ่อมเครื่องขุด ASIC
 * รวมถึง CRUD, เปลี่ยนสถานะ, มอบหมายช่าง, บันทึกการซ่อม, เบิกอะไหล่
 */

import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { generateJobNumber } from '../utils/jobNumber';

/**
 * Get All Jobs - ดึงรายการงานซ่อมทั้งหมด
 * GET /api/jobs?search=&status=&technician=&priority=&page=1&limit=20
 */
export const getAllJobs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      search,
      status,
      technician,
      priority,
      page = '1',
      limit = '20',
    } = req.query;

    // แปลง query params
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // สร้าง where condition
    const where: any = {};

    // Filter by search (ค้นหาจากเลขที่งาน, ชื่อลูกค้า, S/N)
    if (search) {
      where.OR = [
        { jobNumber: { contains: search as string, mode: 'insensitive' } },
        { serialNumber: { contains: search as string, mode: 'insensitive' } },
        {
          customer: {
            fullName: { contains: search as string, mode: 'insensitive' },
          },
        },
        {
          customer: {
            phone: { contains: search as string },
          },
        },
      ];
    }

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by technician
    if (technician) {
      where.technicianId = technician;
    }

    // Filter by priority
    if (priority) {
      where.priority = parseInt(priority as string, 10);
    }

    // ดึงข้อมูลงานซ่อม พร้อมข้อมูลที่เกี่ยวข้อง
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              fullName: true,
              phone: true,
            },
          },
          minerModel: {
            include: {
              brand: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          technician: {
            select: {
              id: true,
              fullName: true,
            },
          },
          warrantyProfile: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              repairRecords: true,
              jobParts: true,
              images: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.job.count({ where }),
    ]);

    // ดึงรายการ technicians สำหรับ filter
    const technicians = await prisma.user.findMany({
      where: { role: 'TECHNICIAN', isActive: true },
      select: { id: true, fullName: true },
    });

    res.status(200).json({
      data: jobs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      filters: {
        availableTechnicians: technicians,
      },
    });
  } catch (error) {
    console.error('❌ Get all jobs error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve jobs',
    });
  }
};

/**
 * Get Job By ID - ดึงข้อมูลงานซ่อมตาม ID
 * GET /api/jobs/:id
 */
export const getJobById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // ดึงข้อมูลงานพร้อมข้อมูลที่เกี่ยวข้องทั้งหมด
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        customer: true,
        minerModel: {
          include: {
            brand: true,
          },
        },
        technician: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
          },
        },
        warrantyProfile: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
        repairRecords: {
          orderBy: { createdAt: 'desc' },
        },
        jobParts: {
          include: {
            part: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        images: {
          orderBy: { createdAt: 'desc' },
        },
        quotations: {
          orderBy: { createdAt: 'desc' },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
        activityLogs: {
          include: {
            user: {
              select: {
                fullName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50, // แสดง 50 รายการล่าสุด
        },
      },
    });

    if (!job) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Job not found',
      });
      return;
    }

    res.status(200).json(job);
  } catch (error) {
    console.error('❌ Get job by ID error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve jobs',
    });
  }
};

/**
 * Create Job - สร้างงานซ่อมใหม่
 * POST /api/jobs
 */
export const createJob = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      customerId,
      minerModelId,
      serialNumber,
      password,
      problemDescription,
      customerNotes,
      priority = 0,
      warrantyProfileId,
      estimatedDoneDate,
    } = req.body;

    // สร้างเลขที่งานอัตโนมัติ
    const jobNumber = await generateJobNumber();

    // สร้างงานใหม่
    const job = await prisma.job.create({
      data: {
        jobNumber,
        customerId,
        minerModelId,
        serialNumber: serialNumber || null,
        password: password || null,
        problemDescription,
        customerNotes: customerNotes || null,
        priority,
        warrantyProfileId: warrantyProfileId || null,
        estimatedDoneDate: estimatedDoneDate
          ? new Date(estimatedDoneDate)
          : null,
        status: 'RECEIVED',
        createdById: req.user!.id, // จาก auth middleware
      },
      include: {
        customer: true,
        minerModel: {
          include: {
            brand: true,
          },
        },
        warrantyProfile: true,
      },
    });

    // บันทึก Activity Log
    await prisma.activityLog.create({
      data: {
        jobId: job.id,
        userId: req.user!.id,
        action: 'CREATE_JOB',
        description: `สร้างงานซ่อม ${job.jobNumber}`,
      },
    });

    console.log('✅ Job created:', job.jobNumber);

    res.status(201).json({
      message: 'สร้างงานซ่อมสำเร็จ',
      data: job,
    });
  } catch (error) {
    console.error('❌ Create job error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create job',
    });
  }
};

/**
 * Update Job - แก้ไขข้อมูลงานซ่อม
 * PUT /api/jobs/:id
 */
export const updateJob = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      customerId,
      minerModelId,
      serialNumber,
      password,
      problemDescription,
      customerNotes,
      priority,
      warrantyProfileId,
      estimatedDoneDate,
    } = req.body;

    // ตรวจสอบว่างานมีอยู่จริงหรือไม่
    const existingJob = await prisma.job.findUnique({
      where: { id },
    });

    if (!existingJob) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Job not found',
      });
      return;
    }

    // อัพเดทงาน
    const job = await prisma.job.update({
      where: { id },
      data: {
        ...(customerId && { customerId }),
        ...(minerModelId && { minerModelId }),
        ...(serialNumber !== undefined && { serialNumber: serialNumber || null }),
        ...(password !== undefined && { password: password || null }),
        ...(problemDescription && { problemDescription }),
        ...(customerNotes !== undefined && {
          customerNotes: customerNotes || null,
        }),
        ...(priority !== undefined && { priority }),
        ...(warrantyProfileId !== undefined && {
          warrantyProfileId: warrantyProfileId || null,
        }),
        ...(estimatedDoneDate !== undefined && {
          estimatedDoneDate: estimatedDoneDate
            ? new Date(estimatedDoneDate)
            : null,
        }),
      },
      include: {
        customer: true,
        minerModel: {
          include: {
            brand: true,
          },
        },
        technician: true,
        warrantyProfile: true,
      },
    });

    // บันทึก Activity Log
    await prisma.activityLog.create({
      data: {
        jobId: job.id,
        userId: req.user!.id,
        action: 'UPDATE_JOB',
        description: `แก้ไขงานซ่อม ${job.jobNumber}`,
      },
    });

    res.status(200).json({
      message: 'แก้ไขงานซ่อมสำเร็จ',
      data: job,
    });
  } catch (error) {
    console.error('❌ Update job error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update job',
    });
  }
};

/**
 * Delete Job - ลบงานซ่อม
 * DELETE /api/jobs/:id
 */
export const deleteJob = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // ตรวจสอบว่างานมีอยู่จริงหรือไม่
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            quotations: true,
            transactions: true,
          },
        },
      },
    });

    if (!job) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Job not found',
      });
      return;
    }

    // ตรวจสอบว่ามีใบเสนอราคาหรือการชำระเงินหรือไม่
    if (job._count.quotations > 0 || job._count.transactions > 0) {
      res.status(409).json({
        error: 'Conflict',
        message:
          'Cannot delete job with quotations or payments. Please cancel instead',
      });
      return;
    }

    // ลบงาน (cascade จะลบ repairRecords, jobParts, images, activityLogs ด้วย)
    await prisma.job.delete({
      where: { id },
    });

    console.log('✅ Job deleted:', job.jobNumber);

    res.status(200).json({
      message: 'ลบงานซ่อมสำเร็จ',
    });
  } catch (error) {
    console.error('❌ Delete job error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete job',
    });
  }
};

/**
 * Change Status - เปลี่ยนสถานะงาน
 * PATCH /api/jobs/:id/status
 */
export const changeStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { newStatus, note } = req.body;

    // ดึงข้อมูลงาน
    const job = await prisma.job.findUnique({
      where: { id },
      select: { id: true, jobNumber: true, status: true },
    });

    if (!job) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Job not found',
      });
      return;
    }

    // ตรวจสอบว่าสถานะซ้ำหรือไม่
    if (job.status === newStatus) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'สถานะงานเหมือนเดิมแล้ว',
      });
      return;
    }

    // อัพเดทสถานะ
    const updateData: any = {
      status: newStatus,
    };

    // ถ้าเปลี่ยนเป็น COMPLETED ให้เซ็ต completedDate
    if (newStatus === 'COMPLETED') {
      updateData.completedDate = new Date();
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        minerModel: {
          include: { brand: true },
        },
        technician: true,
      },
    });

    // บันทึก Activity Log
    await prisma.activityLog.create({
      data: {
        jobId: id,
        userId: req.user!.id,
        action: 'CHANGE_STATUS',
        description: `เปลี่ยนสถานะจาก ${job.status} เป็น ${newStatus}${
          note ? `: ${note}` : ''
        }`,
      },
    });

    console.log(`✅ Job status changed: ${job.jobNumber} → ${newStatus}`);

    res.status(200).json({
      message: 'เปลี่ยนสถานะสำเร็จ',
      data: updatedJob,
    });
  } catch (error) {
    console.error('❌ Change status error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update job status',
    });
  }
};

/**
 * Assign Technician - มอบหมายช่าง
 * PATCH /api/jobs/:id/assign
 */
export const assignTechnician = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { technicianId, note } = req.body;

    // ตรวจสอบว่างานมีอยู่จริง
    const job = await prisma.job.findUnique({
      where: { id },
      select: { id: true, jobNumber: true, technicianId: true },
    });

    if (!job) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Job not found',
      });
      return;
    }

    // ตรวจสอบว่า technician มีอยู่จริงและเป็น TECHNICIAN
    const technician = await prisma.user.findUnique({
      where: { id: technicianId },
      select: { id: true, fullName: true, role: true, isActive: true },
    });

    if (!technician) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Technician not found',
      });
      return;
    }

    if (technician.role !== 'TECHNICIAN') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'ผู้ใช้นี้ไม่ใช่ช่างซ่อม',
      });
      return;
    }

    if (!technician.isActive) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'ช่างนี้ถูกระงับการใช้งาน',
      });
      return;
    }

    // อัพเดทงาน
    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        technicianId,
      },
      include: {
        technician: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    // บันทึก Activity Log
    const oldTechName = job.technicianId ? '(มีช่างเดิม)' : '(ยังไม่มีช่าง)';
    await prisma.activityLog.create({
      data: {
        jobId: id,
        userId: req.user!.id,
        action: 'ASSIGN_TECHNICIAN',
        description: `มอบหมายช่าง ${technician.fullName} ${oldTechName}${
          note ? `: ${note}` : ''
        }`,
      },
    });

    console.log(
      `✅ Technician assigned: ${job.jobNumber} → ${technician.fullName}`
    );

    res.status(200).json({
      message: 'มอบหมายช่างสำเร็จ',
      data: updatedJob,
    });
  } catch (error) {
    console.error('❌ Assign technician error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to assign technician',
    });
  }
};

/**
 * Add Repair Record - เพิ่มบันทึกการซ่อม
 * POST /api/jobs/:id/records
 */
export const addRepairRecord = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { description, findings, actions } = req.body;

    // ตรวจสอบว่างานมีอยู่จริง
    const job = await prisma.job.findUnique({
      where: { id },
      select: { id: true, jobNumber: true },
    });

    if (!job) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Job not found',
      });
      return;
    }

    // สร้างบันทึกการซ่อม
    const record = await prisma.repairRecord.create({
      data: {
        jobId: id,
        description,
        findings: findings || null,
        actions: actions || null,
        createdBy: req.user!.id,
      },
    });

    // บันทึก Activity Log
    await prisma.activityLog.create({
      data: {
        jobId: id,
        userId: req.user!.id,
        action: 'ADD_REPAIR_RECORD',
        description: `เพิ่มบันทึกการซ่อม: ${description.substring(0, 50)}${
          description.length > 50 ? '...' : ''
        }`,
      },
    });

    console.log(`✅ Repair record added to job: ${job.jobNumber}`);

    res.status(201).json({
      message: 'เพิ่มบันทึกการซ่อมสำเร็จ',
      data: record,
    });
  } catch (error) {
    console.error('❌ Add repair record error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to add repair record',
    });
  }
};

/**
 * Add Job Part - เบิกอะไหล่สำหรับงานซ่อม
 * POST /api/jobs/:id/parts
 */
export const addJobPart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { partId, quantity, unitPrice, notes } = req.body;

    // ตรวจสอบว่างานมีอยู่จริง
    const job = await prisma.job.findUnique({
      where: { id },
      select: { id: true, jobNumber: true },
    });

    if (!job) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Job not found',
      });
      return;
    }

    // ตรวจสอบว่าอะไหล่มีอยู่จริง
    const part = await prisma.part.findUnique({
      where: { id: partId },
      select: {
        id: true,
        partName: true,
        partNumber: true,
        stockQty: true,
        unitPrice: true,
      },
    });

    if (!part) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Part not found',
      });
      return;
    }

    // ตรวจสอบสต๊อก
    if (part.stockQty < quantity) {
      res.status(400).json({
        error: 'Bad Request',
        message: `สต๊อกอะไหล่ไม่เพียงพอ (มีเพียง ${part.stockQty} ชิ้น)`,
      });
      return;
    }

    // ใช้ transaction เพื่อให้ทุกอย่างสำเร็จพร้อมกัน
    const result = await prisma.$transaction(async (tx) => {
      // 1. สร้าง JobPart
      const jobPart = await tx.jobPart.create({
        data: {
          jobId: id,
          partId,
          quantity,
          unitPrice,
          notes: notes || null,
        },
        include: {
          part: true,
        },
      });

      // 2. ลดสต๊อกอะไหล่
      await tx.part.update({
        where: { id: partId },
        data: {
          stockQty: {
            decrement: quantity,
          },
        },
      });

      // 3. บันทึก Activity Log
      await tx.activityLog.create({
        data: {
          jobId: id,
          userId: req.user!.id,
          action: 'ADD_PART',
          description: `เบิกอะไหล่: ${part.partName} (${part.partNumber}) x${quantity}`,
        },
      });

      return jobPart;
    });

    console.log(
      `✅ Part added to job: ${job.jobNumber} - ${part.partName} x${quantity}`
    );

    res.status(201).json({
      message: 'เบิกอะไหล่สำเร็จ',
      data: result,
    });
  } catch (error) {
    console.error('❌ Add job part error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to request part',
    });
  }
};

/**
 * Remove Job Part - ลบอะไหล่ออกจากงาน
 * DELETE /api/jobs/:id/parts/:partId
 */
export const removeJobPart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id, partId } = req.params;

    // ดึงข้อมูล JobPart
    const jobPart = await prisma.jobPart.findFirst({
      where: {
        id: partId,
        jobId: id,
      },
      include: {
        part: {
          select: {
            id: true,
            partName: true,
            partNumber: true,
          },
        },
        job: {
          select: {
            id: true,
            jobNumber: true,
          },
        },
      },
    });

    if (!jobPart) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Job part not found',
      });
      return;
    }

    // ใช้ transaction
    await prisma.$transaction(async (tx) => {
      // 1. คืนสต๊อกอะไหล่
      await tx.part.update({
        where: { id: jobPart.part.id },
        data: {
          stockQty: {
            increment: jobPart.quantity,
          },
        },
      });

      // 2. ลบ JobPart
      await tx.jobPart.delete({
        where: { id: partId },
      });

      // 3. บันทึก Activity Log
      await tx.activityLog.create({
        data: {
          jobId: id,
          userId: req.user!.id,
          action: 'REMOVE_PART',
          description: `ลบอะไหล่: ${jobPart.part.partName} (${jobPart.part.partNumber}) x${jobPart.quantity}`,
        },
      });
    });

    console.log(
      `✅ Part removed from job: ${jobPart.job.jobNumber} - ${jobPart.part.partName}`
    );

    res.status(200).json({
      message: 'ลบอะไหล่สำเร็จ',
    });
  } catch (error) {
    console.error('❌ Remove job part error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to remove part',
    });
  }
};

/**
 * Upload Images - อัพโหลดรูปภาพสำหรับงาน
 * POST /api/jobs/:id/images
 * Multipart form data with files
 */
export const uploadImages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { category = 'OTHER' } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Please select files to upload',
      });
      return;
    }

    // ตรวจสอบว่างานมีอยู่จริง
    const job = await prisma.job.findUnique({
      where: { id },
      select: { id: true, jobNumber: true },
    });

    if (!job) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Job not found',
      });
      return;
    }

    // สร้าง JobImage records
    const imageRecords = await Promise.all(
      files.map((file) =>
        prisma.jobImage.create({
          data: {
            jobId: id,
            imageUrl: `/uploads/jobs/${id}/${file.filename}`, // path to file
            imageType: category,
            caption: file.originalname,
          },
        })
      )
    );

    // บันทึก Activity Log
    await prisma.activityLog.create({
      data: {
        jobId: id,
        userId: req.user!.id,
        action: 'UPLOAD_IMAGES',
        description: `อัพโหลดรูปภาพ ${files.length} ไฟล์ (${category})`,
      },
    });

    console.log(
      `✅ Images uploaded to job: ${job.jobNumber} - ${files.length} files`
    );

    res.status(201).json({
      message: 'อัพโหลดรูปภาพสำเร็จ',
      data: imageRecords,
    });
  } catch (error) {
    console.error('❌ Upload images error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to upload images',
    });
  }
};

/**
 * Delete Image - ลบรูปภาพ
 * DELETE /api/jobs/:id/images/:imageId
 */
export const deleteImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id, imageId } = req.params;

    // ดึงข้อมูลรูปภาพ
    const image = await prisma.jobImage.findFirst({
      where: {
        id: imageId,
        jobId: id,
      },
    });

    if (!image) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Image not found',
      });
      return;
    }

    // ลบไฟล์จาก disk (ถ้ามี)
    // TODO: Implement file deletion from /uploads/

    // ลบ record จาก database
    await prisma.jobImage.delete({
      where: { id: imageId },
    });

    // บันทึก Activity Log
    await prisma.activityLog.create({
      data: {
        jobId: id,
        userId: req.user!.id,
        action: 'DELETE_IMAGE',
        description: `ลบรูปภาพ: ${image.caption || 'ไม่มีชื่อ'}`,
      },
    });

    console.log(`✅ Image deleted: ${image.imageUrl}`);

    res.status(200).json({
      message: 'ลบรูปภาพสำเร็จ',
    });
  } catch (error) {
    console.error('❌ Delete image error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete image',
    });
  }
};

/**
 * Get Activity Log - ดึงประวัติการทำงาน
 * GET /api/jobs/:id/activity
 */
export const getActivityLog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { limit = '50' } = req.query;

    // ตรวจสอบว่างานมีอยู่จริง
    const job = await prisma.job.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!job) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Job not found',
      });
      return;
    }

    // ดึง Activity Logs
    const logs = await prisma.activityLog.findMany({
      where: {
        jobId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string, 10),
    });

    res.status(200).json(logs);
  } catch (error) {
    console.error('❌ Get activity log error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve activity logs',
    });
  }
};

/**
 * Get Job Statistics - สถิติของงาน (สำหรับ dashboard)
 * GET /api/jobs/stats
 */
export const getJobStatistics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // นับจำนวนงานตามสถานะ
    const [
      total,
      received,
      diagnosed,
      waitingApproval,
      inRepair,
      waitingParts,
      testing,
      readyForPickup,
      completed,
      cancelled,
      onHold,
    ] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({ where: { status: 'RECEIVED' } }),
      prisma.job.count({ where: { status: 'DIAGNOSED' } }),
      prisma.job.count({ where: { status: 'WAITING_APPROVAL' } }),
      prisma.job.count({ where: { status: 'IN_REPAIR' } }),
      prisma.job.count({ where: { status: 'WAITING_PARTS' } }),
      prisma.job.count({ where: { status: 'TESTING' } }),
      prisma.job.count({ where: { status: 'READY_FOR_PICKUP' } }),
      prisma.job.count({ where: { status: 'COMPLETED' } }),
      prisma.job.count({ where: { status: 'CANCELLED' } }),
      prisma.job.count({ where: { status: 'ON_HOLD' } }),
    ]);

    const stats = {
      total,
      active: total - completed - cancelled,
      byStatus: {
        RECEIVED: received,
        DIAGNOSED: diagnosed,
        WAITING_APPROVAL: waitingApproval,
        IN_REPAIR: inRepair,
        WAITING_PARTS: waitingParts,
        TESTING: testing,
        READY_FOR_PICKUP: readyForPickup,
        COMPLETED: completed,
        CANCELLED: cancelled,
        ON_HOLD: onHold,
      },
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('❌ Get job statistics error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve job statistics',
    });
  }
};

