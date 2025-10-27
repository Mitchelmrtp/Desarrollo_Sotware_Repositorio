/**
 * Controllers Index
 * Gestión centralizada de controladores
 */

import { Logger } from '../utils/Logger.js';
import { getServiceManager } from '../services/index.js';

// Importar controladores
import UserController from './UserController.js';
import ResourceController from './ResourceController.js';
import CategoryController from './CategoryController.js';

class ControllerManager {
    constructor() {
        this.controllers = {};
        this.isInitialized = false;
    }

    async initialize() {
        try {
            if (this.isInitialized) {
                return this.controllers;
            }

            Logger.info('Initializing controllers...');

            // Asegurar que los servicios estén inicializados
            const serviceManager = getServiceManager();
            await serviceManager.initialize();

            // Inicializar controladores
            this.controllers = {
                userController: new UserController(),
                resourceController: new ResourceController(),
                categoryController: new CategoryController()
            };

            // Inicializar cada controlador
            await Promise.all(
                Object.values(this.controllers).map(controller => controller.initialize())
            );

            this.isInitialized = true;
            Logger.info('Controllers initialized successfully');

            return this.controllers;
        } catch (error) {
            Logger.error('Error initializing controllers:', error);
            throw error;
        }
    }

    getController(controllerName) {
        if (!this.isInitialized) {
            throw new Error('Controllers not initialized. Call initialize() first.');
        }

        const controller = this.controllers[controllerName];
        if (!controller) {
            throw new Error(`Controller '${controllerName}' not found`);
        }

        return controller;
    }

    getUserController() {
        return this.getController('userController');
    }

    getResourceController() {
        return this.getController('resourceController');
    }

    getCategoryController() {
        return this.getController('categoryController');
    }

    getAllControllers() {
        return this.controllers;
    }
}

// Singleton instance
let controllerManagerInstance = null;

export const getControllerManager = () => {
    if (!controllerManagerInstance) {
        controllerManagerInstance = new ControllerManager();
    }
    return controllerManagerInstance;
};

// Export individual controller getters for convenience
export const getUserController = () => getControllerManager().getUserController();
export const getResourceController = () => getControllerManager().getResourceController();
export const getCategoryController = () => getControllerManager().getCategoryController();

// Export default
export default getControllerManager;