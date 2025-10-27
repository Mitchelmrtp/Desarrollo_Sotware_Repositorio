/**
 * CategoryRepository
 * Repositorio específico para operaciones con categorías
 */

import { BaseRepository } from './BaseRepository.js';
import { Logger } from '../utils/Logger.js';
import { getCategory } from '../models/index.js';

export class CategoryRepository extends BaseRepository {
    constructor() {
        super(null);
        this.modelName = 'Category';
    }

    async initialize() {
        this.model = getCategory();
        Logger.info('CategoryRepository initialized');
    }

    // Métodos específicos de categorías
    async findActiveCategories(options = {}) {
        try {
            Logger.info('Finding active categories');
            
            const categories = await this.findAll({
                where: { status: 'active' },
                order: [['sort_order', 'ASC'], ['name', 'ASC']],
                ...options
            });

            return categories;
        } catch (error) {
            Logger.error('Error finding active categories:', error);
            throw error;
        }
    }

    async findRootCategories(options = {}) {
        try {
            Logger.info('Finding root categories');
            
            const categories = await this.findAll({
                where: { 
                    parent_id: null,
                    status: 'active'
                },
                include: [
                    {
                        association: 'children',
                        where: { status: 'active' },
                        required: false,
                        order: [['sort_order', 'ASC'], ['name', 'ASC']]
                    }
                ],
                order: [['sort_order', 'ASC'], ['name', 'ASC']],
                ...options
            });

            return categories;
        } catch (error) {
            Logger.error('Error finding root categories:', error);
            throw error;
        }
    }

    async findBySlug(slug) {
        try {
            Logger.info(`Finding category by slug: ${slug}`);
            
            const category = await this.model.findOne({
                where: { 
                    slug, 
                    status: 'active' 
                },
                include: [
                    {
                        association: 'parent'
                    },
                    {
                        association: 'children',
                        where: { status: 'active' },
                        required: false
                    }
                ]
            });

            return category;
        } catch (error) {
            Logger.error('Error finding category by slug:', error);
            throw error;
        }
    }

    async findCategoryTree() {
        try {
            Logger.info('Building category tree');
            
            const categories = await this.model.findAll({
                where: { status: 'active' },
                order: [
                    ['sort_order', 'ASC'], 
                    ['name', 'ASC'],
                    [{ model: this.model, as: 'children' }, 'sort_order', 'ASC']
                ],
                include: [
                    {
                        association: 'children',
                        where: { status: 'active' },
                        required: false,
                        include: [
                            {
                                association: 'children',
                                where: { status: 'active' },
                                required: false
                            }
                        ]
                    }
                ]
            });

            // Filtrar solo categorías raíz (sin parent_id)
            const rootCategories = categories.filter(cat => !cat.parent_id);
            
            return rootCategories;
        } catch (error) {
            Logger.error('Error building category tree:', error);
            throw error;
        }
    }

    async findByParentId(parentId, options = {}) {
        try {
            Logger.info(`Finding categories by parent ID: ${parentId}`);
            
            const categories = await this.findAll({
                where: { 
                    parent_id: parentId,
                    status: 'active'
                },
                order: [['sort_order', 'ASC'], ['name', 'ASC']],
                ...options
            });

            return categories;
        } catch (error) {
            Logger.error('Error finding categories by parent ID:', error);
            throw error;
        }
    }

    async updateResourceCount(categoryId, transaction = null) {
        try {
            Logger.info(`Updating resource count for category: ${categoryId}`);
            
            // Esto requerirá acceso al ResourceRepository o hacer la consulta directamente
            // Por ahora, implementamos la lógica básica
            const category = await this.findById(categoryId);
            if (!category) {
                throw new Error('Category not found');
            }

            // Aquí necesitaríamos contar los recursos de esta categoría
            // Esto se implementará cuando tengamos acceso al ResourceRepository
            const resourceCount = 0; // Placeholder

            const result = await this.updateById(categoryId, {
                resource_count: resourceCount
            }, transaction);

            return result;
        } catch (error) {
            Logger.error('Error updating resource count:', error);
            throw error;
        }
    }

    async reorderCategories(categoryUpdates, transaction = null) {
        try {
            Logger.info('Reordering categories');
            
            const results = [];
            
            for (const update of categoryUpdates) {
                const result = await this.updateById(update.id, {
                    sort_order: update.sort_order
                }, transaction);
                results.push(result);
            }

            Logger.info('Categories reordered successfully');
            return results;
        } catch (error) {
            Logger.error('Error reordering categories:', error);
            throw error;
        }
    }

