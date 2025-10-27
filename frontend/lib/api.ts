/**
 * API Client
 * ไฟล์นี้ใช้สำหรับเรียก Backend API
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import logger from './logger';

/**
 * ฟังก์ชันกำหนด API URL แบบ dynamic
 * ถ้าเข้าผ่าน IP จะใช้ IP เดียวกันสำหรับ API
 * ถ้าเข้าผ่าน localhost จะใช้ localhost
 */
const getApiUrl = (): string => {
  // ถ้ากำหนดไว้ใน env ให้ใช้ตามนั้น
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // ถ้าเป็น server-side ให้ใช้ localhost
  if (typeof window === 'undefined') {
    return 'http://localhost:4000';
  }

  // ถ้าเป็น client-side ให้ใช้ host เดียวกันกับที่เข้ามา
  const hostname = window.location.hostname;
  
  // ถ้าเป็น IP address ใช้ IP
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:4000`;
  }
  
  // Default: localhost
  return 'http://localhost:4000';
};

// สร้าง axios instance
const api: AxiosInstance = axios.create({
  baseURL: getApiUrl(),
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * ดักจับ request ก่อนส่งไป backend
 * ใช้สำหรับแนบ JWT token
 */
api.interceptors.request.use(
  (config) => {
    const startTime = Date.now();
    (config as any).metadata = { startTime };

    // ดึง token จาก localStorage (ถ้ามี)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log API request
      logger.apiRequest(
        config.method?.toUpperCase() || 'UNKNOWN',
        config.url || '',
        {
          baseURL: config.baseURL,
          fullURL: `${config.baseURL}${config.url}`,
          hostname: window.location.hostname,
          hasToken: !!token,
        }
      );
    }
    return config;
  },
  (error) => {
    logger.error('Request setup error', { error: error.message });
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * ดักจับ response จาก backend
 * ใช้สำหรับจัดการ error แบบรวมศูนย์
 */
api.interceptors.response.use(
  (response) => {
    const duration = Date.now() - ((response.config as any).metadata?.startTime || 0);
    
    // Log API response
    logger.apiResponse(
      response.config.method?.toUpperCase() || 'UNKNOWN',
      response.config.url || '',
      response.status,
      duration,
      {
        data: response.data,
        headers: response.headers,
      }
    );

    return response;
  },
  async (error: AxiosError) => {
    const duration = Date.now() - ((error.config as any)?.metadata?.startTime || 0);
    
    // Log API error
    logger.error('API Error', {
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      responseData: error.response?.data,
      code: error.code,
      duration,
    });

    // จัดการ error ตามสถานะ HTTP
    if (error.response) {
      const status = error.response.status;

      // 401 Unauthorized - Token หมดอายุหรือไม่ถูกต้อง
      if (status === 401) {
        logger.warn('Unauthorized - attempting token refresh', {
          requestURL: error.config?.url,
          requestMethod: error.config?.method,
        });
        
        // พยายาม refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          try {
            logger.info('Attempting token refresh');
            // เรียก refresh API โดยตรง (ไม่ผ่าน interceptor)
            const refreshResponse = await axios.post(`${getApiUrl()}/api/auth/refresh`, {
              refreshToken,
            });
            
            const { token, user } = refreshResponse.data;
            logger.info('Token refresh successful, retrying original request');
            
            // เก็บ token ใหม่
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // อัพเดท Authorization header สำหรับ request เดิม
            if (error.config) {
              error.config.headers.Authorization = `Bearer ${token}`;
              // ลอง request เดิมอีกครั้ง
              return api.request(error.config);
            }
          } catch (refreshError) {
            logger.error('Token refresh failed', { error: refreshError });
            // ถ้า refresh ล้มเหลว ให้ logout
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }
          }
        } else {
          logger.warn('No refresh token, redirecting to login');
          // ไม่มี refresh token ให้ redirect ไป login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }
      }

      // 403 Forbidden - ไม่มีสิทธิ์เข้าถึง
      if (status === 403) {
        logger.warn('Forbidden: คุณไม่มีสิทธิ์เข้าถึงส่วนนี้');
      }

      // 404 Not Found
      if (status === 404) {
        logger.warn('Not Found: ไม่พบข้อมูลที่ต้องการ');
      }

      // 500 Internal Server Error
      if (status === 500) {
        logger.error('Server Error: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์');
      }
    } else if (error.request) {
      // Request ถูกส่งแต่ไม่ได้รับ response
      logger.error('No Response - ไม่สามารถเชื่อมต่อกับ Backend ได้', {
        message: error.message,
        possibleCauses: [
          'Backend ไม่ทำงาน',
          'URL ไม่ถูกต้อง',
          'Firewall block',
          'Network error',
        ],
      });
    } else {
      // Error อื่นๆ
      logger.error('Request Setup Error', { message: error.message });
    }

    return Promise.reject(error);
  }
);

export default api;

/**
 * ตัวอย่างการใช้งาน:
 * 
 * import api from '@/lib/api';
 * 
 * // GET request
 * const response = await api.get('/api/jobs');
 * const jobs = response.data;
 * 
 * // POST request
 * const response = await api.post('/api/jobs', {
 *   customerId: '123',
 *   modelId: '456',
 *   symptoms: 'ไม่ทำงาน'
 * });
 * 
 * // PUT request
 * await api.put('/api/jobs/123', { status: 'IN_REPAIR' });
 * 
 * // DELETE request
 * await api.delete('/api/jobs/123');
 */

