/**
 * Repository Index
 * Gestión centralizada de repositorios
 */

import { Logger } from '../utils/Logger.js';
import { getModelManager } from '../models/index.js';

// Importar repositorios
import UserRepository from './UserRepository.js';
import ResourceRepository from './ResourceRepository.js';
import CategoryRepository from './CategoryRepository.js';

class RepositoryManager {
    constructor() {
        this.repositories = {};
        this.isInitialized = false;
    }

    async initialize() {
        try {
            if (this.isInitialized) {
                return this.repositories;
            }

            Logger.info('Initializing repositories...');

            // Asegurar que los modelos estén inicializados
            const modelManager = getModelManager();
            await modelManager.initialize();

            // Inicializar repositorios
            this.repositories = {
                userRepository: new UserRepository(),
                resourceRepository: new ResourceRepository(),
                categoryRepository: new CategoryRepository()
            };

            // Inicializar cada repositorio
            await Promise.all(
                Object.values(this.repositories).map(repo => repo.initialize())
            );

            this.isInitialized = true;
            Logger.info('Repositories initialized successfully');

            return this.repositories;
        } catch (error) {
            Logger.error('Error initializing repositories:', error);
            throw error;
        }
    }

    getRepository(repositoryName) {
        if (!this.isInitialized) {
            throw new Error('Repositories not initialized. Call initialize() first.');
        }

        const repo = this.repositories[repositoryName];
        if (!repo) {
            throw new Error(`Repository '${repositoryName}' not found`);
        }

        return repo;
    }

    getUserRepository() {
        return this.getRepository('userRepository');
    }

    getResourceRepository() {
        return this.getRepository('resourceRepository');
    }

    getCategoryRepository() {
        return this.getRepository('categoryRepository');
    }

    getAllRepositories() {
        return this.repositories;
    }
}

// Singleton instance
let repositoryManagerInstance = null;

export const getRepositoryManager = () => {
    if (!repositoryManagerInstance) {
        repositoryManagerInstance = new RepositoryManager();
    }
    return repositoryManagerInstance;
};

// Export individual repository getters for convenience
export const getUserRepository = () => getRepositoryManager().getUserRepository();
export const getResourceRepository = () => getRepositoryManager().getResourceRepository();
export const getCategoryRepository = () => getRepositoryManager().getCategoryRepository();

// Export default
export default getRepositoryManager;