// 📤 Upload Resource Page - Upload new resource
// Following MVVM pattern

import { MainLayout } from '../../layouts';

const UploadResourcePage = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900">Subir Recurso</h1>
          <p className="mt-2 text-gray-600">
            Comparte un nuevo recurso con la comunidad.
          </p>
          {/* TODO: Implement upload form */}
        </div>
      </div>
    </MainLayout>
  );
};

export default UploadResourcePage;