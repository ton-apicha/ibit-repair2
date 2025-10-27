/**
 * Common Validation Schemas
 * Reusable validation schemas สำหรับ API endpoints
 */

import { z } from 'zod';

/**
 * Common field validations
 */
export const commonFields = {
  // UUID validation
  id: z.string().uuid('Invalid ID format'),
  
  // String validations
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  
  // Contact validations
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().regex(/^[0-9+\-\s()]+$/, 'Invalid phone format').optional(),
  
  // Date validations
  date: z.string().datetime('Invalid date format').optional(),
  dateRange: z.object({
    from: z.string().datetime('Invalid start date'),
    to: z.string().datetime('Invalid end date'),
  }).optional(),
  
  // Pagination
  page: z.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit too high').default(20),
  
  // Search
  search: z.string().max(100, 'Search term too long').optional(),
  
  // Status
  status: z.enum(['active', 'inactive', 'pending']).optional(),
};

/**
 * Pagination Schema
 */
export const paginationSchema = z.object({
  page: commonFields.page,
  limit: commonFields.limit,
  search: commonFields.search,
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * User Role Schema
 */
export const roleSchema = z.enum(['ADMIN', 'MANAGER', 'TECHNICIAN', 'RECEPTIONIST']);

/**
 * Job Status Schema
 */
export const jobStatusSchema = z.enum([
  'RECEIVED',
  'DIAGNOSED',
  'WAITING_APPROVAL',
  'IN_REPAIR',
  'WAITING_PARTS',
  'TESTING',
  'READY_FOR_PICKUP',
  'COMPLETED',
  'CANCELLED',
  'ON_HOLD'
]);

/**
 * Payment Status Schema
 */
export const paymentStatusSchema = z.enum(['PENDING', 'PAID', 'PARTIAL', 'CANCELLED']);

/**
 * Transaction Type Schema
 */
export const transactionTypeSchema = z.enum(['DEPOSIT', 'PAYMENT', 'REFUND']);

/**
 * Image Type Schema
 */
export const imageTypeSchema = z.enum(['BEFORE', 'DURING', 'AFTER', 'PROBLEM', 'OTHER']);

/**
 * Customer Schema
 */
export const customerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100, 'Name too long'),
  phone: z.string().min(1, 'Phone is required').regex(/^[0-9+\-\s()]+$/, 'Invalid phone format'),
  email: z.string().email('Invalid email format').optional(),
  address: z.string().max(500, 'Address too long').optional(),
  taxId: z.string().max(20, 'Tax ID too long').optional(),
  companyName: z.string().max(100, 'Company name too long').optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
});

/**
 * User Schema
 */
export const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username too long'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(1, 'Full name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().regex(/^[0-9+\-\s()]+$/, 'Invalid phone format').optional(),
  role: roleSchema,
  language: z.enum(['th', 'en', 'zh']).default('th'),
  isActive: z.boolean().default(true),
});

/**
 * Brand Schema
 */
export const brandSchema = z.object({
  name: z.string().min(1, 'Brand name is required').max(50, 'Brand name too long'),
});

/**
 * Miner Model Schema
 */
export const minerModelSchema = z.object({
  brandId: commonFields.id,
  modelName: z.string().min(1, 'Model name is required').max(100, 'Model name too long'),
  hashrate: z.string().max(50, 'Hashrate too long').optional(),
  powerUsage: z.string().max(50, 'Power usage too long').optional(),
  description: z.string().max(500, 'Description too long').optional(),
});

/**
 * Part Schema
 */
