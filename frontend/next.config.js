/** @type {import('next').NextConfig} */

/**
 * Next.js Configuration
 * ไฟล์นี้ใช้สำหรับตั้งค่า Next.js application
 */

const nextConfig = {
  // เปิดใช้งาน Standalone output สำหรับ Docker deployment
  output: 'standalone',

  // การตั้งค่ารูปภาพ
  images: {
    // อนุญาตให้โหลดรูปจาก domains เหล่านี้
    domains: ['localhost', '127.0.0.1'],
    // รูปแบบรูปภาพที่รองรับ
    formats: ['image/webp', 'image/avif'],
    // เปิดใช้งาน image optimization
    unoptimized: false,
  },

  // Environment variables ที่จะส่งไปให้ client-side
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Webpack configuration (ถ้าต้องการปรับแต่ง)
  webpack: (config, { isServer }) => {
    // ปรับแต่ง webpack config ได้ที่นี่
    return config;
  },

  // Production optimizations
  swcMinify: true,
  compress: true,
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;