    async moveCategory(categoryId, newParentId, transaction = null) {
        try {
            Logger.info(`Moving category ${categoryId} to parent ${newParentId}`);
            
            // Verificar que no se está moviendo a sí mismo o a uno de sus hijos
            if (newParentId) {
                const category = await this.findById(categoryId);
                const newParent = await this.findById(newParentId);
                
                if (!category || !newParent) {
                    throw new Error('Category or new parent not found');
                }

                // Verificar ciclos
                await this.validateNoCyclicReference(categoryId, newParentId);
            }

            const result = await this.updateById(categoryId, {
                parent_id: newParentId
            }, transaction);

            Logger.info(`Category moved successfully: ${categoryId}`);
            return result;
        } catch (error) {
            Logger.error('Error moving category:', error);
            throw error;
        }
    }

    async validateNoCyclicReference(categoryId, parentId) {
        try {
            if (!parentId) return true;
            
            let currentParent = await this.findById(parentId);
            
            while (currentParent) {
                if (currentParent.id === categoryId) {
                    throw new Error('Cannot create cyclic reference');
                }
                
                currentParent = currentParent.parent_id 
                    ? await this.findById(currentParent.parent_id)
                    : null;
            }
            
            return true;
        } catch (error) {
            Logger.error('Error validating cyclic reference:', error);
            throw error;
        }
    }

    async searchCategories(query, options = {}) {
        try {
            Logger.info(`Searching categories with query: ${query}`);
            
            const { Op } = require('sequelize');
            const categories = await this.findAll({
                where: {
                    [Op.or]: [
                        { name: { [Op.iLike]: `%${query}%` } },
                        { description: { [Op.iLike]: `%${query}%` } }
                    ],
                    status: 'active'
                },
                order: [['name', 'ASC']],
                ...options
            });

            return categories;
        } catch (error) {
            Logger.error('Error searching categories:', error);
            throw error;
        }
    }

    async getCategoryStats(categoryId) {
        try {
            Logger.info(`Getting stats for category: ${categoryId}`);
            
            const category = await this.findById(categoryId);
            if (!category) {
                throw new Error('Category not found');
            }

            // Esto requerirá integración con ResourceRepository
            const stats = {
                category: category.toJSON(),
                resource_count: category.resource_count || 0,
                children_count: 0, // Se calculará
                total_resources: 0 // Recursos incluyendo subcategorías
            };

            return stats;
        } catch (error) {
            Logger.error('Error getting category stats:', error);
            throw error;
        }
    }

    // Validación de datos de categoría
    validateCategoryData(categoryData) {
        const errors = [];

        if (!categoryData.name || categoryData.name.length < 2) {
            errors.push('Category name must be at least 2 characters long');
        }

        if (categoryData.slug && !/^[a-z0-9-]+$/.test(categoryData.slug)) {
            errors.push('Slug must contain only lowercase letters, numbers and hyphens');
        }

        if (categoryData.color && !/^#[0-9A-Fa-f]{6}$/.test(categoryData.color)) {
            errors.push('Color must be a valid hex color code');
        }

        if (categoryData.status && !['active', 'inactive'].includes(categoryData.status)) {
            errors.push('Invalid status');
        }

        return errors;
    }

    async createCategory(categoryData, transaction = null) {
        try {
            // Validar datos
            const validationErrors = this.validateCategoryData(categoryData);
            if (validationErrors.length > 0) {
                throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
            }

            // Generar slug si no se proporciona
            if (!categoryData.slug) {
                categoryData.slug = this.generateSlug(categoryData.name);
            }

            // Verificar si el slug ya existe
            const existingCategory = await this.findBySlug(categoryData.slug);
            if (existingCategory) {
                throw new Error('A category with this slug already exists');
            }

            // Validar referencia cíclica si tiene parent_id
            if (categoryData.parent_id) {
                const parent = await this.findById(categoryData.parent_id);
                if (!parent) {
                    throw new Error('Parent category not found');
                }
            }

            const category = await this.create(categoryData, transaction);
            Logger.info(`Category created successfully: ${category.name} (ID: ${category.id})`);

            return category;
        } catch (error) {
            Logger.error('Error creating category:', error);
            throw error;
        }
    }

    generateSlug(name) {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remover acentos
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
}

export default CategoryRepository;