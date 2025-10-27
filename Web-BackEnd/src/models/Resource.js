/**
 * Resource Model
 * Implementa el modelo de recurso académico con validaciones completas
 */

import { DataTypes, Model } from 'sequelize';
import { Logger } from '../utils/Logger.js';

export class Resource extends Model {
    // Métodos de instancia
    isPublic() {
        return this.visibility === 'public';
    }

    isPrivate() {
        return this.visibility === 'private';
    }

    isRestricted() {
        return this.visibility === 'restricted';
    }

    isPublished() {
        return this.status === 'published';
    }

    isDraft() {
        return this.status === 'draft';
    }

    isArchived() {
        return this.status === 'archived';
    }

    // Incrementar contador de descargas
    async incrementDownloads() {
        await this.increment('download_count');
        Logger.info(`Download count incremented for resource: ${this.id}`);
    }

    // Incrementar contador de vistas
    async incrementViews() {
        await this.increment('view_count');
    }

    // Obtener datos públicos del recurso
    getPublicData() {
        const data = this.toJSON();
        // Remover datos sensibles si es necesario
        return data;
    }

    // Verificar si el usuario puede acceder al recurso
    canAccess(user) {
        if (this.isPublic()) return true;
        if (!user) return false;
        if (user.isAdmin()) return true;
        if (this.user_id === user.id) return true;
        return false;
    }

    // Métodos estáticos
    static async findByCategory(category) {
        return await this.findAll({
            where: { 
                category,
                status: 'published',
                visibility: 'public'
            }
        });
    }

    static async findBySubject(subject) {
        return await this.findAll({
            where: { 
                subject,
                status: 'published'
            }
        });
    }

    static async findPublished() {
        return await this.findAll({
            where: { 
                status: 'published',
                visibility: 'public'
            }
        });
    }

    static async search(query) {
        const { Op } = require('sequelize');
        return await this.findAll({
            where: {
                [Op.or]: [
                    { title: { [Op.iLike]: `%${query}%` } },
                    { description: { [Op.iLike]: `%${query}%` } },
                    { tags: { [Op.contains]: [query] } }
                ],
                status: 'published',
                visibility: 'public'
            }
        });
    }
}

