// 📂 System Settings - Admin system configuration
// Following MVVM pattern

import { MainLayout } from '../../layouts';

const SystemSettingsPage = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
          <p className="mt-2 text-gray-600">
            Configura parámetros globales y ajustes del sistema.
          </p>
          {/* TODO: Implement system settings interface */}
        </div>
      </div>
    </MainLayout>
  );
};

export default SystemSettingsPage;