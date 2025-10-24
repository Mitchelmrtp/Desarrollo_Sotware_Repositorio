// 📂 Admin Dashboard - Main admin panel
// Following MVVM pattern

import { MainLayout } from '../../layouts';

const AdminDashboardPage = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="mt-2 text-gray-600">
            Gestiona usuarios, recursos y configuración del sistema.
          </p>
          {/* TODO: Implement admin dashboard */}
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboardPage;