/**
 * Server Application
 * Aplicación principal del servidor usando el patrón Factory
 */

import express from 'express';
import { Logger } from '../utils/Logger.js';
import { ConfigurationManager } from '../utils/ConfigurationManager.js';
import { getModelManager } from '../models/index.js';
import { getRouteManager } from '../routes/index.js';
import MiddlewareCollection from '../middleware/MiddlewareCollection.js';

export class ServerApplication {
    constructor() {
        this.app = express();
        this.server = null;
        this.config = ConfigurationManager.getInstance();
        this.middlewareCollection = new MiddlewareCollection();
        this.isInitialized = false;
    }

    async initialize() {
        try {
            if (this.isInitialized) {
                return this.app;
            }

            Logger.info('Initializing server application...');

            // Configurar middlewares básicos
            await this.setupBasicMiddleware();

            // Inicializar base de datos y modelos
            await this.initializeDatabase();

            // Configurar rutas
            await this.setupRoutes();

            // Configurar middleware de manejo de errores (debe ir al final)
            await this.setupErrorHandling();

            this.isInitialized = true;
            Logger.info('Server application initialized successfully');

            return this.app;
        } catch (error) {
            Logger.error('Error initializing server application:', error);
            throw error;
        }
    }

    async setupBasicMiddleware() {
        Logger.info('Setting up basic middleware...');

        const middleware = this.middlewareCollection.getAllMiddleware();

        // Middleware de seguridad (debe ir primero)
        this.app.use(middleware.security);

        // CORS
        this.app.use(middleware.cors);

        // Rate limiting
        this.app.use(middleware.rateLimit);

        // Parsing de JSON
        this.app.use(express.json({ 
            limit: this.config.get('MAX_REQUEST_SIZE', '10mb'),
            strict: true
        }));

        // Parsing de URL encoded
        this.app.use(express.urlencoded({ 
            extended: true, 
            limit: this.config.get('MAX_REQUEST_SIZE', '10mb')
        }));

        // Sanitización de entrada
        this.app.use(middleware.sanitization);

        // Validación de Content-Type
        this.app.use(middleware.contentTypeValidation);

        // Logging de requests
        this.app.use(middleware.requestLogging);

        Logger.info('Basic middleware configured');
    }

    async initializeDatabase() {
        try {
            Logger.info('Initializing database...');

            const modelManager = getModelManager();
            await modelManager.initialize();

            // Sincronizar base de datos
            await modelManager.syncDatabase();

            // Crear datos por defecto
            await modelManager.createDefaultData();

            Logger.info('Database initialized successfully');
        } catch (error) {
            Logger.error('Error initializing database:', error);
            throw error;
        }
    }

    async setupRoutes() {
        try {
            Logger.info('Setting up routes...');

            const routeManager = getRouteManager();
            const mainRouter = await routeManager.initialize();

            // Montar las rutas principales bajo /api
            this.app.use('/api', mainRouter);

            // Ruta raíz
            this.app.get('/', (req, res) => {
                res.json({
                    success: true,
                    message: 'Academic Resources API Server',
                    version: '1.0.0',
                    endpoints: {
                        health: '/api/health',
                        info: '/api/info',
                        users: '/api/users',
                        resources: '/api/resources',
                        categories: '/api/categories'
                    }
                });
            });

            Logger.info('Routes configured successfully');
        } catch (error) {
            Logger.error('Error setting up routes:', error);
            throw error;
        }
    }

    async setupErrorHandling() {
        Logger.info('Setting up error handling...');

        const middleware = this.middlewareCollection.getAllMiddleware();

        // Middleware de manejo de errores (debe ir al final)
        this.app.use(middleware.errorHandling);

        // Manejar promesas rechazadas no capturadas
        process.on('unhandledRejection', (reason, promise) => {
            Logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
            this.gracefulShutdown('UNHANDLED_REJECTION');
        });

        // Manejar excepciones no capturadas
        process.on('uncaughtException', (error) => {
            Logger.error('Uncaught Exception:', error);
            this.gracefulShutdown('UNCAUGHT_EXCEPTION');
        });

        // Manejar señales de terminación
        process.on('SIGTERM', () => {
            Logger.info('SIGTERM received, starting graceful shutdown...');
            this.gracefulShutdown('SIGTERM');
        });

        process.on('SIGINT', () => {
            Logger.info('SIGINT received, starting graceful shutdown...');
            this.gracefulShutdown('SIGINT');
        });

        Logger.info('Error handling configured');
    }

    async start() {
        try {
            // Inicializar aplicación si no está inicializada
            if (!this.isInitialized) {
                await this.initialize();
            }

            const port = this.config.get('PORT', 3000);
            const host = this.config.get('HOST', 'localhost');

            this.server = this.app.listen(port, host, () => {
                Logger.info(`Server started successfully on ${host}:${port}`);
                Logger.info(`Environment: ${this.config.get('NODE_ENV', 'development')}`);
                Logger.info(`API Documentation: http://${host}:${port}/api/info`);
            });

            // Configurar timeouts del servidor
            this.server.timeout = parseInt(this.config.get('SERVER_TIMEOUT', '30000'));
            this.server.keepAliveTimeout = parseInt(this.config.get('KEEP_ALIVE_TIMEOUT', '5000'));
            this.server.headersTimeout = parseInt(this.config.get('HEADERS_TIMEOUT', '60000'));

            return this.server;
        } catch (error) {
            Logger.error('Error starting server:', error);
            throw error;
        }
    }

    async stop() {
        return new Promise((resolve, reject) => {
            if (!this.server) {
                return resolve();
            }

            Logger.info('Stopping server...');

            this.server.close((error) => {
                if (error) {
                    Logger.error('Error stopping server:', error);
                    return reject(error);
                }

                Logger.info('Server stopped successfully');
                resolve();
            });
        });
    }

    async gracefulShutdown(signal) {
        Logger.info(`Graceful shutdown initiated by ${signal}`);

        try {
            // Parar de aceptar nuevas conexiones
            await this.stop();

            // Cerrar conexión a base de datos
            const modelManager = getModelManager();
            await modelManager.close();

            Logger.info('Graceful shutdown completed');
            process.exit(0);
        } catch (error) {
            Logger.error('Error during graceful shutdown:', error);
            process.exit(1);
        }
    }

    getApp() {
        return this.app;
    }

    getServer() {
        return this.server;
    }

    isRunning() {
        return this.server && this.server.listening;
    }
}

export default ServerApplication;