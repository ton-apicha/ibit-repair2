/**
 * Type Definitions
 * กำหนดประเภทข้อมูลสำหรับระบบ
 */

// User Types
export interface User {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'RECEPTIONIST';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Customer Types
export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Brand Types
export interface Brand {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Model Types
export interface MinerModel {
  id: string;
  brandId: string;
  modelName: string;
  hashrate?: string;
  powerUsage?: string;
  description?: string;
  brand: Brand;
  createdAt: string;
  updatedAt: string;
}

// Job Types
export interface Job {
  id: string;
  jobNumber: string;
  status: string;
  priority: number;
  serialNumber?: string;
  password?: string;
  problemDescription: string;
  customerNotes?: string;
  receivedDate: string;
  estimatedDoneDate?: string;
  completedDate?: string;
  customer: Customer;
  minerModel: MinerModel;
  technician?: User;
  warrantyProfile?: WarrantyProfile;
  createdAt: string;
  updatedAt: string;
}

// Warranty Types
export interface WarrantyProfile {
  id: string;
  name: string;
  durationDays: number;
  description?: string;
  terms?: string;
  laborWarranty: boolean;
  partsWarranty: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Part Types
export interface Part {
  id: string;
  partNumber: string;
  partName: string;
  description?: string;
  unitPrice: number;
  stockQty: number;
  minStockQty: number;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  message: string;
  data: T;
  total?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
