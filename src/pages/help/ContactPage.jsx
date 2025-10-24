// 📂 Contact Page - Contact information and support
// Following MVVM pattern

import { MainLayout } from '../../layouts';

const ContactPage = () => {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900">Contacto</h1>
          <p className="mt-2 text-gray-600">
            Ponte en contacto con nuestro equipo de soporte.
          </p>
          {/* TODO: Implement contact form */}
        </div>
      </div>
    </MainLayout>
  );
};

export default ContactPage;