/**
 * Services Index
 * Gestión centralizada de servicios
 */

import { Logger } from '../utils/Logger.js';
import { getRepositoryManager } from '../repositories/index.js';

// Importar servicios
import UserService from './UserService.js';
import ResourceService from './ResourceService.js';
import CategoryService from './CategoryService.js';

class ServiceManager {
    constructor() {
        this.services = {};
        this.isInitialized = false;
    }

    async initialize() {
        try {
            if (this.isInitialized) {
                return this.services;
            }

            Logger.info('Initializing services...');

            // Asegurar que los repositorios estén inicializados
            const repositoryManager = getRepositoryManager();
            await repositoryManager.initialize();

            // Inicializar servicios
            this.services = {
                userService: new UserService(),
                resourceService: new ResourceService(),
                categoryService: new CategoryService()
            };

            // Inicializar cada servicio
            await Promise.all(
                Object.values(this.services).map(service => service.initialize())
            );

            this.isInitialized = true;
            Logger.info('Services initialized successfully');

            return this.services;
        } catch (error) {
            Logger.error('Error initializing services:', error);
            throw error;
        }
    }

    getService(serviceName) {
        if (!this.isInitialized) {
            throw new Error('Services not initialized. Call initialize() first.');
        }

        const service = this.services[serviceName];
        if (!service) {
            throw new Error(`Service '${serviceName}' not found`);
        }

        return service;
    }

    getUserService() {
        return this.getService('userService');
    }

    getResourceService() {
        return this.getService('resourceService');
    }

    getCategoryService() {
        return this.getService('categoryService');
    }

    getAllServices() {
        return this.services;
    }
}

// Singleton instance
let serviceManagerInstance = null;

export const getServiceManager = () => {
    if (!serviceManagerInstance) {
        serviceManagerInstance = new ServiceManager();
    }
    return serviceManagerInstance;
};

// Export individual service getters for convenience
export const getUserService = () => getServiceManager().getUserService();
export const getResourceService = () => getServiceManager().getResourceService();
export const getCategoryService = () => getServiceManager().getCategoryService();

// Export default
export default getServiceManager;