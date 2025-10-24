// 📂 Resource Management - Admin resource oversight
// Following MVVM pattern

import { MainLayout } from '../../layouts';

const ResourceManagementPage = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Recursos</h1>
          <p className="mt-2 text-gray-600">
            Supervisa, modera y gestiona todos los recursos de la plataforma.
          </p>
          {/* TODO: Implement resource management interface */}
        </div>
      </div>
    </MainLayout>
  );
};

export default ResourceManagementPage;