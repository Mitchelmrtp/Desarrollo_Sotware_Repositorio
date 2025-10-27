/**
 * ResourceService
 * Lógica de negocio para operaciones con recursos académicos
 */

import { Logger } from '../utils/Logger.js';
import { getResourceRepository, getCategoryRepository } from '../repositories/index.js';

export class ResourceService {
    constructor() {
        this.resourceRepository = null;
        this.categoryRepository = null;
    }

    async initialize() {
        this.resourceRepository = getResourceRepository();
        this.categoryRepository = getCategoryRepository();
        Logger.info('ResourceService initialized');
    }

    // Operaciones CRUD básicas
    async createResource(resourceData, userId) {
        try {
            Logger.info(`Creating resource: ${resourceData.title} by user: ${userId}`);

            // Validar datos de entrada
            const validationErrors = this.validateResourceData(resourceData);
            if (validationErrors.length > 0) {
                throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
            }

            // Verificar que la categoría existe si se proporciona
            if (resourceData.category) {
                const categoryExists = await this.categoryRepository.findBySlug(resourceData.category);
                if (!categoryExists) {
                    throw new Error('Category does not exist');
                }
            }

            // Agregar ID del usuario
            const resourceToCreate = {
                ...resourceData,
                user_id: userId,
                status: resourceData.status || 'draft'
            };

            const resource = await this.resourceRepository.createResource(resourceToCreate);

            Logger.info(`Resource created successfully: ${resource.id}`);

            return resource;
        } catch (error) {
            Logger.error('Error creating resource:', error);
            throw error;
        }
    }

    async getResourceById(resourceId, userId = null) {
        try {
            Logger.info(`Getting resource: ${resourceId}`);

            const resource = await this.resourceRepository.model.findByPk(resourceId, {
                include: [
                    {
                        association: 'author',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        association: 'tags'
                    },
                    {
                        association: 'comments',
                        where: { status: 'approved' },
                        required: false,
                        include: [
                            {
                                association: 'author',
                                attributes: ['id', 'name']
                            }
                        ]
                    }
                ]
            });

            if (!resource) {
                throw new Error('Resource not found');
            }

            // Verificar permisos de acceso
            if (!this.canUserAccessResource(resource, userId)) {
                throw new Error('Access denied');
            }

            // Incrementar contador de vistas si el usuario no es el autor
            if (userId !== resource.user_id) {
                await this.resourceRepository.incrementViewCount(resourceId);
            }

            return resource;
        } catch (error) {
            Logger.error('Error getting resource:', error);
            throw error;
        }
    }

    async updateResource(resourceId, updateData, userId) {
        try {
            Logger.info(`Updating resource: ${resourceId} by user: ${userId}`);

            // Verificar que el recurso existe
            const resource = await this.resourceRepository.findById(resourceId);
            if (!resource) {
                throw new Error('Resource not found');
            }

            // Verificar permisos (solo el autor o admin puede actualizar)
            if (!this.canUserEditResource(resource, userId)) {
                throw new Error('Permission denied');
            }

            // Validar datos de actualización
            const validationErrors = this.validateUpdateData(updateData);
            if (validationErrors.length > 0) {
                throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
            }

            // Actualizar recurso
            const updatedResource = await this.resourceRepository.updateById(resourceId, updateData);

            Logger.info(`Resource updated successfully: ${resourceId}`);

            return updatedResource;
        } catch (error) {
            Logger.error('Error updating resource:', error);
            throw error;
        }
    }

    async deleteResource(resourceId, userId) {
        try {
            Logger.info(`Deleting resource: ${resourceId} by user: ${userId}`);

            // Verificar que el recurso existe
            const resource = await this.resourceRepository.findById(resourceId);
            if (!resource) {
                throw new Error('Resource not found');
            }

            // Verificar permisos
            if (!this.canUserEditResource(resource, userId)) {
                throw new Error('Permission denied');
            }

            // Eliminar recurso (soft delete)
            await this.resourceRepository.deleteById(resourceId);

            Logger.info(`Resource deleted successfully: ${resourceId}`);

            return { message: 'Resource deleted successfully' };
        } catch (error) {
            Logger.error('Error deleting resource:', error);
            throw error;
        }
    }

