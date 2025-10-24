// 📄 Resource Detail Page - Individual resource view
// Following MVVM pattern

import { useParams } from 'react-router-dom';
import { MainLayout } from '../../layouts';

const ResourceDetailPage = () => {
  const { id } = useParams();
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900">Detalle del Recurso</h1>
          <p className="mt-2 text-gray-600">
            Recurso ID: {id}
          </p>
          {/* TODO: Implement resource detail */}
        </div>
      </div>
    </MainLayout>
  );
};

export default ResourceDetailPage;