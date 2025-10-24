// ⚠️ General Error Page
// Following Single Responsibility Principle

import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon, HomeIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/atoms';

const ErrorPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto h-12 w-12 text-yellow-600">
          <ExclamationTriangleIcon className="w-12 h-12" />
        </div>
        
        <h1 className="mt-4 text-6xl font-bold text-gray-900">500</h1>
        
        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          Error del servidor
        </h2>
        
        <p className="mt-4 text-gray-600">
          Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado y está trabajando para solucionarlo.
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/">
              <HomeIcon className="mr-2 h-4 w-4" />
              Ir al Inicio
            </Link>
          </Button>
          
          <Button variant="outline" onClick={() => window.location.reload()}>
            Recargar Página
          </Button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>¿El problema persiste? <Link to="/help/contact" className="text-blue-600 hover:text-blue-500">Reporta el error</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;