/**
 * UserController
 * Controlador para operaciones de usuarios
 */

import { Logger } from '../utils/Logger.js';
import { getUserService } from '../services/index.js';

export class UserController {
    constructor() {
        this.userService = null;
    }

    async initialize() {
        this.userService = getUserService();
        Logger.info('UserController initialized');
    }

    // Autenticación
    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            const result = await this.userService.authenticateUser(email, password);

            res.json({
                success: true,
                message: 'Login successful',
                data: result
            });
        } catch (error) {
            Logger.error('Login error:', error);
            res.status(401).json({
                success: false,
                message: error.message || 'Authentication failed'
            });
        }
    }

    async register(req, res, next) {
        try {
            const userData = req.body;

            const result = await this.userService.registerUser(userData);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: result
            });
        } catch (error) {
            Logger.error('Registration error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Registration failed'
            });
        }
    }

    async logout(req, res, next) {
        try {
            // En un sistema con JWT, el logout se maneja en el cliente
            // Aquí podríamos agregar el token a una blacklist si fuera necesario
            
            res.json({
                success: true,
                message: 'Logout successful'
            });
        } catch (error) {
            Logger.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Logout failed'
            });
        }
    }

    // Perfil de usuario
    async getProfile(req, res, next) {
        try {
            const userId = req.user.id;

            const profile = await this.userService.getUserProfile(userId);

            res.json({
                success: true,
                data: profile
            });
        } catch (error) {
            Logger.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get profile'
            });
        }
    }

    async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const updateData = req.body;

            const updatedProfile = await this.userService.updateUserProfile(userId, updateData);

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: updatedProfile
            });
        } catch (error) {
            Logger.error('Update profile error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update profile'
            });
        }
    }

    async changePassword(req, res, next) {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password and new password are required'
                });
            }

            const result = await this.userService.changePassword(userId, currentPassword, newPassword);

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            Logger.error('Change password error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to change password'
            });
        }
    }

    async verifyEmail(req, res, next) {
        try {
            const userId = req.user.id;

            const result = await this.userService.verifyEmail(userId);

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            Logger.error('Email verification error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Email verification failed'
            });
        }
    }

    async updatePreferences(req, res, next) {
        try {
            const userId = req.user.id;
            const preferences = req.body;

            const result = await this.userService.updatePreferences(userId, preferences);

            res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            Logger.error('Update preferences error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update preferences'
            });
        }
    }

    // Gestión de usuarios (Admin)
    async getAllUsers(req, res, next) {
        try {
            const { page = 1, limit = 20, role, status } = req.query;
            const offset = (page - 1) * limit;

            const options = {
                limit: parseInt(limit),
                offset: parseInt(offset)
            };

            // Agregar filtros si se proporcionan
            if (role) options.where = { ...options.where, role };
            if (status) options.where = { ...options.where, status };

            const users = await this.userService.getAllUsers(options);

            res.json({
                success: true,
                data: users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: users.length
                }
            });
        } catch (error) {
            Logger.error('Get all users error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get users'
            });
        }
    }

    async getUserById(req, res, next) {
        try {
            const { id } = req.params;

            const user = await this.userService.getUserProfile(id);

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            Logger.error('Get user by ID error:', error);
            res.status(404).json({
                success: false,
                message: error.message || 'User not found'
            });
        }
    }

    async getUsersByRole(req, res, next) {
        try {
            const { role } = req.params;
            const { page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;

            const users = await this.userService.getUsersByRole(role, {
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            res.json({
                success: true,
                data: users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: users.length
                }
            });
        } catch (error) {
            Logger.error('Get users by role error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get users by role'
            });
        }
    }

    async searchUsers(req, res, next) {
        try {
            const { q: query } = req.query;
            const { page = 1, limit = 20 } = req.query;
            const offset = (page - 1) * limit;

            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
            }

            const users = await this.userService.searchUsers(query, {
                limit: parseInt(limit),
                offset: parseInt(offset)
            });

            res.json({
                success: true,
                data: users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: users.length
                }
            });
        } catch (error) {
            Logger.error('Search users error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Search failed'
            });
        }
    }

    async deactivateUser(req, res, next) {
        try {
            const { id } = req.params;

            const user = await this.userService.deactivateUser(id);

            res.json({
                success: true,
                message: 'User deactivated successfully',
                data: user
            });
        } catch (error) {
            Logger.error('Deactivate user error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to deactivate user'
            });
        }
    }

    async activateUser(req, res, next) {
        try {
            const { id } = req.params;

            const user = await this.userService.activateUser(id);

            res.json({
                success: true,
                message: 'User activated successfully',
                data: user
            });
        } catch (error) {
            Logger.error('Activate user error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to activate user'
            });
        }
    }

    // Middleware para validar JWT
    async validateToken(req, res, next) {
        try {
            const token = req.headers.authorization?.split(' ')[1];

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'Access token required'
                });
            }

            const decoded = this.userService.verifyJWT(token);
            req.user = decoded;
            next();
        } catch (error) {
            Logger.error('Token validation error:', error);
            res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    }

    // Middleware para validar roles
    requireRole(roles) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const userRole = req.user.role;
            const allowedRoles = Array.isArray(roles) ? roles : [roles];

            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions'
                });
            }

            next();
        };
    }
}

export default UserController;