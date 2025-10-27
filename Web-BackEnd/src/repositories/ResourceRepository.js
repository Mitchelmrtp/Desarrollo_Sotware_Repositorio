/**
 * ResourceRepository
 * Repositorio específico para operaciones con recursos académicos
 */

import { BaseRepository } from './BaseRepository.js';
import { Logger } from '../utils/Logger.js';
import { getResource } from '../models/index.js';

export class ResourceRepository extends BaseRepository {
    constructor() {
        super(null);
        this.modelName = 'Resource';
    }

    async initialize() {
        this.model = getResource();
        Logger.info('ResourceRepository initialized');
    }

    // Métodos específicos de recursos
    async findPublishedResources(options = {}) {
        try {
            Logger.info('Finding published resources');
            
            const resources = await this.findAll({
                where: { 
                    status: 'published',
                    visibility: 'public'
                },
                include: [
                    {
                        association: 'author',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        association: 'tags'
                    }
                ],
                order: [['published_at', 'DESC']],
                ...options
            });

            return resources;
        } catch (error) {
            Logger.error('Error finding published resources:', error);
            throw error;
        }
    }

    async findByCategory(category, options = {}) {
        try {
            Logger.info(`Finding resources by category: ${category}`);
            
            const resources = await this.findAll({
                where: { 
                    category,
                    status: 'published',
                    visibility: 'public'
                },
                include: [
                    {
                        association: 'author',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        association: 'tags'
                    }
                ],
                ...options
            });

            return resources;
        } catch (error) {
            Logger.error('Error finding resources by category:', error);
            throw error;
        }
    }

    async findBySubject(subject, options = {}) {
        try {
            Logger.info(`Finding resources by subject: ${subject}`);
            
            const resources = await this.findAll({
                where: { 
                    subject,
                    status: 'published'
                },
                include: [
                    {
                        association: 'author',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        association: 'tags'
                    }
                ],
                ...options
            });

            return resources;
        } catch (error) {
            Logger.error('Error finding resources by subject:', error);
            throw error;
        }
    }

    async findByType(type, options = {}) {
        try {
            Logger.info(`Finding resources by type: ${type}`);
            
            const resources = await this.findAll({
                where: { 
                    type,
                    status: 'published',
                    visibility: 'public'
                },
                include: [
                    {
                        association: 'author',
                        attributes: ['id', 'name', 'email']
                    }
                ],
                ...options
            });

            return resources;
        } catch (error) {
            Logger.error('Error finding resources by type:', error);
            throw error;
        }
    }

    async findByUser(userId, options = {}) {
        try {
            Logger.info(`Finding resources by user: ${userId}`);
            
            const resources = await this.findAll({
                where: { user_id: userId },
                include: [
                    {
                        association: 'tags'
                    }
                ],
                order: [['created_at', 'DESC']],
                ...options
            });

            return resources;
        } catch (error) {
            Logger.error('Error finding resources by user:', error);
            throw error;
        }
    }

    async searchResources(query, options = {}) {
        try {
            Logger.info(`Searching resources with query: ${query}`);
            
            const { Op } = require('sequelize');
            const resources = await this.findAll({
                where: {
                    [Op.or]: [
                        { title: { [Op.iLike]: `%${query}%` } },
                        { description: { [Op.iLike]: `%${query}%` } },
                        { content: { [Op.iLike]: `%${query}%` } },
                        { category: { [Op.iLike]: `%${query}%` } },
                        { subject: { [Op.iLike]: `%${query}%` } }
                    ],
                    status: 'published',
                    visibility: 'public'
                },
                include: [
                    {
                        association: 'author',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        association: 'tags'
                    }
                ],
                ...options
            });

            return resources;
        } catch (error) {
            Logger.error('Error searching resources:', error);
            throw error;
        }
    }

    async findPopularResources(limit = 10) {
        try {
            Logger.info('Finding popular resources');
            
            const resources = await this.findAll({
                where: { 
                    status: 'published',
                    visibility: 'public'
                },
                include: [
                    {
                        association: 'author',
                        attributes: ['id', 'name', 'email']
                    }
                ],
                order: [
                    ['view_count', 'DESC'],
                    ['download_count', 'DESC'],
                    ['like_count', 'DESC']
                ],
                limit
            });

            return resources;
        } catch (error) {
            Logger.error('Error finding popular resources:', error);
            throw error;
        }
    }

    async findRecentResources(limit = 10) {
        try {
            Logger.info('Finding recent resources');
            
            const resources = await this.findAll({
                where: { 
                    status: 'published',
                    visibility: 'public'
                },
                include: [
                    {
                        association: 'author',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        association: 'tags'
                    }
                ],
                order: [['published_at', 'DESC']],
                limit
            });

            return resources;
        } catch (error) {
            Logger.error('Error finding recent resources:', error);
            throw error;
        }
    }

