/**
 * Validation Middleware
 * Validate request data using Zod schemas
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { ValidationError } from '../utils/errors';

/**
 * Generic validation middleware
 */
export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      let data;
      
      switch (source) {
        case 'body':
          data = req.body;
          break;
        case 'query':
          data = req.query;
          break;
        case 'params':
          data = req.params;
          break;
      }

      // Parse and validate data
      const validatedData = schema.parse(data);
      
      // Replace original data with validated data
      switch (source) {
        case 'body':
          req.body = validatedData;
          break;
        case 'query':
          req.query = validatedData;
          break;
        case 'params':
          req.params = validatedData;
          break;
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = new ValidationError(
          'Validation failed',
          undefined,
          undefined,
          req.requestId
        );
        
        // Add validation details
        const details = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          value: (err as any).input,
        }));

        (validationError as any).details = details;
        
        next(validationError);
      } else {
        next(error);
      }
    }
  };
};

/**
 * Validate request body
 */
export const validateBody = (schema: ZodSchema) => validate(schema, 'body');

/**
 * Validate request query parameters
 */
export const validateQuery = (schema: ZodSchema) => validate(schema, 'query');

/**
 * Validate request parameters
 */
export const validateParams = (schema: ZodSchema) => validate(schema, 'params');

/**
 * Validate multiple sources
 */
export const validateMultiple = (schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate body
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      // Validate query
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }

      // Validate params
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = new ValidationError(
          'Validation failed',
          undefined,
          undefined,
          req.requestId
        );
        
        const details = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          value: (err as any).input,
        }));

        (validationError as any).details = details;
        
        next(validationError);
      } else {
        next(error);
      }
    }
  };
};

/**
 * Sanitize input data
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize string fields
  const sanitizeString = (str: string): string => {
    if (typeof str !== 'string') return str;
    
    return str
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  };

  // Recursively sanitize object
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    
    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

/**
 * Validate file upload
 */
export const validateFileUpload = (options: {
  maxSize?: number;
  allowedTypes?: string[];
  required?: boolean;
} = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    const maxSize = options.maxSize || 10485760; // 10MB default
    const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'];
    const required = options.required || false;

    if (required && !file) {
      const error = new ValidationError(
        'File is required',
        'file',
        undefined,
        req.requestId
      );
      return next(error);
    }

    if (file) {
      // Check file size
      if (file.size > maxSize) {
        const error = new ValidationError(
          `File size exceeds maximum allowed size of ${Math.round(maxSize / 1024 / 1024)}MB`,
          'file',
          file.size,
          req.requestId
        );
        return next(error);
      }

      // Check file type
      if (!allowedTypes.includes(file.mimetype)) {
        const error = new ValidationError(
          `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
          'file',
          file.mimetype,
          req.requestId
        );
        return next(error);
      }
    }

    next();
  };
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (page < 1) {
      const error = new ValidationError(
        'Page must be at least 1',
        'page',
        page,
        req.requestId
      );
      return next(error);
    }

    if (limit < 1 || limit > 100) {
      const error = new ValidationError(
        'Limit must be between 1 and 100',
        'limit',
        limit,
        req.requestId
      );
      return next(error);
    }

    // Add validated values to request
    req.query.page = page.toString();
    req.query.limit = limit.toString();

    next();
  } catch (error) {
    next(error);
  }
};

export default {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  validateMultiple,
  sanitizeInput,
  validateFileUpload,
  validatePagination,
};
