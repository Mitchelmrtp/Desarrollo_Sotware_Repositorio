/**
 * Resource Routes
 * Definición de rutas para operaciones de recursos académicos
 */

import { Router } from 'express';
import { Logger } from '../utils/Logger.js';
import { getResourceController, getUserController } from '../controllers/index.js';

export class ResourceRoutes {
    constructor() {
        this.router = Router();
        this.resourceController = null;
        this.userController = null;
    }

    async initialize() {
        this.resourceController = getResourceController();
        this.userController = getUserController();
        await this.setupRoutes();
        Logger.info('ResourceRoutes initialized');
        return this.router;
    }

    async setupRoutes() {
        // Rutas públicas (sin autenticación)
        this.router.get('/published', 
            this.resourceController.getPublishedResources.bind(this.resourceController)
        );

        this.router.get('/popular', 
            this.resourceController.getPopularResources.bind(this.resourceController)
        );

        this.router.get('/recent', 
            this.resourceController.getRecentResources.bind(this.resourceController)
        );

        this.router.get('/search', 
            this.resourceController.searchResources.bind(this.resourceController)
        );

        this.router.get('/category/:category', 
            this.resourceController.getResourcesByCategory.bind(this.resourceController)
        );

        this.router.get('/user/:userId', 
            this.resourceController.getResourcesByUser.bind(this.resourceController)
        );

        // Rutas públicas para recursos específicos
        this.router.get('/:id', 
            this.resourceController.getResourceById.bind(this.resourceController)
        );

        this.router.post('/:id/download', 
            this.resourceController.downloadResource.bind(this.resourceController)
        );

        // Middleware de autenticación para rutas protegidas
        const authMiddleware = this.userController.validateToken.bind(this.userController);

        // Rutas que requieren autenticación
        this.router.post('/', 
            authMiddleware,
            this.resourceController.validateResourceCreation.bind(this.resourceController),
            this.resourceController.createResource.bind(this.resourceController)
        );

        this.router.put('/:id', 
            authMiddleware,
            this.resourceController.updateResource.bind(this.resourceController)
        );

        this.router.delete('/:id', 
            authMiddleware,
            this.resourceController.deleteResource.bind(this.resourceController)
        );

        // Rutas de interacción (requieren autenticación)
        this.router.post('/:id/like', 
            authMiddleware,
            this.resourceController.likeResource.bind(this.resourceController)
        );

        this.router.post('/:id/rate', 
            authMiddleware,
            this.resourceController.rateResource.bind(this.resourceController)
        );

        // Rutas de gestión de estado (requieren autenticación)
        this.router.post('/:id/publish', 
            authMiddleware,
            this.resourceController.publishResource.bind(this.resourceController)
        );

        this.router.post('/:id/archive', 
            authMiddleware,
            this.resourceController.archiveResource.bind(this.resourceController)
        );

        this.router.get('/:id/stats', 
            authMiddleware,
            this.resourceController.getResourceStats.bind(this.resourceController)
        );

        Logger.info('Resource routes configured successfully');
    }

    getRouter() {
        return this.router;
    }
}

export default ResourceRoutes;