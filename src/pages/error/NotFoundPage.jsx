// 🚫 404 Not Found Page
// Following Single Responsibility Principle

import { Link } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/atoms';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto h-12 w-12 text-blue-600">
          <svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-12 h-12"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        
        <h1 className="mt-4 text-6xl font-bold text-gray-900">404</h1>
        
        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          Página no encontrada
        </h2>
        
        <p className="mt-4 text-gray-600">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/">
              <HomeIcon className="mr-2 h-4 w-4" />
              Ir al Inicio
            </Link>
          </Button>
          
          <Button variant="outline" onClick={() => window.history.back()}>
            Volver Atrás
          </Button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>¿Necesitas ayuda? <Link to="/help" className="text-blue-600 hover:text-blue-500">Contacta con soporte</Link></p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;