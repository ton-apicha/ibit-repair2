/**
 * CORS Configuration
 * จัดการการตั้งค่า CORS ตาม environment
 */

import { config } from './index';

/**
 * CORS configuration based on environment
 */
export const corsConfig = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // อนุญาต request ที่ไม่มี origin (เช่น Postman, curl, same-origin)
    if (!origin) {
      return callback(null, true);
    }

    // ใน development mode อนุญาต localhost และ local network
    if (config.server.nodeEnv === 'development') {
      const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
      const isLocalNetwork = /^http:\/\/192\.168\.\d+\.\d+:3000$/.test(origin) ||
                            /^http:\/\/10\.\d+\.\d+\.\d+:3000$/.test(origin);
      
      if (isLocalhost || isLocalNetwork) {
        return callback(null, true);
      }
    }

    // ตรวจสอบ origin กับ allowed origins
    const allowedOrigins = config.cors.origins;
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // ถ้าไม่ตรงกับ allowed origins ให้ reject
    console.warn(`🚫 CORS: Blocked origin - ${origin}`);
    callback(new Error('Not allowed by CORS policy'));
  },
  
  credentials: true, // อนุญาตให้ส่ง cookies/credentials
  optionsSuccessStatus: 200, // รองรับ legacy browsers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
  ],
};

/**
 * Dynamic CORS configuration for production
 */
export const getCorsConfig = () => {
  if (config.server.nodeEnv === 'production') {
    return {
      ...corsConfig,
      origin: config.cors.origins, // ใช้ array ของ allowed origins ใน production
    };
  }
  
  return corsConfig;
};

/**
 * Validate CORS configuration
 */
export const validateCorsConfig = () => {
  if (config.server.nodeEnv === 'production' && config.cors.origins.length === 0) {
    console.error('❌ CORS configuration error: No allowed origins configured for production');
    return false;
  }

  // ตรวจสอบว่า origins ใน production เป็น HTTPS
  if (config.server.nodeEnv === 'production') {
    const hasHttp = config.cors.origins.some(origin => origin.startsWith('http://'));
    if (hasHttp) {
      console.warn('⚠️ CORS warning: HTTP origins detected in production. Consider using HTTPS.');
    }
  }

  console.log('✅ CORS configuration validated');
  return true;
};

export default corsConfig;
