/**
 * Root Layout
 * Layout หลักของทั้งแอปพลิเคชัน - ครอบทุกหน้า
 */

import type { Metadata, Viewport } from 'next';
// import './globals-basic.css';
import I18nProvider from '@/components/I18nProvider';

// Metadata สำหรับ SEO
export const metadata: Metadata = {
  title: 'ระบบซ่อมเครื่องขุด ASIC | IBIT Repair',
  description: 'ระบบจัดการซ่อมเครื่องขุดบิทคอยน์ ASIC ครบวงจร',
};

// Viewport configuration (แยกออกมาตาม Next.js 14 best practices)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0ea5e9',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <I18nProvider>
          {/* Main content */}
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}