    async incrementDownloadCount(resourceId, transaction = null) {
        try {
            Logger.info(`Incrementing download count for resource: ${resourceId}`);
            
            const resource = await this.findById(resourceId);
            if (!resource) {
                throw new Error('Resource not found');
            }

            await resource.increment('download_count', { transaction });
            Logger.info(`Download count incremented for resource: ${resourceId}`);

            return resource;
        } catch (error) {
            Logger.error('Error incrementing download count:', error);
            throw error;
        }
    }

    async incrementViewCount(resourceId, transaction = null) {
        try {
            const resource = await this.findById(resourceId);
            if (!resource) {
                throw new Error('Resource not found');
            }

            await resource.increment('view_count', { transaction });
            return resource;
        } catch (error) {
            Logger.error('Error incrementing view count:', error);
            throw error;
        }
    }

    async incrementLikeCount(resourceId, transaction = null) {
        try {
            const resource = await this.findById(resourceId);
            if (!resource) {
                throw new Error('Resource not found');
            }

            await resource.increment('like_count', { transaction });
            return resource;
        } catch (error) {
            Logger.error('Error incrementing like count:', error);
            throw error;
        }
    }

    async updateRating(resourceId, newRating, transaction = null) {
        try {
            Logger.info(`Updating rating for resource: ${resourceId}`);
            
            const resource = await this.findById(resourceId);
            if (!resource) {
                throw new Error('Resource not found');
            }

            const currentRating = resource.rating || 0;
            const currentCount = resource.rating_count || 0;
            
            // Calcular nueva calificación promedio
            const totalRating = (currentRating * currentCount) + newRating;
            const newCount = currentCount + 1;
            const averageRating = totalRating / newCount;

            const result = await this.updateById(resourceId, {
                rating: Math.round(averageRating * 100) / 100, // Redondear a 2 decimales
                rating_count: newCount
            }, transaction);

            Logger.info(`Rating updated for resource: ${resourceId}, new average: ${averageRating}`);
            return result;
        } catch (error) {
            Logger.error('Error updating rating:', error);
            throw error;
        }
    }

    async publishResource(resourceId, transaction = null) {
        try {
            Logger.info(`Publishing resource: ${resourceId}`);
            
            const result = await this.updateById(resourceId, {
                status: 'published',
                published_at: new Date()
            }, transaction);

            Logger.info(`Resource published successfully: ${resourceId}`);
            return result;
        } catch (error) {
            Logger.error('Error publishing resource:', error);
            throw error;
        }
    }

    async archiveResource(resourceId, transaction = null) {
        try {
            Logger.info(`Archiving resource: ${resourceId}`);
            
            const result = await this.updateById(resourceId, {
                status: 'archived'
            }, transaction);

            Logger.info(`Resource archived successfully: ${resourceId}`);
            return result;
        } catch (error) {
            Logger.error('Error archiving resource:', error);
            throw error;
        }
    }

    async findExpiredResources() {
        try {
            Logger.info('Finding expired resources');
            
            const resources = await this.findAll({
                where: {
                    expires_at: {
                        [Op.lt]: new Date()
                    },
                    status: 'published'
                }
            });

            return resources;
        } catch (error) {
            Logger.error('Error finding expired resources:', error);
            throw error;
        }
    }

    async getResourceStats(resourceId) {
        try {
            Logger.info(`Getting stats for resource: ${resourceId}`);
            
            const resource = await this.model.findByPk(resourceId, {
                include: [
                    {
                        association: 'comments',
                        attributes: []
                    },
                    {
                        association: 'tags'
                    }
                ],
                attributes: {
                    include: [
                        [
                            this.model.sequelize.fn('COUNT', this.model.sequelize.col('comments.id')),
                            'comment_count'
                        ]
                    ]
                },
                group: ['Resource.id', 'tags.id']
            });

            if (!resource) {
                throw new Error('Resource not found');
            }

            return {
                resource: resource.getPublicData(),
                stats: {
                    views: resource.view_count,
                    downloads: resource.download_count,
                    likes: resource.like_count,
                    comments: resource.dataValues.comment_count || 0,
                    rating: resource.rating,
                    rating_count: resource.rating_count
                }
            };
        } catch (error) {
            Logger.error('Error getting resource stats:', error);
            throw error;
        }
    }

    // Validación de datos de recurso
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

        if (resourceData.visibility && !['public', 'private', 'restricted'].includes(resourceData.visibility)) {
            errors.push('Invalid visibility setting');
        }

        if (resourceData.status && !['draft', 'published', 'archived', 'under_review'].includes(resourceData.status)) {
            errors.push('Invalid status');
        }

        return errors;
    }

    async createResource(resourceData, transaction = null) {
        try {
            // Validar datos
            const validationErrors = this.validateResourceData(resourceData);
            if (validationErrors.length > 0) {
                throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
            }

            // Crear recurso
            const resource = await this.create(resourceData, transaction);
            Logger.info(`Resource created successfully: ${resource.title} (ID: ${resource.id})`);

            return resource;
        } catch (error) {
            Logger.error('Error creating resource:', error);
            throw error;
        }
    }
}

export default ResourceRepository;