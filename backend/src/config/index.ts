/**
 * Configuration Management
 * จัดการ environment variables และ configuration ทั้งหมดแบบรวมศูนย์
 */

import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// โหลด environment variables
dotenv.config();

/**
 * Configuration Schema สำหรับ validation
 */
const configSchema = z.object({
  // Server Configuration
  server: z.object({
    port: z.number().default(4000),
    host: z.string().default('0.0.0.0'),
    nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  }),

  // Database Configuration
  database: z.object({
    url: z.string().min(1, 'DATABASE_URL is required'),
    poolMin: z.number().default(5),
    poolMax: z.number().default(20),
    poolIdle: z.number().default(10000),
  }),

  // JWT Configuration
  jwt: z.object({
    secret: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    expiresIn: z.number().default(86400), // 24 hours
    refreshExpiresIn: z.number().default(604800), // 7 days
  }),

  // CORS Configuration
  cors: z.object({
    origins: z.array(z.string()).default(['http://localhost:3000']),
  }),

  // File Upload Configuration
  upload: z.object({
    maxFileSize: z.number().default(10485760), // 10MB
    allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
    uploadDir: z.string().default('./uploads'),
  }),

  // Email Configuration
  email: z.object({
    smtpHost: z.string().optional(),
    smtpPort: z.number().optional(),
    smtpSecure: z.boolean().default(false),
    smtpUser: z.string().optional(),
    smtpPass: z.string().optional(),
    from: z.string().default('noreply@ibit-repair.com'),
  }),

  // Logging Configuration
  logging: z.object({
    level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    dir: z.string().default('./logs'),
    retentionDays: z.number().default(14),
  }),

  // Security Configuration
  security: z.object({
    rateLimitWindowMs: z.number().default(900000), // 15 minutes
    rateLimitMaxRequests: z.number().default(100),
    minPasswordLength: z.number().default(8),
    requireUppercase: z.boolean().default(true),
    requireLowercase: z.boolean().default(true),
    requireNumbers: z.boolean().default(true),
    requireSymbols: z.boolean().default(false),
    sessionSecret: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
    sessionMaxAge: z.number().default(86400000), // 24 hours
  }),

  // Monitoring Configuration
  monitoring: z.object({
    healthCheckInterval: z.number().default(30000),
    enableMetrics: z.boolean().default(true),
  }),

  // Feature Flags
  features: z.object({
    enableRegistration: z.boolean().default(true),
    enableEmailVerification: z.boolean().default(false),
    enablePasswordReset: z.boolean().default(true),
    enableAuditLog: z.boolean().default(true),
  }),

  // External Services
  external: z.object({
    redisUrl: z.string().optional(),
    backupEnabled: z.boolean().default(true),
    backupSchedule: z.string().default('0 2 * * *'),
    backupRetentionDays: z.number().default(30),
  }),

  // Development Configuration
  development: z.object({
    debug: z.boolean().default(false),
    enableRequestLogging: z.boolean().default(true),
    seedDatabase: z.boolean().default(true),
  }),
});

/**
 * Parse และ validate configuration จาก environment variables
 */
function parseConfig() {
  try {
    // Parse CORS origins
    const corsOrigins = process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
      : ['http://localhost:3000'];

    // Parse allowed file types
    const allowedTypes = process.env.ALLOWED_FILE_TYPES
      ? process.env.ALLOWED_FILE_TYPES.split(',').map(type => type.trim())
      : ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

    const config = {
      server: {
        port: parseInt(process.env.PORT || '4000', 10),
        host: process.env.HOST || '0.0.0.0',
        nodeEnv: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
      },
      database: {
        url: process.env.DATABASE_URL || '',
        poolMin: parseInt(process.env.DB_POOL_MIN || '5', 10),
        poolMax: parseInt(process.env.DB_POOL_MAX || '20', 10),
        poolIdle: parseInt(process.env.DB_POOL_IDLE || '10000', 10),
      },
      jwt: {
        secret: process.env.JWT_SECRET || '',
        expiresIn: parseInt(process.env.JWT_EXPIRES_IN || '86400', 10),
        refreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800', 10),
      },
      cors: {
        origins: corsOrigins,
      },
      upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
        allowedTypes,
        uploadDir: process.env.UPLOAD_DIR || './uploads',
      },
      email: {
        smtpHost: process.env.SMTP_HOST,
        smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
        smtpSecure: process.env.SMTP_SECURE === 'true',
        smtpUser: process.env.SMTP_USER,
        smtpPass: process.env.SMTP_PASS,
        from: process.env.EMAIL_FROM || 'noreply@ibit-repair.com',
      },
      logging: {
        level: (process.env.LOG_LEVEL as 'error' | 'warn' | 'info' | 'debug') || 'info',
        dir: process.env.LOG_DIR || './logs',
        retentionDays: parseInt(process.env.LOG_RETENTION_DAYS || '14', 10),
      },
      security: {
        rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
        minPasswordLength: parseInt(process.env.MIN_PASSWORD_LENGTH || '8', 10),
        requireUppercase: process.env.REQUIRE_UPPERCASE === 'true',
        requireLowercase: process.env.REQUIRE_LOWERCASE === 'true',
        requireNumbers: process.env.REQUIRE_NUMBERS === 'true',
        requireSymbols: process.env.REQUIRE_SYMBOLS === 'true',
        sessionSecret: process.env.SESSION_SECRET || '',
        sessionMaxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10),
      },
      monitoring: {
        healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000', 10),
        enableMetrics: process.env.ENABLE_METRICS === 'true',
      },
      features: {
        enableRegistration: process.env.ENABLE_REGISTRATION !== 'false',
        enableEmailVerification: process.env.ENABLE_EMAIL_VERIFICATION === 'true',
        enablePasswordReset: process.env.ENABLE_PASSWORD_RESET !== 'false',
        enableAuditLog: process.env.ENABLE_AUDIT_LOG !== 'false',
      },
      external: {
        redisUrl: process.env.REDIS_URL,
        backupEnabled: process.env.BACKUP_ENABLED !== 'false',
        backupSchedule: process.env.BACKUP_SCHEDULE || '0 2 * * *',
        backupRetentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30', 10),
      },
      development: {
        debug: process.env.DEBUG === 'true',
        enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING !== 'false',
        seedDatabase: process.env.SEED_DATABASE !== 'false',
      },
    };

    // Validate configuration
    const validatedConfig = configSchema.parse(config);
    return validatedConfig;
  } catch (error) {
    console.error('❌ Configuration validation failed:');
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error('  - Unknown configuration error:', error);
    }
    process.exit(1);
  }
}

/**
 * Global configuration object
 */
export const config = parseConfig();

/**
 * Helper functions
 */
export const isDevelopment = () => config.server.nodeEnv === 'development';
export const isProduction = () => config.server.nodeEnv === 'production';
export const isTest = () => config.server.nodeEnv === 'test';

/**
 * Get configuration for specific module
 */
export const getConfig = () => config;

/**
 * Validate required environment variables
 */
export const validateEnvironment = () => {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`  - ${key}`));
    console.error('\n💡 Please check your .env file and ensure all required variables are set.');
    process.exit(1);
  }

  console.log('✅ Environment validation passed');
};

export default config;
