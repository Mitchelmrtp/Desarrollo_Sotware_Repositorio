import { Resource, Category, User, Comment, ResourceLike } from '../models/index.js';
import { Op } from 'sequelize';
import { processUploadedFiles, deleteFile } from '../services/uploadService.js';

// Get all resources with pagination and filters
export const getResources = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            type,
            author,
            search,
            sort = 'created_at',
            order = 'DESC',
            status = 'published'
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const whereClause = { status };

        // Add filters
        if (category) {
            whereClause.category_id = category;
        }

        if (type) {
            whereClause.type = type;
        }

        if (author) {
            whereClause.author_id = author;
        }

        // Add search
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { description: { [Op.iLike]: `%${search}%` } },
                { content: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows: resources } = await Resource.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name', 'profile_picture']
                },
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'slug', 'color']
                }
            ],
            order: [[sort, order.toUpperCase()]],
            limit: parseInt(limit),
            offset,
            distinct: true
        });

        const totalPages = Math.ceil(count / parseInt(limit));

        res.json({
            resources,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages,
                hasNext: parseInt(page) < totalPages,
                hasPrev: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error('Get resources error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Get single resource by ID
export const getResourceById = async (req, res) => {
    try {
        const { id } = req.params;

        const resource = await Resource.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name', 'profile_picture', 'bio']
                },
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'slug', 'color']
                },
                {
                    model: Comment,
                    as: 'comments',
                    include: [{
                        model: User,
                        as: 'author',
                        attributes: ['id', 'name', 'profile_picture']
                    }],
                    where: { parent_id: null },
                    required: false
                }
            ]
        });

        if (!resource) {
            return res.status(404).json({ message: 'Recurso no encontrado' });
        }

        // Check if resource is published or user has permission
        if (resource.status !== 'published') {
            if (!req.user || (req.user.userId !== resource.author_id && req.user.role !== 'admin')) {
                return res.status(403).json({ message: 'Recurso no disponible' });
            }
        }

        // Increment view count
        await resource.increment('views');

        res.json({ resource });

    } catch (error) {
        console.error('Get resource error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Create new resource
export const createResource = async (req, res) => {
    try {
        const resourceData = {
            ...req.body,
            author_id: req.user.userId,
            status: 'under_review' // Default status for new resources
        };

        // Process uploaded files
        if (req.files && Object.keys(req.files).length > 0) {
            const processedFiles = processUploadedFiles(req.files);
            
            if (processedFiles.resource_file) {
                resourceData.file_url = processedFiles.resource_file.path;
                resourceData.file_size = processedFiles.resource_file.size;
                resourceData.file_type = processedFiles.resource_file.mimetype;
            }
            
            if (processedFiles.thumbnail) {
                resourceData.thumbnail_url = processedFiles.thumbnail.path;
            }
        }

        const resource = await Resource.create(resourceData);

        // Fetch the complete resource with associations
        const completeResource = await Resource.findByPk(resource.id, {
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name', 'profile_picture']
                },
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'slug', 'color']
                }
            ]
        });

        res.status(201).json({
            message: 'Recurso creado exitosamente',
            resource: completeResource
        });

    } catch (error) {
        console.error('Create resource error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Update resource
export const updateResource = async (req, res) => {
    try {
        const { id } = req.params;

        const resource = await Resource.findByPk(id);

        if (!resource) {
            return res.status(404).json({ message: 'Recurso no encontrado' });
        }

        // Check permissions
        if (resource.author_id !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No tienes permisos para editar este recurso' });
        }

        const updateData = { ...req.body };

        // Process uploaded files
        if (req.files && Object.keys(req.files).length > 0) {
            const processedFiles = processUploadedFiles(req.files);
            
            if (processedFiles.resource_file) {
                // Delete old file
                if (resource.file_url) {
                    await deleteFile(resource.file_url);
                }
                
                updateData.file_url = processedFiles.resource_file.path;
                updateData.file_size = processedFiles.resource_file.size;
                updateData.file_type = processedFiles.resource_file.mimetype;
            }
            
            if (processedFiles.thumbnail) {
                // Delete old thumbnail
                if (resource.thumbnail_url) {
                    await deleteFile(resource.thumbnail_url);
                }
                
                updateData.thumbnail_url = processedFiles.thumbnail.path;
            }
        }

        // If content is updated, set status back to review (except for admins)
        if (updateData.content && req.user.role !== 'admin') {
            updateData.status = 'under_review';
        }

        await resource.update(updateData);

        // Fetch updated resource with associations
        const updatedResource = await Resource.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name', 'profile_picture']
                },
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'slug', 'color']
                }
            ]
        });

        res.json({
            message: 'Recurso actualizado exitosamente',
            resource: updatedResource
        });

    } catch (error) {
        console.error('Update resource error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Delete resource
export const deleteResource = async (req, res) => {
    try {
        const { id } = req.params;

        const resource = await Resource.findByPk(id);

        if (!resource) {
            return res.status(404).json({ message: 'Recurso no encontrado' });
        }

        // Check permissions
        if (resource.author_id !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'No tienes permisos para eliminar este recurso' });
        }

        // Delete associated files
        if (resource.file_url) {
            await deleteFile(resource.file_url);
        }
        if (resource.thumbnail_url) {
            await deleteFile(resource.thumbnail_url);
        }

        await resource.destroy();

        res.json({
            message: 'Recurso eliminado exitosamente'
        });

    } catch (error) {
        console.error('Delete resource error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Like/Unlike resource
export const toggleResourceLike = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const resource = await Resource.findByPk(id);
        if (!resource) {
            return res.status(404).json({ message: 'Recurso no encontrado' });
        }

        const existingLike = await ResourceLike.findOne({
            where: { resource_id: id, user_id: userId }
        });

        let liked;
        if (existingLike) {
            // Unlike
            await existingLike.destroy();
            await resource.decrement('likes_count');
            liked = false;
        } else {
            // Like
            await ResourceLike.create({ resource_id: id, user_id: userId });
            await resource.increment('likes_count');
            liked = true;
        }

        res.json({
            message: liked ? 'Recurso marcado como favorito' : 'Recurso removido de favoritos',
            liked,
            likes_count: resource.likes_count + (liked ? 1 : -1)
        });

    } catch (error) {
        console.error('Toggle like error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Get user's own resources
export const getUserResources = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            sort = 'created_at',
            order = 'DESC'
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const whereClause = { author_id: req.user.userId };

        if (status) {
            whereClause.status = status;
        }

        const { count, rows: resources } = await Resource.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'slug', 'color']
                }
            ],
            order: [[sort, order.toUpperCase()]],
            limit: parseInt(limit),
            offset
        });

        const totalPages = Math.ceil(count / parseInt(limit));

        res.json({
            resources,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages,
                hasNext: parseInt(page) < totalPages,
                hasPrev: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error('Get user resources error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Get featured resources
export const getFeaturedResources = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const resources = await Resource.findAll({
            where: { 
                status: 'published',
                is_featured: true
            },
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name', 'profile_picture']
                },
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'slug', 'color']
                }
            ],
            order: [['featured_at', 'DESC']],
            limit: parseInt(limit)
        });

        res.json({ resources });

    } catch (error) {
        console.error('Get featured resources error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};