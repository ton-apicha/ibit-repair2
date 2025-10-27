/**
 * Prisma Client Instance
 * ไฟล์นี้สร้าง instance ของ Prisma Client เพื่อใช้เชื่อมต่อฐานข้อมูล
 * แนะนำให้ import จากไฟล์นี้เสมอแทนการสร้าง instance ใหม่ทุกครั้ง
 */

import { PrismaClient } from '@prisma/client';

// สร้าง Prisma Client instance
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn']  // แสดง log ใน development mode
    : ['error'],                    // แสดงแค่ error ใน production mode
});

// Export เพื่อให้ไฟล์อื่นใช้งาน
export default prisma;

/**
 * ตัวอย่างการใช้งาน:
 * 
 * import prisma from '@/utils/prisma';
 * 
 * const users = await prisma.user.findMany();
 * const customer = await prisma.customer.create({ data: {...} });
 */

