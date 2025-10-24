// 📂 Advanced Search Page - Detailed search with filters
// Following MVVM pattern

import { MainLayout } from '../../layouts';

const AdvancedSearchPage = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900">Búsqueda Avanzada</h1>
          <p className="mt-2 text-gray-600">
            Utiliza filtros avanzados para encontrar recursos específicos.
          </p>
          {/* TODO: Implement advanced search with filters */}
        </div>
      </div>
    </MainLayout>
  );
};

export default AdvancedSearchPage;