export const partSchema = z.object({
  partNumber: z.string().min(1, 'Part number is required').max(50, 'Part number too long'),
  partName: z.string().min(1, 'Part name is required').max(100, 'Part name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  unitPrice: z.number().min(0, 'Price must be positive'),
  stockQty: z.number().int().min(0, 'Stock quantity must be non-negative'),
  minStockQty: z.number().int().min(0, 'Minimum stock must be non-negative'),
  location: z.string().max(100, 'Location too long').optional(),
});

/**
 * Warranty Profile Schema
 */
export const warrantyProfileSchema = z.object({
  name: z.string().min(1, 'Warranty name is required').max(100, 'Name too long'),
  durationDays: z.number().int().min(0, 'Duration must be non-negative'),
  description: z.string().max(500, 'Description too long').optional(),
  terms: z.string().max(1000, 'Terms too long').optional(),
  laborWarranty: z.boolean().default(true),
  partsWarranty: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

/**
 * Job Schema
 */
export const jobSchema = z.object({
  customerId: commonFields.id,
  minerModelId: commonFields.id,
  serialNumber: z.string().max(100, 'Serial number too long').optional(),
  password: z.string().max(50, 'Password too long').optional(),
  status: jobStatusSchema.default('RECEIVED'),
  priority: z.number().int().min(0).max(10).default(0),
  warrantyProfileId: commonFields.id.optional(),
  problemDescription: z.string().min(1, 'Problem description is required').max(2000, 'Description too long'),
  customerNotes: z.string().max(1000, 'Notes too long').optional(),
  estimatedDoneDate: z.string().datetime('Invalid estimated date').optional(),
  technicianId: commonFields.id.optional(),
});

/**
 * Quotation Schema
 */
export const quotationSchema = z.object({
  jobId: commonFields.id,
  laborCost: z.number().min(0, 'Labor cost must be positive'),
  partsCost: z.number().min(0, 'Parts cost must be positive'),
  otherCost: z.number().min(0, 'Other cost must be positive').default(0),
  discount: z.number().min(0, 'Discount must be positive').default(0),
  vat: z.number().min(0, 'VAT must be positive').default(0),
  notes: z.string().max(1000, 'Notes too long').optional(),
  validUntil: z.string().datetime('Invalid valid until date').optional(),
});

/**
 * Transaction Schema
 */
export const transactionSchema = z.object({
  jobId: commonFields.id,
  quotationId: commonFields.id.optional(),
  type: transactionTypeSchema,
  amount: z.number().min(0, 'Amount must be positive'),
  paymentMethod: z.string().max(50, 'Payment method too long').optional(),
  paymentStatus: paymentStatusSchema.default('PENDING'),
  notes: z.string().max(500, 'Notes too long').optional(),
  paidAt: z.string().datetime('Invalid paid date').optional(),
});

/**
 * Repair Record Schema
 */
export const repairRecordSchema = z.object({
  jobId: commonFields.id,
  description: z.string().min(1, 'Description is required').max(2000, 'Description too long'),
  findings: z.string().max(2000, 'Findings too long').optional(),
  actions: z.string().max(2000, 'Actions too long').optional(),
});

/**
 * Job Part Schema
 */
export const jobPartSchema = z.object({
  jobId: commonFields.id,
  partId: commonFields.id,
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  notes: z.string().max(500, 'Notes too long').optional(),
});

/**
 * Job Image Schema
 */
export const jobImageSchema = z.object({
  jobId: commonFields.id,
  imageUrl: z.string().url('Invalid image URL'),
  imageType: imageTypeSchema.default('OTHER'),
  caption: z.string().max(200, 'Caption too long').optional(),
});

/**
 * Login Schema
 */
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Password Change Schema
 */
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

/**
 * File Upload Schema
 */
export const fileUploadSchema = z.object({
  file: z.any(), // Will be validated in middleware
  maxSize: z.number().default(10485760), // 10MB
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp']),
});

/**
 * System Settings Schema
 */
export const systemSettingsSchema = z.object({
  shopName: z.string().min(1, 'Shop name is required').max(100, 'Shop name too long'),
  address: z.string().max(500, 'Address too long').optional(),
  phone: z.string().regex(/^[0-9+\-\s()]+$/, 'Invalid phone format').optional(),
  email: z.string().email('Invalid email format').optional(),
  logoUrl: z.string().url('Invalid logo URL').optional(),
  taxId: z.string().max(20, 'Tax ID too long').optional(),
});

/**
 * Update schemas (partial schemas for PUT/PATCH operations)
 */
export const updateCustomerSchema = customerSchema.partial();
export const updateUserSchema = userSchema.partial().omit({ password: true });
export const updateBrandSchema = brandSchema.partial();
export const updateMinerModelSchema = minerModelSchema.partial();
export const updatePartSchema = partSchema.partial();
export const updateWarrantyProfileSchema = warrantyProfileSchema.partial();
export const updateJobSchema = jobSchema.partial();
export const updateQuotationSchema = quotationSchema.partial();
export const updateTransactionSchema = transactionSchema.partial();
export const updateSystemSettingsSchema = systemSettingsSchema.partial();

/**
 * Query schemas for filtering and searching
 */
export const customerQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  hasJobs: z.boolean().optional(),
});

export const jobQuerySchema = paginationSchema.extend({
  status: jobStatusSchema.optional(),
  customerId: commonFields.id.optional(),
  technicianId: commonFields.id.optional(),
  priority: z.number().int().min(0).max(10).optional(),
  dateRange: commonFields.dateRange,
});

export const partQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  lowStock: z.boolean().optional(),
  location: z.string().optional(),
});

export const transactionQuerySchema = paginationSchema.extend({
  type: transactionTypeSchema.optional(),
  paymentStatus: paymentStatusSchema.optional(),
  jobId: commonFields.id.optional(),
  dateRange: commonFields.dateRange,
});

export default {
  // Common fields
  commonFields,
  paginationSchema,
  
  // Enums
  roleSchema,
  jobStatusSchema,
  paymentStatusSchema,
  transactionTypeSchema,
  imageTypeSchema,
  
  // Entity schemas
  customerSchema,
  userSchema,
  brandSchema,
  minerModelSchema,
  partSchema,
  warrantyProfileSchema,
  jobSchema,
  quotationSchema,
  transactionSchema,
  repairRecordSchema,
  jobPartSchema,
  jobImageSchema,
  
  // Auth schemas
  loginSchema,
  passwordChangeSchema,
  
  // Other schemas
  fileUploadSchema,
  systemSettingsSchema,
  
  // Update schemas
  updateCustomerSchema,
  updateUserSchema,
  updateBrandSchema,
  updateMinerModelSchema,
  updatePartSchema,
  updateWarrantyProfileSchema,
  updateJobSchema,
  updateQuotationSchema,
  updateTransactionSchema,
  updateSystemSettingsSchema,
  
  // Query schemas
  customerQuerySchema,
  jobQuerySchema,
  partQuerySchema,
  transactionQuerySchema,
};
