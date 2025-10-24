// 🔄 Reset Password Page - Password reset form
// Following MVVM pattern and Container/Presenter separation

import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthLayout } from '../../layouts';
import { Button } from '../../components/atoms';
import { FormField } from '../../components/molecules';
import { useAuth, useForm } from '../../hooks';
import { EyeIcon, EyeSlashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Form validation rules
  const validationRules = {
    password: {
      required: true,
      minLength: 8,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      requiredMessage: 'La contraseña es requerida',
      minLengthMessage: 'La contraseña debe tener al menos 8 caracteres',
      patternMessage: 'La contraseña debe contener al menos una minúscula, una mayúscula y un número',
    },
    confirmPassword: {
      required: true,
      custom: (value, values) => {
        if (value !== values.password) {
          return 'Las contraseñas no coinciden';
        }
        return '';
      },
      requiredMessage: 'Confirma tu contraseña',
    },
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      const result = await resetPassword(token, values.password);
      
      if (result.success) {
        setResetSuccess(true);
        toast.success('Contraseña actualizada exitosamente');
      } else {
        toast.error(result.error || 'Error al actualizar la contraseña');
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
    { password: '', confirmPassword: '' },
    validationRules,
    handleSubmit
  );

  // Check if token exists
  if (!token) {
    return (
      <AuthLayout
        title="Enlace Inválido"
        subtitle="El enlace de recuperación no es válido"
      >
        <div className="text-center space-y-6">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Enlace de recuperación inválido
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              El enlace que has usado no es válido o ha expirado.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/forgot-password">
                Solicitar nuevo enlace
              </Link>
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

  if (resetSuccess) {
    return (
      <AuthLayout
        title="Contraseña Actualizada"
        subtitle="Tu contraseña ha sido actualizada exitosamente"
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
              ¡Contraseña actualizada!
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Tu contraseña ha sido actualizada exitosamente. 
              Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
          </div>

          <Button
            onClick={() => navigate('/login')}
            className="w-full"
          >
            Ir al inicio de sesión
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Nueva Contraseña"
      subtitle="Crea una nueva contraseña segura"
    >
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Password Field */}
        <div className="relative">
          <FormField
            {...getFieldProps('password')}
            label="Nueva Contraseña"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Confirm Password Field */}
        <div className="relative">
          <FormField
            {...getFieldProps('confirmPassword')}
            label="Confirmar Nueva Contraseña"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Password Requirements */}
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md">
          <p className="font-medium mb-1">La contraseña debe contener:</p>
          <ul className="space-y-1">
            <li className={`flex items-center ${values.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="mr-2">{values.password.length >= 8 ? '✓' : '•'}</span>
              Al menos 8 caracteres
            </li>
            <li className={`flex items-center ${/[a-z]/.test(values.password) ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="mr-2">{/[a-z]/.test(values.password) ? '✓' : '•'}</span>
              Una letra minúscula
            </li>
            <li className={`flex items-center ${/[A-Z]/.test(values.password) ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="mr-2">{/[A-Z]/.test(values.password) ? '✓' : '•'}</span>
              Una letra mayúscula
            </li>
            <li className={`flex items-center ${/\d/.test(values.password) ? 'text-green-600' : 'text-gray-500'}`}>
              <span className="mr-2">{/\d/.test(values.password) ? '✓' : '•'}</span>
              Un número
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Actualizando...' : 'Actualizar Contraseña'}
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

export default ResetPasswordPage;