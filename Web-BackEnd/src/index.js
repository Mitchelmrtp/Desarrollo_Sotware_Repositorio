// 🚀 Main Server Entry Point - Application Bootstrap
// Following Dependency Injection and Factory Patterns

import 'dotenv/config';
import { ServerFactory } from './patterns/factories/ServerFactory.js';
import { DatabaseConnectionSingleton } from './patterns/singletons/DatabaseConnectionSingleton.js';
import { Logger } from './utils/Logger.js';
import { ConfigurationManager } from './config/ConfigurationManager.js';

/**
 * 🏗️ Application Bootstrap Class
 * Implements Template Method Pattern for startup sequence
 */
class Application {
  constructor() {
    this.server = null;
    this.database = null;
    this.logger = Logger.getInstance();
    this.config = ConfigurationManager.getInstance();
  }

  /**
   * Template method for application startup
   */
  async start() {
    try {
      await this.validateEnvironment();
      await this.initializeDatabase();
      await this.createServer();
      await this.startListening();
      await this.postStartupTasks();
    } catch (error) {
      await this.handleStartupError(error);
    }
  }

  /**
   * Validate required environment variables
   */
  async validateEnvironment() {
    this.logger.info('🔍 Validating environment configuration...');
    
    const requiredVars = [
      'NODE_ENV',
      'PORT',
      'DB_HOST',
      'DB_PORT', 
      'DB_NAME',
      'DB_USER',
      'DB_PASSWORD',
      'JWT_SECRET'
    ];

    const missing = requiredVars.filter(varName => !process.env[varName]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    this.logger.success('✅ Environment validation completed');
  }

  /**
   * Initialize database connection using Singleton pattern
   */
  async initializeDatabase() {
    this.logger.info('🔗 Initializing database connection...');
    
    this.database = DatabaseConnectionSingleton.getInstance();
    await this.database.connect();
    await this.database.testConnection();
    await this.database.syncModels();
    
    this.logger.success('✅ Database initialized successfully');
  }

  /**
   * Create server instance using Factory pattern
   */
  async createServer() {
    this.logger.info('🏭 Creating server instance...');
    
    const serverType = this.config.get('SERVER_TYPE', 'express');
    this.server = ServerFactory.createServer(serverType);
    
    this.logger.success('✅ Server instance created');
  }

  /**
   * Start server listening
   */
  async startListening() {
    const port = this.config.get('PORT', 3001);
    const host = this.config.get('HOST', 'localhost');
    
    this.logger.info(`🚀 Starting server on ${host}:${port}...`);
    
    await new Promise((resolve, reject) => {
      this.server.listen(port, host, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });

    this.logger.success(`✅ Server running on http://${host}:${port}`);
    this.logger.info(`📊 Environment: ${this.config.get('NODE_ENV')}`);
    this.logger.info(`🔧 API Documentation: http://${host}:${port}/api/docs`);
  }

  /**
   * Execute post-startup tasks
   */
  async postStartupTasks() {
    this.logger.info('⚡ Executing post-startup tasks...');
    
    // Setup graceful shutdown
    this.setupGracefulShutdown();
    
    // Initialize scheduled tasks if any
    await this.initializeScheduledTasks();
    
    this.logger.success('✅ Post-startup tasks completed');
  }

  /**
   * Handle startup errors
   */
  async handleStartupError(error) {
    this.logger.error('❌ Application startup failed:', error);
    
    // Cleanup resources
    if (this.database) {
      await this.database.disconnect().catch(() => {});
    }
    
    process.exit(1);
  }

  /**
   * Setup graceful shutdown handlers
   */
  setupGracefulShutdown() {
    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
    
    signals.forEach(signal => {
      process.on(signal, async () => {
        this.logger.info(`📡 Received ${signal}, starting graceful shutdown...`);
        await this.gracefulShutdown();
      });
    });
  }

  /**
   * Graceful shutdown process
   */
  async gracefulShutdown() {
    try {
      // Stop accepting new requests
      if (this.server) {
        await new Promise((resolve) => {
          this.server.close(resolve);
        });
        this.logger.info('🔒 Server stopped accepting new connections');
      }

      // Close database connections
      if (this.database) {
        await this.database.disconnect();
        this.logger.info('🔗 Database connections closed');
      }

      this.logger.success('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      this.logger.error('❌ Error during graceful shutdown:', error);
      process.exit(1);
    }
  }

  /**
   * Initialize scheduled tasks
   */
  async initializeScheduledTasks() {
    // Implement any scheduled tasks here
    this.logger.info('📅 Scheduled tasks initialized');
  }
}

// Bootstrap the application
const app = new Application();
app.start();

export default app;