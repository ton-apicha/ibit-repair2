/**
 * JWT Configuration
 * จัดการการตั้งค่า JWT และ refresh token
 */

import { config } from './index';

/**
 * JWT configuration
 */
export const jwtConfig = {
  secret: config.jwt.secret,
  expiresIn: config.jwt.expiresIn, // seconds
  refreshExpiresIn: config.jwt.refreshExpiresIn, // seconds
  
  // JWT algorithm
  algorithm: 'HS256' as const,
  
  // Token issuer
  issuer: 'ibit-repair',
  
  // Token audience
  audience: 'ibit-repair-users',
};

/**
 * JWT payload interface
 */
export interface JWTPayload {
  id: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

/**
 * Refresh token payload interface
 */
export interface RefreshTokenPayload {
  id: string;
  tokenId: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

/**
 * Generate JWT options
 */
export const getJwtOptions = () => ({
  expiresIn: jwtConfig.expiresIn,
  issuer: jwtConfig.issuer,
  audience: jwtConfig.audience,
  algorithm: jwtConfig.algorithm,
});

/**
 * Generate refresh token options
 */
export const getRefreshTokenOptions = () => ({
  expiresIn: jwtConfig.refreshExpiresIn,
  issuer: jwtConfig.issuer,
  audience: jwtConfig.audience,
  algorithm: jwtConfig.algorithm,
});

/**
 * Validate JWT configuration
 */
export const validateJwtConfig = () => {
  if (!jwtConfig.secret || jwtConfig.secret.length < 32) {
    console.error('❌ JWT configuration error: Secret must be at least 32 characters');
    return false;
  }

  if (config.server.nodeEnv === 'production' && jwtConfig.secret === 'ibit-repair-secret-key-2025-change-in-production') {
    console.error('❌ JWT configuration error: Default secret detected in production!');
    return false;
  }

  if (jwtConfig.expiresIn < 300) { // 5 minutes
    console.warn('⚠️ JWT warning: Token expiration time is very short');
  }

  if (jwtConfig.expiresIn > 86400) { // 24 hours
    console.warn('⚠️ JWT warning: Token expiration time is very long');
  }

  console.log('✅ JWT configuration validated');
  return true;
};

/**
 * Generate secure random secret (for development)
 */
export const generateSecureSecret = (): string => {
  const crypto = require('crypto');
  return crypto.randomBytes(64).toString('hex');
};

export default jwtConfig;
