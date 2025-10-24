// 📚 Resources Page - Browse all resources
// Following MVVM pattern

import { MainLayout } from '../../layouts';

const ResourcesPage = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900">Recursos</h1>
          <p className="mt-2 text-gray-600">
            Explora todos los recursos disponibles en la plataforma.
          </p>
          {/* TODO: Implement resources list */}
        </div>
      </div>
    </MainLayout>
  );
};

export default ResourcesPage;