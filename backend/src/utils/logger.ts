/**
 * Winston Logger Configuration
 * ระบบ logging ที่ครบถ้วนสำหรับ production
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { config } from '../config';

/**
 * Custom log format
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (stack) {
      logMessage += `\n${stack}`;
    }
    
    if (Object.keys(meta).length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return logMessage;
  })
);

/**
 * Console format สำหรับ development
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    let logMessage = `${timestamp} ${level}: ${message}`;
    if (stack) {
      logMessage += `\n${stack}`;
    }
    return logMessage;
  })
);

/**
 * Create transports based on environment
 */
const createTransports = () => {
  const transports: winston.transport[] = [];

  // Console transport สำหรับ development
  if (config.server.nodeEnv === 'development') {
    transports.push(
      new winston.transports.Console({
        format: consoleFormat,
        level: config.logging.level,
      })
    );
  }

  // File transports สำหรับ production
  if (config.server.nodeEnv === 'production' || config.development.debug) {
    // Error logs
    transports.push(
      new DailyRotateFile({
        filename: path.join(config.logging.dir, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        format: logFormat,
        maxSize: '20m',
        maxFiles: `${config.logging.retentionDays}d`,
        zippedArchive: true,
      })
    );

    // Combined logs (all levels)
    transports.push(
      new DailyRotateFile({
        filename: path.join(config.logging.dir, 'combined-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        format: logFormat,
        maxSize: '20m',
        maxFiles: `${config.logging.retentionDays}d`,
        zippedArchive: true,
      })
    );

    // Access logs (สำหรับ HTTP requests)
    transports.push(
      new DailyRotateFile({
        filename: path.join(config.logging.dir, 'access-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        format: logFormat,
        maxSize: '20m',
        maxFiles: `${config.logging.retentionDays}d`,
        zippedArchive: true,
      })
    );
  }

  return transports;
};

/**
 * Create logger instance
 */
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports: createTransports(),
  exitOnError: false,
});

/**
 * Request logger สำหรับ HTTP requests
 */
export const requestLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new DailyRotateFile({
      filename: path.join(config.logging.dir, 'access-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: `${config.logging.retentionDays}d`,
      zippedArchive: true,
    })
  ],
});

/**
 * Log levels และ methods
 */
export const logLevels = {
  error: 'error',
  warn: 'warn',
  info: 'info',
  http: 'http',
  debug: 'debug',
} as const;

/**
 * Enhanced logger methods
 */
export const log = {
  /**
   * Log error messages
   */
  error: (message: string, meta?: any) => {
    logger.error(message, meta);
  },

  /**
   * Log warning messages
   */
  warn: (message: string, meta?: any) => {
    logger.warn(message, meta);
  },

  /**
   * Log info messages
   */
  info: (message: string, meta?: any) => {
    logger.info(message, meta);
  },

  /**
   * Log HTTP requests
   */
  http: (message: string, meta?: any) => {
    requestLogger.info(message, meta);
  },

  /**
   * Log debug messages
   */
  debug: (message: string, meta?: any) => {
    logger.debug(message, meta);
  },

  /**
   * Log database operations
   */
  database: (operation: string, table: string, meta?: any) => {
    logger.info(`Database ${operation} on ${table}`, {
      operation,
      table,
      ...meta,
    });
  },

  /**
   * Log authentication events
   */
  auth: (event: string, userId?: string, meta?: any) => {
    logger.info(`Auth ${event}`, {
      event,
      userId,
      ...meta,
    });
  },

  /**
   * Log security events
   */
  security: (event: string, meta?: any) => {
    logger.warn(`Security ${event}`, {
      event,
      ...meta,
    });
  },

  /**
   * Log performance metrics
   */
  performance: (operation: string, duration: number, meta?: any) => {
    logger.info(`Performance ${operation}`, {
      operation,
      duration,
      ...meta,
    });
  },
};

/**
 * Initialize logger
 */
export const initializeLogger = () => {
  // สร้างโฟลเดอร์ logs ถ้ายังไม่มี
  const fs = require('fs');
  if (!fs.existsSync(config.logging.dir)) {
    fs.mkdirSync(config.logging.dir, { recursive: true });
  }

  logger.info('Logger initialized', {
    level: config.logging.level,
    environment: config.server.nodeEnv,
    logDir: config.logging.dir,
  });
};

/**
 * Graceful shutdown
 */
export const closeLogger = () => {
  logger.end();
  requestLogger.end();
};

export default logger;
