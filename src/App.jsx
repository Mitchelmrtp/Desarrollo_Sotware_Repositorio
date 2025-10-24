// 🚀 Main App Component - Application entry point
// Following Clean Architecture and Composition principles

import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { GlobalStateProvider, AuthStateProvider } from './store';
import { AppRoutes } from './routes';

// Create a QueryClient instance for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalStateProvider>
        <AuthStateProvider>
          <Router>
            <AppRoutes />
            
            {/* Global toast notifications */}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </Router>
        </AuthStateProvider>
      </GlobalStateProvider>
    </QueryClientProvider>
  );
}

export default App;
