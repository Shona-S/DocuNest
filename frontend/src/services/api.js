import axios from 'axios';
import { toast } from 'react-toastify';

/**
 * API Service
 * 
 * Centralized Axios instance for all API calls to the backend.
 * Automatically includes JWT token from localStorage in requests.
 * Handles errors and provides consistent error messages.
 */

// Create Axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Automatically adds JWT token to all requests if available
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles errors globally and shows toast notifications
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'An error occurred';
      
      // Don't show toast for 401 (unauthorized) - let components handle it
      if (error.response.status !== 401) {
        toast.error(message);
      }
      
      // If token is invalid/expired, clear it and redirect to login
      if (error.response.status === 401 && error.config.url !== '/auth/login') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // Request was made but no response received
      toast.error('Network error. Please check your connection.');
    } else {
      // Something else happened
      toast.error('An unexpected error occurred');
    }
    
    return Promise.reject(error);
  }
);

// ==================== AUTH ENDPOINTS ====================

/**
 * Register a new user
 * @param {Object} userData - { name, email, password }
 * @returns {Promise} User data and token
 */
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

/**
 * Login user
 * @param {Object} credentials - { email, password }
 * @returns {Promise} User data and token
 */
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

/**
 * Get current user information
 * @returns {Promise} User data
 */
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * Set PIN for sensitive files
 * @param {string} pin - PIN code (4-6 digits)
 * @returns {Promise}
 */
export const setPIN = async (pin) => {
  const response = await api.post('/auth/set-pin', { pin });
  return response.data;
};

// ==================== FILE ENDPOINTS ====================

/**
 * Upload a file
 * @param {FormData} formData - File and metadata (file, category, tags, requiresPIN)
 * @param {Function} onUploadProgress - Progress callback
 * @returns {Promise} Document data
 */
export const uploadFile = async (formData, onUploadProgress) => {
  const response = await api.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onUploadProgress(percentCompleted);
      }
    },
  });
  return response.data;
};

/**
 * Get all files for the current user
 * @param {Object} filters - { category, tag }
 * @returns {Promise} Array of documents
 */
export const getFiles = async (filters = {}) => {
  const response = await api.get('/files', { params: filters });
  return response.data;
};

/**
 * Get a specific file's metadata
 * @param {number} fileId - File ID
 * @returns {Promise} Document data
 */
export const getFile = async (fileId) => {
  const response = await api.get(`/files/${fileId}`);
  return response.data;
};

/**
 * Download a file
 * @param {number} fileId - File ID
 * @param {string} filename - Original filename
 * @param {string} pin - Optional PIN for protected files
 * @returns {Promise} Blob data
 */
export const downloadFile = async (fileId, filename, pin = null) => {
  const params = pin ? { pin } : {};
  const response = await api.get(`/files/${fileId}/download`, {
    params,
    responseType: 'blob',
  });
  
  // Create download link
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

/**
 * Delete a file
 * @param {number} fileId - File ID
 * @returns {Promise}
 */
export const deleteFile = async (fileId) => {
  const response = await api.delete(`/files/${fileId}`);
  return response.data;
};

// ==================== SEARCH ENDPOINTS ====================

/**
 * Search files
 * @param {Object} query - { q, category, tag }
 * @returns {Promise} Array of documents
 */
export const searchFiles = async (query) => {
  const response = await api.get('/search', { params: query });
  return response.data;
};

/**
 * Get all categories with counts
 * @returns {Promise} Array of categories
 */
export const getCategories = async () => {
  const response = await api.get('/search/categories');
  return response.data;
};

/**
 * Get all tags with counts
 * @returns {Promise} Array of tags
 */
export const getTags = async () => {
  const response = await api.get('/search/tags');
  return response.data;
};

export default api;

