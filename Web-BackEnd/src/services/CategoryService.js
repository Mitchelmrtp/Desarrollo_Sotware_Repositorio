/**
 * CategoryService
 * Lógica de negocio para operaciones con categorías
 */

import { Logger } from '../utils/Logger.js';
import { getCategoryRepository } from '../repositories/index.js';

export class CategoryService {
    constructor() {
        this.categoryRepository = null;
    }

    async initialize() {
        this.categoryRepository = getCategoryRepository();
        Logger.info('CategoryService initialized');
    }

    // Operaciones CRUD básicas
    async createCategory(categoryData, userId) {
        try {
            Logger.info(`Creating category: ${categoryData.name} by user: ${userId}`);

            // Validar datos de entrada
            const validationErrors = this.validateCategoryData(categoryData);
            if (validationErrors.length > 0) {
                throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
            }

            // Verificar permisos (solo administradores pueden crear categorías)
            // Esta validación debería hacerse en el middleware de autorización
            
            const category = await this.categoryRepository.createCategory(categoryData);

            Logger.info(`Category created successfully: ${category.id}`);

            return category;
        } catch (error) {
            Logger.error('Error creating category:', error);
            throw error;
        }
    }

    async getCategoryById(categoryId) {
        try {
            Logger.info(`Getting category: ${categoryId}`);

            const category = await this.categoryRepository.model.findByPk(categoryId, {
                include: [
                    {
                        association: 'parent'
                    },
                    {
                        association: 'children',
                        where: { status: 'active' },
                        required: false,
                        order: [['sort_order', 'ASC'], ['name', 'ASC']]
                    }
                ]
            });

            if (!category) {
                throw new Error('Category not found');
            }

            if (!category.isActive()) {
                throw new Error('Category is not active');
            }

            return category;
        } catch (error) {
            Logger.error('Error getting category:', error);
            throw error;
        }
    }

    async getCategoryBySlug(slug) {
        try {
            Logger.info(`Getting category by slug: ${slug}`);

            const category = await this.categoryRepository.findBySlug(slug);
            
            if (!category) {
                throw new Error('Category not found');
            }

            return category;
        } catch (error) {
            Logger.error('Error getting category by slug:', error);
            throw error;
        }
    }

    async updateCategory(categoryId, updateData, userId) {
        try {
            Logger.info(`Updating category: ${categoryId} by user: ${userId}`);

            // Verificar que la categoría existe
            const category = await this.categoryRepository.findById(categoryId);
            if (!category) {
                throw new Error('Category not found');
            }

            // Verificar permisos (solo administradores pueden actualizar categorías)
            
            // Validar datos de actualización
            const validationErrors = this.validateUpdateData(updateData);
            if (validationErrors.length > 0) {
                throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
            }

            // Si se actualiza el slug, verificar que no exista
            if (updateData.slug && updateData.slug !== category.slug) {
                const existingCategory = await this.categoryRepository.findBySlug(updateData.slug);
                if (existingCategory) {
                    throw new Error('A category with this slug already exists');
                }
            }

            // Si se actualiza parent_id, validar jerarquía
            if (updateData.parent_id !== undefined) {
                if (updateData.parent_id && updateData.parent_id === categoryId) {
                    throw new Error('Category cannot be its own parent');
                }

                if (updateData.parent_id) {
                    await this.categoryRepository.validateNoCyclicReference(categoryId, updateData.parent_id);
                }
            }

            const updatedCategory = await this.categoryRepository.updateById(categoryId, updateData);

            Logger.info(`Category updated successfully: ${categoryId}`);

            return updatedCategory;
        } catch (error) {
            Logger.error('Error updating category:', error);
            throw error;
        }
    }

    async deleteCategory(categoryId, userId) {
        try {
            Logger.info(`Deleting category: ${categoryId} by user: ${userId}`);

            // Verificar que la categoría existe
            const category = await this.categoryRepository.findById(categoryId);
            if (!category) {
                throw new Error('Category not found');
            }

            // Verificar permisos
            
            // Verificar si tiene hijos
            const children = await this.categoryRepository.findByParentId(categoryId);
            if (children.length > 0) {
                throw new Error('Cannot delete category with subcategories');
            }

            // Verificar si tiene recursos (esto requeriría integración con ResourceRepository)
            if (category.resource_count > 0) {
                throw new Error('Cannot delete category with resources');
            }

            // Eliminar categoría
            await this.categoryRepository.deleteById(categoryId);

            Logger.info(`Category deleted successfully: ${categoryId}`);

            return { message: 'Category deleted successfully' };
        } catch (error) {
            Logger.error('Error deleting category:', error);
            throw error;
        }
    }

    // Operaciones de consulta
    async getAllCategories(options = {}) {
        try {
            Logger.info('Getting all active categories');

            const categories = await this.categoryRepository.findActiveCategories({
                include: [
                    {
                        association: 'parent'
                    }
                ],
                ...options
            });

            return categories;
        } catch (error) {
            Logger.error('Error getting all categories:', error);
            throw error;
        }
    }

    async getCategoryTree() {
        try {
            Logger.info('Building category tree');

            const categoryTree = await this.categoryRepository.findCategoryTree();

            return categoryTree;
        } catch (error) {
            Logger.error('Error building category tree:', error);
            throw error;
        }
    }

