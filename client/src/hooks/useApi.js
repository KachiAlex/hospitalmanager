// Custom React hooks for API data management
// Provides loading states, error handling, and data caching

import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

// Generic hook for API calls with loading and error states
export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err.message);
      console.error('API Hook Error:', err);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

// Hook for dashboard statistics
export const useDashboardStats = () => {
  return useApi(() => apiService.getDashboardStats());
};

// Hook for patients data
export const usePatients = () => {
  return useApi(() => apiService.getPatients());
};

// Hook for doctors data
export const useDoctors = () => {
  return useApi(() => apiService.getDoctors());
};

// Hook for beds data
export const useBeds = (status = null) => {
  return useApi(() => apiService.getBeds(status), [status]);
};

// Hook for admissions data
export const useAdmissions = () => {
  return useApi(() => apiService.getAdmissions());
};

// Hook for API health check
export const useHealthCheck = () => {
  return useApi(() => apiService.healthCheck());
};

// Hook for creating data with loading state
export const useApiMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (apiCall) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
};