    // Operaciones de consulta
    async getPublishedResources(options = {}) {
        try {
            Logger.info('Getting published resources');

            const resources = await this.resourceRepository.findPublishedResources({
                limit: options.limit || 20,
                offset: options.offset || 0,
                ...options
            });

            return resources;
        } catch (error) {
            Logger.error('Error getting published resources:', error);
            throw error;
        }
    }

    async getResourcesByCategory(category, options = {}) {
        try {
            Logger.info(`Getting resources by category: ${category}`);

            const resources = await this.resourceRepository.findByCategory(category, {
                limit: options.limit || 20,
                offset: options.offset || 0,
                ...options
            });

            return resources;
        } catch (error) {
            Logger.error('Error getting resources by category:', error);
            throw error;
        }
    }

    async getResourcesByUser(userId, options = {}) {
        try {
            Logger.info(`Getting resources by user: ${userId}`);

            const resources = await this.resourceRepository.findByUser(userId, {
                limit: options.limit || 20,
                offset: options.offset || 0,
                ...options
            });

            return resources;
        } catch (error) {
            Logger.error('Error getting resources by user:', error);
            throw error;
        }
    }

    async searchResources(query, options = {}) {
        try {
            Logger.info(`Searching resources with query: ${query}`);

            const resources = await this.resourceRepository.searchResources(query, {
                limit: options.limit || 20,
                offset: options.offset || 0,
                ...options
            });

            return resources;
        } catch (error) {
            Logger.error('Error searching resources:', error);
            throw error;
        }
    }

    async getPopularResources(limit = 10) {
        try {
            Logger.info('Getting popular resources');

            const resources = await this.resourceRepository.findPopularResources(limit);

            return resources;
        } catch (error) {
            Logger.error('Error getting popular resources:', error);
            throw error;
        }
    }

    async getRecentResources(limit = 10) {
        try {
            Logger.info('Getting recent resources');

            const resources = await this.resourceRepository.findRecentResources(limit);

            return resources;
        } catch (error) {
            Logger.error('Error getting recent resources:', error);
            throw error;
        }
    }

    // Operaciones de interacción
    async downloadResource(resourceId, userId = null) {
        try {
            Logger.info(`Processing download for resource: ${resourceId}`);

            const resource = await this.resourceRepository.findById(resourceId);
            if (!resource) {
                throw new Error('Resource not found');
            }

            // Verificar permisos de acceso
            if (!this.canUserAccessResource(resource, userId)) {
                throw new Error('Access denied');
            }

            // Incrementar contador de descargas
            await this.resourceRepository.incrementDownloadCount(resourceId);

            Logger.info(`Download processed for resource: ${resourceId}`);

            return {
                resource,
                download_url: resource.file_url || resource.external_url,
                message: 'Download initiated'
            };
        } catch (error) {
            Logger.error('Error processing download:', error);
            throw error;
        }
    }

    async likeResource(resourceId, userId) {
        try {
            Logger.info(`Processing like for resource: ${resourceId} by user: ${userId}`);

            const resource = await this.resourceRepository.findById(resourceId);
            if (!resource) {
                throw new Error('Resource not found');
            }

            // Aquí se podría implementar una tabla de likes para evitar likes duplicados
            // Por ahora, incrementamos el contador directamente
            await this.resourceRepository.incrementLikeCount(resourceId);

            Logger.info(`Like processed for resource: ${resourceId}`);

            return { message: 'Resource liked successfully' };
        } catch (error) {
            Logger.error('Error processing like:', error);
            throw error;
        }
    }

    async rateResource(resourceId, rating, userId) {
        try {
            Logger.info(`Processing rating for resource: ${resourceId} by user: ${userId}`);

            if (rating < 1 || rating > 5) {
                throw new Error('Rating must be between 1 and 5');
            }

            const resource = await this.resourceRepository.findById(resourceId);
            if (!resource) {
                throw new Error('Resource not found');
            }

            // Verificar que el usuario no sea el autor
            if (resource.user_id === userId) {
                throw new Error('Cannot rate your own resource');
            }

            // Actualizar calificación
            await this.resourceRepository.updateRating(resourceId, rating);

            Logger.info(`Rating processed for resource: ${resourceId}`);

            return { message: 'Resource rated successfully' };
        } catch (error) {
            Logger.error('Error processing rating:', error);
            throw error;
        }
    }

