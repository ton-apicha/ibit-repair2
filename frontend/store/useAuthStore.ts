/**
 * Auth Store (Zustand)
 * จัดการ state สำหรับ Authentication
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

// Interface สำหรับข้อมูล User
interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'MANAGER' | 'TECHNICIAN' | 'RECEPTIONIST';
  language: string;
}

// Interface สำหรับ Auth Store State
interface AuthState {
  // State
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User) => void;
}

/**
 * Auth Store
 * ใช้ persist middleware เพื่อเก็บข้อมูลใน localStorage
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ==================
      // Initial State
      // ==================
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // ==================
      // Login
      // ==================
      login: async (username: string, password: string) => {
        try {
          set({ isLoading: true });

          console.log('🔑 useAuthStore.login: Starting login process...');

          // เรียก API login
          const response = await api.post('/api/auth/login', {
            username,
            password,
          });

          console.log('📦 Login Response:');
          console.log('  Status:', response.status);
          console.log('  HasToken:', !!response.data.token);
          console.log('  HasUser:', !!response.data.user);
          console.log('  UserRole:', response.data.user?.role);
          console.log('  Full Response:', response.data);

          const { token, refreshToken, user } = response.data;

          // เก็บ tokens ใน localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));
            console.log('💾 Tokens และ User ถูกเก็บใน localStorage แล้ว');
          }

          // อัพเดท state
          set({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          // Initialize i18n with user's language preference
          if (user.language && typeof window !== 'undefined') {
            try {
              const i18nModule = await import('react-i18next');
              const i18n = (i18nModule as any).i18n;
              if (i18n) {
                await i18n.changeLanguage(user.language);
              }
            } catch (i18nError) {
              console.warn('Failed to initialize i18n with user language:', i18nError);
            }
          }

          console.log('✅ Login Success! State updated.');
        } catch (error: any) {
          set({ isLoading: false });
          
          console.error('❌ Login Error in Store:');
          console.error('  HasResponse:', !!error.response);
          console.error('  HasRequest:', !!error.request);
          console.error('  Status:', error.response?.status);
          console.error('  ResponseData:', error.response?.data);
          console.error('  Message:', error.message);
          console.error('  Code:', error.code);
          console.error('  Full Error:', error);
          
          // แสดง error message
          const message =
            error.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
          throw new Error(message);
        }
      },

      // ==================
      // Logout
      // ==================
      logout: () => {
        // ลบข้อมูลจาก localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }

        // Reset state
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      // ==================
      // Refresh Authentication
      // ใช้ refresh token เพื่อสร้าง access token ใหม่
      // ==================
      refreshAuth: async () => {
        try {
          const { refreshToken } = get();
          
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          console.log('🔄 Refreshing token...');

          const response = await api.post('/api/auth/refresh', {
            refreshToken,
          });

          const { token, user } = response.data;

          // เก็บ token ใหม่ใน localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
          }

          // อัพเดท state
          set({
            user,
            token,
            isAuthenticated: true,
          });

          console.log('✅ Token refreshed successfully');
        } catch (error) {
          console.error('❌ Token refresh failed:', error);
          
          // ถ้า refresh ล้มเหลว ให้ logout
          get().logout();
          throw error;
        }
      },

      // ==================
      // Check Authentication
      // ตรวจสอบว่า token ยังใช้ได้หรือไม่
      // ==================
      checkAuth: async () => {
        try {
          const token = get().token;

          // ถ้าไม่มี token ให้ logout
          if (!token) {
            get().logout();
            return;
          }

          // เรียก API เพื่อตรวจสอบ token
          const response = await api.get('/api/auth/me');
          const user = response.data;

          // อัพเดท user ข้อมูลล่าสุด
          set({
            user,
            isAuthenticated: true,
          });
        } catch (error) {
          // ถ้า token หมดอายุหรือไม่ถูกต้อง ให้ logout
          get().logout();
        }
      },

      // ==================
      // Set User
      // ==================
      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      // ชื่อ key ใน localStorage
      name: 'auth-storage',
      
      // เก็บเฉพาะ state ที่ต้องการ persist
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * ตัวอย่างการใช้งาน:
 * 
 * const { user, login, logout, isAuthenticated } = useAuthStore();
 * 
 * // Login
 * await login('admin', 'admin123');
 * 
 * // Logout
 * logout();
 * 
 * // ตรวจสอบ role
 * if (user?.role === 'ADMIN') {
 *   // Admin only action
 * }
 */

