// 🔐 Auth State Store - Specific Authentication State Management
// Following Single Responsibility Principle

import { createContext, useContext, useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';

// Initial auth state
const initialAuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  token: null,
  refreshToken: null,
  permissions: [],
  role: null,
};

// Auth action types
export const AuthActionTypes = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REFRESH_TOKEN: 'REFRESH_TOKEN',
  SET_USER: 'SET_USER',
  SET_PERMISSIONS: 'SET_PERMISSIONS',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AuthActionTypes.LOGIN_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AuthActionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        loading: false,
        error: null,
        role: action.payload.user.role,
        permissions: action.payload.user.permissions || [],
      };

    case AuthActionTypes.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
        role: null,
        permissions: [],
      };

    case AuthActionTypes.LOGOUT:
      return {
        ...initialAuthState,
        loading: false,
      };

    case AuthActionTypes.REFRESH_TOKEN:
      return {
        ...state,
        token: action.payload.token,
        refreshToken: action.payload.refreshToken,
      };

    case AuthActionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        role: action.payload.role,
        permissions: action.payload.permissions || [],
      };

    case AuthActionTypes.SET_PERMISSIONS:
      return {
        ...state,
        permissions: action.payload,
      };

    case AuthActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create auth contexts
const AuthStateContext = createContext();
const AuthDispatchContext = createContext();

// Auth provider component
export const AuthStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userData = localStorage.getItem('userData');

        if (token && userData) {
          const user = JSON.parse(userData);
          dispatch({
            type: AuthActionTypes.LOGIN_SUCCESS,
            payload: {
              user,
              token,
              refreshToken,
            },
          });
        } else {
          dispatch({ type: AuthActionTypes.LOGOUT });
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        dispatch({ type: AuthActionTypes.LOGOUT });
      }
    };

    checkAuthStatus();
  }, []);

  // Persist auth data to localStorage
  useEffect(() => {
    if (state.isAuthenticated && state.token) {
      localStorage.setItem('authToken', state.token);
      localStorage.setItem('userData', JSON.stringify(state.user));
      if (state.refreshToken) {
        localStorage.setItem('refreshToken', state.refreshToken);
      }
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('refreshToken');
    }
  }, [state.isAuthenticated, state.token, state.user, state.refreshToken]);

  return (
    <AuthStateContext.Provider value={state}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
};

AuthStateProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hooks for auth state
export const useAuthState = () => {
  const context = useContext(AuthStateContext);
  if (context === undefined) {
    throw new Error('useAuthState must be used within an AuthStateProvider');
  }
  return context;
};

export const useAuthDispatch = () => {
  const context = useContext(AuthDispatchContext);
  if (context === undefined) {
    throw new Error('useAuthDispatch must be used within an AuthStateProvider');
  }
  return context;
};

// Combined hook
export const useAuth = () => {
  return [useAuthState(), useAuthDispatch()];
};