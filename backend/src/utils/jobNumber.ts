/**
 * Job Number Generator
 * สร้างเลขที่งานแบบอัตโนมัติ
 * รูปแบบ: RJ{YYYY}-{####}
 * ตัวอย่าง: RJ2025-0001, RJ2025-0002, ..., RJ2026-0001
 */

import prisma from './prisma';

/**
 * สร้างเลขที่งานใหม่
 * @returns เลขที่งาน เช่น "RJ2025-0001"
 */
export async function generateJobNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `RJ${year}-`;

  // ค้นหางานล่าสุดของปีนี้
  const lastJob = await prisma.job.findFirst({
    where: {
      jobNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      jobNumber: 'desc',
    },
  });

  // คำนวณหมายเลขถัดไป
  let nextNumber = 1;
  if (lastJob) {
    const lastNumber = parseInt(lastJob.jobNumber.split('-')[1], 10);
    nextNumber = lastNumber + 1;
  }

  // Format: RJ2025-0001 (4 หลัก)
  const jobNumber = `${prefix}${String(nextNumber).padStart(4, '0')}`;

  return jobNumber;
}

/**
 * ตรวจสอบว่าเลขที่งานซ้ำหรือไม่
 * @param jobNumber เลขที่งาน
 * @returns true ถ้าซ้ำ, false ถ้าไม่ซ้ำ
 */
export async function isJobNumberExists(jobNumber: string): Promise<boolean> {
  const job = await prisma.job.findUnique({
    where: { jobNumber },
  });

  return !!job;
}


