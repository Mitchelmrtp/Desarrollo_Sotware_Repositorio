/**
 * UserService
 * Lógica de negocio para operaciones con usuarios
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Logger } from '../utils/Logger.js';
import { ConfigurationManager } from '../utils/ConfigurationManager.js';
import { getUserRepository } from '../repositories/index.js';

export class UserService {
    constructor() {
        this.userRepository = null;
        this.config = ConfigurationManager.getInstance();
    }

    async initialize() {
        this.userRepository = getUserRepository();
        Logger.info('UserService initialized');
    }

    // Autenticación y autorización
    async authenticateUser(email, password) {
        try {
            Logger.info(`Authenticating user: ${email}`);

            // Buscar usuario por email
            const user = await this.userRepository.findByEmail(email);
            if (!user) {
                Logger.warn(`Authentication failed - user not found: ${email}`);
                throw new Error('Invalid credentials');
            }

            // Verificar si la cuenta está bloqueada
            const isLocked = await this.userRepository.isAccountLocked(user.id);
            if (isLocked) {
                Logger.warn(`Authentication failed - account locked: ${email}`);
                throw new Error('Account is temporarily locked');
            }

            // Verificar contraseña
            const isPasswordValid = await user.validatePassword(password);
            if (!isPasswordValid) {
                // Incrementar intentos de login fallidos
                await this.userRepository.incrementLoginAttempts(user.id);
                Logger.warn(`Authentication failed - invalid password: ${email}`);
                throw new Error('Invalid credentials');
            }

            // Verificar si el usuario está activo
            if (!user.isActive()) {
                Logger.warn(`Authentication failed - inactive account: ${email}`);
                throw new Error('Account is not active');
            }

            // Actualizar último login
            await this.userRepository.updateLastLogin(user.id);

            // Generar token JWT
            const token = this.generateJWT(user);

            Logger.info(`User authenticated successfully: ${email}`);
            
            return {
                user: user.getPublicData(),
                token
            };
        } catch (error) {
            Logger.error('Error authenticating user:', error);
            throw error;
        }
    }

    async registerUser(userData) {
        try {
            Logger.info(`Registering new user: ${userData.email}`);

            // Validar datos de entrada
            const validationErrors = this.validateRegistrationData(userData);
            if (validationErrors.length > 0) {
                throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
            }

            // Verificar si el email ya existe
            const existingUser = await this.userRepository.findByEmail(userData.email);
            if (existingUser) {
                throw new Error('Email is already registered');
            }

            // Preparar datos del usuario
            const userToCreate = {
                ...userData,
                status: 'active',
                email_verified: false,
                role: userData.role || 'user'
            };

            // Crear usuario (la contraseña se hasheará automáticamente en el hook del modelo)
            const user = await this.userRepository.createUser(userToCreate);

            Logger.info(`User registered successfully: ${user.email} (ID: ${user.id})`);

            return {
                user: user.getPublicData(),
                message: 'User registered successfully'
            };
        } catch (error) {
            Logger.error('Error registering user:', error);
            throw error;
        }
    }

    async getUserProfile(userId) {
        try {
            Logger.info(`Getting profile for user: ${userId}`);

            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            const profile = {
                ...user.getPublicData(),
                stats: await this.userRepository.getUserStats(userId)
            };

            return profile;
        } catch (error) {
            Logger.error('Error getting user profile:', error);
            throw error;
        }
    }

    async updateUserProfile(userId, updateData) {
        try {
            Logger.info(`Updating profile for user: ${userId}`);

            // Verificar que el usuario existe
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Validar datos de actualización
            const validationErrors = this.validateUpdateData(updateData);
            if (validationErrors.length > 0) {
                throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
            }

            // Si se está actualizando el email, verificar que no exista
            if (updateData.email && updateData.email !== user.email) {
                const existingUser = await this.userRepository.findByEmail(updateData.email);
                if (existingUser) {
                    throw new Error('Email is already in use');
                }
                updateData.email_verified = false;
            }

            // Actualizar usuario
            const updatedUser = await this.userRepository.updateById(userId, updateData);

            Logger.info(`User profile updated successfully: ${userId}`);

            return updatedUser.getPublicData();
        } catch (error) {
            Logger.error('Error updating user profile:', error);
            throw error;
        }
    }

    async changePassword(userId, currentPassword, newPassword) {
        try {
            Logger.info(`Changing password for user: ${userId}`);

            // Verificar usuario actual
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Verificar contraseña actual
            const isCurrentPasswordValid = await user.validatePassword(currentPassword);
            if (!isCurrentPasswordValid) {
                throw new Error('Current password is incorrect');
            }

            // Validar nueva contraseña
            if (newPassword.length < 8) {
                throw new Error('New password must be at least 8 characters long');
            }

            // Hash de la nueva contraseña
            const hashedNewPassword = await bcrypt.hash(newPassword, 12);

            // Actualizar contraseña
            await this.userRepository.updatePassword(userId, hashedNewPassword);

            Logger.info(`Password changed successfully for user: ${userId}`);

            return { message: 'Password changed successfully' };
        } catch (error) {
            Logger.error('Error changing password:', error);
            throw error;
        }
    }

    async verifyEmail(userId) {
        try {
            Logger.info(`Verifying email for user: ${userId}`);

            await this.userRepository.verifyEmail(userId);

            Logger.info(`Email verified successfully for user: ${userId}`);

            return { message: 'Email verified successfully' };
        } catch (error) {
            Logger.error('Error verifying email:', error);
            throw error;
        }
    }

    async updatePreferences(userId, preferences) {
        try {
            Logger.info(`Updating preferences for user: ${userId}`);

            await this.userRepository.updatePreferences(userId, preferences);

            Logger.info(`Preferences updated successfully for user: ${userId}`);

            return { message: 'Preferences updated successfully' };
        } catch (error) {
            Logger.error('Error updating preferences:', error);
            throw error;
        }
    }

    // Gestión de usuarios (Admin)
    async getAllUsers(options = {}) {
        try {
            Logger.info('Getting all users');

            const users = await this.userRepository.findAll({
                attributes: { exclude: ['password'] },
                order: [['created_at', 'DESC']],
                ...options
            });

            return users;
        } catch (error) {
            Logger.error('Error getting all users:', error);
            throw error;
        }
    }

    async getUsersByRole(role, options = {}) {
        try {
            Logger.info(`Getting users by role: ${role}`);

            const users = await this.userRepository.findByRole(role, {
                attributes: { exclude: ['password'] },
                ...options
            });

            return users;
        } catch (error) {
            Logger.error('Error getting users by role:', error);
            throw error;
        }
    }

    async searchUsers(query, options = {}) {
        try {
            Logger.info(`Searching users with query: ${query}`);

            const users = await this.userRepository.searchUsers(query, {
                attributes: { exclude: ['password'] },
                ...options
            });

            return users;
        } catch (error) {
            Logger.error('Error searching users:', error);
            throw error;
        }
    }

    async deactivateUser(userId) {
        try {
            Logger.info(`Deactivating user: ${userId}`);

            const user = await this.userRepository.updateById(userId, {
                status: 'inactive'
            });

            Logger.info(`User deactivated successfully: ${userId}`);

            return user.getPublicData();
        } catch (error) {
            Logger.error('Error deactivating user:', error);
            throw error;
        }
    }

    async activateUser(userId) {
        try {
            Logger.info(`Activating user: ${userId}`);

            const user = await this.userRepository.updateById(userId, {
                status: 'active'
            });

            Logger.info(`User activated successfully: ${userId}`);

            return user.getPublicData();
        } catch (error) {
            Logger.error('Error activating user:', error);
            throw error;
        }
    }

    // Utilidades
    generateJWT(user) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        };

        const secret = this.config.get('JWT_SECRET', 'default-secret-key');
        const expiresIn = this.config.get('JWT_EXPIRES_IN', '24h');

        return jwt.sign(payload, secret, { expiresIn });
    }

    verifyJWT(token) {
        const secret = this.config.get('JWT_SECRET', 'default-secret-key');
        return jwt.verify(token, secret);
    }

    validateRegistrationData(userData) {
        const errors = [];

        if (!userData.name || userData.name.length < 2) {
            errors.push('Name must be at least 2 characters long');
        }

        if (!userData.email || !/\S+@\S+\.\S+/.test(userData.email)) {
            errors.push('Valid email is required');
        }

        if (!userData.password || userData.password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (userData.role && !['admin', 'teacher', 'student', 'user'].includes(userData.role)) {
            errors.push('Invalid role');
        }

        return errors;
    }

    validateUpdateData(updateData) {
        const errors = [];

        if (updateData.name && updateData.name.length < 2) {
            errors.push('Name must be at least 2 characters long');
        }

        if (updateData.email && !/\S+@\S+\.\S+/.test(updateData.email)) {
            errors.push('Valid email format required');
        }

        if (updateData.telephone && !/^[\+]?[0-9\s\-\(\)]{7,20}$/.test(updateData.telephone)) {
            errors.push('Invalid telephone format');
        }

        return errors;
    }
}

export default UserService;