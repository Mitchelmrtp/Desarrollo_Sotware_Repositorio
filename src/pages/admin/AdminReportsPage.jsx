// 📂 Admin Reports Page - System reports and analytics
// Following MVVM pattern

import { MainLayout } from '../../layouts';

const AdminReportsPage = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
          <p className="mt-2 text-gray-600">
            Visualiza métricas de uso, reportes de actividad y estadísticas del sistema.
          </p>
          {/* TODO: Implement reports and analytics dashboard */}
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminReportsPage;