/**
 * Type Definitions
 * กำหนดประเภทข้อมูลสำหรับ Backend
 */

import { Role } from '@prisma/client';

// JWT Token Types
export interface TokenPayload {
  id: string;
  username: string;
  role: Role;
}

// Request Types
export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

// API Response Types
export interface ApiResponse<T = any> {
  message: string;
  data: T;
  total?: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
}

// Pagination Types
export interface PaginationQuery {
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// File Upload Types
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

// System Types
export interface SystemHealth {
  status: string;
  timestamp: string;
  database: {
    status: string;
    responseTime: string;
  };
  api: {
    status: string;
    uptime: string;
    uptimeSeconds: number;
  };
}

export interface SystemMetrics {
  timestamp: string;
  cpu: {
    usage: number;
    cores: number;
    model: string;
  };
  memory: {
    total: string;
    used: string;
    free: string;
    usagePercent: number;
    totalBytes: number;
    usedBytes: number;
  };
  disk: {
    total: string;
    used: string;
    free: string;
    usagePercent: number;
  };
  os: {
    platform: string;
    distro: string;
    release: string;
    arch: string;
  };
}
