/**
 * Routes Index
 * Gestión centralizada de rutas
 */

import { Router } from 'express';
import { Logger } from '../utils/Logger.js';
import { getControllerManager } from '../controllers/index.js';

// Importar rutas
import UserRoutes from './UserRoutes.js';
import ResourceRoutes from './ResourceRoutes.js';
import CategoryRoutes from './CategoryRoutes.js';

export class RouteManager {
    constructor() {
        this.router = Router();
        this.routes = {};
        this.isInitialized = false;
    }

    async initialize() {
        try {
            if (this.isInitialized) {
                return this.router;
            }

            Logger.info('Initializing routes...');

            // Asegurar que los controladores estén inicializados
            const controllerManager = getControllerManager();
            await controllerManager.initialize();

            // Inicializar rutas
            this.routes = {
                userRoutes: new UserRoutes(),
                resourceRoutes: new ResourceRoutes(),
                categoryRoutes: new CategoryRoutes()
            };

            // Configurar rutas principales
            await this.setupMainRoutes();

            this.isInitialized = true;
            Logger.info('Routes initialized successfully');

            return this.router;
        } catch (error) {
            Logger.error('Error initializing routes:', error);
            throw error;
        }
    }

    async setupMainRoutes() {
        // Ruta de salud del sistema
        this.router.get('/health', (req, res) => {
            res.json({
                success: true,
                message: 'Server is running',
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            });
        });

        // Ruta de información del API
        this.router.get('/info', (req, res) => {
            res.json({
                success: true,
                data: {
                    name: 'Academic Resources API',
                    version: '1.0.0',
                    description: 'RESTful API for academic resource management',
                    endpoints: {
                        users: '/api/users',
                        resources: '/api/resources',
                        categories: '/api/categories'
                    },
                    documentation: '/api/docs'
                }
            });
        });

        // Inicializar y configurar subrutas
        const userRouter = await this.routes.userRoutes.initialize();
        const resourceRouter = await this.routes.resourceRoutes.initialize();
        const categoryRouter = await this.routes.categoryRoutes.initialize();

        // Montar las rutas en sus paths correspondientes
        this.router.use('/users', userRouter);
        this.router.use('/resources', resourceRouter);
        this.router.use('/categories', categoryRouter);

        // Ruta catch-all para endpoints no encontrados
        this.router.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                message: 'Endpoint not found',
                path: req.originalUrl,
                method: req.method
            });
        });

        Logger.info('Main routes configured successfully');
    }

    getRouter() {
        return this.router;
    }

    getRoutes() {
        return this.routes;
    }
}

// Singleton instance
let routeManagerInstance = null;

export const getRouteManager = () => {
    if (!routeManagerInstance) {
        routeManagerInstance = new RouteManager();
    }
    return routeManagerInstance;
};

export default getRouteManager;