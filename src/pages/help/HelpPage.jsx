// 📂 Help Page - General help and documentation
// Following MVVM pattern

import { MainLayout } from '../../layouts';

const HelpPage = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900">Ayuda</h1>
          <p className="mt-2 text-gray-600">
            Encuentra respuestas a tus preguntas y aprende a usar la plataforma.
          </p>
          {/* TODO: Implement help documentation */}
        </div>
      </div>
    </MainLayout>
  );
};

export default HelpPage;