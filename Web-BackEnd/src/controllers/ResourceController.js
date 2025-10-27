/**
 * ResourceController
 * Controlador para operaciones de recursos académicos
 */

import { Logger } from '../utils/Logger.js';
import { getResourceService } from '../services/index.js';

export class ResourceController {
    constructor() {
        this.resourceService = null;
    }

    async initialize() {
        this.resourceService = getResourceService();
        Logger.info('ResourceController initialized');
    }

    // Operaciones CRUD
    async createResource(req, res, next) {
        try {
            const userId = req.user.id;
            const resourceData = req.body;

            const resource = await this.resourceService.createResource(resourceData, userId);

            res.status(201).json({
                success: true,
                message: 'Resource created successfully',
                data: resource
            });
        } catch (error) {
            Logger.error('Create resource error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to create resource'
            });
        }
    }

    async getResourceById(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            const resource = await this.resourceService.getResourceById(id, userId);

            res.json({
                success: true,
                data: resource
            });
        } catch (error) {
            Logger.error('Get resource by ID error:', error);
            
            if (error.message === 'Resource not found') {
                res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            } else if (error.message === 'Access denied') {
                res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to get resource'
                });
            }
        }
    }

    async updateResource(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const updateData = req.body;

            const resource = await this.resourceService.updateResource(id, updateData, userId);

            res.json({
                success: true,
                message: 'Resource updated successfully',
                data: resource
            });
        } catch (error) {
            Logger.error('Update resource error:', error);
            
            if (error.message === 'Resource not found') {
                res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            } else if (error.message === 'Permission denied') {
                res.status(403).json({
                    success: false,
                    message: 'Permission denied'
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to update resource'
                });
            }
        }
    }

    async deleteResource(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const result = await this.resourceService.deleteResource(id, userId);

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            Logger.error('Delete resource error:', error);
            
            if (error.message === 'Resource not found') {
                res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            } else if (error.message === 'Permission denied') {
                res.status(403).json({
                    success: false,
                    message: 'Permission denied'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to delete resource'
                });
            }
        }
    }

    // Consultas públicas
    async getPublishedResources(req, res, next) {
        try {
            const { page = 1, limit = 20, category, type, subject } = req.query;
            const offset = (page - 1) * limit;

            const options = {
                limit: parseInt(limit),
                offset: parseInt(offset)
            };

            // Agregar filtros si se proporcionan
            const where = {};
            if (category) where.category = category;
            if (type) where.type = type;
            if (subject) where.subject = subject;
            
            if (Object.keys(where).length > 0) {
                options.where = where;
            }

            const resources = await this.resourceService.getPublishedResources(options);

            res.json({
                success: true,
                data: resources,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: resources.length
                }
            });
        } catch (error) {
            Logger.error('Get published resources error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get resources'
            });
        }
    }

    async getResourcesByCategory(req, res, next) {
        try {
            const { category } = req.params;
            const { page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;

            const resources = await this.resourceService.getResourcesByCategory(category, {
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            res.json({
                success: true,
                data: resources,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: resources.length
                }
            });
        } catch (error) {
            Logger.error('Get resources by category error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get resources by category'
            });
        }
    }

    async getResourcesByUser(req, res, next) {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;

            // Si es el propio usuario, puede ver todos sus recursos
            // Si no, solo los públicos y publicados
            const requestingUserId = req.user?.id;
            const isOwnResources = requestingUserId === userId;

            const options = {
                limit: parseInt(limit),
                offset: parseInt(offset)
            };

            if (!isOwnResources) {
                options.where = {
                    status: 'published',
                    visibility: 'public'
                };
            }

            const resources = await this.resourceService.getResourcesByUser(userId, options);

            res.json({
                success: true,
                data: resources,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: resources.length
                }
            });
        } catch (error) {
            Logger.error('Get resources by user error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get user resources'
            });
        }
    }

    async searchResources(req, res, next) {
        try {
            const { q: query } = req.query;
            const { page = 1, limit = 20, category, type } = req.query;
            const offset = (page - 1) * limit;

            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
            }

            const options = {
                limit: parseInt(limit),
                offset: parseInt(offset)
            };

            // Agregar filtros adicionales
            const where = {};
            if (category) where.category = category;
            if (type) where.type = type;
            
            if (Object.keys(where).length > 0) {
                options.where = where;
            }

            const resources = await this.resourceService.searchResources(query, options);

            res.json({
                success: true,
                data: resources,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: resources.length
                }
            });
        } catch (error) {
            Logger.error('Search resources error:', error);
            res.status(500).json({
                success: false,
                message: 'Search failed'
            });
        }
    }

    async getPopularResources(req, res, next) {
        try {
            const { limit = 10 } = req.query;

            const resources = await this.resourceService.getPopularResources(parseInt(limit));

            res.json({
                success: true,
                data: resources
            });
        } catch (error) {
            Logger.error('Get popular resources error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get popular resources'
            });
        }
    }

    async getRecentResources(req, res, next) {
        try {
            const { limit = 10 } = req.query;

            const resources = await this.resourceService.getRecentResources(parseInt(limit));

            res.json({
                success: true,
                data: resources
            });
        } catch (error) {
            Logger.error('Get recent resources error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get recent resources'
            });
        }
    }

    // Operaciones de interacción
    async downloadResource(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            const result = await this.resourceService.downloadResource(id, userId);

            res.json({
                success: true,
                message: result.message,
                data: {
                    download_url: result.download_url
                }
            });
        } catch (error) {
            Logger.error('Download resource error:', error);
            
            if (error.message === 'Resource not found') {
                res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            } else if (error.message === 'Access denied') {
                res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Download failed'
                });
            }
        }
    }

    async likeResource(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const result = await this.resourceService.likeResource(id, userId);

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            Logger.error('Like resource error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to like resource'
            });
        }
    }

    async rateResource(req, res, next) {
        try {
            const { id } = req.params;
            const { rating } = req.body;
            const userId = req.user.id;

            if (!rating || rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating must be between 1 and 5'
                });
            }

            const result = await this.resourceService.rateResource(id, rating, userId);

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            Logger.error('Rate resource error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to rate resource'
            });
        }
    }

    // Operaciones de gestión
    async publishResource(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const result = await this.resourceService.publishResource(id, userId);

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            Logger.error('Publish resource error:', error);
            
            if (error.message === 'Resource not found') {
                res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            } else if (error.message === 'Permission denied') {
                res.status(403).json({
                    success: false,
                    message: 'Permission denied'
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to publish resource'
                });
            }
        }
    }

    async archiveResource(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const result = await this.resourceService.archiveResource(id, userId);

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            Logger.error('Archive resource error:', error);
            
            if (error.message === 'Resource not found') {
                res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            } else if (error.message === 'Permission denied') {
                res.status(403).json({
                    success: false,
                    message: 'Permission denied'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to archive resource'
                });
            }
        }
    }

    async getResourceStats(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const stats = await this.resourceService.getResourceStats(id, userId);

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            Logger.error('Get resource stats error:', error);
            
            if (error.message === 'Resource not found') {
                res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            } else if (error.message === 'Permission denied') {
                res.status(403).json({
                    success: false,
                    message: 'Permission denied'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to get resource stats'
                });
            }
        }
    }

    // Middleware de validación
    validateResourceCreation(req, res, next) {
        const { title, category, type } = req.body;

        const errors = [];

        if (!title || title.trim().length < 3) {
            errors.push('Title must be at least 3 characters long');
        }

        if (!category || category.trim().length === 0) {
            errors.push('Category is required');
        }

        if (!type || !['document', 'video', 'image', 'audio', 'link', 'presentation', 'spreadsheet', 'other'].includes(type)) {
            errors.push('Valid resource type is required');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors
            });
        }

        next();
    }
}

export default ResourceController;