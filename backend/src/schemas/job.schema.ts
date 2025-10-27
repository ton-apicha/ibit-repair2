/**
 * Job Validation Schemas
 * Zod schemas สำหรับ validate ข้อมูลงานซ่อม
 */

import { z } from 'zod';

/**
 * Schema สำหรับสร้างงานใหม่
 */
export const createJobSchema = z.object({
  // ข้อมูลลูกค้า
  customerId: z.string().uuid({
    message: 'รหัสลูกค้าไม่ถูกต้อง',
  }),

  // ข้อมูลเครื่อง
  minerModelId: z.string().uuid({
    message: 'รหัสรุ่นเครื่องไม่ถูกต้อง',
  }),
  serialNumber: z.string().optional(),
  password: z.string().optional(),

  // ข้อมูลปัญหา
  problemDescription: z
    .string()
    .min(10, { message: 'กรุณาอธิบายปัญหาอย่างน้อย 10 ตัวอักษร' })
    .max(5000, { message: 'คำอธิบายยาวเกินไป (สูงสุด 5000 ตัวอักษร)' }),
  customerNotes: z.string().optional(),

  // ลำดับความสำคัญ (0=ปกติ, 1=ด่วน, 2=ด่วนมาก)
  priority: z.number().int().min(0).max(2).default(0),

  // การรับประกัน
  warrantyProfileId: z.string().uuid().optional(),

  // วันที่โดยประมาณ
  estimatedDoneDate: z.string().datetime().optional(),
});

/**
 * Schema สำหรับแก้ไขงาน
 */
export const updateJobSchema = z.object({
  customerId: z.string().uuid().optional(),
  minerModelId: z.string().uuid().optional(),
  serialNumber: z.string().optional(),
  password: z.string().optional(),
  problemDescription: z.string().min(10).max(5000).optional(),
  customerNotes: z.string().optional(),
  priority: z.number().int().min(0).max(2).optional(),
  warrantyProfileId: z.string().uuid().nullable().optional(),
  estimatedDoneDate: z.string().datetime().nullable().optional(),
});

/**
 * Schema สำหรับเปลี่ยนสถานะงาน
 */
export const changeStatusSchema = z.object({
  newStatus: z.enum([
    'RECEIVED',
    'DIAGNOSED',
    'WAITING_APPROVAL',
    'IN_REPAIR',
    'WAITING_PARTS',
    'TESTING',
    'READY_FOR_PICKUP',
    'COMPLETED',
    'CANCELLED',
    'ON_HOLD',
  ]),
  note: z.string().max(500).optional(),
});

/**
 * Schema สำหรับมอบหมายช่าง
 */
export const assignTechnicianSchema = z.object({
  technicianId: z.string().uuid({
    message: 'รหัสช่างไม่ถูกต้อง',
  }),
  note: z.string().max(500).optional(),
});

/**
 * Schema สำหรับเพิ่มบันทึกการซ่อม
 */
export const addRepairRecordSchema = z.object({
  description: z
    .string()
    .min(10, { message: 'กรุณาอธิบายการซ่อมอย่างน้อย 10 ตัวอักษร' })
    .max(5000, { message: 'คำอธิบายยาวเกินไป (สูงสุด 5000 ตัวอักษร)' }),
  findings: z.string().max(5000).optional(),
  actions: z.string().max(5000).optional(),
});

/**
 * Schema สำหรับเบิกอะไหล่
 */
export const addJobPartSchema = z.object({
  partId: z.string().uuid({
    message: 'รหัสอะไหล่ไม่ถูกต้อง',
  }),
  quantity: z
    .number()
    .int({ message: 'จำนวนต้องเป็นจำนวนเต็ม' })
    .min(1, { message: 'จำนวนต้องมากกว่า 0' }),
  unitPrice: z
    .number()
    .positive({ message: 'ราคาต้องมากกว่า 0' }),
  notes: z.string().max(500).optional(),
});

/**
 * Type definitions
 */
export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;
export type AssignTechnicianInput = z.infer<typeof assignTechnicianSchema>;
export type AddRepairRecordInput = z.infer<typeof addRepairRecordSchema>;
export type AddJobPartInput = z.infer<typeof addJobPartSchema>;


