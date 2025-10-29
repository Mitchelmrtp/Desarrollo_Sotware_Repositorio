// 🔐 Login Page - Authentication login form
// Following MVVM pattern and Container/Presenter separation

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthLayout } from '../../layouts';
import { Button, Input } from '../../components/atoms';
import { FormField } from '../../components/molecules';
import { useAuth, useForm } from '../../hooks';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/';

  // Form validation rules
  const validationRules = {
    email: {
      required: true,
      email: true,
      requiredMessage: 'El email es requerido',
      emailMessage: 'Ingresa un email válido',
    },
    password: {
      required: true,
      minLength: 6,
      requiredMessage: 'La contraseña es requerida',
      minLengthMessage: 'La contraseña debe tener al menos 6 caracteres',
    },
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      const result = await login(values, from);
      
      if (result.success) {
        toast.success('¡Bienvenido de nuevo!');
      } else {
        toast.error(result.error || 'Error al iniciar sesión');
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
    setFieldValue,
  } = useForm(
    { email: '', password: '' },
    validationRules,
    handleSubmit
  );

  return (
    <AuthLayout
      title="Iniciar Sesión"
      subtitle="Bienvenido de nuevo a Resource Share"
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

        {/* Remember me and Forgot password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Recordarme
            </label>
          </div>

          <div className="text-sm">
            <Link
              to="/forgot-password"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>

        {/* Register Link */}
        <div className="text-center">
          <span className="text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Regístrate aquí
            </Link>
          </span>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">O continúa con</span>
          </div>
        </div>

        {/* 🧪 DEV ONLY - Test Users Info */}
        {import.meta.env.VITE_NODE_ENV === 'development' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">
              🧪 Usuarios de Prueba (Solo Desarrollo)
            </h4>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setFieldValue('email', 'admin@test.com');
                  setFieldValue('password', 'admin123');
                }}
                className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setFieldValue('email', 'user@test.com');
                  setFieldValue('password', 'user123');
                }}
                className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded transition-colors"
              >
                Usuario
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setFieldValue('email', 'teacher@test.com');
                  setFieldValue('password', 'teacher123');
                }}
                className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded transition-colors"
              >
                Profesor
              </button>
            </div>
            <div className="text-xs text-yellow-700 space-y-1">
              <div>🎯 Haz clic en los botones para autocompletar</div>
              <div className="font-mono">
                Env: {import.meta.env.VITE_NODE_ENV || 'undefined'}
              </div>
            </div>
          </div>
        )}

        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => toast.info('Próximamente: Login con Google')}
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
            onClick={() => toast.info('Próximamente: Login con GitHub')}
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

export default LoginPage;