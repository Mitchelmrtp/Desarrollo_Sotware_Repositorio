/**
 * Application Bootstrap Module
 * Módulo de inicialización y arranque de la aplicación
 */

import { Logger } from './src/utils/Logger.js';
import { ConfigurationManager } from './src/utils/ConfigurationManager.js';
import { DatabaseConnectionSingleton } from './src/patterns/singletons/DatabaseConnectionSingleton.js';
import { ServerApplication } from './src/core/ServerApplication.js';

class ApplicationBootstrap {
    constructor() {
        this.config = ConfigurationManager.getInstance();
        this.app = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) {
            Logger.warn('Application already initialized');
            return this.app;
        }

        try {
            Logger.info('Initializing Academic Resources API Application...');

            // 1. Verificar variables de entorno críticas
            this.validateEnvironment();

            // 2. Inicializar conexión a base de datos
            await this.initializeDatabase();

            // 3. Crear y configurar aplicación Express
            this.app = new ServerApplication();
            await this.app.initialize();

            // 4. Configurar rutas y middleware
            await this.app.setupRoutes();
            await this.app.setupErrorHandling();

            this.isInitialized = true;
            Logger.info('✅ Application initialized successfully');

            return this.app;
        } catch (error) {
            Logger.error('❌ Failed to initialize application:', error);
            throw error;
        }
    }

    validateEnvironment() {
        Logger.info('Validating environment configuration...');

        const requiredVars = [
            'DB_NAME',
            'DB_USER',
            'DB_PASSWORD',
            'DB_HOST',
            'DB_PORT',
            'JWT_SECRET'
        ];

        const missing = requiredVars.filter(varName => !this.config.get(varName));

        if (missing.length > 0) {
            const missingVars = missing.join(', ');
            Logger.error(`Missing required environment variables: ${missingVars}`);
            throw new Error(`Missing required environment variables: ${missingVars}`);
        }

        // Validar configuración de base de datos
        const dbHost = this.config.get('DB_HOST');
        const dbPort = this.config.get('DB_PORT');
        const dbName = this.config.get('DB_NAME');

        Logger.info(`Database configuration: ${dbHost}:${dbPort}/${dbName}`);

        // Validar configuración JWT
        const jwtSecret = this.config.get('JWT_SECRET');
        if (jwtSecret.length < 32) {
            Logger.warn('JWT_SECRET should be at least 32 characters long for security');
        }

        Logger.info('✅ Environment validation completed');
    }

    async initializeDatabase() {
        Logger.info('Initializing database connection...');

        try {
            const db = DatabaseConnectionSingleton.getInstance();
            await db.testConnection();
            
            // Sincronizar modelos en desarrollo
            const nodeEnv = this.config.get('NODE_ENV', 'development');
            if (nodeEnv === 'development') {
                Logger.info('Synchronizing database models (development mode)...');
                await db.syncModels();
            }

            Logger.info('✅ Database initialized successfully');
        } catch (error) {
            Logger.error('❌ Database initialization failed:', error);
            throw new Error(`Database initialization failed: ${error.message}`);
        }
    }

    getApplication() {
        if (!this.isInitialized) {
            throw new Error('Application not initialized. Call initialize() first.');
        }
        return this.app;
    }

    async shutdown() {
        Logger.info('Shutting down application...');

        try {
            // Cerrar conexión a base de datos
            const db = DatabaseConnectionSingleton.getInstance();
            await db.close();

            Logger.info('✅ Application shutdown completed');
        } catch (error) {
            Logger.error('❌ Error during application shutdown:', error);
        }
    }
}

// Crear instancia singleton del bootstrap
let bootstrapInstance = null;

export function getApplicationBootstrap() {
    if (!bootstrapInstance) {
        bootstrapInstance = new ApplicationBootstrap();
    }
    return bootstrapInstance;
}

export { ApplicationBootstrap };