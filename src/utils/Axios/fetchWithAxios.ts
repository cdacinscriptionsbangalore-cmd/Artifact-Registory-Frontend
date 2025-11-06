import axios from 'axios';
import { getEnvConfig } from '@/config/env';
import { getCookie } from '../Auth/auth';

const { backendApiUrl } = getEnvConfig();

const axiosInstance = axios.create({
  baseURL: backendApiUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = getCookie('token');
  const csrfToken = getCookie('XSRF-TOKEN');
  
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (csrfToken) {
    config.headers['X-XSRF-TOKEN'] = csrfToken;
  }
  
  return config;
});

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 419) {
      // CSRF token mismatch, try to get a new token
      try {
        await axios.get(`${backendApiUrl}oauth2/login/csrf-token`, {
          withCredentials: true
        });
        // Retry the original request
        return axiosInstance(error.config);
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }
    return Promise.reject(error);
  }
);

export const initCsrf = async () => {
  if (!getCookie('XSRF-TOKEN')) {
    try {
      await axios.get(`${backendApiUrl}oauth2/login/csrf-token`, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Failed to initialize CSRF token:', error);
    }
  }
};

export default axiosInstance;