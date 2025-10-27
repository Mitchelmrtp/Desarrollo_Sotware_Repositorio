/**
 * Configuration Manager - Singleton Pattern
 * Administrador de configuración usando patrón Singleton
 */

import dotenv from 'dotenv';

class ConfigurationManager {
    constructor() {
        if (ConfigurationManager.instance) {
            return ConfigurationManager.instance;
        }

        // Cargar variables de entorno
        dotenv.config();

        this.config = new Map();
        this.loadEnvironmentVariables();
        
        ConfigurationManager.instance = this;
    }

    static getInstance() {
        if (!ConfigurationManager.instance) {
            ConfigurationManager.instance = new ConfigurationManager();
        }
        return ConfigurationManager.instance;
    }

    loadEnvironmentVariables() {
        // Variables de servidor
        this.set('NODE_ENV', process.env.NODE_ENV || 'development');
        this.set('PORT', process.env.PORT || '3000');
        this.set('HOST', process.env.HOST || 'localhost');
        this.set('SERVER_TYPE', process.env.SERVER_TYPE || 'http');

        // Variables de base de datos
        this.set('DB_HOST', process.env.DB_HOST || 'localhost');
        this.set('DB_PORT', process.env.DB_PORT || '5432');
        this.set('DB_NAME', process.env.DB_NAME || 'academic_resources_db');
        this.set('DB_USER', process.env.DB_USER || 'postgres');
        this.set('DB_PASSWORD', process.env.DB_PASSWORD || '');
        this.set('DB_DIALECT', process.env.DB_DIALECT || 'postgres');

        // Pool de conexiones
        this.set('DB_POOL_MAX', process.env.DB_POOL_MAX || '5');
        this.set('DB_POOL_MIN', process.env.DB_POOL_MIN || '0');
        this.set('DB_POOL_ACQUIRE', process.env.DB_POOL_ACQUIRE || '30000');
        this.set('DB_POOL_IDLE', process.env.DB_POOL_IDLE || '10000');

        // JWT
        this.set('JWT_SECRET', process.env.JWT_SECRET || 'default-secret-key-change-in-production');
        this.set('JWT_EXPIRATION', process.env.JWT_EXPIRATION || '24h');
        this.set('JWT_REFRESH_EXPIRATION', process.env.JWT_REFRESH_EXPIRATION || '7d');

        // CORS
        this.set('FRONTEND_URL', process.env.FRONTEND_URL || 'http://localhost:5001');
        this.set('ALLOWED_ORIGINS', process.env.ALLOWED_ORIGINS || 'http://localhost:5001,http://localhost:3000');

        // Rate Limiting
        this.set('RATE_LIMIT_WINDOW_MS', process.env.RATE_LIMIT_WINDOW_MS || '900000');
        this.set('RATE_LIMIT_MAX_REQUESTS', process.env.RATE_LIMIT_MAX_REQUESTS || '100');

        // File Upload
        this.set('MAX_FILE_SIZE', process.env.MAX_FILE_SIZE || '10485760');
        this.set('UPLOAD_PATH', process.env.UPLOAD_PATH || './uploads');
        this.set('ALLOWED_FILE_TYPES', process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,application/pdf');

        // Email
        this.set('EMAIL_HOST', process.env.EMAIL_HOST || 'smtp.gmail.com');
        this.set('EMAIL_PORT', process.env.EMAIL_PORT || '587');
        this.set('EMAIL_SECURE', process.env.EMAIL_SECURE || 'false');
        this.set('EMAIL_USER', process.env.EMAIL_USER || '');
        this.set('EMAIL_PASSWORD', process.env.EMAIL_PASSWORD || '');

        // Redis
        this.set('REDIS_HOST', process.env.REDIS_HOST || 'localhost');
        this.set('REDIS_PORT', process.env.REDIS_PORT || '6379');
        this.set('REDIS_PASSWORD', process.env.REDIS_PASSWORD || '');

        // Logging
        this.set('LOG_LEVEL', process.env.LOG_LEVEL || 'info');
        this.set('LOG_FILE_PATH', process.env.LOG_FILE_PATH || './logs/app.log');
        this.set('LOG_MAX_SIZE', process.env.LOG_MAX_SIZE || '10m');
        this.set('LOG_MAX_FILES', process.env.LOG_MAX_FILES || '5');

        // Security
        this.set('HELMET_ENABLED', process.env.HELMET_ENABLED || 'true');
        this.set('TRUST_PROXY', process.env.TRUST_PROXY || 'false');

        // Features
        this.set('ENABLE_SWAGGER', process.env.ENABLE_SWAGGER || 'true');
        this.set('ENABLE_REQUEST_LOGGING', process.env.ENABLE_REQUEST_LOGGING || 'true');
        this.set('ENABLE_DETAILED_ERRORS', process.env.ENABLE_DETAILED_ERRORS || 'true');

        // SSL (para HTTPS)
        this.set('SSL_KEY_PATH', process.env.SSL_KEY_PATH || '');
        this.set('SSL_CERT_PATH', process.env.SSL_CERT_PATH || '');

        // API Documentation
        this.set('API_TITLE', process.env.API_TITLE || 'Academic Resources API');
        this.set('API_VERSION', process.env.API_VERSION || '1.0.0');
        this.set('API_DESCRIPTION', process.env.API_DESCRIPTION || 'API for managing academic resources');

        // Cache
        this.set('CACHE_TTL', process.env.CACHE_TTL || '3600');
        this.set('CACHE_ENABLED', process.env.CACHE_ENABLED || 'true');

        // Pagination
        this.set('DEFAULT_PAGE_SIZE', process.env.DEFAULT_PAGE_SIZE || '10');
        this.set('MAX_PAGE_SIZE', process.env.MAX_PAGE_SIZE || '100');
    }

    get(key, defaultValue = null) {
        return this.config.get(key) || defaultValue;
    }

    getBoolean(key, defaultValue = false) {
        const value = this.get(key, defaultValue.toString());
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return defaultValue;
    }

    set(key, value) {
        this.config.set(key, value);
    }

    has(key) {
        return this.config.has(key);
    }

    getAll() {
        return Object.fromEntries(this.config);
    }

    // Obtener configuración de base de datos
    getDatabaseConfig() {
        return {
            host: this.get('DB_HOST'),
            port: parseInt(this.get('DB_PORT')),
            database: this.get('DB_NAME'),
            username: this.get('DB_USER'),
            password: this.get('DB_PASSWORD'),
            dialect: this.get('DB_DIALECT'),
            pool: {
                max: parseInt(this.get('DB_POOL_MAX')),
                min: parseInt(this.get('DB_POOL_MIN')),
                acquire: parseInt(this.get('DB_POOL_ACQUIRE')),
                idle: parseInt(this.get('DB_POOL_IDLE'))
            },
            logging: this.get('NODE_ENV') === 'development' ? console.log : false
        };
    }

    // Obtener configuración de JWT
    getJWTConfig() {
        return {
            secret: this.get('JWT_SECRET'),
            expiresIn: this.get('JWT_EXPIRATION'),
            refreshExpiresIn: this.get('JWT_REFRESH_EXPIRATION')
        };
    }

    // Obtener configuración de CORS
    getCORSConfig() {
        const allowedOrigins = this.get('ALLOWED_ORIGINS').split(',').map(origin => origin.trim());
        return {
            origin: allowedOrigins,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
        };
    }

    // Obtener configuración de Rate Limiting
    getRateLimitConfig() {
        return {
            windowMs: parseInt(this.get('RATE_LIMIT_WINDOW_MS')),
            max: parseInt(this.get('RATE_LIMIT_MAX_REQUESTS')),
            message: {
                error: 'Too many requests',
                message: 'Rate limit exceeded, please try again later'
            }
        };
    }

    // Validar configuración crítica
    validateConfiguration() {
        const requiredVars = [
            'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD',
            'JWT_SECRET'
        ];

        const missing = requiredVars.filter(varName => !this.get(varName));

        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }

        // Validar longitud de JWT_SECRET
        const jwtSecret = this.get('JWT_SECRET');
        if (jwtSecret.length < 32) {
            console.warn('⚠️  JWT_SECRET should be at least 32 characters long for security');
        }

        return true;
    }

    // Modo desarrollo
    isDevelopment() {
        return this.get('NODE_ENV') === 'development';
    }

    // Modo producción
    isProduction() {
        return this.get('NODE_ENV') === 'production';
    }

    // Modo test
    isTest() {
        return this.get('NODE_ENV') === 'test';
    }
}

export { ConfigurationManager };