export const ResourceModel = (sequelize) => {
    Resource.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            comment: 'Unique identifier for the resource'
        },
        title: {
            type: DataTypes.STRING(200),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Title is required'
                },
                len: {
                    args: [3, 200],
                    msg: 'Title must be between 3 and 200 characters'
                }
            },
            comment: 'Resource title'
        },
        description: {
            type: DataTypes.TEXT,
            validate: {
                len: {
                    args: [0, 2000],
                    msg: 'Description cannot exceed 2000 characters'
                }
            },
            comment: 'Resource description'
        },
        content: {
            type: DataTypes.TEXT,
            comment: 'Main resource content'
        },
        type: {
            type: DataTypes.ENUM,
            values: ['document', 'video', 'image', 'audio', 'link', 'presentation', 'spreadsheet', 'other'],
            allowNull: false,
            defaultValue: 'document',
            comment: 'Type of resource'
        },
        category: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Category is required'
                }
            },
            comment: 'Resource category'
        },
        subject: {
            type: DataTypes.STRING(100),
            comment: 'Academic subject'
        },
        level: {
            type: DataTypes.ENUM,
            values: ['beginner', 'intermediate', 'advanced', 'expert'],
            defaultValue: 'beginner',
            comment: 'Difficulty level'
        },
        file_url: {
            type: DataTypes.TEXT,
            validate: {
                isUrl: {
                    msg: 'File URL must be a valid URL'
                }
            },
            comment: 'URL to the resource file'
        },
        file_name: {
            type: DataTypes.STRING(255),
            comment: 'Original file name'
        },
        file_size: {
            type: DataTypes.BIGINT,
            validate: {
                min: 0
            },
            comment: 'File size in bytes'
        },
        file_type: {
            type: DataTypes.STRING(100),
            comment: 'MIME type of the file'
        },
        thumbnail_url: {
            type: DataTypes.TEXT,
            validate: {
                isUrl: {
                    msg: 'Thumbnail URL must be a valid URL'
                }
            },
            comment: 'URL to resource thumbnail'
        },
        external_url: {
            type: DataTypes.TEXT,
            validate: {
                isUrl: {
                    msg: 'External URL must be a valid URL'
                }
            },
            comment: 'External resource URL'
        },
        tags: {
            type: DataTypes.JSON,
            defaultValue: [],
            comment: 'Resource tags for search and categorization'
        },
        visibility: {
            type: DataTypes.ENUM,
            values: ['public', 'private', 'restricted'],
            allowNull: false,
            defaultValue: 'public',
            comment: 'Resource visibility level'
        },
        status: {
            type: DataTypes.ENUM,
            values: ['draft', 'published', 'archived', 'under_review'],
            allowNull: false,
            defaultValue: 'draft',
            comment: 'Resource publication status'
        },
        download_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: 0
            },
            comment: 'Number of downloads'
        },
        view_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: 0
            },
            comment: 'Number of views'
        },
        like_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: 0
            },
            comment: 'Number of likes'
        },
        rating: {
            type: DataTypes.DECIMAL(3, 2),
            validate: {
                min: 0,
                max: 5
            },
            comment: 'Average rating (0-5)'
        },
        rating_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: 0
            },
            comment: 'Number of ratings'
        },
        language: {
            type: DataTypes.STRING(10),
            defaultValue: 'es',
            validate: {
                isAlpha: {
                    msg: 'Language must contain only letters'
                },
                len: {
                    args: [2, 10],
                    msg: 'Language code must be between 2 and 10 characters'
                }
            },
            comment: 'Resource language code'
        },
        duration: {
            type: DataTypes.INTEGER,
            validate: {
                min: 0
            },
            comment: 'Duration in seconds (for video/audio resources)'
        },
        published_at: {
            type: DataTypes.DATE,
            comment: 'Publication timestamp'
        },
        expires_at: {
            type: DataTypes.DATE,
            comment: 'Expiration timestamp'
        },
        metadata: {
            type: DataTypes.JSON,
            defaultValue: {},
            comment: 'Additional metadata'
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            comment: 'ID of the user who created the resource'
        }
    }, {
        sequelize,
        modelName: 'Resource',
        tableName: 'resources',
        timestamps: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        indexes: [
            {
                fields: ['user_id']
            },
            {
                fields: ['category']
            },
            {
                fields: ['subject']
            },
            {
                fields: ['type']
            },
            {
                fields: ['status']
            },
            {
                fields: ['visibility']
            },
            {
                fields: ['published_at']
            },
            {
                fields: ['created_at']
            },
            {
                fields: ['title']
            },
            {
                name: 'idx_resources_search',
                fields: ['title', 'category', 'status']
            }
        ],
        hooks: {
            beforeCreate: (resource) => {
                if (resource.status === 'published' && !resource.published_at) {
                    resource.published_at = new Date();
                }
                Logger.info(`Creating resource: ${resource.title}`);
            },
            beforeUpdate: (resource) => {
                if (resource.changed('status') && resource.status === 'published' && !resource.published_at) {
                    resource.published_at = new Date();
                }
            },
            afterCreate: (resource) => {
                Logger.info(`Resource created successfully: ${resource.title} (ID: ${resource.id})`);
            }
        },
        validate: {
            publishedAtRequired() {
                if (this.status === 'published' && !this.published_at) {
                    throw new Error('published_at is required when status is published');
                }
            },
            expirationValid() {
                if (this.expires_at && this.expires_at <= new Date()) {
                    throw new Error('Expiration date must be in the future');
                }
            }
        }
    });

    return Resource;
};