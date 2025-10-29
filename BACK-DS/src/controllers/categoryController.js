import { Category } from '../models/index.js';
import Joi from 'joi';

// Validation schemas
const createCategorySchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().optional(),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
    icon: Joi.string().optional(),
    parent_id: Joi.string().uuid().optional()
});

const updateCategorySchema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().optional(),
    color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
    icon: Joi.string().optional(),
    status: Joi.string().valid('active', 'inactive').optional(),
    sort_order: Joi.number().optional()
});

// Get all categories (tree structure)
export const getCategories = async (req, res) => {
    try {
        const { flat = false, status = 'active' } = req.query;

        if (flat === 'true') {
            // Return flat list
            const categories = await Category.findAll({
                where: { status },
                order: [['level', 'ASC'], ['sort_order', 'ASC'], ['name', 'ASC']]
            });
            return res.json({ categories });
        }

        // Return tree structure
        const categories = await Category.getTreeStructure();
        res.json({ categories });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Get category by ID or slug
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

        const category = await Category.findOne({
            where: isUUID ? { id } : { slug: id },
            include: [
                {
                    model: Category,
                    as: 'parent',
                    attributes: ['id', 'name', 'slug']
                },
                {
                    model: Category,
                    as: 'children',
                    where: { status: 'active' },
                    required: false,
                    attributes: ['id', 'name', 'slug', 'description', 'color', 'icon', 'resources_count']
                }
            ]
        });

        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        res.json({ category });

    } catch (error) {
        console.error('Get category by ID error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Create new category (admin only)
export const createCategory = async (req, res) => {
    const { error } = createCategorySchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: 'Error de validación',
            errors: error.details.map(err => err.message)
        });
    }

    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Solo los administradores pueden crear categorías' });
        }

        const categoryData = { ...req.body };

        // Generate slug if not provided
        if (!categoryData.slug) {
            const category = new Category();
            categoryData.slug = category.generateSlug(categoryData.name);
        }

        const category = await Category.create(categoryData);

        res.status(201).json({
            message: 'Categoría creada exitosamente',
            category
        });

    } catch (error) {
        console.error('Create category error:', error);
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Ya existe una categoría con ese nombre o slug' });
        }

        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Update category (admin only)
export const updateCategory = async (req, res) => {
    const { error } = updateCategorySchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: 'Error de validación',
            errors: error.details.map(err => err.message)
        });
    }

    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Solo los administradores pueden editar categorías' });
        }

        const { id } = req.params;
        const category = await Category.findByPk(id);

        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        await category.update(req.body);

        res.json({
            message: 'Categoría actualizada exitosamente',
            category
        });

    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Delete category (admin only)
export const deleteCategory = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Solo los administradores pueden eliminar categorías' });
        }

        const { id } = req.params;
        const category = await Category.findByPk(id);

        if (!category) {
            return res.status(404).json({ message: 'Categoría no encontrada' });
        }

        // Check if category has resources
        if (category.resources_count > 0) {
            return res.status(409).json({ 
                message: 'No se puede eliminar una categoría que tiene recursos asociados' 
            });
        }

        // Check if category has children
        const childrenCount = await Category.count({ where: { parent_id: id } });
        if (childrenCount > 0) {
            return res.status(409).json({ 
                message: 'No se puede eliminar una categoría que tiene subcategorías' 
            });
        }

        await category.destroy();

        res.json({ message: 'Categoría eliminada exitosamente' });

    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};