    async getRootCategories(options = {}) {
        try {
            Logger.info('Getting root categories');

            const rootCategories = await this.categoryRepository.findRootCategories({
                ...options
            });

            return rootCategories;
        } catch (error) {
            Logger.error('Error getting root categories:', error);
            throw error;
        }
    }

    async getSubcategories(parentId, options = {}) {
        try {
            Logger.info(`Getting subcategories for parent: ${parentId}`);

            const subcategories = await this.categoryRepository.findByParentId(parentId, {
                ...options
            });

            return subcategories;
        } catch (error) {
            Logger.error('Error getting subcategories:', error);
            throw error;
        }
    }

    async searchCategories(query, options = {}) {
        try {
            Logger.info(`Searching categories with query: ${query}`);

            const categories = await this.categoryRepository.searchCategories(query, {
                ...options
            });

            return categories;
        } catch (error) {
            Logger.error('Error searching categories:', error);
            throw error;
        }
    }

    // Operaciones de gestión
    async reorderCategories(categoryUpdates, userId) {
        try {
            Logger.info(`Reordering categories by user: ${userId}`);

            // Verificar permisos
            
            // Validar datos de entrada
            if (!Array.isArray(categoryUpdates)) {
                throw new Error('Category updates must be an array');
            }

            for (const update of categoryUpdates) {
                if (!update.id || typeof update.sort_order !== 'number') {
                    throw new Error('Each update must have id and sort_order');
                }
            }

            const results = await this.categoryRepository.reorderCategories(categoryUpdates);

            Logger.info('Categories reordered successfully');

            return results;
        } catch (error) {
            Logger.error('Error reordering categories:', error);
            throw error;
        }
    }

    async moveCategory(categoryId, newParentId, userId) {
        try {
            Logger.info(`Moving category ${categoryId} to parent ${newParentId} by user: ${userId}`);

            // Verificar permisos
            
            // Verificar que la categoría existe
            const category = await this.categoryRepository.findById(categoryId);
            if (!category) {
                throw new Error('Category not found');
            }

            // Si se especifica un nuevo padre, verificar que existe
            if (newParentId) {
                const newParent = await this.categoryRepository.findById(newParentId);
                if (!newParent) {
                    throw new Error('New parent category not found');
                }
            }

            // Mover categoría
            const result = await this.categoryRepository.moveCategory(categoryId, newParentId);

            Logger.info(`Category moved successfully: ${categoryId}`);

            return result;
        } catch (error) {
            Logger.error('Error moving category:', error);
            throw error;
        }
    }

    async activateCategory(categoryId, userId) {
        try {
            Logger.info(`Activating category: ${categoryId} by user: ${userId}`);

            // Verificar permisos
            
            const category = await this.categoryRepository.updateById(categoryId, {
                status: 'active'
            });

            Logger.info(`Category activated successfully: ${categoryId}`);

            return category;
        } catch (error) {
            Logger.error('Error activating category:', error);
            throw error;
        }
    }

    async deactivateCategory(categoryId, userId) {
        try {
            Logger.info(`Deactivating category: ${categoryId} by user: ${userId}`);

            // Verificar permisos
            
            // Verificar si tiene subcategorías activas
            const activeChildren = await this.categoryRepository.findByParentId(categoryId, {
                where: { status: 'active' }
            });

            if (activeChildren.length > 0) {
                throw new Error('Cannot deactivate category with active subcategories');
            }

            const category = await this.categoryRepository.updateById(categoryId, {
                status: 'inactive'
            });

            Logger.info(`Category deactivated successfully: ${categoryId}`);

            return category;
        } catch (error) {
            Logger.error('Error deactivating category:', error);
            throw error;
        }
    }

    async getCategoryStats(categoryId) {
        try {
            Logger.info(`Getting stats for category: ${categoryId}`);

            const stats = await this.categoryRepository.getCategoryStats(categoryId);

            return stats;
        } catch (error) {
            Logger.error('Error getting category stats:', error);
            throw error;
        }
    }

    async updateResourceCount(categoryId) {
        try {
            Logger.info(`Updating resource count for category: ${categoryId}`);

            // Esta función se llamaría cuando se creen/eliminen recursos
            await this.categoryRepository.updateResourceCount(categoryId);

            Logger.info(`Resource count updated for category: ${categoryId}`);

            return { message: 'Resource count updated successfully' };
        } catch (error) {
            Logger.error('Error updating resource count:', error);
            throw error;
        }
    }

    // Métodos de utilidad
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

        if (categoryData.sort_order && typeof categoryData.sort_order !== 'number') {
            errors.push('Sort order must be a number');
        }

        return errors;
    }

    validateUpdateData(updateData) {
        const errors = [];

        if (updateData.name && updateData.name.length < 2) {
            errors.push('Category name must be at least 2 characters long');
        }

        if (updateData.slug && !/^[a-z0-9-]+$/.test(updateData.slug)) {
            errors.push('Slug must contain only lowercase letters, numbers and hyphens');
        }

        if (updateData.color && !/^#[0-9A-Fa-f]{6}$/.test(updateData.color)) {
            errors.push('Color must be a valid hex color code');
        }

        if (updateData.status && !['active', 'inactive'].includes(updateData.status)) {
            errors.push('Invalid status');
        }

        return errors;
    }

    generateCategoryPath(category) {
        const path = [];
        let current = category;

        while (current) {
            path.unshift({
                id: current.id,
                name: current.name,
                slug: current.slug
            });
            current = current.parent;
        }

        return path;
    }
}

export default CategoryService;