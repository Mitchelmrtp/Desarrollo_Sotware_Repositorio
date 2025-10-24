// 🎭 API Service Facade - Facade Pattern for API operations
// Following Facade Pattern and Single Responsibility Principle

import { httpClient } from '../adapters/HttpClientAdapter';

class ApiServiceFacade {
  constructor() {
    this.client = httpClient;
  }

  // Authentication services
  async login(credentials) {
    try {
      const response = await this.client.post('/auth/login', credentials);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async register(userData) {
    try {
      const response = await this.client.post('/auth/register', userData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async forgotPassword(email) {
    try {
      const response = await this.client.post('/auth/forgot-password', { email });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async resetPassword(token, newPassword) {
    try {
      const response = await this.client.post('/auth/reset-password', {
        token,
        password: newPassword,
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // User services
  async getUserProfile() {
    try {
      const response = await this.client.get('/users/profile');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateUserProfile(profileData) {
    try {
      const response = await this.client.put('/users/profile', profileData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async uploadAvatar(file) {
    try {
      const response = await this.client.upload('/users/avatar', file);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Resource services
  async getResources(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams ? `/resources?${queryParams}` : '/resources';
      const response = await this.client.get(url);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getResourceById(id) {
    try {
      const response = await this.client.get(`/resources/${id}`);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createResource(resourceData) {
    try {
      const response = await this.client.post('/resources', resourceData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateResource(id, resourceData) {
    try {
      const response = await this.client.put(`/resources/${id}`, resourceData);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteResource(id) {
    try {
      const response = await this.client.delete(`/resources/${id}`);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async uploadResource(file, metadata = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });

      const response = await this.client.post('/resources/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Search services
  async searchResources(query, filters = {}) {
    try {
      const searchParams = { q: query, ...filters };
      const queryParams = new URLSearchParams(searchParams).toString();
      const response = await this.client.get(`/search/resources?${queryParams}`);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getSearchSuggestions(query) {
    try {
      const response = await this.client.get(`/search/suggestions?q=${query}`);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Admin services
  async getAdminDashboard() {
    try {
      const response = await this.client.get('/admin/dashboard');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUsers(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams ? `/admin/users?${queryParams}` : '/admin/users';
      const response = await this.client.get(url);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async moderateResource(id, action, reason = '') {
    try {
      const response = await this.client.post(`/admin/moderate/${id}`, {
        action,
        reason,
      });
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getReports(dateRange = {}) {
    try {
      const queryParams = new URLSearchParams(dateRange).toString();
      const url = queryParams ? `/admin/reports?${queryParams}` : '/admin/reports';
      const response = await this.client.get(url);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Notification services
  async getNotifications() {
    try {
      const response = await this.client.get('/notifications');
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async markNotificationAsRead(id) {
    try {
      const response = await this.client.patch(`/notifications/${id}/read`);
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Singleton instance
export const apiService = new ApiServiceFacade();
export default ApiServiceFacade;