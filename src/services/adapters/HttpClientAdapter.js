// 🔌 HTTP Client Adapter - Adapter Pattern for API communication
// Following Interface Segregation and Dependency Inversion principles

import axios from 'axios';

class HttpClientAdapter {
  constructor(baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors (unauthorized) - but only for protected routes
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Don't clear tokens for login/register endpoints
          if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register')) {
            return Promise.reject(this.normalizeError(error));
          }
          
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.refreshAuthToken(refreshToken);
              const newToken = response.data.token;
              
              localStorage.setItem('authToken', newToken);
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              
              return this.client(originalRequest);
            } else {
              // Only clear tokens if refresh token is not available
              this.clearAuthData();
            }
          } catch (refreshError) {
            // Only clear tokens if refresh fails
            this.clearAuthData();
          }
        }

        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  normalizeError(error) {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || error.message,
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      // Request was made but no response
      return {
        message: 'Network error - no response from server',
        status: 0,
        data: null,
      };
    } else {
      // Something else happened
      return {
        message: error.message,
        status: 0,
        data: null,
      };
    }
  }

  clearAuthData() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    // Don't redirect automatically - let the app handle it
  }

  async refreshAuthToken(refreshToken) {
    return this.client.post('/auth/refresh', { refreshToken });
  }

  // HTTP methods
  async get(url, config = {}) {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post(url, data = {}, config = {}) {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put(url, data = {}, config = {}) {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async patch(url, data = {}, config = {}) {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete(url, config = {}) {
    const response = await this.client.delete(url, config);
    return response.data;
  }

  // File upload method
  async upload(url, file, onProgress = null) {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      };
    }

    const response = await this.client.post(url, formData, config);
    return response.data;
  }
}

// Singleton instance
export const httpClient = new HttpClientAdapter();
export default HttpClientAdapter;