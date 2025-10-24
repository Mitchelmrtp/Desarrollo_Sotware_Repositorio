// 🔗 Store Index - Export all state management
// Following DRY principle - single point of export

export {
  GlobalStateProvider,
  useGlobalState,
  useGlobalDispatch,
  useGlobalStateAndDispatch,
  ActionTypes,
  globalStateObserver,
} from './GlobalState';

export {
  AuthStateProvider,
  useAuthState,
  useAuthDispatch,
  useAuth,
  AuthActionTypes,
} from './AuthState';