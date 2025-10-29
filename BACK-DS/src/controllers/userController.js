import { User } from '../models/index.js';
import Joi from 'joi';

const updateProfileSchema = Joi.object({
    name: Joi.string().min(2).optional(),
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
    telephone: Joi.string().optional(),
    bio: Joi.string().max(500).optional(),
    preferences: Joi.object().optional()
});

// Get user profile (same as auth profile but separate for organization)
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(user.toSafeObject());
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
    const { error } = updateProfileSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: 'Error de validación',
            errors: error.details.map(err => err.message)
        });
    }

    try {
        const user = await User.findByPk(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const updateData = { ...req.body };

        // Handle avatar upload
        if (req.file) {
            updateData.avatar_url = `/uploads/${req.file.filename}`;
        }

        await user.update(updateData);

        res.json({
            message: 'Perfil actualizado exitosamente',
            user: user.toSafeObject()
        });

    } catch (error) {
        console.error('Update user profile error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Change password
export const changePassword = async (req, res) => {
    const schema = Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().min(6).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: 'Error de validación',
            errors: error.details.map(err => err.message)
        });
    }

    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Verify current password
        const validPassword = await user.comparePassword(currentPassword);
        if (!validPassword) {
            return res.status(401).json({ message: 'Contraseña actual incorrecta' });
        }

        // Update password
        await user.update({ password: newPassword });

        res.json({ message: 'Contraseña actualizada exitosamente' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Get user settings/preferences
export const getUserSettings = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId, {
            attributes: ['preferences', 'id']
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ 
            preferences: user.preferences || {},
            userId: user.id 
        });

    } catch (error) {
        console.error('Get user settings error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Update user settings/preferences
export const updateUserSettings = async (req, res) => {
    const schema = Joi.object({
        preferences: Joi.object().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: 'Error de validación',
            errors: error.details.map(err => err.message)
        });
    }

    try {
        const user = await User.findByPk(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        await user.update({ preferences: req.body.preferences });

        res.json({ 
            message: 'Configuración actualizada exitosamente',
            preferences: user.preferences 
        });

    } catch (error) {
        console.error('Update user settings error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Upload user avatar
export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se proporcionó archivo' });
        }

        const user = await User.findByPk(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Delete old avatar if exists
        if (user.profile_picture) {
            const { deleteFile } = await import('../services/uploadService.js');
            await deleteFile(user.profile_picture);
        }

        // Update user with new avatar path
        const avatarPath = req.file.path.replace(/\\/g, '/').replace(process.cwd().replace(/\\/g, '/') + '/public', '');
        await user.update({ profile_picture: avatarPath });

        res.json({
            message: 'Avatar actualizado exitosamente',
            avatar_url: avatarPath,
            user: user.toSafeObject()
        });

    } catch (error) {
        console.error('Upload avatar error:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};