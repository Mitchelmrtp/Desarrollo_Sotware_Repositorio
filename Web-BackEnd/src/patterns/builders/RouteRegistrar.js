// 🏗️ Route Registrar Builder - Builder Pattern for route configuration
// Following Builder Pattern and Single Responsibility Principle

import swaggerUi from 'swagger-ui-express';
import { Logger } from '../../utils/Logger.js';
import { ConfigurationManager } from '../../config/ConfigurationManager.js';
import { SwaggerDocumentBuilder } from './SwaggerDocumentBuilder.js';

/**
 * 🏗️ Route Registrar Builder
 * Builds and registers application routes using Builder pattern
 */
export class RouteRegistrar {
  constructor(app) {
    this.app = app;
    this.logger = Logger.getInstance();
    this.config = ConfigurationManager.getInstance();
    this.routes = [];
  }

  /**
   * Add health check endpoint
   * @returns {RouteRegistrar}
   */
  addHealthCheck() {
    this.app.get('/health', async (req, res) => {
      try {
        const { DatabaseConnectionSingleton } = await import('../../patterns/singletons/DatabaseConnectionSingleton.js');
        const db = DatabaseConnectionSingleton.getInstance();
        const dbHealth = await db.getHealthStatus();
        
        const health = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: this.config.get('NODE_ENV'),
          version: this.config.get('API_VERSION', '1.0.0'),
          database: dbHealth,
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
          }
        };

        res.status(200).json(health);
      } catch (error) {
        res.status(503).json({
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    });

    this.routes.push({ method: 'GET', path: '/health', description: 'Health check endpoint' });
    this.logger.debug('✅ Health check route registered');
    return this;
  }

  /**
   * Add API documentation
   * @returns {RouteRegistrar}
   */
  addApiDocumentation() {
    try {
      const swaggerBuilder = new SwaggerDocumentBuilder();
      const swaggerDocument = swaggerBuilder
        .setTitle('Resource Share API')
        .setDescription('Academic Resource Sharing Platform API')
        .setVersion(this.config.get('API_VERSION', '1.0.0'))
        .addServer(`http://localhost:${this.config.get('PORT', 3001)}`, 'Development server')
        .addBearerAuth()
        .build();

      // Serve Swagger UI
      this.app.use('/api/docs', swaggerUi.serve);
      this.app.get('/api/docs', swaggerUi.setup(swaggerDocument, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Resource Share API Documentation'
      }));

      // Serve raw swagger JSON
      this.app.get('/api/swagger.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerDocument);
      });

      this.routes.push({ method: 'GET', path: '/api/docs', description: 'API Documentation (Swagger UI)' });
      this.routes.push({ method: 'GET', path: '/api/swagger.json', description: 'Swagger JSON specification' });
      
      this.logger.debug('📚 API documentation routes registered');
    } catch (error) {
      this.logger.warn('⚠️ Failed to register API documentation:', error.message);
    }

    return this;
  }

  /**
   * Add authentication routes
   * @returns {RouteRegistrar}
   */
  async addAuthRoutes() {
    try {
      const { authRouter } = await import('../../routes/authRoutes.js');
      this.app.use('/api/auth', authRouter);
      
      this.routes.push({ method: 'ALL', path: '/api/auth/*', description: 'Authentication routes' });
      this.logger.debug('🔐 Authentication routes registered');
    } catch (error) {
      this.logger.error('❌ Failed to register auth routes:', error);
    }
    
    return this;
  }

  /**
   * Add resource routes
   * @returns {RouteRegistrar}
   */
  async addResourceRoutes() {
    try {
      const { resourceRouter } = await import('../../routes/resourceRoutes.js');
      this.app.use('/api/resources', resourceRouter);
      
      this.routes.push({ method: 'ALL', path: '/api/resources/*', description: 'Resource management routes' });
      this.logger.debug('📚 Resource routes registered');
    } catch (error) {
      this.logger.warn('⚠️ Resource routes not available:', error.message);
    }
    
    return this;
  }

  /**
   * Add user routes
   * @returns {RouteRegistrar}
   */
  async addUserRoutes() {
    try {
      const { userRouter } = await import('../../routes/userRoutes.js');
      this.app.use('/api/users', userRouter);
      
      this.routes.push({ method: 'ALL', path: '/api/users/*', description: 'User management routes' });
      this.logger.debug('👤 User routes registered');
    } catch (error) {
      this.logger.warn('⚠️ User routes not available:', error.message);
    }
    
    return this;
  }

  /**
   * Add admin routes
   * @returns {RouteRegistrar}
   */
  async addAdminRoutes() {
    try {
      const { adminRouter } = await import('../../routes/adminRoutes.js');
      this.app.use('/api/admin', adminRouter);
      
      this.routes.push({ method: 'ALL', path: '/api/admin/*', description: 'Admin management routes' });
      this.logger.debug('👑 Admin routes registered');
    } catch (error) {
      this.logger.warn('⚠️ Admin routes not available:', error.message);
    }
    
    return this;
  }

  /**
   * Add search routes
   * @returns {RouteRegistrar}
   */
  async addSearchRoutes() {
    try {
      const { searchRouter } = await import('../../routes/searchRoutes.js');
      this.app.use('/api/search', searchRouter);
      
      this.routes.push({ method: 'ALL', path: '/api/search/*', description: 'Search functionality routes' });
      this.logger.debug('🔍 Search routes registered');
    } catch (error) {
      this.logger.warn('⚠️ Search routes not available:', error.message);
    }
    
    return this;
  }

  /**
   * Add catch-all route for undefined endpoints
   * @returns {RouteRegistrar}
   */
  addCatchAllRoute() {
    this.app.all('*', (req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        message: `The requested endpoint ${req.method} ${req.path} was not found on this server.`,
        availableRoutes: this.routes.map(route => `${route.method} ${route.path}`),
        timestamp: new Date().toISOString()
      });
    });

    this.logger.debug('🔍 Catch-all route registered');
    return this;
  }

  /**
   * Add custom route
   * @param {string} method - HTTP method
   * @param {string} path - Route path
   * @param {Function} handler - Route handler
   * @param {string} description - Route description
   * @returns {RouteRegistrar}
   */
  addCustomRoute(method, path, handler, description = '') {
    const methodLower = method.toLowerCase();
    
    if (typeof this.app[methodLower] === 'function') {
      this.app[methodLower](path, handler);
      this.routes.push({ method: method.toUpperCase(), path, description });
      this.logger.debug(`🛣️ Custom route registered: ${method.toUpperCase()} ${path}`);
    } else {
      throw new Error(`Unsupported HTTP method: ${method}`);
    }

    return this;
  }

  /**
   * Get registered routes summary
   * @returns {Array}
   */
  getRoutesSummary() {
    return [...this.routes];
  }

  /**
   * Log routes summary
   */
  logRoutesSummary() {
    this.logger.info('📋 Registered Routes Summary:');
    this.routes.forEach(route => {
      this.logger.info(`   ${route.method.padEnd(6)} ${route.path} - ${route.description}`);
    });
  }
}