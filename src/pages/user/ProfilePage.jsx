// 📂 User Profile Page - User profile management
// Following MVVM pattern

import { MainLayout } from '../../layouts';

const ProfilePage = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="mt-2 text-gray-600">
            Gestiona tu información personal y configuración de cuenta.
          </p>
          {/* TODO: Implement user profile form */}
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;