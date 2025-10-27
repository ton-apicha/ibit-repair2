/**
 * useApi Hook
 * Custom hook สำหรับเรียก API
 */

import { useState, useCallback } from 'react';
import api from '@/lib/api';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (
    apiCall: () => Promise<any>,
    options?: UseApiOptions
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall();
      
      if (options?.onSuccess) {
        options.onSuccess(response.data);
      }
      
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'เกิดข้อผิดพลาด';
      setError(errorMessage);
      
      if (options?.onError) {
        options.onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    execute,
    clearError: () => setError(null),
  };
}
