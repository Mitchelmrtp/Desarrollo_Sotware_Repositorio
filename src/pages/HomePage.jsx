// 🏠 Home Page - Landing page component
// Following MVVM pattern with Container/Presenter separation

import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../components/atoms';
import { useAuth, useResponsive } from '../hooks';
import { 
  DocumentIcon, 
  MagnifyingGlassIcon, 
  UserGroupIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isMobile } = useResponsive();

  const features = [
    {
      name: 'Compartir Recursos',
      description: 'Sube y comparte recursos educativos con la comunidad',
      icon: DocumentIcon,
      href: '/resources/upload',
    },
    {
      name: 'Búsqueda Avanzada',
      description: 'Encuentra exactamente lo que necesitas con filtros inteligentes',
      icon: MagnifyingGlassIcon,
      href: '/search/advanced',
    },
    {
      name: 'Comunidad',
      description: 'Conecta con otros usuarios y colabora en proyectos',
      icon: UserGroupIcon,
      href: '/community',
    },
    {
      name: 'Estadísticas',
      description: 'Visualiza el impacto de tus contribuciones',
      icon: ChartBarIcon,
      href: '/stats',
    },
  ];

  const stats = [
    { name: 'Recursos Compartidos', value: '12,345' },
    { name: 'Usuarios Activos', value: '2,456' },
    { name: 'Descargas Totales', value: '98,765' },
    { name: 'Colaboraciones', value: '1,234' },
  ];

  return (
    <MainLayout showSidebar={isAuthenticated}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center py-16 sm:py-20">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 tracking-tight">
            Comparte{' '}
            <span className="text-blue-600">Conocimiento</span>
            <br />
            Construye{' '}
            <span className="text-blue-600">Futuro</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Plataforma colaborativa para compartir recursos educativos y de investigación.
            Conecta con una comunidad global de aprendizaje.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Button 
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="text-lg px-8 py-3"
                >
                  Comenzar Gratis
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="text-lg px-8 py-3"
                >
                  Iniciar Sesión
                </Button>
              </>
            ) : (
              <>
                <Button 
                  size="lg"
                  onClick={() => navigate('/resources')}
                  className="text-lg px-8 py-3"
                >
                  Explorar Recursos
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/resources/upload')}
                  className="text-lg px-8 py-3"
                >
                  Subir Recurso
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16 sm:py-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.name} className="text-center p-6">
                <CardContent>
                  <dt className="text-2xl sm:text-3xl font-bold text-blue-600">
                    {stat.value}
                  </dt>
                  <dd className="mt-2 text-sm sm:text-base text-gray-600">
                    {stat.name}
                  </dd>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              ¿Por qué elegir Resource Share?
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Herramientas poderosas diseñadas para facilitar el intercambio de conocimiento
            </p>
          </div>

          <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-4'}`}>
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={feature.name}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => isAuthenticated ? navigate(feature.href) : navigate('/login')}
                >
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{feature.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 sm:py-20 text-center">
          <div className="bg-blue-50 rounded-2xl p-8 sm:p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              ¿Listo para comenzar?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Únete a miles de usuarios que ya están compartiendo y descubriendo recursos increíbles.
            </p>
            {!isAuthenticated && (
              <Button 
                size="lg"
                onClick={() => navigate('/register')}
                className="text-lg px-8 py-3"
              >
                Crear Cuenta Gratuita
              </Button>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage;