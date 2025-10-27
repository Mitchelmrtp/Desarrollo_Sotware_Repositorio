/**
 * User Routes
 * Definición de rutas para operaciones de usuarios
 */

import { Router } from 'express';
import { Logger } from '../utils/Logger.js';
import { getUserController } from '../controllers/index.js';

export class UserRoutes {
    constructor() {
        this.router = Router();
        this.userController = null;
    }

    async initialize() {
        this.userController = getUserController();
        await this.setupRoutes();
        Logger.info('UserRoutes initialized');
        return this.router;
    }

    async setupRoutes() {
        // Rutas públicas (sin autenticación)
        this.router.post('/auth/login', 
            this.userController.login.bind(this.userController)
        );

        this.router.post('/auth/register', 
            this.userController.register.bind(this.userController)
        );

        this.router.post('/auth/logout', 
            this.userController.logout.bind(this.userController)
        );

        // Middleware de autenticación para rutas protegidas
        this.router.use('/profile', this.userController.validateToken.bind(this.userController));
        this.router.use('/admin', this.userController.validateToken.bind(this.userController));

        // Rutas de perfil (requieren autenticación)
        this.router.get('/profile', 
            this.userController.getProfile.bind(this.userController)
        );

        this.router.put('/profile', 
            this.userController.updateProfile.bind(this.userController)
        );

        this.router.post('/profile/change-password', 
            this.userController.changePassword.bind(this.userController)
        );

        this.router.post('/profile/verify-email', 
            this.userController.verifyEmail.bind(this.userController)
        );

        this.router.put('/profile/preferences', 
            this.userController.updatePreferences.bind(this.userController)
        );

        // Rutas de administración (requieren rol admin)
        this.router.get('/admin/users', 
            this.userController.requireRole('admin'),
            this.userController.getAllUsers.bind(this.userController)
        );

        this.router.get('/admin/users/search', 
            this.userController.requireRole('admin'),
            this.userController.searchUsers.bind(this.userController)
        );

        this.router.get('/admin/users/role/:role', 
            this.userController.requireRole('admin'),
            this.userController.getUsersByRole.bind(this.userController)
        );

        this.router.get('/admin/users/:id', 
            this.userController.requireRole('admin'),
            this.userController.getUserById.bind(this.userController)
        );

        this.router.post('/admin/users/:id/activate', 
            this.userController.requireRole('admin'),
            this.userController.activateUser.bind(this.userController)
        );

        this.router.post('/admin/users/:id/deactivate', 
            this.userController.requireRole('admin'),
            this.userController.deactivateUser.bind(this.userController)
        );

        Logger.info('User routes configured successfully');
    }

    getRouter() {
        return this.router;
    }
}

export default UserRoutes;