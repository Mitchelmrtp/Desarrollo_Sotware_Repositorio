/**
 * Category Routes
 * Definición de rutas para operaciones de categorías
 */

import { Router } from 'express';
import { Logger } from '../utils/Logger.js';
import { getCategoryController, getUserController } from '../controllers/index.js';

export class CategoryRoutes {
    constructor() {
        this.router = Router();
        this.categoryController = null;
        this.userController = null;
    }

    async initialize() {
        this.categoryController = getCategoryController();
        this.userController = getUserController();
        await this.setupRoutes();
        Logger.info('CategoryRoutes initialized');
        return this.router;
    }

    async setupRoutes() {
        // Rutas públicas (sin autenticación)
        this.router.get('/', 
            this.categoryController.getAllCategories.bind(this.categoryController)
        );

        this.router.get('/tree', 
            this.categoryController.getCategoryTree.bind(this.categoryController)
        );

        this.router.get('/root', 
            this.categoryController.getRootCategories.bind(this.categoryController)
        );

        this.router.get('/search', 
            this.categoryController.searchCategories.bind(this.categoryController)
        );

        this.router.get('/:id', 
            this.categoryController.getCategoryById.bind(this.categoryController)
        );

        this.router.get('/slug/:slug', 
            this.categoryController.getCategoryBySlug.bind(this.categoryController)
        );

        this.router.get('/:id/subcategories', 
            this.categoryController.getSubcategories.bind(this.categoryController)
        );

        this.router.get('/:id/stats', 
            this.categoryController.getCategoryStats.bind(this.categoryController)
        );

        // Middleware de autenticación para rutas administrativas
        const authMiddleware = this.userController.validateToken.bind(this.userController);
        const adminMiddleware = this.categoryController.requireAdminRole.bind(this.categoryController);

        // Rutas administrativas (requieren autenticación y rol admin)
        this.router.post('/', 
            authMiddleware,
            adminMiddleware,
            this.categoryController.validateCategoryCreation.bind(this.categoryController),
            this.categoryController.createCategory.bind(this.categoryController)
        );

        this.router.put('/:id', 
            authMiddleware,
            adminMiddleware,
            this.categoryController.validateCategoryUpdate.bind(this.categoryController),
            this.categoryController.updateCategory.bind(this.categoryController)
        );

        this.router.delete('/:id', 
            authMiddleware,
            adminMiddleware,
            this.categoryController.deleteCategory.bind(this.categoryController)
        );

        // Rutas de gestión de estado
        this.router.post('/:id/activate', 
            authMiddleware,
            adminMiddleware,
            this.categoryController.activateCategory.bind(this.categoryController)
        );

        this.router.post('/:id/deactivate', 
            authMiddleware,
            adminMiddleware,
            this.categoryController.deactivateCategory.bind(this.categoryController)
        );

        // Rutas de organización
        this.router.post('/reorder', 
            authMiddleware,
            adminMiddleware,
            this.categoryController.reorderCategories.bind(this.categoryController)
        );

        this.router.post('/:id/move', 
            authMiddleware,
            adminMiddleware,
            this.categoryController.moveCategory.bind(this.categoryController)
        );

        Logger.info('Category routes configured successfully');
    }

    getRouter() {
        return this.router;
    }
}

export default CategoryRoutes;