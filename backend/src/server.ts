/**
 * Express Server หลักสำหรับ Backend API
 * ไฟล์นี้เป็นจุดเริ่มต้นของระบบ Backend
 */

import express, { Express, Request, Response, NextFunction } from 'express';

// ขยาย Request interface เพื่อเพิ่ม requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
    }
  }
}
import cors from 'cors';
import path from 'path';

// Import configuration และ logging
import { config, validateEnvironment } from './config';
import { initializeLogger, log, closeLogger } from './utils/logger';
import { getCorsConfig, validateCorsConfig } from './config/cors';
import { validateJwtConfig } from './config/jwt';

// Import middleware
import {
  requestIdMiddleware,
  requestLoggingMiddleware,
  errorLoggingMiddleware,
  securityLoggingMiddleware,
} from './middleware/logging.middleware';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler.middleware';
import {
  rateLimitMiddleware,
  authRateLimitMiddleware,
  slowDownMiddleware,
  helmetMiddleware,
  requestSizeLimiter,
  sessionSecurityMiddleware,
  sqlInjectionProtection,
  xssProtection,
} from './middleware/security.middleware';

// Validate environment variables
validateEnvironment();

// Initialize logger
initializeLogger();

// Validate configurations
validateCorsConfig();
validateJwtConfig();

// สร้าง Express application
const app: Express = express();
const PORT = config.server.port;

// ========================
// Middleware Configuration
// ========================

// 1. Security Headers
app.use(helmetMiddleware);

// 2. Request Size Limiter
app.use(requestSizeLimiter);

// 3. Session Security
app.use(sessionSecurityMiddleware);

// 4. Request ID Middleware
app.use(requestIdMiddleware);

// 5. Security Logging Middleware
app.use(securityLoggingMiddleware);

// 6. Request Logging Middleware
if (config.development.enableRequestLogging) {
  app.use(requestLoggingMiddleware);
}

// 7. CORS - อนุญาตให้ Frontend เรียก API ได้
app.use(cors(getCorsConfig()));

// 8. Rate Limiting
app.use(rateLimitMiddleware);

// 9. Slow Down (สำหรับ requests ที่มากเกินไป)
app.use(slowDownMiddleware);

// 10. Input Validation & Security
app.use(sqlInjectionProtection);
app.use(xssProtection);

// 5. Parse JSON request body
app.use(express.json({ limit: '10mb' }));

// 6. Parse URL-encoded request body
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 7. Static files สำหรับรูปภาพที่ upload
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ========================
// Routes
// ========================

// Health check endpoint (ทดสอบว่า server รันอยู่)
app.get('/health', (req: Request, res: Response) => {
  const healthInfo = {
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };

  log.info('Health check', { requestId: req.requestId });
  res.status(200).json(healthInfo);
});

// ========================
// API Routes
// ========================

// Import routes
import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import brandRoutes from './routes/brand.routes';
import modelRoutes from './routes/model.routes';
import warrantyRoutes from './routes/warranty.routes';
import partRoutes from './routes/part.routes';
import jobRoutes from './routes/job.routes';
import dashboardRoutes from './routes/dashboard.routes';
import userRoutes from './routes/user.routes';
import systemRoutes from './routes/system.routes';
import settingsRoutes from './routes/settings.routes';

// Authentication routes (with strict rate limiting)
app.use('/api/auth', authRateLimitMiddleware, authRoutes);

// Customer routes
app.use('/api/customers', customerRoutes);

// Brand routes
app.use('/api/brands', brandRoutes);

// Model routes
app.use('/api/models', modelRoutes);

// Warranty routes
app.use('/api/warranties', warrantyRoutes);

// Part routes
app.use('/api/parts', partRoutes);

// Job routes
app.use('/api/jobs', jobRoutes);

// Dashboard routes
app.use('/api/dashboard', dashboardRoutes);

// User routes
app.use('/api/users', userRoutes);

// System routes
app.use('/api/system', systemRoutes);

// Settings routes
app.use('/api/settings', settingsRoutes);

// TODO: เพิ่ม routes อื่นๆ
// app.use('/api/quotations', quotationRoutes);
// app.use('/api/transactions', transactionRoutes);
// app.use('/api/reports', reportRoutes);

// ========================
// Error Handling
// ========================

// 404 Not Found handler
app.use(notFoundHandler);

// Global Error Handler
app.use(globalErrorHandler);

// ========================
// Start Server
// ========================

app.listen(PORT, config.server.host, () => {
  log.info('Server started', {
    port: PORT,
    host: config.server.host,
    environment: config.server.nodeEnv,
    uploadDir: path.join(__dirname, '../uploads'),
  });
  
  console.log('');
  console.log('🚀 ระบบซ่อมเครื่องขุดบิทคอยน์ ASIC - Backend API');
  console.log('================================================');
  console.log(`📡 Server กำลังรันที่: http://${config.server.host}:${PORT}`);
  console.log(`🌍 Environment: ${config.server.nodeEnv}`);
  console.log(`📁 Upload folder: ${path.join(__dirname, '../uploads')}`);
  console.log(`📝 Log level: ${config.logging.level}`);
  console.log('================================================');
  console.log('');
});

// Graceful Shutdown (ปิด server อย่างสง่างาม)
process.on('SIGTERM', () => {
  log.info('SIGTERM signal received: closing server...');
  closeLogger();
  process.exit(0);
});

process.on('SIGINT', () => {
  log.info('SIGINT signal received: closing server...');
  closeLogger();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  log.error('Uncaught Exception', { error: err.message, stack: err.stack });
  closeLogger();
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled Rejection', { reason, promise });
  closeLogger();
  process.exit(1);
});

