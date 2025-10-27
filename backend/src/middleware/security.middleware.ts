/**
 * Security Middleware
 * จัดการความปลอดภัยของระบบ
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import helmet from 'helmet';
import { config } from '../config';
import { log } from '../utils/logger';

/**
 * Rate Limiting Middleware
 */
export const rateLimitMiddleware = rateLimit({
  windowMs: config.security.rateLimitWindowMs, // 15 minutes
  max: config.security.rateLimitMaxRequests, // 100 requests per window
  message: {
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests from this IP, please try again later',
    retryAfter: Math.ceil(config.security.rateLimitWindowMs / 1000),
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    log.warn('Rate limit exceeded', {
      requestId: req.requestId,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
    });

    res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later',
      retryAfter: Math.ceil(config.security.rateLimitWindowMs / 1000),
      requestId: req.requestId,
    });
  },
});

/**
 * Strict Rate Limiting for Auth endpoints
 */
export const authRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'AUTH_RATE_LIMIT_EXCEEDED',
    message: 'Too many authentication attempts, please try again later',
    retryAfter: 900, // 15 minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    log.security('Auth rate limit exceeded', {
      requestId: req.requestId,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      username: req.body?.username,
    });

    res.status(429).json({
      error: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later',
      retryAfter: 900,
      requestId: req.requestId,
    });
  },
});

/**
 * Slow Down Middleware (สำหรับ slow down requests)
 */
export const slowDownMiddleware = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per 15 minutes, then...
  delayMs: 500, // Add 500ms delay per request above 50
  maxDelayMs: 20000, // Max delay of 20 seconds
});

/**
 * Helmet Security Headers
 */
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for development
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
});

/**
 * Request Size Limiter
 */
export const requestSizeLimiter = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.get('Content-Length') || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (contentLength > maxSize) {
    log.security('Request size limit exceeded', {
      requestId: req.requestId,
      ip: req.ip || req.connection.remoteAddress,
      contentLength,
      maxSize,
      url: req.url,
    });

    return res.status(413).json({
      error: 'PAYLOAD_TOO_LARGE',
      message: 'Request payload too large',
      requestId: req.requestId,
    });
  }

  next();
};

/**
 * IP Whitelist Middleware (สำหรับ production)
 */
export const ipWhitelistMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (config.server.nodeEnv === 'production') {
    const clientIP = req.ip || req.connection.remoteAddress;
    const allowedIPs = process.env.ALLOWED_IPS?.split(',') || [];

    if (allowedIPs.length > 0 && clientIP && !allowedIPs.includes(clientIP)) {
      log.security('IP not in whitelist', {
        requestId: req.requestId,
        ip: clientIP,
        allowedIPs,
        url: req.url,
      });

      return res.status(403).json({
        error: 'IP_NOT_ALLOWED',
        message: 'Your IP address is not allowed to access this resource',
        requestId: req.requestId,
      });
    }
  }

  next();
};

/**
 * User-Agent Filter
 */
export const userAgentFilter = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.get('User-Agent') || '';
  const blockedPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /go-http/i,
    /php/i,
  ];

  const isBlocked = blockedPatterns.some(pattern => pattern.test(userAgent));

  if (isBlocked) {
    log.security('Blocked user agent', {
      requestId: req.requestId,
      userAgent,
      ip: req.ip || req.connection.remoteAddress,
      url: req.url,
    });

    return res.status(403).json({
      error: 'USER_AGENT_BLOCKED',
      message: 'Access denied',
      requestId: req.requestId,
    });
  }

  next();
};

/**
 * Password Strength Validator
 */
export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < config.security.minPasswordLength) {
    errors.push(`Password must be at least ${config.security.minPasswordLength} characters long`);
  }

  if (config.security.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (config.security.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (config.security.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (config.security.requireSymbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Password Strength Middleware
 */
export const passwordStrengthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.body.password) {
    const validation = validatePasswordStrength(req.body.password);
    
    if (!validation.isValid) {
      log.warn('Weak password attempted', {
        requestId: req.requestId,
        errors: validation.errors,
        ip: req.ip || req.connection.remoteAddress,
      });

      return res.status(400).json({
        error: 'WEAK_PASSWORD',
        message: 'Password does not meet security requirements',
        errors: validation.errors,
        requestId: req.requestId,
      });
    }
  }

  next();
};

/**
 * Session Security Middleware
 */
export const sessionSecurityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Set secure headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  next();
};

/**
 * SQL Injection Protection
 */
export const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
    /(\b(OR|AND)\s+'.*'\s*=\s*'.*')/gi,
    /(UNION\s+SELECT)/gi,
    /(DROP\s+TABLE)/gi,
    /(DELETE\s+FROM)/gi,
  ];

  const checkString = (str: string): boolean => {
    return sqlPatterns.some(pattern => pattern.test(str));
  };

  const checkObject = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return checkString(obj);
    }
    
    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(value => checkObject(value));
    }
    
    return false;
  };

  // Check request body, query, and params
  const requestData = { ...req.body, ...req.query, ...req.params };
  
  if (checkObject(requestData)) {
    log.security('SQL injection attempt detected', {
      requestId: req.requestId,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      data: requestData,
    });

    return res.status(400).json({
      error: 'INVALID_INPUT',
      message: 'Invalid input detected',
      requestId: req.requestId,
    });
  }

  next();
};

/**
 * XSS Protection
 */
export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<link/gi,
    /<meta/gi,
  ];

  const checkString = (str: string): boolean => {
    return xssPatterns.some(pattern => pattern.test(str));
  };

  const checkObject = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return checkString(obj);
    }
    
    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(value => checkObject(value));
    }
    
    return false;
  };

  // Check request body, query, and params
  const requestData = { ...req.body, ...req.query, ...req.params };
  
  if (checkObject(requestData)) {
    log.security('XSS attempt detected', {
      requestId: req.requestId,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      data: requestData,
    });

    return res.status(400).json({
      error: 'INVALID_INPUT',
      message: 'Invalid input detected',
      requestId: req.requestId,
    });
  }

  next();
};

export default {
  rateLimitMiddleware,
  authRateLimitMiddleware,
  slowDownMiddleware,
  helmetMiddleware,
  requestSizeLimiter,
  ipWhitelistMiddleware,
  userAgentFilter,
  passwordStrengthMiddleware,
  sessionSecurityMiddleware,
  sqlInjectionProtection,
  xssProtection,
};
