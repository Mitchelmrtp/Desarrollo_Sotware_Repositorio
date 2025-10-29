import { User, Resource, Category } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

// Middleware to check admin role
export const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
    }
    next();
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalResources,
            totalCategories,
            publishedResources,
            pendingResources,
            recentUsers,
            recentResources
        ] = await Promise.all([
            User.count(),
            Resource.count(),
            Category.count(),
            Resource.count({ where: { status: 'published' } }),
            Resource.count({ where: { status: 'under_review' } }),
            User.count({ 
                where: {
                    created_at: {
                        [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                    }
                }
            }),
            Resource.count({
                where: {
                    created_at: {
                        [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                    }
                }
            })
        ]);

        res.json({
            stats: {
                users: {
                    total: totalUsers,
                    recent: recentUsers
                },
                resources: {
                    total: totalResources,
                    published: publishedResources,
                    pending: pendingResources,
                    recent: recentResources
                },
                categories: {
                    total: totalCategories
                }
            }
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Get all users with pagination
export const getUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            status,
            role,
            sort = 'created_at',
            order = 'DESC'
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const whereClause = {};

        // Add filters
        if (status) whereClause.status = status;
        if (role) whereClause.role = role;

        // Add search
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { first_name: { [Op.iLike]: `%${search}%` } },
                { last_name: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows: users } = await User.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ['password'] },
            order: [[sort, order.toUpperCase()]],
            limit: parseInt(limit),
            offset
        });

        const totalPages = Math.ceil(count / parseInt(limit));

        res.json({
            users,
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
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Update user (admin only)
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const allowedFields = ['status', 'role', 'name', 'first_name', 'last_name'];
        
        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowedFields.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No se proporcionaron campos válidos para actualizar' });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        await user.update(updates);

        res.json({
            message: 'Usuario actualizado exitosamente',
            user: user.toSafeObject()
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Get all resources for moderation
export const getResourcesForModeration = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            type,
            sort = 'created_at',
            order = 'DESC'
        } = req.query;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const whereClause = {};

        if (status) whereClause.status = status;
        if (type) whereClause.type = type;

        const { count, rows: resources } = await Resource.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Category,
                    as: 'category',
                    attributes: ['id', 'name', 'slug']
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
        console.error('Get resources for moderation error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Moderate resource (approve/reject)
export const moderateResource = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;

        if (!['published', 'rejected', 'under_review'].includes(status)) {
            return res.status(400).json({ message: 'Estado inválido' });
        }

        const resource = await Resource.findByPk(id);
        if (!resource) {
            return res.status(404).json({ message: 'Recurso no encontrado' });
        }

        const updateData = { status };
        
        // Set published date if approved
        if (status === 'published' && resource.status !== 'published') {
            updateData.published_at = new Date();
        }

        // Add rejection reason to metadata
        if (status === 'rejected' && reason) {
            updateData.metadata = {
                ...resource.metadata,
                rejection_reason: reason,
                rejected_by: req.user.userId,
                rejected_at: new Date()
            };
        }

        await resource.update(updateData);

        res.json({
            message: `Recurso ${status === 'published' ? 'aprobado' : status === 'rejected' ? 'rechazado' : 'actualizado'} exitosamente`,
            resource
        });

    } catch (error) {
        console.error('Moderate resource error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Get admin reports
export const getReports = async (req, res) => {
    try {
        const { 
            dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default: 30 days ago
            dateTo = new Date() 
        } = req.query;

        const [
            userStats,
            resourceStats,
            categoryStats
        ] = await Promise.all([
            // User statistics
            User.findAll({
                attributes: [
                    [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                where: {
                    created_at: {
                        [Op.between]: [dateFrom, dateTo]
                    }
                },
                group: [sequelize.fn('DATE', sequelize.col('created_at'))],
                order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'DESC']]
            }),
            
            // Resource statistics
            Resource.findAll({
                attributes: [
                    [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                    'status'
                ],
                where: {
                    created_at: {
                        [Op.between]: [dateFrom, dateTo]
                    }
                },
                group: [
                    sequelize.fn('DATE', sequelize.col('created_at')), 
                    'status'
                ],
                order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'DESC']]
            }),

            // Category usage
            Category.findAll({
                attributes: [
                    'id',
                    'name',
                    [sequelize.fn('COUNT', sequelize.col('Resources.id')), 'resource_count']
                ],
                include: [{
                    model: Resource,
                    as: 'resources',
                    attributes: [],
                    where: {
                        created_at: {
                            [Op.between]: [dateFrom, dateTo]
                        }
                    },
                    required: false
                }],
                group: ['Category.id'],
                order: [[sequelize.fn('COUNT', sequelize.col('Resources.id')), 'DESC']]
            })
        ]);

        res.json({
            date_range: {
                from: dateFrom,
                to: dateTo
            },
            reports: {
                user_registrations: userStats,
                resource_submissions: resourceStats,
                category_usage: categoryStats
            },
            summary: {
                total_users_in_period: userStats.reduce((sum, day) => sum + parseInt(day.dataValues.count), 0),
                total_resources_in_period: resourceStats.reduce((sum, day) => sum + parseInt(day.dataValues.count), 0),
                most_popular_category: categoryStats[0]?.name || 'N/A'
            }
        });

    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};