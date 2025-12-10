import axios from 'axios';
import { toast } from 'react-toastify';

/**
 * API Service
 * Central Axios instance for backend communication.
 * Automatically handles JWT, errors, redirects and toasts.
 */

// Determine API base URL based on environment
const getApiBaseURL = () => {
  // If VITE_API_BASE_URL is set, use it (from .env files)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Development fallback
  if (import.meta.env.DEV) {
    return 'http://localhost:5000/api';
  }
  
  // Production fallback - use relative path for same-origin requests
  return '/api';
};

const api = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log API base URL in development
if (import.meta.env.DEV) {
  console.log('✅ API Base URL:', api.defaults.baseURL);
}

/* ============================================================
   REQUEST INTERCEPTOR – attach JWT token                         
============================================================ */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ============================================================
   RESPONSE INTERCEPTOR – global error handling                       
============================================================ */
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response) {
      const message = error.response.data?.message || 'Something went wrong';
      const status = error.response.status;

      const requestUrl = error.config?.url || '';

      // Normalize URL (full URL or relative)
      const endpoint = requestUrl.replace(api.defaults.baseURL, '');

      // Log errors in development
      if (import.meta.env.DEV) {
        console.error(`❌ API Error [${status}] ${endpoint}:`, error.response.data);
      }

      /* -----------------------------------------
         HANDLE 401 UNAUTHORIZED
      ------------------------------------------ */
      if (status === 401) {
        // Do NOT redirect for login endpoint itself
        if (!endpoint.endsWith('/auth/login')) {
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      /* -----------------------------------------
         Handle all OTHER errors (show toast)
      ------------------------------------------ */
      toast.error(message);
      
    } else if (error.request) {
      // No response received (network error or timeout)
      console.error('❌ Network Error:', error.request);
      toast.error('Network error. Please check your internet connection and backend server status.');
    } else {
      // Request setup error
      console.error('❌ Request Error:', error.message);
      toast.error('Unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

/* ============================================================
   AUTH ENDPOINTS
============================================================ */

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const setPIN = async (pin) => {
  const response = await api.post('/auth/set-pin', { pin });
  return response.data;
};

export const updateProfile = async (profileData) => {
  // Sends profile updates to backend. Endpoint may be adjusted to match backend.
  const response = await api.put('/auth/profile', profileData);
  return response.data;
};

/* ============================================================
   FILE ENDPOINTS
============================================================ */

export const uploadFile = async (formData, onUploadProgress) => {
  const response = await api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },

    onUploadProgress: (event) => {
      if (onUploadProgress) {
        const percent = Math.round((event.loaded * 100) / event.total);
        onUploadProgress(percent);
      }
    },
  });

  return response.data;
};

export const getFiles = async (filters = {}) => {
  const response = await api.get('/files', { params: filters });
  return response.data;
};

export const getFile = async (fileId) => {
  const response = await api.get(`/files/${fileId}`);
  return response.data;
};

export const fetchFileBlob = async (fileId, pin = null) => {
  const params = pin ? { pin } : {};
  const response = await api.get(`/files/${fileId}/download`, {
    params,
    responseType: 'blob',
  });
  return response.data;
};

export const downloadFile = async (fileId, filename, pin = null) => {
  const blob = await fetchFileBlob(fileId, pin);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  return blob;
};

export const deleteFile = async (fileId) => {
  const response = await api.delete(`/files/${fileId}`);
  return response.data;
};

/* ============================================================
   SEARCH ENDPOINTS
============================================================ */

export const searchFiles = async (query) => {
  const response = await api.get('/search', { params: query });
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/search/categories');
  return response.data;
};

export const getTags = async () => {
  const response = await api.get('/search/tags');
  return response.data;
};

export default api;
