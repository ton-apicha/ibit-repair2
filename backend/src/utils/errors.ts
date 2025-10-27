/**
 * Custom Error Classes
 * ระบบจัดการ error แบบรวมศูนย์
 */

import { log } from './logger';

/**
 * Base Error Class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode: string;
  public readonly requestId?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    requestId?: string
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    this.requestId = requestId;
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error
 */
export class ValidationError extends AppError {
  public readonly field?: string;
  public readonly value?: any;

  constructor(
    message: string,
    field?: string,
    value?: any,
    requestId?: string
  ) {
    super(message, 400, 'VALIDATION_ERROR', true, requestId);
    this.field = field;
    this.value = value;
  }
}

/**
 * Authentication Error
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', requestId?: string) {
    super(message, 401, 'AUTHENTICATION_ERROR', true, requestId);
  }
}

/**
 * Authorization Error
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', requestId?: string) {
    super(message, 403, 'AUTHORIZATION_ERROR', true, requestId);
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', requestId?: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR', true, requestId);
  }
}

/**
 * Conflict Error
 */
export class ConflictError extends AppError {
  constructor(message: string, requestId?: string) {
    super(message, 409, 'CONFLICT_ERROR', true, requestId);
  }
}

/**
 * Database Error
 */
export class DatabaseError extends AppError {
  public readonly operation?: string;
  public readonly table?: string;

  constructor(
    message: string,
    operation?: string,
    table?: string,
    requestId?: string
  ) {
    super(message, 500, 'DATABASE_ERROR', false, requestId);
    this.operation = operation;
    this.table = table;
  }
}

/**
 * External Service Error
 */
export class ExternalServiceError extends AppError {
  public readonly service?: string;

  constructor(
    message: string,
    service?: string,
    requestId?: string
  ) {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR', true, requestId);
    this.service = service;
  }
}

/**
 * Rate Limit Error
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(
    message: string = 'Too many requests',
    retryAfter?: number,
    requestId?: string
  ) {
    super(message, 429, 'RATE_LIMIT_ERROR', true, requestId);
    this.retryAfter = retryAfter;
  }
}

/**
 * File Upload Error
 */
export class FileUploadError extends AppError {
  public readonly fileName?: string;
  public readonly fileSize?: number;
  public readonly allowedTypes?: string[];

  constructor(
    message: string,
    fileName?: string,
    fileSize?: number,
    allowedTypes?: string[],
    requestId?: string
  ) {
    super(message, 400, 'FILE_UPLOAD_ERROR', true, requestId);
    this.fileName = fileName;
    this.fileSize = fileSize;
    this.allowedTypes = allowedTypes;
  }
}

/**
 * Business Logic Error
 */
export class BusinessLogicError extends AppError {
  public readonly context?: any;

  constructor(
    message: string,
    context?: any,
    requestId?: string
  ) {
    super(message, 422, 'BUSINESS_LOGIC_ERROR', true, requestId);
    this.context = context;
  }
}

/**
 * Error Handler
 */
export class ErrorHandler {
  /**
   * Handle operational errors
   */
  static handleOperationalError(error: AppError, requestId?: string): AppError {
    log.error('Operational error', {
      requestId,
      errorCode: error.errorCode,
      message: error.message,
      statusCode: error.statusCode,
    });

    return error;
  }

  /**
   * Handle programming errors
   */
  static handleProgrammingError(error: Error, requestId?: string): AppError {
    log.error('Programming error', {
      requestId,
      message: error.message,
      stack: error.stack,
    });

    return new AppError(
      'Something went wrong',
      500,
      'PROGRAMMING_ERROR',
      false,
      requestId
    );
  }

  /**
   * Handle Prisma errors
   */
  static handlePrismaError(error: any, requestId?: string): AppError {
    log.error('Prisma error', {
      requestId,
      error: error.message,
      code: error.code,
      meta: error.meta,
    });

    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        return new ConflictError(
          'Resource already exists',
          requestId
        );
      
      case 'P2025':
        // Record not found
        return new NotFoundError('Resource', requestId);
      
      case 'P2003':
        // Foreign key constraint violation
        return new ValidationError(
          'Invalid reference',
          error.meta?.field_name,
          error.meta?.field_value,
          requestId
        );
      
      case 'P2014':
        // Required relation violation
        return new ValidationError(
          'Required relation missing',
          error.meta?.relation_name,
          undefined,
          requestId
        );
      
      default:
        return new DatabaseError(
          'Database operation failed',
          error.meta?.operation,
          error.meta?.model,
          requestId
        );
    }
  }

  /**
   * Handle JWT errors
   */
  static handleJwtError(error: any, requestId?: string): AppError {
    log.error('JWT error', {
      requestId,
      error: error.message,
      name: error.name,
    });

    switch (error.name) {
      case 'JsonWebTokenError':
        return new AuthenticationError('Invalid token', requestId);
      
      case 'TokenExpiredError':
        return new AuthenticationError('Token expired', requestId);
      
      case 'NotBeforeError':
        return new AuthenticationError('Token not active', requestId);
      
      default:
        return new AuthenticationError('Token validation failed', requestId);
    }
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(error: any, requestId?: string): ValidationError {
    if (error.issues && Array.isArray(error.issues)) {
      // Zod validation error
      const firstIssue = error.issues[0];
      return new ValidationError(
        firstIssue.message,
        firstIssue.path?.join('.'),
        firstIssue.input,
        requestId
      );
    }

    return new ValidationError(
      error.message || 'Validation failed',
      undefined,
      undefined,
      requestId
    );
  }

  /**
   * Check if error is operational
   */
  static isOperationalError(error: Error): error is AppError {
    if (error instanceof AppError) {
      return error.isOperational;
    }
    return false;
  }

  /**
   * Format error for response
   */
  static formatError(error: AppError, includeStack: boolean = false): any {
    const formatted: any = {
      error: error.errorCode,
      message: error.message,
      statusCode: error.statusCode,
    };

    if (error.requestId) {
      formatted.requestId = error.requestId;
    }

    if (includeStack && error.stack) {
      formatted.stack = error.stack;
    }

    // Add specific error properties
    if (error instanceof ValidationError) {
      if (error.field) formatted.field = error.field;
      if (error.value !== undefined) formatted.value = error.value;
    }

    if (error instanceof RateLimitError && error.retryAfter) {
      formatted.retryAfter = error.retryAfter;
    }

    if (error instanceof FileUploadError) {
      if (error.fileName) formatted.fileName = error.fileName;
      if (error.fileSize) formatted.fileSize = error.fileSize;
      if (error.allowedTypes) formatted.allowedTypes = error.allowedTypes;
    }

    return formatted;
  }
}

/**
 * Async error wrapper
 */
export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Error response helper
 */
export const sendErrorResponse = (res: any, error: AppError) => {
  const includeStack = process.env.NODE_ENV === 'development';
  const formattedError = ErrorHandler.formatError(error, includeStack);
  
  res.status(error.statusCode).json(formattedError);
};

export default ErrorHandler;
