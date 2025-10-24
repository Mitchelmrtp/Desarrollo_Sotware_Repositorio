// 🔐 useAuth Hook - Template Method Pattern for authentication
// Following Template Method Pattern and Single Responsibility Principle

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthDispatch, useAuthState, AuthActionTypes } from '../store/AuthState';
import { apiService } from '../services';

// 🧪 DEVELOPMENT ONLY - Test users (remove in production)
const DEV_USERS = import.meta.env.VITE_NODE_ENV === 'development' ? [
  {
    email: 'admin@test.com',
    password: 'admin123',
    user: {
      id: '1',
      name: 'Admin Test',
      email: 'admin@test.com',
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'admin'],
      avatar: null
    }
  },
  {
    email: 'user@test.com', 
    password: 'user123',
    user: {
      id: '2',
      name: 'Usuario Test',
      email: 'user@test.com',
      role: 'user',
      permissions: ['read', 'write'],
      avatar: null
    }
  },
  {
    email: 'teacher@test.com',
    password: 'teacher123', 
    user: {
      id: '3',
      name: 'Profesor Test',
      email: 'teacher@test.com',
      role: 'teacher',
      permissions: ['read', 'write', 'moderate'],
      avatar: null
    }
  }
] : [];

export const useAuth = () => {
  const authState = useAuthState();
  const dispatch = useAuthDispatch();
  const navigate = useNavigate();

  // 🧪 DEV ONLY - Mock login for testing (remove in production)
  const mockLogin = useCallback(async (credentials, redirectPath = '/') => {
    const testUser = DEV_USERS.find(u => 
      u.email === credentials.email && u.password === credentials.password
    );
    
    if (testUser) {
      dispatch({ type: AuthActionTypes.LOGIN_START });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockToken = `mock-token-${testUser.user.id}-${Date.now()}`;
      localStorage.setItem('authToken', mockToken);
      
      dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: {
          user: testUser.user,
          token: mockToken
        },
      });
      
      navigate(redirectPath);
      return { success: true, data: { user: testUser.user, token: mockToken } };
    }
    
    return null; // Let normal login handle it
  }, [dispatch, navigate]);

  // Template method for login process
  const login = useCallback(async (credentials, redirectPath = '/') => {
    try {
      // 🧪 DEV ONLY - Try mock login first in development
      if (import.meta.env.VITE_NODE_ENV === 'development') {
        const mockResult = await mockLogin(credentials, redirectPath);
        if (mockResult) return mockResult;
      }

      dispatch({ type: AuthActionTypes.LOGIN_START });

      const result = await apiService.login(credentials);
      
      if (result.success) {
        dispatch({
          type: AuthActionTypes.LOGIN_SUCCESS,
          payload: result.data,
        });
        
        navigate(redirectPath);
        return { success: true, data: result.data };
      } else {
        dispatch({
          type: AuthActionTypes.LOGIN_FAILURE,
          payload: result.error,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Error de conexión';
      dispatch({
        type: AuthActionTypes.LOGIN_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, [dispatch, navigate, mockLogin]);

  // Template method for registration process
  const register = useCallback(async (userData, redirectPath = '/') => {
    try {
      dispatch({ type: AuthActionTypes.LOGIN_START });

      const result = await apiService.register(userData);
      
      if (result.success) {
        dispatch({
          type: AuthActionTypes.LOGIN_SUCCESS,
          payload: result.data,
        });
        
        navigate(redirectPath);
        return { success: true, data: result.data };
      } else {
        dispatch({
          type: AuthActionTypes.LOGIN_FAILURE,
          payload: result.error,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = error.message || 'Error de conexión';
      dispatch({
        type: AuthActionTypes.LOGIN_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  }, [dispatch, navigate]);

  // Template method for logout process
  const logout = useCallback(async (redirectPath = '/login') => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      dispatch({ type: AuthActionTypes.LOGOUT });
      navigate(redirectPath);
    }
  }, [dispatch, navigate]);

  // Template method for forgot password
  const forgotPassword = useCallback(async (email) => {
    try {
      const result = await apiService.forgotPassword(email);
      return result;
    } catch (error) {
      return { success: false, error: error.message || 'Error de conexión' };
    }
  }, []);

  // Template method for reset password
  const resetPassword = useCallback(async (token, newPassword) => {
    try {
      const result = await apiService.resetPassword(token, newPassword);
      return result;
    } catch (error) {
      return { success: false, error: error.message || 'Error de conexión' };
    }
  }, []);

  // Template method for updating user profile
  const updateProfile = useCallback(async (profileData) => {
    try {
      const result = await apiService.updateUserProfile(profileData);
      
      if (result.success) {
        dispatch({
          type: AuthActionTypes.SET_USER,
          payload: result.data.user,
        });
      }
      
      return result;
    } catch (error) {
      return { success: false, error: error.message || 'Error de conexión' };
    }
  }, [dispatch]);

  // Template method for checking permissions
  const hasPermission = useCallback((permission) => {
    return authState.permissions.includes(permission);
  }, [authState.permissions]);

  // Template method for checking roles
  const hasRole = useCallback((role) => {
    return authState.role === role;
  }, [authState.role]);

  // Template method for checking if user is admin
  const isAdmin = useCallback(() => {
    return authState.role === 'admin';
  }, [authState.role]);

  // Clear auth errors
  const clearError = useCallback(() => {
    dispatch({ type: AuthActionTypes.CLEAR_ERROR });
  }, [dispatch]);

  return {
    // State
    ...authState,
    
    // Actions
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    clearError,
    
    // Utility functions
    hasPermission,
    hasRole,
    isAdmin,
  };
};

export default useAuth;