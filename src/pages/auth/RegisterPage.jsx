// 📝 Register Page - User registration form
// Following MVVM pattern and Container/Presenter separation

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthLayout } from '../../layouts';
import { Button } from '../../components/atoms';
import { FormField } from '../../components/molecules';
import { useAuth, useForm } from '../../hooks';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form validation rules
  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
      requiredMessage: 'El nombre es requerido',
      minLengthMessage: 'El nombre debe tener al menos 2 caracteres',
      maxLengthMessage: 'El nombre no puede tener más de 50 caracteres',
    },
    email: {
      required: true,
      email: true,
      requiredMessage: 'El email es requerido',
      emailMessage: 'Ingresa un email válido',
    },
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
    terms: {
      required: true,
      custom: (value) => {
        if (!value) {
          return 'Debes aceptar los términos y condiciones';
        }
        return '';
      },
    },
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      const { confirmPassword, terms, ...userData } = values;
      
      const result = await register(userData);
      
      if (result.success) {
        toast.success('¡Cuenta creada exitosamente! Bienvenido a Resource Share.');
      } else {
        toast.error(result.error || 'Error al crear la cuenta');
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
    handleChange,
    handleBlur,
    handleSubmit: onSubmit,
    getFieldProps,
  } = useForm(
    { 
      name: '', 
      email: '', 
      password: '', 
      confirmPassword: '',
      terms: false 
    },
    validationRules,
    handleSubmit
  );

  return (
    <AuthLayout
      title="Crear Cuenta"
      subtitle="Únete a la comunidad de Resource Share"
    >
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Name Field */}
        <FormField
          {...getFieldProps('name')}
          label="Nombre Completo"
          type="text"
          placeholder="Juan Pérez"
          required
        />

        {/* Email Field */}
        <FormField
          {...getFieldProps('email')}
          label="Correo Electrónico"
          type="email"
          placeholder="tu@ejemplo.com"
          required
        />

        {/* Password Field */}
        <div className="relative">
          <FormField
            {...getFieldProps('password')}
            label="Contraseña"
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
            label="Confirmar Contraseña"
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

        {/* Terms and Conditions */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={values.terms}
              onChange={(e) => handleChange('terms', e.target.checked)}
              onBlur={() => handleBlur('terms')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="text-gray-700">
              Acepto los{' '}
              <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                términos y condiciones
              </Link>{' '}
              y la{' '}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                política de privacidad
              </Link>
            </label>
            {touched.terms && errors.terms && (
              <p className="mt-1 text-sm text-red-600">{errors.terms}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
        </Button>

        {/* Login Link */}
        <div className="text-center">
          <span className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Inicia sesión aquí
            </Link>
          </span>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">O regístrate con</span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => toast.info('Próximamente: Registro con Google')}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>
          
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => toast.info('Próximamente: Registro con GitHub')}
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;