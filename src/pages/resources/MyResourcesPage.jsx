// 📂 My Resources Page - User's own resources
// Following MVVM pattern

import { MainLayout } from '../../layouts';

const MyResourcesPage = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Recursos</h1>
          <p className="mt-2 text-gray-600">
            Gestiona los recursos que has subido.
          </p>
          {/* TODO: Implement user resources list */}
        </div>
      </div>
    </MainLayout>
  );
};

export default MyResourcesPage;