/**
 * Tailwind CSS Configuration
 * ไฟล์นี้ใช้สำหรับตั้งค่า Tailwind CSS
 */

import type { Config } from 'tailwindcss';

const config: Config = {
  // กำหนดไฟล์ที่ Tailwind จะ scan เพื่อหา classes ที่ใช้งาน
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
  theme: {
    extend: {
      // สีที่ใช้ในระบบ (สามารถปรับแต่งได้)
      colors: {
        // สีหลักของระบบ
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        
        // สีสถานะงานซ่อม
        status: {
          received: '#94a3b8',      // สีเทา - รับเครื่องแล้ว
          diagnosed: '#3b82f6',     // สีน้ำเงิน - ตรวจสอบแล้ว
          inRepair: '#f59e0b',      // สีส้ม - กำลังซ่อม
          testing: '#8b5cf6',       // สีม่วง - ทดสอบ
          ready: '#10b981',         // สีเขียว - พร้อมส่งมอบ
          completed: '#059669',     // สีเขียวเข้ม - เสร็จสิ้น
          cancelled: '#ef4444',     // สีแดง - ยกเลิก
          onHold: '#6b7280',        // สีเทาเข้ม - พักไว้
          waitingParts: '#eab308',  // สีเหลือง - รออะไหล่
        },
      },

      // ขนาดหน้าจอ (responsive breakpoints)
      screens: {
        'xs': '475px',
        // sm: 640px (default)
        // md: 768px (default)
        // lg: 1024px (default)
        // xl: 1280px (default)
        // 2xl: 1536px (default)
      },

      // Spacing, border radius, shadows ฯลฯ สามารถปรับเพิ่มได้
    },
  },
  
  plugins: [],
};

export default config;

