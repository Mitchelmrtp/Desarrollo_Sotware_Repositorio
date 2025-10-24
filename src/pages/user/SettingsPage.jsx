// 📂 Settings Page - Application and user settings
// Following MVVM pattern

import { MainLayout } from '../../layouts';

const SettingsPage = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="mt-2 text-gray-600">
            Personaliza tu experiencia y configuración de la aplicación.
          </p>
          {/* TODO: Implement settings management */}
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;