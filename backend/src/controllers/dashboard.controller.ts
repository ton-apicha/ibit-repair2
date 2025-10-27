/**
 * Dashboard Controller
 * จัดการข้อมูลสำหรับหน้า Dashboard
 */

import { Request, Response } from 'express';
import prisma from '../utils/prisma';

/**
 * Get Statistics - สถิติรวมทั้งระบบ
 * GET /api/dashboard/statistics
 */
export const getStatistics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // นับจำนวนงานตามสถานะ
    const [
      totalJobs,
      activeJobs,
      inRepair,
      readyForPickup,
      completed,
      lowStockParts,
      totalCustomers,
      totalParts,
    ] = await Promise.all([
      // Total jobs
      prisma.job.count(),
      
      // Active jobs (ไม่รวม COMPLETED และ CANCELLED)
      prisma.job.count({
        where: {
          status: {
            notIn: ['COMPLETED', 'CANCELLED'],
          },
        },
      }),
      
      // In repair
      prisma.job.count({
        where: { status: 'IN_REPAIR' },
      }),
      
      // Ready for pickup
      prisma.job.count({
        where: { status: 'READY_FOR_PICKUP' },
      }),
      
      // Completed
      prisma.job.count({
        where: { status: 'COMPLETED' },
      }),
      
      // Low stock parts
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*) as count
        FROM "parts"
        WHERE "stockQty" < "minStockQty"
      `,
      
      // Total customers
      prisma.customer.count(),
      
      // Total parts
      prisma.part.count(),
    ]);

    res.status(200).json({
      jobs: {
        total: totalJobs,
        active: activeJobs,
        inRepair,
        readyForPickup,
        completed,
      },
      lowStockParts: Number(lowStockParts[0].count),
      totalCustomers,
      totalParts,
    });
  } catch (error) {
    console.error('❌ Get statistics error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการดึงสถิติ',
    });
  }
};

/**
 * Get Recent Jobs - งานล่าสุด 10 รายการ
 * GET /api/dashboard/recent-jobs
 */
export const getRecentJobs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const jobs = await prisma.job.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
          },
        },
        technician: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    res.status(200).json(jobs);
  } catch (error) {
    console.error('❌ Get recent jobs error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการดึงงานล่าสุด',
    });
  }
};

/**
 * Get Low Stock Parts - อะไหล่ที่สต๊อกต่ำ
 * GET /api/dashboard/low-stock
 */
export const getLowStockParts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const parts = await prisma.part.findMany({
      where: {
        stockQty: {
          lt: prisma.part.fields.minStockQty,
        },
      },
      orderBy: [
        // เรียงตาม shortage (ขาดมากสุดก่อน)
        { stockQty: 'asc' },
      ],
    });

    // คำนวณ shortage
    const partsWithShortage = parts.map((part) => ({
      ...part,
      shortage: part.minStockQty - part.stockQty,
    }));

    res.status(200).json(partsWithShortage);
  } catch (error) {
    console.error('❌ Get low stock parts error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลอะไหล่สต๊อกต่ำ',
    });
  }
};

/**
 * Get Jobs by Status - จำนวนงานแยกตามสถานะ
 * GET /api/dashboard/jobs-by-status
 */
export const getJobsByStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await prisma.job.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    });

    // แปลงเป็น object
    const statusCount = result.reduce((acc, curr) => {
      acc[curr.status] = curr._count._all;
      return acc;
    }, {} as Record<string, number>);

    res.status(200).json(statusCount);
  } catch (error) {
    console.error('❌ Get jobs by status error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลงานตามสถานะ',
    });
  }
};

/**
 * Get Technician Performance - ประสิทธิภาพของช่าง
 * GET /api/dashboard/technician-performance
 */
export const getTechnicianPerformance = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // ดึงช่างทั้งหมด
    const technicians = await prisma.user.findMany({
      where: {
        role: 'TECHNICIAN',
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
      },
    });

    // นับงานของแต่ละช่าง
    const performance = await Promise.all(
      technicians.map(async (tech) => {
        const [activeJobs, completedJobs] = await Promise.all([
          prisma.job.count({
            where: {
              technicianId: tech.id,
              status: {
                notIn: ['COMPLETED', 'CANCELLED'],
              },
            },
          }),
          prisma.job.count({
            where: {
              technicianId: tech.id,
              status: 'COMPLETED',
            },
          }),
        ]);

        return {
          id: tech.id,
          name: tech.fullName,
          activeJobs,
          completedJobs,
          totalJobs: activeJobs + completedJobs,
        };
      })
    );

    // เรียงตามจำนวนงานที่มี
    performance.sort((a, b) => b.totalJobs - a.totalJobs);

    res.status(200).json(performance);
  } catch (error) {
    console.error('❌ Get technician performance error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลประสิทธิภาพช่าง',
    });
  }
};

/**
 * Get Recent Activity - กิจกรรมล่าสุด
 * GET /api/dashboard/recent-activity
 */
export const getRecentActivity = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const activities = await prisma.activityLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
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

    res.status(200).json(activities);
  } catch (error) {
    console.error('❌ Get recent activity error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'เกิดข้อผิดพลาดในการดึงกิจกรรมล่าสุด',
    });
  }
};


