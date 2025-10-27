/**
 * Comment Model
 * Implementa el modelo de comentarios para recursos
 */

import { DataTypes, Model } from 'sequelize';
import { Logger } from '../utils/Logger.js';

export class Comment extends Model {
    // Métodos de instancia
    isApproved() {
        return this.status === 'approved';
    }

    isPending() {
        return this.status === 'pending';
    }

    isRejected() {
        return this.status === 'rejected';
    }

    hasReplies() {
        return this.replies && this.replies.length > 0;
    }

    // Aprobar comentario
    async approve() {
        this.status = 'approved';
        this.approved_at = new Date();
        await this.save();
        Logger.info(`Comment approved: ${this.id}`);
    }

    // Rechazar comentario
    async reject(reason) {
        this.status = 'rejected';
        this.rejection_reason = reason;
        await this.save();
        Logger.info(`Comment rejected: ${this.id}`);
    }

    // Obtener datos públicos
    getPublicData() {
        const data = this.toJSON();
        // Remover datos sensibles
        delete data.ip_address;
        delete data.user_agent;
        return data;
    }

    // Métodos estáticos
    static async findByResource(resourceId, options = {}) {
        return await this.findAll({
            where: { 
                resource_id: resourceId,
                status: 'approved',
                parent_id: null // Solo comentarios principales
            },
            include: [
                {
                    model: this,
                    as: 'replies',
                    where: { status: 'approved' },
                    required: false
                }
            ],
            order: [['created_at', options.order || 'DESC']],
            ...options
        });
    }

    static async findPending() {
        return await this.findAll({
            where: { status: 'pending' },
            order: [['created_at', 'ASC']]
        });
    }
}

export const CommentModel = (sequelize) => {
    Comment.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            comment: 'Unique identifier for the comment'
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Comment content is required'
                },
                len: {
                    args: [1, 2000],
                    msg: 'Comment must be between 1 and 2000 characters'
                }
            },
            comment: 'Comment content'
        },
        author_name: {
            type: DataTypes.STRING(100),
            validate: {
                len: {
                    args: [1, 100],
                    msg: 'Author name must be between 1 and 100 characters'
                }
            },
            comment: 'Author name (for anonymous comments)'
        },
        author_email: {
            type: DataTypes.STRING(255),
            validate: {
                isEmail: {
                    msg: 'Must be a valid email address'
                }
            },
            comment: 'Author email (for anonymous comments)'
        },
        status: {
            type: DataTypes.ENUM,
            values: ['pending', 'approved', 'rejected', 'spam'],
            defaultValue: 'pending',
            comment: 'Comment moderation status'
        },
        rating: {
            type: DataTypes.INTEGER,
            validate: {
                min: 1,
                max: 5
            },
            comment: 'Rating given with the comment (1-5)'
        },
        is_anonymous: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Whether the comment is anonymous'
        },
        ip_address: {
            type: DataTypes.INET,
            comment: 'IP address of the commenter'
        },
        user_agent: {
            type: DataTypes.TEXT,
            comment: 'User agent string'
        },
        approved_at: {
            type: DataTypes.DATE,
            comment: 'Timestamp when comment was approved'
        },
        rejection_reason: {
            type: DataTypes.STRING(500),
            comment: 'Reason for rejection'
        },
        like_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: 0
            },
            comment: 'Number of likes'
        },
        dislike_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: 0
            },
            comment: 'Number of dislikes'
        },
        user_id: {
            type: DataTypes.UUID,
            references: {
                model: 'users',
                key: 'id'
            },
            comment: 'ID of the user who made the comment'
        },
        resource_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'resources',
                key: 'id'
            },
            comment: 'ID of the resource being commented on'
        },
        parent_id: {
            type: DataTypes.UUID,
            references: {
                model: 'comments',
                key: 'id'
            },
            comment: 'Parent comment ID for replies'
        },
        metadata: {
            type: DataTypes.JSON,
            defaultValue: {},
            comment: 'Additional metadata'
        }
    }, {
        sequelize,
        modelName: 'Comment',
        tableName: 'comments',
        timestamps: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        indexes: [
            {
                fields: ['resource_id']
            },
            {
                fields: ['user_id']
            },
            {
                fields: ['parent_id']
            },
            {
                fields: ['status']
            },
            {
                fields: ['created_at']
            },
            {
                fields: ['approved_at']
            }
        ],
        hooks: {
            beforeCreate: (comment) => {
                if (comment.status === 'approved' && !comment.approved_at) {
                    comment.approved_at = new Date();
                }
                Logger.info(`Creating comment for resource: ${comment.resource_id}`);
            },
            beforeUpdate: (comment) => {
                if (comment.changed('status') && comment.status === 'approved' && !comment.approved_at) {
                    comment.approved_at = new Date();
                }
            }
        },
        validate: {
            authorRequired() {
                if (!this.user_id && (!this.author_name || !this.author_email)) {
                    throw new Error('Either user_id or author_name and author_email are required');
                }
            },
            approvedAtRequired() {
                if (this.status === 'approved' && !this.approved_at) {
                    throw new Error('approved_at is required when status is approved');
                }
            }
        }
    });

    return Comment;
};