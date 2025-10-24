// 🔒 Unauthorized Page
// Following Single Responsibility Principle

import { Link } from 'react-router-dom';
import { ShieldExclamationIcon, HomeIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/atoms';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto h-12 w-12 text-red-600">
          <ShieldExclamationIcon className="w-12 h-12" />
        </div>
        
        <h1 className="mt-4 text-6xl font-bold text-gray-900">403</h1>
        
        <h2 className="mt-4 text-2xl font-bold text-gray-900">
          Acceso denegado
        </h2>
        
        <p className="mt-4 text-gray-600">
          No tienes permisos para acceder a esta página. Contacta con el administrador si crees que esto es un error.
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
          <p>¿Necesitas acceso? <Link to="/help/contact" className="text-blue-600 hover:text-blue-500">Contacta con soporte</Link></p>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;