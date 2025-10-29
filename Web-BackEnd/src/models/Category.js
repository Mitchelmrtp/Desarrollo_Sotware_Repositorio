/**
 * Category Model
 * Implementa el modelo de categorías para organizar recursos
 */

import { DataTypes, Model } from 'sequelize';
import { Logger } from '../utils/Logger.js';

export class Category extends Model {
    // Métodos de instancia
    isActive() {
        return this.status === 'active';
    }

    hasChildren() {
        return this.children && this.children.length > 0;
    }

    getFullPath() {
        if (this.parent) {
            return `${this.parent.getFullPath()} / ${this.name}`;
        }
        return this.name;
    }

    // Métodos estáticos
    static async findActive() {
        return await this.findAll({
            where: { status: 'active' },
            order: [['sort_order', 'ASC'], ['name', 'ASC']]
        });
    }

    static async findRootCategories() {
        return await this.findAll({
            where: { 
                parent_id: null,
                status: 'active'
            },
            order: [['sort_order', 'ASC'], ['name', 'ASC']]
        });
    }

    static async findBySlug(slug) {
        return await this.findOne({
            where: { slug, status: 'active' }
        });
    }
}

export const CategoryModel = (sequelize) => {
    Category.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            comment: 'Unique identifier for the category'
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Category name is required'
                },
                len: {
                    args: [2, 100],
                    msg: 'Category name must be between 2 and 100 characters'
                }
            },
            comment: 'Category name'
        },
        slug: {
            type: DataTypes.STRING(120),
            allowNull: false,
            unique: true,
            validate: {
                is: {
                    args: /^[a-z0-9-]+$/,
                    msg: 'Slug must contain only lowercase letters, numbers and hyphens'
                }
            },
            comment: 'URL-friendly category identifier'
        },
        description: {
            type: DataTypes.TEXT,
            comment: 'Category description'
        },
        icon: {
            type: DataTypes.STRING(50),
            comment: 'Icon class or name for the category'
        },
        color: {
            type: DataTypes.STRING(7),
            validate: {
                is: {
                    args: /^#[0-9A-Fa-f]{6}$/,
                    msg: 'Color must be a valid hex color code'
                }
            },
            comment: 'Category color in hex format'
        },
        sort_order: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Sort order for displaying categories'
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active',
            comment: 'Category status'
        },
        resource_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: 0
            },
            comment: 'Number of resources in this category'
        },
        parent_id: {
            type: DataTypes.UUID,
            references: {
                model: 'categories',
                key: 'id'
            },
            comment: 'Parent category ID for hierarchical structure'
        },
        metadata: {
            type: DataTypes.JSON,
            defaultValue: {},
            comment: 'Additional metadata for the category'
        }
    }, {
        sequelize,
        modelName: 'Category',
        tableName: 'categories',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['slug']
            },
            {
                fields: ['parent_id']
            },
            {
                fields: ['status']
            },
            {
                fields: ['sort_order']
            }
        ],
        hooks: {
            beforeCreate: (category) => {
                if (!category.slug) {
                    category.slug = category.name
                        .toLowerCase()
                        .replace(/[^a-z0-9]/g, '-')
                        .replace(/-+/g, '-')
                        .replace(/^-|-$/g, '');
                }
                Logger.info(`Creating category: ${category.name}`);
            },
            beforeUpdate: (category) => {
                if (category.changed('name') && !category.changed('slug')) {
                    category.slug = category.name
                        .toLowerCase()
                        .replace(/[^a-z0-9]/g, '-')
                        .replace(/-+/g, '-')
                        .replace(/^-|-$/g, '');
                }
            }
        }
    });

    return Category;
};