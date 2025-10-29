# BACK-DS - Backend para Plataforma de Recursos Educativos

## Descripción

Backend completo para una plataforma de recursos educativos desarrollado con Node.js, Express y PostgreSQL. Incluye autenticación JWT, gestión de archivos, sistema de categorías, comentarios y administración.

## Características

- ✅ **Autenticación completa** con JWT y refresh tokens
- ✅ **Gestión de usuarios** con roles (user, moderator, admin)
- ✅ **Sistema de recursos** con subida de archivos
- ✅ **Categorías jerárquicas** para organizar contenido
- ✅ **Sistema de comentarios** con respuestas anidadas
- ✅ **Sistema de likes** para recursos
- ✅ **Búsqueda avanzada** con filtros múltiples
- ✅ **Panel de administración** con estadísticas
- ✅ **Validación de datos** con Joi
- ✅ **Subida de archivos** con Multer
- ✅ **Seguridad** con Helmet y rate limiting

## Estructura del Proyecto

```
BACK-DS/
├── src/
│   ├── config/
│   │   └── database.js           # Configuración de Sequelize
│   ├── controllers/
│   │   ├── adminController.js    # Panel de administración
│   │   ├── categoryController.js # Gestión de categorías
│   │   ├── helpController.js     # Sistema de ayuda/FAQ
│   │   ├── resourceController.js # Gestión de recursos
│   │   ├── searchController.js   # Búsquedas y sugerencias
│   │   └── userController.js     # Gestión de usuarios
│   ├── middleware/
│   │   ├── adminMiddleware.js    # Middleware de admin
│   │   └── authMiddleware.js     # Autenticación JWT
│   ├── models/
│   │   ├── Cart_item.js          # Modelo de carrito
│   │   ├── Category.js           # Categorías
│   │   ├── Comment.js            # Comentarios
│   │   ├── Permission.js         # Permisos
│   │   ├── Resource.js           # Recursos educativos
│   │   ├── ResourceLike.js       # Likes de recursos
│   │   ├── User.js               # Usuarios
│   │   ├── UserPermission.js     # Permisos de usuario
│   │   └── index.js              # Relaciones entre modelos
│   ├── routes/
│   │   ├── adminRoutes.js        # Rutas de administración
│   │   ├── authRoutes.js         # Autenticación
│   │   ├── cartItemRoutes.js     # Carrito (legacy)
│   │   ├── categoryRoutes.js     # Categorías
│   │   ├── helpRoutes.js         # Ayuda y soporte
│   │   ├── resourceRoutes.js     # Recursos
│   │   ├── searchRoutes.js       # Búsquedas
│   │   └── userRoutes.js         # Usuarios
│   ├── services/
│   │   ├── authService.js        # Lógica de autenticación
│   │   ├── uploadService.js      # Subida de archivos
│   │   ├── validationService.js  # Validaciones Joi
│   │   └── index.js              # Exportaciones
│   └── test/                     # Archivos de prueba
├── public/
│   └── uploads/                  # Archivos subidos
├── app.js                        # Configuración de Express
├── index.js                      # Punto de entrada
└── package.json                  # Dependencias
```

## Modelos de Base de Datos

### User
- Autenticación con email/contraseña
- Roles: user, moderator, admin
- Perfiles con información adicional
- Sistema de permisos granular

### Resource
- Recursos educativos con archivos
- Estados: draft, under_review, published, rejected
- Categorización y etiquetado
- Métricas de visualización y likes

### Category
- Categorías jerárquicas (padre-hijo)
- Colores y íconos personalizables
- Organización flexible del contenido

### Comment
- Comentarios anidados en recursos
- Sistema de respuestas ilimitadas
- Moderación y gestión de contenido

## API Endpoints

### Autenticación (`/api/auth`)
- `POST /register` - Registro de usuario
- `POST /login` - Inicio de sesión
- `POST /refresh-token` - Renovar token
- `GET /profile` - Perfil actual
- `POST /logout` - Cerrar sesión

### Recursos (`/api/resources`)
- `GET /` - Listar recursos (con filtros)
- `GET /:id` - Obtener recurso específico
- `POST /` - Crear nuevo recurso
- `PUT /:id` - Actualizar recurso
- `DELETE /:id` - Eliminar recurso
- `POST /:id/like` - Dar/quitar like
- `GET /my` - Recursos del usuario
- `GET /featured` - Recursos destacados

### Categorías (`/api/categories`)
- `GET /` - Listar categorías
- `GET /:id` - Obtener categoría
- `POST /` - Crear categoría (admin)
- `PUT /:id` - Actualizar categoría (admin)
- `DELETE /:id` - Eliminar categoría (admin)
- `GET /tree` - Árbol de categorías

### Usuarios (`/api/users`)
- `GET /profile` - Perfil del usuario
- `PUT /profile` - Actualizar perfil
- `POST /change-password` - Cambiar contraseña
- `GET /settings` - Configuración
- `PUT /settings` - Actualizar configuración

### Búsqueda (`/api/search`)
- `GET /` - Búsqueda básica
- `GET /suggestions` - Sugerencias
- `GET /popular` - Búsquedas populares
- `POST /advanced` - Búsqueda avanzada

### Administración (`/api/admin`)
- `GET /dashboard/stats` - Estadísticas del dashboard
- `GET /users` - Gestión de usuarios
- `PATCH /users/:id` - Actualizar usuario
- `GET /resources/moderation` - Recursos para moderar
- `PATCH /resources/:id/moderate` - Moderar recurso

### Ayuda (`/api/help`)
- `GET /faq` - Preguntas frecuentes
- `POST /contact` - Formulario de contacto
- `GET /articles` - Artículos de ayuda
- `GET /articles/:id` - Artículo específico
- `POST /report` - Reportar problema
- `GET /status` - Estado del sistema

## Instalación y Configuración

1. **Instalar dependencias:**
```bash
npm install
```

2. **Configurar variables de entorno:**
```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=back_ds
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Servidor
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

3. **Inicializar base de datos:**
```bash
npm run init
```

4. **Ejecutar en modo desarrollo:**
```bash
npm run dev
```

## Tecnologías Utilizadas

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos relacional
- **Sequelize** - ORM para PostgreSQL
- **JWT** - Autenticación con tokens
- **Bcrypt** - Hashing de contraseñas
- **Multer** - Subida de archivos
- **Joi** - Validación de esquemas
- **Helmet** - Seguridad HTTP
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - Limitación de requests

## Seguridad

- Autenticación JWT con refresh tokens
- Hashing de contraseñas con bcrypt
- Validación exhaustiva de datos de entrada
- Rate limiting para prevenir ataques de fuerza bruta
- Sanitización de archivos subidos
- Headers de seguridad con Helmet
- Control de acceso basado en roles

## Estado del Desarrollo

✅ **Completado:**
- Todas las funcionalidades esenciales implementadas
- Sistema de autenticación completo
- Gestión de recursos y categorías
- Sistema de búsqueda avanzada
- Panel de administración
- Validaciones y seguridad
- Documentación de API

🔄 **En desarrollo:**
- Tests automatizados
- Documentación Swagger
- Optimizaciones de rendimiento
- Funcionalidades adicionales

## Contribución

El backend está completamente funcional y listo para integrarse con el frontend React. Incluye todas las características solicitadas y sigue las mejores prácticas de desarrollo.