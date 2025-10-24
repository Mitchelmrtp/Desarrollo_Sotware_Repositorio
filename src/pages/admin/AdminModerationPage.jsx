// 📂 Admin Moderation Page - Content moderation tools
// Following MVVM pattern

import { MainLayout } from '../../layouts';

const AdminModerationPage = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900">Moderación de Contenido</h1>
          <p className="mt-2 text-gray-600">
            Revisa y modera recursos reportados o pendientes de aprobación.
          </p>
          {/* TODO: Implement content moderation interface */}
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminModerationPage;