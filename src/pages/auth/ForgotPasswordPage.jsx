// 🔑 Forgot Password Page - Password recovery form
// Following MVVM pattern and Container/Presenter separation

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthLayout } from '../../layouts';
import { Button } from '../../components/atoms';
import { FormField } from '../../components/molecules';
import { useAuth, useForm } from '../../hooks';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();
  const [emailSent, setEmailSent] = useState(false);

  // Form validation rules
  const validationRules = {
    email: {
      required: true,
      email: true,
      requiredMessage: 'El email es requerido',
      emailMessage: 'Ingresa un email válido',
    },
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      const result = await forgotPassword(values.email);
      
      if (result.success) {
        setEmailSent(true);
        toast.success('Se ha enviado un enlace de recuperación a tu email');
      } else {
        toast.error(result.error || 'Error al enviar el email de recuperación');
      }
    } catch (error) {
      toast.error('Error de conexión. Inténtalo de nuevo.');
    }
  };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleSubmit: onSubmit,
    getFieldProps,
  } = useForm(
    { email: '' },
    validationRules,
    handleSubmit
  );

  if (emailSent) {
    return (
      <AuthLayout
        title="Email Enviado"
        subtitle="Revisa tu bandeja de entrada"
      >
        <div className="text-center space-y-6">
          <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Email de recuperación enviado
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Hemos enviado un enlace de recuperación de contraseña a{' '}
              <span className="font-medium">{values.email}</span>
            </p>
          </div>

          <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-md">
            <p className="font-medium mb-2">¿No ves el email?</p>
            <ul className="text-left space-y-1">
              <li>• Revisa tu carpeta de spam</li>
              <li>• Asegúrate de que el email sea correcto</li>
              <li>• El enlace expira en 1 hora</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setEmailSent(false)}
              variant="outline"
              className="w-full"
            >
              Intentar con otro email
            </Button>
            
            <Link
              to="/login"
              className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-500"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Recuperar Contraseña"
      subtitle="Ingresa tu email para recibir un enlace de recuperación"
    >
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Email Field */}
        <FormField
          {...getFieldProps('email')}
          label="Correo Electrónico"
          type="email"
          placeholder="tu@ejemplo.com"
          required
        />

        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
          <p>
            Te enviaremos un enlace seguro para restablecer tu contraseña.
            El enlace será válido por 1 hora.
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar enlace de recuperación'}
        </Button>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            to="/login"
            className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-500"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;