    // Operaciones de gestión
    async publishResource(resourceId, userId) {
        try {
            Logger.info(`Publishing resource: ${resourceId} by user: ${userId}`);

            const resource = await this.resourceRepository.findById(resourceId);
            if (!resource) {
                throw new Error('Resource not found');
            }

            // Verificar permisos
            if (!this.canUserEditResource(resource, userId)) {
                throw new Error('Permission denied');
            }

            // Validar que el recurso esté completo para publicación
            const validationErrors = this.validateResourceForPublication(resource);
            if (validationErrors.length > 0) {
                throw new Error(`Cannot publish: ${validationErrors.join(', ')}`);
            }

            // Publicar recurso
            await this.resourceRepository.publishResource(resourceId);

            Logger.info(`Resource published successfully: ${resourceId}`);

            return { message: 'Resource published successfully' };
        } catch (error) {
            Logger.error('Error publishing resource:', error);
            throw error;
        }
    }

    async archiveResource(resourceId, userId) {
        try {
            Logger.info(`Archiving resource: ${resourceId} by user: ${userId}`);

            const resource = await this.resourceRepository.findById(resourceId);
            if (!resource) {
                throw new Error('Resource not found');
            }

            // Verificar permisos
            if (!this.canUserEditResource(resource, userId)) {
                throw new Error('Permission denied');
            }

            // Archivar recurso
            await this.resourceRepository.archiveResource(resourceId);

            Logger.info(`Resource archived successfully: ${resourceId}`);

            return { message: 'Resource archived successfully' };
        } catch (error) {
            Logger.error('Error archiving resource:', error);
            throw error;
        }
    }

    async getResourceStats(resourceId, userId) {
        try {
            Logger.info(`Getting stats for resource: ${resourceId}`);

            const resource = await this.resourceRepository.findById(resourceId);
            if (!resource) {
                throw new Error('Resource not found');
            }

            // Verificar permisos (solo el autor puede ver estadísticas detalladas)
            if (resource.user_id !== userId) {
                throw new Error('Permission denied');
            }

            const stats = await this.resourceRepository.getResourceStats(resourceId);

            return stats;
        } catch (error) {
            Logger.error('Error getting resource stats:', error);
            throw error;
        }
    }

    // Métodos de utilidad
    canUserAccessResource(resource, userId) {
        // Recursos públicos son accesibles por todos
        if (resource.visibility === 'public' && resource.status === 'published') {
            return true;
        }

        // Usuario no autenticado solo puede acceder a recursos públicos
        if (!userId) {
            return false;
        }

        // El autor siempre puede acceder
        if (resource.user_id === userId) {
            return true;
        }

        // Aquí se pueden agregar más reglas de acceso (roles, grupos, etc.)
        return false;
    }

    canUserEditResource(resource, userId) {
        // Solo el autor puede editar su recurso
        if (resource.user_id === userId) {
            return true;
        }

        // Aquí se pueden agregar permisos para administradores
        return false;
    }

    validateResourceData(resourceData) {
        const errors = [];

        if (!resourceData.title || resourceData.title.length < 3) {
            errors.push('Title must be at least 3 characters long');
        }

        if (!resourceData.category) {
            errors.push('Category is required');
        }

        if (!resourceData.type || !['document', 'video', 'image', 'audio', 'link', 'presentation', 'spreadsheet', 'other'].includes(resourceData.type)) {
            errors.push('Valid type is required');
        }

        return errors;
    }

    validateUpdateData(updateData) {
        const errors = [];

        if (updateData.title && updateData.title.length < 3) {
            errors.push('Title must be at least 3 characters long');
        }

        if (updateData.type && !['document', 'video', 'image', 'audio', 'link', 'presentation', 'spreadsheet', 'other'].includes(updateData.type)) {
            errors.push('Invalid type');
        }

        if (updateData.visibility && !['public', 'private', 'restricted'].includes(updateData.visibility)) {
            errors.push('Invalid visibility setting');
        }

        if (updateData.status && !['draft', 'published', 'archived', 'under_review'].includes(updateData.status)) {
            errors.push('Invalid status');
        }

        return errors;
    }

    validateResourceForPublication(resource) {
        const errors = [];

        if (!resource.title || resource.title.length < 3) {
            errors.push('Title is required');
        }

        if (!resource.description) {
            errors.push('Description is required');
        }

        if (!resource.category) {
            errors.push('Category is required');
        }

        if (!resource.file_url && !resource.external_url && !resource.content) {
            errors.push('Resource must have content, file, or external URL');
        }

        return errors;
    }
}

export default ResourceService;