/**
 * Logging Middleware
 * Log ทุก HTTP request และ response
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { log, requestLogger } from '../utils/logger';

/**
 * Request ID Middleware
 * เพิ่ม unique request ID ให้ทุก request
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  req.requestId = uuidv4();
  req.startTime = Date.now();
  next();
};

/**
 * Request Logging Middleware
 * Log ทุก incoming request
 */
export const requestLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = req.startTime || Date.now();
  
  // Log incoming request
  const requestInfo = {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    host: req.get('Host'),
    referer: req.get('Referer'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
  };

  log.http('Incoming request', requestInfo);

  // Override res.end เพื่อ log response
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, cb?: any) {
    const duration = Date.now() - startTime;
    const responseInfo = {
      requestId: req.requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      contentLength: res.get('Content-Length'),
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
    };

    // Log response
    if (res.statusCode >= 400) {
      log.warn('HTTP response', responseInfo);
    } else {
      log.http('HTTP response', responseInfo);
    }

    // Log performance สำหรับ slow requests
    if (duration > 1000) { // 1 second
      log.performance('Slow request', duration, {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
      });
    }

    // Call original end function
    return originalEnd.call(this, chunk, encoding, cb);
  };

  next();
};

/**
 * Error Logging Middleware
 * Log errors ที่เกิดขึ้นใน request
 */
export const errorLoggingMiddleware = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  const errorInfo = {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    error: err.message,
    stack: err.stack,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
  };

  log.error('Request error', errorInfo);
  next(err);
};

/**
 * Database Query Logging
 * Log database operations (ถ้าเปิด debug mode)
 */
export const databaseLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV === 'development' && process.env.DEBUG === 'true') {
    // Override console.log เพื่อ log database queries
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('prisma:query')) {
        log.debug('Database query', {
          requestId: req.requestId,
          query: args[0],
        });
      }
      originalConsoleLog.apply(console, args);
    };
  }
  next();
};

/**
 * Security Event Logging
 * Log security-related events
 */
export const securityLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Log suspicious activities
  const suspiciousPatterns = [
    /\.\./, // Path traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection attempts
    /javascript:/i, // JavaScript injection
  ];

  const url = req.url.toLowerCase();
  const userAgent = (req.get('User-Agent') || '').toLowerCase();

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(userAgent)) {
      log.security('Suspicious request detected', {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        pattern: pattern.toString(),
      });
      break;
    }
  }

  next();
};

/**
 * Memory Usage Logging
 * Log memory usage สำหรับ monitoring
 */
export const memoryLoggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const memUsage = process.memoryUsage();
  const memoryInfo = {
    requestId: req.requestId,
    rss: Math.round(memUsage.rss / 1024 / 1024), // MB
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
    external: Math.round(memUsage.external / 1024 / 1024), // MB
  };

  // Log memory usage ทุก 100 requests
  if (Math.random() < 0.01) { // 1% chance
    log.debug('Memory usage', memoryInfo);
  }

  next();
};

export default {
  requestIdMiddleware,
  requestLoggingMiddleware,
  errorLoggingMiddleware,
  databaseLoggingMiddleware,
  securityLoggingMiddleware,
  memoryLoggingMiddleware,
};
