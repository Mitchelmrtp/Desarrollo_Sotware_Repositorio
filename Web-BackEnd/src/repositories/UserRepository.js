/**
 * UserRepository
 * Repositorio específico para operaciones con usuarios
 */

import { BaseRepository } from './BaseRepository.js';
import { Logger } from '../utils/Logger.js';
import { getUser } from '../models/index.js';

export class UserRepository extends BaseRepository {
    constructor() {
        // Se inicializará cuando se llame a initialize()
        super(null);
        this.modelName = 'User';
    }

    async initialize() {
        this.model = getUser();
        Logger.info('UserRepository initialized');
    }

    // Métodos específicos de usuario
    async findByEmail(email) {
        try {
            Logger.info(`Finding user by email: ${email}`);
            
            const user = await this.model.findOne({
                where: { email: email.toLowerCase() }
            });

            return user;
        } catch (error) {
            Logger.error('Error finding user by email:', error);
            throw error;
        }
    }

    async findActiveUsers(options = {}) {
        try {
            Logger.info('Finding active users');
            
            const users = await this.findAll({
                where: { status: 'active' },
                ...options
            });

            return users;
        } catch (error) {
            Logger.error('Error finding active users:', error);
            throw error;
        }
    }

    async findByRole(role, options = {}) {
        try {
            Logger.info(`Finding users by role: ${role}`);
            
            const users = await this.findAll({
                where: { role },
                ...options
            });

            return users;
        } catch (error) {
            Logger.error('Error finding users by role:', error);
            throw error;
        }
    }

    async updatePassword(userId, hashedPassword, transaction = null) {
        try {
            Logger.info(`Updating password for user: ${userId}`);
            
            const result = await this.updateById(userId, {
                password: hashedPassword
            }, transaction);

            Logger.info(`Password updated successfully for user: ${userId}`);
            return result;
        } catch (error) {
            Logger.error('Error updating password:', error);
            throw error;
        }
    }

    async updateLastLogin(userId, transaction = null) {
        try {
            const result = await this.updateById(userId, {
                last_login: new Date(),
                login_attempts: 0
            }, transaction);

            return result;
        } catch (error) {
            Logger.error('Error updating last login:', error);
            throw error;
        }
    }

    async incrementLoginAttempts(userId, transaction = null) {
        try {
            const user = await this.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            const newAttempts = (user.login_attempts || 0) + 1;
            const updates = { login_attempts: newAttempts };

            // Bloquear cuenta después de 5 intentos fallidos
            if (newAttempts >= 5) {
                const lockUntil = new Date();
                lockUntil.setMinutes(lockUntil.getMinutes() + 30); // 30 minutos
                updates.locked_until = lockUntil;
                Logger.warn(`User account locked: ${userId}`);
            }

            const result = await this.updateById(userId, updates, transaction);
            return result;
        } catch (error) {
            Logger.error('Error incrementing login attempts:', error);
            throw error;
        }
    }

    async isAccountLocked(userId) {
        try {
            const user = await this.findById(userId);
            if (!user) {
                return false;
            }

            if (user.locked_until && new Date() < user.locked_until) {
                return true;
            }

            // Si el tiempo de bloqueo ha pasado, limpiar el bloqueo
            if (user.locked_until && new Date() >= user.locked_until) {
                await this.updateById(userId, {
                    locked_until: null,
                    login_attempts: 0
                });
            }

            return false;
        } catch (error) {
            Logger.error('Error checking account lock:', error);
            throw error;
        }
    }

    async verifyEmail(userId, transaction = null) {
        try {
            Logger.info(`Verifying email for user: ${userId}`);
            
            const result = await this.updateById(userId, {
                email_verified: true,
                email_verified_at: new Date()
            }, transaction);

            Logger.info(`Email verified successfully for user: ${userId}`);
            return result;
        } catch (error) {
            Logger.error('Error verifying email:', error);
            throw error;
        }
    }

    async updatePreferences(userId, preferences, transaction = null) {
        try {
            Logger.info(`Updating preferences for user: ${userId}`);
            
            const user = await this.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            const updatedPreferences = {
                ...user.preferences,
                ...preferences
            };

            const result = await this.updateById(userId, {
                preferences: updatedPreferences
            }, transaction);

            return result;
        } catch (error) {
            Logger.error('Error updating preferences:', error);
            throw error;
        }
    }

    async searchUsers(query, options = {}) {
        try {
            Logger.info(`Searching users with query: ${query}`);
            
            const { Op } = require('sequelize');
            const searchOptions = {
                where: {
                    [Op.or]: [
                        { name: { [Op.iLike]: `%${query}%` } },
                        { email: { [Op.iLike]: `%${query}%` } },
                        { first_name: { [Op.iLike]: `%${query}%` } },
                        { last_name: { [Op.iLike]: `%${query}%` } }
                    ]
                },
                ...options
            };

            const users = await this.findAll(searchOptions);
            return users;
        } catch (error) {
            Logger.error('Error searching users:', error);
            throw error;
        }
    }

    async getUserStats(userId) {
        try {
            Logger.info(`Getting stats for user: ${userId}`);
            
            const user = await this.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Obtener estadísticas relacionadas (esto requerirá otros repositorios)
            // Por ahora retornamos datos básicos del usuario
            const stats = {
                user: user.getPublicData(),
                resources_count: 0, // Se calculará cuando tengamos ResourceRepository
                comments_count: 0,  // Se calculará cuando tengamos CommentRepository
                last_activity: user.last_login || user.updated_at
            };

            return stats;
        } catch (error) {
            Logger.error('Error getting user stats:', error);
            throw error;
        }
    }

    // Método para obtener usuarios con recursos
    async findUsersWithResources(options = {}) {
        try {
            Logger.info('Finding users with resources');
            
            const users = await this.model.findAll({
                include: [
                    {
                        association: 'resources',
                        required: true
                    }
                ],
                ...options
            });

            return users;
        } catch (error) {
            Logger.error('Error finding users with resources:', error);
            throw error;
        }
    }

    // Método para validar datos de usuario antes de crear/actualizar
    validateUserData(userData) {
        const errors = [];

        if (!userData.name || userData.name.length < 2) {
            errors.push('Name must be at least 2 characters long');
        }

        if (!userData.email || !/\S+@\S+\.\S+/.test(userData.email)) {
            errors.push('Valid email is required');
        }

        if (userData.password && userData.password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (userData.role && !['admin', 'teacher', 'student', 'user'].includes(userData.role)) {
            errors.push('Invalid role');
        }

        return errors;
    }

    // Método para crear usuario con validaciones
    async createUser(userData, transaction = null) {
        try {
            // Validar datos
            const validationErrors = this.validateUserData(userData);
            if (validationErrors.length > 0) {
                throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
            }

            // Verificar si el email ya existe
            const existingUser = await this.findByEmail(userData.email);
            if (existingUser) {
                throw new Error('Email already exists');
            }

            // Crear usuario
            const user = await this.create(userData, transaction);
            Logger.info(`User created successfully: ${user.email} (ID: ${user.id})`);

            return user;
        } catch (error) {
            Logger.error('Error creating user:', error);
            throw error;
        }
    }
}

export default UserRepository;