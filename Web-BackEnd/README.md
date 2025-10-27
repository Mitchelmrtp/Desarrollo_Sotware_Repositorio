# Academic Resources API 📚

Backend API for Academic Resource Sharing Platform built with **Clean Architecture**, **Design Patterns**, and **SOLID Principles**.

## 🏗️ Architecture Overview

This project implements a robust backend architecture using:

- **Clean Architecture** with clear separation of concerns
- **Design Patterns**: Singleton, Factory, Builder, Chain of Responsibility, Decorator
- **SOLID Principles** for maintainable and extensible code
- **Repository Pattern** for data access abstraction
- **Service Layer** for business logic encapsulation

## 🛠️ Technology Stack

### Core Technologies
- **Node.js** (v18+) - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Primary database
- **Sequelize** - ORM for database operations

### Security & Authentication
- **JWT** - Token-based authentication
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection
- **bcrypt** - Password hashing

### Documentation & Testing
- **Swagger/OpenAPI** - API documentation
- **Jest** - Testing framework
- **Supertest** - HTTP testing
- **Winston** - Logging system

### Development Tools
- **Nodemon** - Development server
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Babel** - JavaScript transpilation

## 📁 Project Structure

```
Web-BackEnd/
├── src/
│   ├── controllers/          # HTTP request handlers
│   │   ├── UserController.js
│   │   ├── ResourceController.js
│   │   └── CategoryController.js
│   ├── services/             # Business logic layer
│   │   ├── UserService.js
│   │   ├── ResourceService.js
│   │   └── CategoryService.js
│   ├── repositories/         # Data access layer
│   │   ├── BaseRepository.js
│   │   ├── UserRepository.js
│   │   ├── ResourceRepository.js
│   │   └── CategoryRepository.js
│   ├── models/               # Database models
│   │   ├── User.js
│   │   ├── Resource.js
│   │   ├── Category.js
│   │   ├── Comment.js
│   │   └── Tag.js
│   ├── routes/               # API routes
│   │   ├── userRoutes.js
│   │   ├── resourceRoutes.js
│   │   └── categoryRoutes.js
│   ├── middleware/           # Express middleware
│   │   ├── authMiddleware.js
│   │   ├── validationMiddleware.js
│   │   └── errorMiddleware.js
│   ├── patterns/             # Design pattern implementations
│   │   ├── DatabaseConnectionSingleton.js
│   │   ├── ServerFactory.js
│   │   ├── MiddlewareChain.js
│   │   └── RouteRegistrar.js
│   ├── core/                 # Core application components
│   │   └── ServerApplication.js
│   ├── utils/                # Utility functions
│   │   ├── Logger.js
│   │   ├── ConfigurationManager.js
│   │   └── ResponseHelper.js
│   └── config/               # Configuration files
│       └── database.js
├── scripts/                  # Utility scripts
│   └── initialize.js
├── tests/                    # Test files
├── logs/                     # Application logs
├── uploads/                  # File uploads
├── server.js                 # Main server entry point
├── bootstrap.js              # Application bootstrap
├── swagger.config.js         # API documentation config
└── package.json             # Dependencies and scripts
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** v12 or higher
- **npm** or **yarn** package manager

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd Web-BackEnd

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

### 3. Database Setup

```bash
# Create database
npm run db:create

# Run migrations
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

### 4. Initialize Project

```bash
# Run initialization script
node scripts/initialize.js --with-seed
```

### 5. Start Development Server

```bash
# Development mode with hot reload
npm run dev

# Production mode
npm start
```

## 🔧 Environment Variables

### Required Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=academic_resources_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Authentication
JWT_SECRET=your-super-secure-secret-key-min-32-chars

# Server Configuration
NODE_ENV=development
PORT=3000
HOST=localhost
```

### Optional Variables

```env
# CORS Configuration
FRONTEND_URL=http://localhost:5001
ALLOWED_ORIGINS=http://localhost:5001,http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Logging
LOG_LEVEL=info
LOG_FILE_PATH=./logs/app.log
```

## 📖 API Documentation

### Access Documentation

- **Swagger UI**: `http://localhost:3000/api/docs`
- **Health Check**: `http://localhost:3000/api/health`
- **API Info**: `http://localhost:3000/api/info`

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Main Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout user

#### Users
- `GET /api/users` - List users (paginated)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Resources
- `GET /api/resources` - List resources (paginated)
- `GET /api/resources/:id` - Get resource by ID
- `POST /api/resources` - Create new resource
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource

#### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

## 🏗️ Design Patterns Implementation

### 1. Singleton Pattern
- **DatabaseConnectionSingleton**: Ensures single database connection instance
- **ConfigurationManager**: Centralized configuration management

### 2. Factory Pattern
- **ServerFactory**: Creates different server types (HTTP/HTTPS)

### 3. Builder Pattern
- **RouteRegistrar**: Builds route configurations systematically

### 4. Chain of Responsibility
- **MiddlewareChain**: Processes requests through middleware chain

### 5. Decorator Pattern
- **ErrorHandlerDecorator**: Enhances error handling capabilities

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

### Test Structure

- **Unit Tests**: Individual component testing
- **Integration Tests**: API endpoint testing
- **Coverage Reports**: Generated in `coverage/` directory

## 📝 Development Scripts

```bash
# Development
npm run dev                    # Start development server
npm run dev:debug             # Start with debugger

# Database
npm run db:create             # Create database
npm run db:migrate            # Run migrations
npm run db:seed              # Run seeders
npm run db:reset             # Reset database

# Code Quality
npm run lint                  # Check code style
npm run lint:fix              # Fix code style issues
npm run format                # Format code with Prettier

# Security
npm run security-audit        # Check for vulnerabilities

# Setup
npm run setup                 # Complete project setup
```

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Password Hashing** using bcrypt
- **Rate Limiting** to prevent abuse
- **CORS Protection** with configurable origins
- **Security Headers** via Helmet
- **Input Validation** with Joi
- **SQL Injection Protection** via Sequelize ORM
- **XSS Protection** through sanitization

## 📊 Logging

The application uses Winston for structured logging:

- **Console Output**: Development environment
- **File Logging**: Production environment
- **Log Rotation**: Daily rotation with size limits
- **Log Levels**: Error, Warn, Info, Debug

### Log Configuration

```javascript
{
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '10m',
      maxFiles: '14d'
    })
  ]
}
```

## 🚀 Deployment

### Production Configuration

1. **Environment Variables**: Set production values in `.env`
2. **Database**: Configure production PostgreSQL instance
3. **Reverse Proxy**: Use nginx or similar for production
4. **Process Management**: Use PM2 for process management
5. **Monitoring**: Set up logging and monitoring systems

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style

- Use **ESLint** and **Prettier** for consistent formatting
- Follow **Clean Code** principles
- Write **comprehensive tests** for new features
- Document **public APIs** with JSDoc comments

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Documentation**: Check the `/api/docs` endpoint
- **Issues**: Create an issue in the repository
- **Email**: support@academicresources.com

## 🎯 Roadmap

- [ ] **GraphQL API** support
- [ ] **Microservices** architecture migration
- [ ] **Redis** caching implementation
- [ ] **WebSocket** real-time features
- [ ] **Advanced Analytics** and reporting
- [ ] **Multi-language** support
- [ ] **Mobile API** optimizations

---

**Built with ❤️ using Clean Architecture and Design Patterns**
