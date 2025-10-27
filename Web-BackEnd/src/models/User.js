/**
 * User Model
 * Implementa el modelo de usuario con validaciones y métodos de instancia
 */

import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import { Logger } from '../utils/Logger.js';

export class User extends Model {
    // Métodos de instancia
    async validatePassword(password) {
        try {
            return await bcrypt.compare(password, this.password);
        } catch (error) {
            Logger.error('Error validating password:', error);
            return false;
        }
    }

    getFullName() {
        return `${this.first_name || ''} ${this.last_name || ''}`.trim() || this.name;
    }

    // Método para obtener datos públicos (sin contraseña)
    getPublicData() {
        const { password, ...publicData } = this.toJSON();
        return publicData;
    }

    // Verificar si el usuario tiene un rol específico
    hasRole(role) {
        return this.role === role;
    }

    // Verificar si el usuario es administrador
    isAdmin() {
        return this.hasRole('admin');
    }

    // Verificar si el usuario está activo
    isActive() {
        return this.status === 'active';
    }

    // Métodos estáticos
    static async hashPassword(password) {
        try {
            const saltRounds = 12;
            return await bcrypt.hash(password, saltRounds);
        } catch (error) {
            Logger.error('Error hashing password:', error);
            throw new Error('Error processing password');
        }
    }

    static async findByEmail(email) {
        return await this.findOne({
            where: { email: email.toLowerCase() }
        });
    }

    static async findActiveUsers() {
        return await this.findAll({
            where: { status: 'active' }
        });
    }
}

export const UserModel = (sequelize) => {
    User.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            comment: 'Unique identifier for the user'
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Name is required'
                },
                len: {
                    args: [2, 100],
                    msg: 'Name must be between 2 and 100 characters'
                }
            },
            comment: 'User display name'
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: {
                msg: 'Email address is already in use'
            },
            validate: {
                isEmail: {
                    msg: 'Must be a valid email address'
                },
                notEmpty: {
                    msg: 'Email is required'
                }
            },
            set(value) {
                this.setDataValue('email', value.toLowerCase());
            },
            comment: 'User email address (unique)'
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Password is required'
                },
                len: {
                    args: [8, 128],
                    msg: 'Password must be between 8 and 128 characters'
                }
            },
            comment: 'Hashed password'
        },
        first_name: {
            type: DataTypes.STRING(50),
            validate: {
                len: {
                    args: [0, 50],
                    msg: 'First name cannot exceed 50 characters'
                }
            },
            comment: 'User first name'
        },
        last_name: {
            type: DataTypes.STRING(50),
            validate: {
                len: {
                    args: [0, 50],
                    msg: 'Last name cannot exceed 50 characters'
                }
            },
            comment: 'User last name'
        },
        telephone: {
            type: DataTypes.STRING(20),
            validate: {
                is: {
                    args: /^[\+]?[0-9\s\-\(\)]{7,20}$/,
                    msg: 'Invalid telephone format'
                }
            },
            comment: 'User telephone number'
        },
        role: {
            type: DataTypes.ENUM,
            values: ['admin', 'teacher', 'student', 'user'],
            allowNull: false,
            defaultValue: 'user',
            validate: {
                isIn: {
                    args: [['admin', 'teacher', 'student', 'user']],
                    msg: 'Role must be one of: admin, teacher, student, user'
                }
            },
            comment: 'User role in the system'
        },
        status: {
            type: DataTypes.ENUM,
            values: ['active', 'inactive', 'pending', 'suspended'],
            allowNull: false,
            defaultValue: 'active',
            comment: 'User account status'
        },
        avatar_url: {
            type: DataTypes.TEXT,
            validate: {
                isUrl: {
                    msg: 'Avatar URL must be a valid URL'
                }
            },
            comment: 'URL to user avatar image'
        },
        email_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Whether email has been verified'
        },
        email_verified_at: {
            type: DataTypes.DATE,
            comment: 'Timestamp when email was verified'
        },
        last_login: {
            type: DataTypes.DATE,
            comment: 'Timestamp of last login'
        },
        login_attempts: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                min: 0
            },
            comment: 'Number of failed login attempts'
        },
        locked_until: {
            type: DataTypes.DATE,
            comment: 'Account locked until this timestamp'
        },
        preferences: {
            type: DataTypes.JSON,
            defaultValue: {},
            comment: 'User preferences and settings'
        },
        metadata: {
            type: DataTypes.JSON,
            defaultValue: {},
            comment: 'Additional metadata for the user'
        }
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        indexes: [
            {
                unique: true,
                fields: ['email']
            },
            {
                fields: ['role']
            },
            {
                fields: ['status']
            },
            {
                fields: ['created_at']
            }
        ],
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    user.password = await User.hashPassword(user.password);
                }
                Logger.info(`Creating user: ${user.email}`);
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    user.password = await User.hashPassword(user.password);
                }
            },
            afterCreate: (user) => {
                Logger.info(`User created successfully: ${user.email} (ID: ${user.id})`);
            }
        },
        validate: {
            emailVerifiedAtRequiresVerified() {
                if (this.email_verified_at && !this.email_verified) {
                    throw new Error('email_verified must be true when email_verified_at is set');
                }
            }
        }
    });

    return User;
};