// 📂 User Management - Admin user management
// Following MVVM pattern

import { MainLayout } from '../../layouts';

const UserManagementPage = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="mt-2 text-gray-600">
            Administra cuentas de usuario, roles y permisos.
          </p>
          {/* TODO: Implement user management interface */}
        </div>
      </div>
    </MainLayout>
  );
};

export default UserManagementPage;