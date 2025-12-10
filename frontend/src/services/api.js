import axios from 'axios';
import { toast } from 'react-toastify';

/**
 * API Service
 * Central Axios instance for backend communication.
 * Automatically handles JWT, errors, redirects and toasts.
 */

// Use Vite environment variable when available (VITE_API_BASE_URL)
const apiBase = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: apiBase,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
      toast.error('Network error. Please check your internet connection.');
    } else {
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

export const downloadFile = async (fileId, filename, pin = null) => {
  const params = pin ? { pin } : {};

  const response = await api.get(`/files/${fileId}/download`, {
    params,
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);

  return response.data;
};

// Fetch file as blob without triggering a download (used for preview)
export const fetchFileBlob = async (fileId, pin = null) => {
  const params = pin ? { pin } : {};
  const response = await api.get(`/files/${fileId}/download`, {
    params,
    responseType: 'blob',
  });
  return response.data;
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
