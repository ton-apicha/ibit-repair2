/**
 * Error Handler Middleware
 * จัดการ error แบบรวมศูนย์
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorHandler } from '../utils/errors';
import { log } from '../utils/logger';

/**
 * Global Error Handler Middleware
 */
export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let appError: AppError;

  // Handle different types of errors
  if (error instanceof AppError) {
    // Already an AppError
    appError = error;
  } else if (error.name === 'ValidationError') {
    // Zod validation error
    appError = ErrorHandler.handleValidationError(error, req.requestId);
  } else if (error.name === 'PrismaClientKnownRequestError' || 
             error.name === 'PrismaClientUnknownRequestError' ||
             error.name === 'PrismaClientRustPanicError' ||
             error.name === 'PrismaClientInitializationError') {
    // Prisma errors
    appError = ErrorHandler.handlePrismaError(error, req.requestId);
  } else if (error.name === 'JsonWebTokenError' || 
             error.name === 'TokenExpiredError' ||
             error.name === 'NotBeforeError') {
    // JWT errors
    appError = ErrorHandler.handleJwtError(error, req.requestId);
  } else if (ErrorHandler.isOperationalError(error)) {
    // Operational errors
    appError = ErrorHandler.handleOperationalError(error, req.requestId);
  } else {
    // Programming errors
    appError = ErrorHandler.handleProgrammingError(error, req.requestId);
  }

  // Log error
  log.error('Error handled by middleware', {
    requestId: req.requestId,
    errorCode: appError.errorCode,
    message: appError.message,
    statusCode: appError.statusCode,
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    stack: appError.stack,
  });

  // Send error response
  const includeStack = process.env.NODE_ENV === 'development';
  const formattedError = ErrorHandler.formatError(appError, includeStack);
  
  res.status(appError.statusCode).json(formattedError);
};

/**
 * 404 Handler Middleware
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const error = new AppError(
    `ไม่พบ API endpoint: ${req.method} ${req.path}`,
    404,
    'NOT_FOUND_ERROR',
    true,
    req.requestId
  );

  log.warn('404 Not Found', {
    requestId: req.requestId,
    method: req.method,
    url: req.path,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
  });

  res.status(404).json({
    error: error.errorCode,
    message: error.message,
    statusCode: error.statusCode,
    requestId: req.requestId,
  });
};

/**
 * Async Error Wrapper
 * Wrap async route handlers to catch errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation Error Handler
 */
export const validationErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error.name === 'ValidationError' || error.issues) {
    const appError = ErrorHandler.handleValidationError(error, req.requestId);
    
    log.warn('Validation error', {
      requestId: req.requestId,
      message: appError.message,
      field: appError.field,
      value: appError.value,
    });

    res.status(400).json({
      error: appError.errorCode,
      message: appError.message,
      field: appError.field,
      value: appError.value,
      statusCode: appError.statusCode,
      requestId: req.requestId,
    });
  } else {
    next(error);
  }
};

/**
 * Database Error Handler
 */
export const databaseErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error.name?.includes('Prisma')) {
    const appError = ErrorHandler.handlePrismaError(error, req.requestId);
    
    log.error('Database error', {
      requestId: req.requestId,
      error: appError.message,
      operation: (appError as any).operation,
      table: (appError as any).table,
    });

    res.status(appError.statusCode).json({
      error: appError.errorCode,
      message: appError.message,
      statusCode: appError.statusCode,
      requestId: req.requestId,
    });
  } else {
    next(error);
  }
};

/**
 * Authentication Error Handler
 */
export const authenticationErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error.name?.includes('JsonWebToken') || error.name?.includes('Token')) {
    const appError = ErrorHandler.handleJwtError(error, req.requestId);
    
    log.warn('Authentication error', {
      requestId: req.requestId,
      message: appError.message,
      error: error.message,
    });

    res.status(401).json({
      error: appError.errorCode,
      message: appError.message,
      statusCode: appError.statusCode,
      requestId: req.requestId,
    });
  } else {
    next(error);
  }
};

export default {
  globalErrorHandler,
  notFoundHandler,
  asyncHandler,
  validationErrorHandler,
  databaseErrorHandler,
  authenticationErrorHandler,
};
