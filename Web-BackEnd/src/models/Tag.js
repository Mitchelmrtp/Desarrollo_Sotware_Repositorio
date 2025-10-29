/**
 * Tag Model
 * Implementa el modelo de etiquetas para clasificar recursos
 */

import { DataTypes, Model } from 'sequelize';
import { Logger } from '../utils/Logger.js';

export class Tag extends Model {
    // Métodos de instancia
    isActive() {
        return this.status === 'active';
    }

    // Incrementar contador de uso
    async incrementUsage() {
        await this.increment('usage_count');
    }

    // Métodos estáticos
    static async findPopular(limit = 20) {
        return await this.findAll({
            where: { status: 'active' },
            order: [['usage_count', 'DESC']],
            limit
        });
    }

    static async findByName(name) {
        return await this.findOne({
            where: { 
                name: name.toLowerCase(),
                status: 'active'
            }
        });
    }

    static async search(query) {
        const { Op } = require('sequelize');
        return await this.findAll({
            where: {
                name: { [Op.iLike]: `%${query.toLowerCase()}%` },
                status: 'active'
            },
            order: [['usage_count', 'DESC']]
        });
    }
}

export const TagModel = (sequelize) => {
    Tag.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            comment: 'Unique identifier for the tag'
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: {
                    msg: 'Tag name is required'
                },
                len: {
                    args: [1, 50],
                    msg: 'Tag name must be between 1 and 50 characters'
                },
                is: {
                    args: /^[a-z0-9áéíóúüñ\s-]+$/i,
                    msg: 'Tag name contains invalid characters'
                }
            },
            set(value) {
                this.setDataValue('name', value.toLowerCase().trim());
            },
            comment: 'Tag name (unique)'
        },
        display_name: {
            type: DataTypes.STRING(50),
            comment: 'Display name for the tag'
        },
        description: {
            type: DataTypes.TEXT,
            comment: 'Tag description'
        },
        color: {
            type: DataTypes.STRING(7),
            validate: {
                is: {
                    args: /^#[0-9A-Fa-f]{6}$/,
                    msg: 'Color must be a valid hex color code'
                }
            },
            comment: 'Tag color in hex format'
        },
        usage_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: 0
            },
            comment: 'Number of times this tag has been used'
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active',
            comment: 'Tag status'
        },
        is_featured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Whether this tag is featured'
        },
        metadata: {
            type: DataTypes.JSON,
            defaultValue: {},
            comment: 'Additional metadata'
        }
    }, {
        sequelize,
        modelName: 'Tag',
        tableName: 'tags',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['name']
            },
            {
                fields: ['status']
            },
            {
                fields: ['usage_count']
            },
            {
                fields: ['is_featured']
            }
        ],
        hooks: {
            beforeCreate: (tag) => {
                if (!tag.display_name) {
                    tag.display_name = tag.name.charAt(0).toUpperCase() + tag.name.slice(1);
                }
                Logger.info(`Creating tag: ${tag.name}`);
            },
            beforeUpdate: (tag) => {
                if (tag.changed('name') && !tag.changed('display_name')) {
                    tag.display_name = tag.name.charAt(0).toUpperCase() + tag.name.slice(1);
                }
            }
        }
    });

    return Tag;
};