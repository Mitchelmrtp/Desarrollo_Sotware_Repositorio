// 📂 FAQ Page - Frequently Asked Questions
// Following MVVM pattern

import { MainLayout } from '../../layouts';

const FAQPage = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900">Preguntas Frecuentes</h1>
          <p className="mt-2 text-gray-600">
            Encuentra respuestas rápidas a las preguntas más comunes.
          </p>
          {/* TODO: Implement FAQ accordion */}
        </div>
      </div>
    </MainLayout>
  );
};

export default FAQPage;