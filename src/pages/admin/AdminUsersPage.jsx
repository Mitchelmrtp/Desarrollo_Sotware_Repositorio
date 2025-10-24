// 📂 Admin Users Page - Admin user management (different from UserManagementPage)
// Following MVVM pattern

import { MainLayout } from '../../layouts';

const AdminUsersPage = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900">Administrar Usuarios</h1>
          <p className="mt-2 text-gray-600">
            Gestiona cuentas de usuario y sus permisos.
          </p>
          {/* TODO: Implement admin users interface */}
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminUsersPage;