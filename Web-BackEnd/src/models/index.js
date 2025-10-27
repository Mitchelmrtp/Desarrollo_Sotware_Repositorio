/**
 * Models Index
 * Configuración central de modelos y sus relaciones
 */

import { DatabaseConnectionSingleton } from '../patterns/singletons/DatabaseConnectionSingleton.js';
import { Logger } from '../utils/Logger.js';

// Importar modelos
import { UserModel } from './User.js';
import { ResourceModel } from './Resource.js';
import { CategoryModel } from './Category.js';
import { CommentModel } from './Comment.js';
import { TagModel } from './Tag.js';
import { ResourceTagModel } from './ResourceTag.js';

class ModelManager {
    constructor() {
        this.sequelize = null;
        this.models = {};
        this.isInitialized = false;
    }

    async initialize() {
        try {
            if (this.isInitialized) {
                return this.models;
            }

            Logger.info('Initializing models...');

            // Obtener instancia de base de datos
            const dbInstance = DatabaseConnectionSingleton.getInstance();
            this.sequelize = await dbInstance.getConnection();

            // Inicializar modelos
            this.models = {
                User: UserModel(this.sequelize),
                Resource: ResourceModel(this.sequelize),
                Category: CategoryModel(this.sequelize),
                Comment: CommentModel(this.sequelize),
                Tag: TagModel(this.sequelize),
                ResourceTag: ResourceTagModel(this.sequelize)
            };

            // Configurar relaciones
            this.setupAssociations();

            this.isInitialized = true;
            Logger.info('Models initialized successfully');

            return this.models;
        } catch (error) {
            Logger.error('Error initializing models:', error);
            throw error;
        }
    }

    setupAssociations() {
        Logger.info('Setting up model associations...');

        const { User, Resource, Category, Comment, Tag, ResourceTag } = this.models;

        try {
            // Relaciones de User
            User.hasMany(Resource, {
                foreignKey: 'user_id',
                as: 'resources',
                onDelete: 'CASCADE'
            });

            User.hasMany(Comment, {
                foreignKey: 'user_id',
                as: 'comments',
                onDelete: 'CASCADE'
            });

            // Relaciones de Resource
            Resource.belongsTo(User, {
                foreignKey: 'user_id',
                as: 'author'
            });

            Resource.hasMany(Comment, {
                foreignKey: 'resource_id',
                as: 'comments',
                onDelete: 'CASCADE'
            });

            // Relación many-to-many entre Resource y Tag
            Resource.belongsToMany(Tag, {
                through: ResourceTag,
                foreignKey: 'resource_id',
                otherKey: 'tag_id',
                as: 'tags'
            });

            Tag.belongsToMany(Resource, {
                through: ResourceTag,
                foreignKey: 'tag_id',
                otherKey: 'resource_id',
                as: 'resources'
            });

            // Relaciones de Category (auto-referencial para jerarquía)
            Category.hasMany(Category, {
                foreignKey: 'parent_id',
                as: 'children'
            });

            Category.belongsTo(Category, {
                foreignKey: 'parent_id',
                as: 'parent'
            });

            // Relaciones de Comment (auto-referencial para respuestas)
            Comment.belongsTo(User, {
                foreignKey: 'user_id',
                as: 'author'
            });

            Comment.belongsTo(Resource, {
                foreignKey: 'resource_id',
                as: 'resource'
            });

            Comment.hasMany(Comment, {
                foreignKey: 'parent_id',
                as: 'replies'
            });

            Comment.belongsTo(Comment, {
                foreignKey: 'parent_id',
                as: 'parent'
            });

            // Relaciones de ResourceTag
            ResourceTag.belongsTo(Resource, {
                foreignKey: 'resource_id',
                as: 'resource'
            });

            ResourceTag.belongsTo(Tag, {
                foreignKey: 'tag_id',
                as: 'tag'
            });

            ResourceTag.belongsTo(User, {
                foreignKey: 'created_by',
                as: 'creator'
            });

            Logger.info('Model associations configured successfully');
        } catch (error) {
            Logger.error('Error setting up associations:', error);
            throw error;
        }
    }

    async syncDatabase(options = {}) {
        try {
            Logger.info('Synchronizing database...');

            const syncOptions = {
                force: false,
                alter: false,
                ...options
            };

            if (process.env.NODE_ENV === 'development') {
                syncOptions.alter = true;
            }

            await this.sequelize.sync(syncOptions);
            Logger.info('Database synchronized successfully');
        } catch (error) {
            Logger.error('Error synchronizing database:', error);
            throw error;
        }
    }

    async createDefaultData() {
        try {
            Logger.info('Creating default data...');

            const { User, Category, Tag } = this.models;

            // Crear usuario administrador por defecto
            const adminExists = await User.findOne({ where: { email: 'admin@system.com' } });
            if (!adminExists) {
                await User.create({
                    name: 'System Administrator',
                    email: 'admin@system.com',
                    password: 'Admin123!@#',
                    first_name: 'System',
                    last_name: 'Administrator',
                    role: 'admin',
                    status: 'active',
                    email_verified: true,
                    email_verified_at: new Date()
                });
                Logger.info('Default admin user created');
            }

            // Crear categorías por defecto
            const defaultCategories = [
                { name: 'Matemáticas', slug: 'matematicas', icon: 'calculator', color: '#3498db' },
                { name: 'Ciencias', slug: 'ciencias', icon: 'atom', color: '#2ecc71' },
                { name: 'Lengua', slug: 'lengua', icon: 'book', color: '#e74c3c' },
                { name: 'Historia', slug: 'historia', icon: 'clock', color: '#f39c12' },
                { name: 'Tecnología', slug: 'tecnologia', icon: 'laptop', color: '#9b59b6' }
            ];

            for (const categoryData of defaultCategories) {
                const exists = await Category.findOne({ where: { slug: categoryData.slug } });
                if (!exists) {
                    await Category.create(categoryData);
                }
            }
            Logger.info('Default categories created');

            // Crear etiquetas por defecto
            const defaultTags = [
                'educativo', 'académico', 'estudiantes', 'profesores', 'investigación',
                'tutorial', 'práctica', 'teoría', 'ejercicios', 'examen'
            ];

            for (const tagName of defaultTags) {
                const exists = await Tag.findOne({ where: { name: tagName } });
                if (!exists) {
                    await Tag.create({ name: tagName });
                }
            }
            Logger.info('Default tags created');

            Logger.info('Default data creation completed');
        } catch (error) {
            Logger.error('Error creating default data:', error);
            throw error;
        }
    }

    getModel(modelName) {
        if (!this.isInitialized) {
            throw new Error('Models not initialized. Call initialize() first.');
        }
        
        if (!this.models[modelName]) {
            throw new Error(`Model '${modelName}' not found`);
        }
        
        return this.models[modelName];
    }

    getAllModels() {
        return this.models;
    }

    getSequelize() {
        return this.sequelize;
    }

    async close() {
        if (this.sequelize) {
            await this.sequelize.close();
            Logger.info('Database connection closed');
        }
    }
}

// Singleton instance
let modelManagerInstance = null;

export const getModelManager = () => {
    if (!modelManagerInstance) {
        modelManagerInstance = new ModelManager();
    }
    return modelManagerInstance;
};

// Export individual model getters for convenience
export const getUser = () => getModelManager().getModel('User');
export const getResource = () => getModelManager().getModel('Resource');
export const getCategory = () => getModelManager().getModel('Category');
export const getComment = () => getModelManager().getModel('Comment');
export const getTag = () => getModelManager().getModel('Tag');
export const getResourceTag = () => getModelManager().getModel('ResourceTag');

// Export default
export default getModelManager;