// 🏭 Server Factory - Creates different types of servers
// Following Factory Pattern and Open/Closed Principle

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Logger } from '../../utils/Logger.js';
import { ConfigurationManager } from '../../utils/ConfigurationManager.js';
import { MiddlewareChain } from '../chains/MiddlewareChain.js';
import { RouteRegistrar } from '../builders/RouteRegistrar.js';
import { ErrorHandlerDecorator } from '../decorators/ErrorHandlerDecorator.js';

/**
 * 🏭 Abstract Server Factory
 * Base class for creating different server types
 */
class AbstractServerFactory {
  constructor() {
    this.logger = Logger.getInstance();
    this.config = ConfigurationManager.getInstance();
  }

  /**
   * Template method for server creation
   * @param {string} type - Server type
   * @returns {Express.Application}
   */
  async createServer(type) {
    // Initialize database first
    await this.initializeDatabase();
    
    const server = this.createBaseServer();
    this.configureMiddlewares(server);
    this.configureRoutes(server);
    this.configureErrorHandling(server);
    return server;
  }

  /**
   * Abstract method - must be implemented by subclasses
   */
  createBaseServer() {
    throw new Error('createBaseServer must be implemented by subclass');
  }

  /**
   * Configure middlewares using Chain of Responsibility
   */
  configureMiddlewares(server) {
    const middlewareChain = new MiddlewareChain();
    
    // Security middlewares
    middlewareChain.add(helmet({
      contentSecurityPolicy: this.config.get('NODE_ENV') === 'production'
    }));

    // CORS configuration
    middlewareChain.add(cors({
      origin: this.getCorsOrigins(),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Rate limiting
    middlewareChain.add(rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: this.config.get('RATE_LIMIT_MAX', 100),
      message: {
        error: 'Too many requests',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false
    }));

    // Body parsing
    middlewareChain.add(express.json({ limit: '10mb' }));
    middlewareChain.add(express.urlencoded({ extended: true, limit: '10mb' }));

    // Apply all middlewares
    middlewareChain.apply(server);
  }

  /**
   * Configure routes using Builder pattern
   */
  configureRoutes(server) {
    const routeRegistrar = new RouteRegistrar(server);
    routeRegistrar
      .addHealthCheck()
      .addApiDocumentation()
      .addCatchAllRoute();
  }

  /**
   * Configure error handling using Decorator pattern
   */
  configureErrorHandling(server) {
    const errorHandler = new ErrorHandlerDecorator(server);
    errorHandler.apply();
  }

  /**
   * Get CORS origins based on environment
   */
  getCorsOrigins() {
    const nodeEnv = this.config.get('NODE_ENV');
    
    if (nodeEnv === 'development') {
      return [
        'http://localhost:3000',
        'http://localhost:3001', 
        'http://localhost:5000',
        'http://localhost:5001'
      ];
    }

    if (nodeEnv === 'production') {
      return this.config.get('CORS_ORIGINS', '').split(',').filter(Boolean);
    }

    return true; // Allow all in test/other environments
  }
}

/**
 * 🚀 Express Server Factory
 * Creates Express.js server instances
 */
class ExpressServerFactory extends AbstractServerFactory {
  createBaseServer() {
    const app = express();
    
    // Basic Express configuration
    app.set('trust proxy', this.config.getBoolean('TRUST_PROXY', false));
    app.set('x-powered-by', false);
    
    this.logger.info('🚀 Express server instance created');
    
    return app;
  }

  /**
   * Initialize database connection and sync models
   */
  async initializeDatabase() {
    try {
      Logger.info('�️  Initializing database...');
      
      // Import database connection
      const { DatabaseConnectionSingleton } = await import('../singletons/DatabaseConnectionSingleton.js');
      
      // Get database instance and connect
      const db = DatabaseConnectionSingleton.getInstance();
      await db.connect();
      
      // Test the connection
      await db.testConnection();
      
      // Sync models (create tables)
      const isDevelopment = this.config.get('NODE_ENV') === 'development';
      if (isDevelopment) {
        Logger.info('🔄 Synchronizing database models (development mode)...');
        await db.syncModels({ alter: true }); // Use alter in development to update existing tables
      } else {
        await db.syncModels({ alter: false }); // Don't alter in production
      }
      
      Logger.info('✅ Database initialized and models synchronized');
      
    } catch (error) {
      Logger.error('❌ Failed to initialize database:', error);
      throw error;
    }
  }
}

/**
 * 🏭 Main Server Factory
 * Factory method to create appropriate server type
 */
export class ServerFactory {
  static #factories = new Map([
    ['express', ExpressServerFactory]
  ]);

  /**
   * Create server of specified type
   * @param {string} type - Server type ('express', etc.)
   * @returns {Express.Application}
   */
  static createServer(type = 'express') {
    const FactoryClass = this.#factories.get(type);
    
    if (!FactoryClass) {
      throw new Error(`Unknown server type: ${type}. Available types: ${Array.from(this.#factories.keys()).join(', ')}`);
    }

    const factory = new FactoryClass();
    return factory.createServer(type);
  }

  /**
   * Register new server factory
   * @param {string} type - Server type name
   * @param {Function} factoryClass - Factory class
   */
  static registerFactory(type, factoryClass) {
    this.#factories.set(type, factoryClass);
  }

  /**
   * Get available server types
   * @returns {string[]}
   */
  static getAvailableTypes() {
    return Array.from(this.#factories.keys());
  }

  /**
   * Create and start server
   * @param {string} type - Server type ('http' or 'https')
   * @param {number} port - Port number
   * @param {string} host - Host address
   * @param {Object} options - Additional options (SSL for HTTPS)
   * @returns {Promise<Object>} Server instance with stop method
   */
  static async createAndStartServer(type = 'http', port = 3000, host = 'localhost', options = {}) {
    try {
      Logger.info(`Creating ${type.toUpperCase()} server...`);
      
      // Create Express app using factory
      const app = await this.createServer('express');
      
      let server;
      
      if (type === 'https' && options.key && options.cert) {
        const https = await import('https');
        server = https.createServer({
          key: options.key,
          cert: options.cert
        }, app);
      } else {
        const http = await import('http');
        server = http.createServer(app);
      }
      
      // Start server
      await new Promise((resolve, reject) => {
        server.listen(port, host, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      Logger.info(`✅ Server listening on ${type}://${host}:${port}`);
      
      // Return server object with stop method
      return {
        app,
        server,
        stop: async () => {
          return new Promise((resolve) => {
            server.close(() => {
              Logger.info('Server stopped successfully');
              resolve();
            });
          });
        }
      };
      
    } catch (error) {
      Logger.error('Failed to create and start server:', error);
      throw error;
    }
  }
}