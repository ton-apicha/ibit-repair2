/**
 * Utility Functions
 * ฟังก์ชันช่วยเหลือต่างๆ ที่ใช้บ่อย
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

/**
 * รวม Tailwind CSS classes โดยแก้ปัญหา conflict
 * ใช้ร่วมกับ clsx และ tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * จัดรูปแบบวันที่เป็นภาษาไทย
 * @param date - Date object หรือ string
 * @param formatString - รูปแบบที่ต้องการ (default: 'dd/MM/yyyy HH:mm')
 * @returns วันที่ในรูปแบบที่กำหนด
 */
export function formatDate(
  date: Date | string,
  formatString: string = 'dd/MM/yyyy HH:mm'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatString, { locale: th });
}

/**
 * จัดรูปแบบตัวเลขเป็นสกุลเงินบาท
 * @param amount - จำนวนเงิน
 * @returns ตัวเลขในรูปแบบ 1,234.56
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * จัดรูปแบบตัวเลขทั่วไป
 * @param value - ตัวเลข
 * @returns ตัวเลขในรูปแบบ 1,234
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('th-TH').format(value);
}

/**
 * ตัดข้อความที่ยาวเกินไป
 * @param text - ข้อความ
 * @param maxLength - ความยาวสูงสุด
 * @returns ข้อความที่ตัดแล้ว (ถ้ายาวเกิน จะใส่ ... ต่อท้าย)
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * ตรวจสอบว่าอยู่ในโหมดมือถือหรือไม่
 * @returns true ถ้าเป็นมือถือ
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768; // < md breakpoint
}

/**
 * Sleep function สำหรับ delay
 * @param ms - เวลา (มิลลิวินาที)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * ดึง error message จาก axios error
 * @param error - Error object
 * @returns ข้อความ error
 */
export function getErrorMessage(error: any): string {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
}

/**
 * แปลงสถานะงานเป็นภาษาไทย
 */
export function getJobStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    RECEIVED: 'รับเครื่องแล้ว',
    DIAGNOSED: 'ตรวจสอบแล้ว',
    IN_REPAIR: 'กำลังซ่อม',
    TESTING: 'ทดสอบ',
    READY_FOR_PICKUP: 'พร้อมส่งมอบ',
    COMPLETED: 'เสร็จสิ้น',
    CANCELLED: 'ยกเลิก',
    ON_HOLD: 'พักไว้',
    WAITING_PARTS: 'รออะไหล่',
  };
  return labels[status] || status;
}

/**
 * Alias สำหรับ getJobStatusLabel (เพื่อความสะดวก)
 */
export const getStatusLabel = getJobStatusLabel;

/**
 * ดึง CSS class สำหรับสี badge ตามสถานะงาน
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    RECEIVED: 'badge-received',
    DIAGNOSED: 'badge-diagnosed',
    IN_REPAIR: 'badge-in-repair',
    TESTING: 'badge-testing',
    READY_FOR_PICKUP: 'badge-ready',
    COMPLETED: 'badge-completed',
    CANCELLED: 'badge-cancelled',
    ON_HOLD: 'badge-on-hold',
    WAITING_PARTS: 'badge-waiting',
  };
  return colors[status] || 'badge-received';
}

/**
 * แปลง Role เป็นภาษาไทย
 */
export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    ADMIN: 'ผู้ดูแลระบบ',
    MANAGER: 'ผู้จัดการ',
    TECHNICIAN: 'ช่างซ่อม',
    RECEPTIONIST: 'พนักงานต้อนรับ',
  };
  return labels[role] || role;
}

/**
 * ตรวจสอบว่าเป็น valid email หรือไม่
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * ตรวจสอบว่าเป็น valid phone number หรือไม่
 * รูปแบบ: 08x-xxx-xxxx หรือ 06x-xxx-xxxx ฯลฯ
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^0[0-9]{1,2}-?[0-9]{3,4}-?[0-9]{4}$/;
  return phoneRegex.test(phone);
}

