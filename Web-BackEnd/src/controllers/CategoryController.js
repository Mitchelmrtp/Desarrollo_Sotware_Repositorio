/**
 * CategoryController
 * Controlador para operaciones de categorías
 */

import { Logger } from '../utils/Logger.js';
import { getCategoryService } from '../services/index.js';

export class CategoryController {
    constructor() {
        this.categoryService = null;
    }

    async initialize() {
        this.categoryService = getCategoryService();
        Logger.info('CategoryController initialized');
    }

    // Operaciones CRUD
    async createCategory(req, res, next) {
        try {
            const userId = req.user.id;
            const categoryData = req.body;

            const category = await this.categoryService.createCategory(categoryData, userId);

            res.status(201).json({
                success: true,
                message: 'Category created successfully',
                data: category
            });
        } catch (error) {
            Logger.error('Create category error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to create category'
            });
        }
    }

    async getCategoryById(req, res, next) {
        try {
            const { id } = req.params;

            const category = await this.categoryService.getCategoryById(id);

            res.json({
                success: true,
                data: category
            });
        } catch (error) {
            Logger.error('Get category by ID error:', error);
            
            if (error.message === 'Category not found' || error.message === 'Category is not active') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to get category'
                });
            }
        }
    }

    async getCategoryBySlug(req, res, next) {
        try {
            const { slug } = req.params;

            const category = await this.categoryService.getCategoryBySlug(slug);

            res.json({
                success: true,
                data: category
            });
        } catch (error) {
            Logger.error('Get category by slug error:', error);
            
            if (error.message === 'Category not found') {
                res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to get category'
                });
            }
        }
    }

    async updateCategory(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const updateData = req.body;

            const category = await this.categoryService.updateCategory(id, updateData, userId);

            res.json({
                success: true,
                message: 'Category updated successfully',
                data: category
            });
        } catch (error) {
            Logger.error('Update category error:', error);
            
            if (error.message === 'Category not found') {
                res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to update category'
                });
            }
        }
    }

    async deleteCategory(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const result = await this.categoryService.deleteCategory(id, userId);

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            Logger.error('Delete category error:', error);
            
            if (error.message === 'Category not found') {
                res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            } else if (error.message.includes('Cannot delete category')) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to delete category'
                });
            }
        }
    }

    // Consultas
    async getAllCategories(req, res, next) {
        try {
            const { include_children = false } = req.query;

            const options = {};
            if (include_children === 'true') {
                options.include = [
                    {
                        association: 'children',
                        where: { status: 'active' },
                        required: false
                    }
                ];
            }

            const categories = await this.categoryService.getAllCategories(options);

            res.json({
                success: true,
                data: categories
            });
        } catch (error) {
            Logger.error('Get all categories error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get categories'
            });
        }
    }

    async getCategoryTree(req, res, next) {
        try {
            const categoryTree = await this.categoryService.getCategoryTree();

            res.json({
                success: true,
                data: categoryTree
            });
        } catch (error) {
            Logger.error('Get category tree error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get category tree'
            });
        }
    }

    async getRootCategories(req, res, next) {
        try {
            const { include_children = false } = req.query;

            const options = {};
            if (include_children === 'true') {
                options.include = [
                    {
                        association: 'children',
                        where: { status: 'active' },
                        required: false
                    }
                ];
            }

            const rootCategories = await this.categoryService.getRootCategories(options);

            res.json({
                success: true,
                data: rootCategories
            });
        } catch (error) {
            Logger.error('Get root categories error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get root categories'
            });
        }
    }

    async getSubcategories(req, res, next) {
        try {
            const { id } = req.params;

            const subcategories = await this.categoryService.getSubcategories(id);

            res.json({
                success: true,
                data: subcategories
            });
        } catch (error) {
            Logger.error('Get subcategories error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get subcategories'
            });
        }
    }

    async searchCategories(req, res, next) {
        try {
            const { q: query } = req.query;

            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
            }

            const categories = await this.categoryService.searchCategories(query);

            res.json({
                success: true,
                data: categories
            });
        } catch (error) {
            Logger.error('Search categories error:', error);
            res.status(500).json({
                success: false,
                message: 'Search failed'
            });
        }
    }

    // Operaciones de gestión
    async reorderCategories(req, res, next) {
        try {
            const userId = req.user.id;
            const { categories } = req.body;

            if (!Array.isArray(categories)) {
                return res.status(400).json({
                    success: false,
                    message: 'Categories must be an array'
                });
            }

            const result = await this.categoryService.reorderCategories(categories, userId);

            res.json({
                success: true,
                message: 'Categories reordered successfully',
                data: result
            });
        } catch (error) {
            Logger.error('Reorder categories error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to reorder categories'
            });
        }
    }

    async moveCategory(req, res, next) {
        try {
            const { id } = req.params;
            const { parent_id } = req.body;
            const userId = req.user.id;

            const result = await this.categoryService.moveCategory(id, parent_id, userId);

            res.json({
                success: true,
                message: 'Category moved successfully',
                data: result
            });
        } catch (error) {
            Logger.error('Move category error:', error);
            
            if (error.message === 'Category not found' || error.message === 'New parent category not found') {
                res.status(404).json({
                    success: false,
                    message: error.message
                });
            } else if (error.message.includes('Cannot create cyclic reference')) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to move category'
                });
            }
        }
    }

    async activateCategory(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const category = await this.categoryService.activateCategory(id, userId);

            res.json({
                success: true,
                message: 'Category activated successfully',
                data: category
            });
        } catch (error) {
            Logger.error('Activate category error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to activate category'
            });
        }
    }

    async deactivateCategory(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const category = await this.categoryService.deactivateCategory(id, userId);

            res.json({
                success: true,
                message: 'Category deactivated successfully',
                data: category
            });
        } catch (error) {
            Logger.error('Deactivate category error:', error);
            
            if (error.message.includes('Cannot deactivate category')) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to deactivate category'
                });
            }
        }
    }

    async getCategoryStats(req, res, next) {
        try {
            const { id } = req.params;

            const stats = await this.categoryService.getCategoryStats(id);

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            Logger.error('Get category stats error:', error);
            
            if (error.message === 'Category not found') {
                res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Failed to get category stats'
                });
            }
        }
    }

    // Middleware de validación
    validateCategoryCreation(req, res, next) {
        const { name } = req.body;

        const errors = [];

        if (!name || name.trim().length < 2) {
            errors.push('Category name must be at least 2 characters long');
        }

        if (req.body.slug && !/^[a-z0-9-]+$/.test(req.body.slug)) {
            errors.push('Slug must contain only lowercase letters, numbers and hyphens');
        }

        if (req.body.color && !/^#[0-9A-Fa-f]{6}$/.test(req.body.color)) {
            errors.push('Color must be a valid hex color code');
        }

        if (req.body.sort_order && typeof req.body.sort_order !== 'number') {
            errors.push('Sort order must be a number');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors
            });
        }

        next();
    }

    validateCategoryUpdate(req, res, next) {
        const errors = [];

        if (req.body.name && req.body.name.trim().length < 2) {
            errors.push('Category name must be at least 2 characters long');
        }

        if (req.body.slug && !/^[a-z0-9-]+$/.test(req.body.slug)) {
            errors.push('Slug must contain only lowercase letters, numbers and hyphens');
        }

        if (req.body.color && !/^#[0-9A-Fa-f]{6}$/.test(req.body.color)) {
            errors.push('Color must be a valid hex color code');
        }

        if (req.body.status && !['active', 'inactive'].includes(req.body.status)) {
            errors.push('Invalid status');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors
            });
        }

        next();
    }

    // Middleware para verificar permisos de administrador
    requireAdminRole(req, res, next) {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Administrator privileges required'
            });
        }
        next();
    }
}

export default CategoryController;