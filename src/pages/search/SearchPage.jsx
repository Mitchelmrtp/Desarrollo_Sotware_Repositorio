// 📂 Search Page - Global search functionality
// Following MVVM pattern

import { MainLayout } from '../../layouts';

const SearchPage = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900">Buscar Recursos</h1>
          <p className="mt-2 text-gray-600">
            Encuentra recursos académicos por tema, tipo o autor.
          </p>
          {/* TODO: Implement search functionality */}
        </div>
      </div>
    </MainLayout>
  );
};

export default SearchPage;