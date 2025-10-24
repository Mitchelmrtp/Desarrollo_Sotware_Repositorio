// 🌐 Global State Store - Observer Pattern Implementation
// Following Single Responsibility and Observer Pattern principles

import { createContext, useContext, useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';

// Observer pattern for state subscriptions
class StateObserver {
  constructor() {
    this.observers = new Set();
  }

  subscribe(callback) {
    this.observers.add(callback);
    return () => this.observers.delete(callback);
  }

  notify(data) {
    this.observers.forEach(callback => callback(data));
  }
}

// Global state observer instance
export const globalStateObserver = new StateObserver();

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  theme: 'light',
  notifications: [],
  ui: {
    sidebarOpen: false,
    searchQuery: '',
    currentPage: '',
  }
};

// Action types
export const ActionTypes = {
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOGOUT: 'LOGOUT',
  SET_THEME: 'SET_THEME',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
};

// Reducer function following the Command pattern
const globalReducer = (state, action) => {
  const newState = (() => {
    switch (action.type) {
      case ActionTypes.SET_USER:
        return {
          ...state,
          user: action.payload,
          isAuthenticated: !!action.payload,
          loading: false,
          error: null,
        };

      case ActionTypes.SET_LOADING:
        return {
          ...state,
          loading: action.payload,
        };

      case ActionTypes.SET_ERROR:
        return {
          ...state,
          error: action.payload,
          loading: false,
        };

      case ActionTypes.CLEAR_ERROR:
        return {
          ...state,
          error: null,
        };

      case ActionTypes.LOGOUT:
        return {
          ...initialState,
          theme: state.theme, // Preserve theme
        };

      case ActionTypes.SET_THEME:
        return {
          ...state,
          theme: action.payload,
        };

      case ActionTypes.ADD_NOTIFICATION:
        return {
          ...state,
          notifications: [...state.notifications, action.payload],
        };

      case ActionTypes.REMOVE_NOTIFICATION:
        return {
          ...state,
          notifications: state.notifications.filter(
            notification => notification.id !== action.payload
          ),
        };

      case ActionTypes.TOGGLE_SIDEBAR:
        return {
          ...state,
          ui: {
            ...state.ui,
            sidebarOpen: !state.ui.sidebarOpen,
          },
        };

      case ActionTypes.SET_SEARCH_QUERY:
        return {
          ...state,
          ui: {
            ...state.ui,
            searchQuery: action.payload,
          },
        };

      case ActionTypes.SET_CURRENT_PAGE:
        return {
          ...state,
          ui: {
            ...state.ui,
            currentPage: action.payload,
          },
        };

      default:
        return state;
    }
  })();

  // Notify observers of state changes
  globalStateObserver.notify({ type: action.type, state: newState });
  
  return newState;
};

// Create contexts
const GlobalStateContext = createContext();
const GlobalDispatchContext = createContext();

// Provider component
export const GlobalStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  // Persist theme to localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && savedTheme !== state.theme) {
      dispatch({ type: ActionTypes.SET_THEME, payload: savedTheme });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', state.theme);
    // Apply theme to document
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  return (
    <GlobalStateContext.Provider value={state}>
      <GlobalDispatchContext.Provider value={dispatch}>
        {children}
      </GlobalDispatchContext.Provider>
    </GlobalStateContext.Provider>
  );
};

GlobalStateProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hooks for accessing state and dispatch
export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};

export const useGlobalDispatch = () => {
  const context = useContext(GlobalDispatchContext);
  if (context === undefined) {
    throw new Error('useGlobalDispatch must be used within a GlobalStateProvider');
  }
  return context;
};

// Combined hook for convenience
export const useGlobalStateAndDispatch = () => {
  return [useGlobalState(), useGlobalDispatch()];
};