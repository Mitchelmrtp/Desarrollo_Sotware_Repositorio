/**
 * Middleware Collection
 * Middleware adicionales para el manejo de peticiones
 */

import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Logger } from '../utils/Logger.js';
import { ConfigurationManager } from '../utils/ConfigurationManager.js';

export class MiddlewareCollection {
    constructor() {
        this.config = ConfigurationManager.getInstance();
    }

    // Middleware de CORS
    getCorsMiddleware() {
        const corsOptions = {
            origin: (origin, callback) => {
                const allowedOrigins = this.config.get('ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:5001').split(',');
                
                // Permitir requests sin origin (mobile apps, postman, etc.)
                if (!origin) return callback(null, true);
                
                if (allowedOrigins.indexOf(origin) !== -1 || this.config.get('NODE_ENV') === 'development') {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
            maxAge: 86400 // 24 hours
        };

        return cors(corsOptions);
    }

    // Middleware de seguridad
    getSecurityMiddleware() {
        return helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                }
            },
            crossOriginEmbedderPolicy: false
        });
    }

    // Rate limiting
    getRateLimitMiddleware() {
        return rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutos
            max: 100, // máximo 100 requests por IP por ventana
            message: {
                success: false,
                message: 'Too many requests, please try again later'
            },
            standardHeaders: true,
            legacyHeaders: false,
            handler: (req, res) => {
                Logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
                res.status(429).json({
                    success: false,
                    message: 'Too many requests, please try again later'
                });
            }
        });
    }

    // Rate limiting específico para autenticación
    getAuthRateLimitMiddleware() {
        return rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutos
            max: 5, // máximo 5 intentos de login por IP por ventana
            message: {
                success: false,
                message: 'Too many authentication attempts, please try again later'
            },
            standardHeaders: true,
            legacyHeaders: false,
            skipSuccessfulRequests: true,
            handler: (req, res) => {
                Logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
                res.status(429).json({
                    success: false,
                    message: 'Too many authentication attempts, please try again later'
                });
            }
        });
    }

    // Middleware para logging de requests
    getRequestLoggingMiddleware() {
        return (req, res, next) => {
            const start = Date.now();
            
            // Log request
            Logger.info(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);
            
            // Interceptar response para log
            const originalSend = res.send;
            res.send = function(data) {
                const duration = Date.now() - start;
                Logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
                originalSend.call(this, data);
            };
            
            next();
        };
    }

    // Middleware de validación de Content-Type
    getContentTypeValidationMiddleware() {
        return (req, res, next) => {
            if (req.method === 'POST' || req.method === 'PUT') {
                const contentType = req.get('Content-Type');
                if (!contentType || !contentType.includes('application/json')) {
                    return res.status(400).json({
                        success: false,
                        message: 'Content-Type must be application/json'
                    });
                }
            }
            next();
        };
    }

    // Middleware de manejo de errores
    getErrorHandlingMiddleware() {
        return (error, req, res, next) => {
            Logger.error('Unhandled error:', error);

            // Error de validación de Sequelize
            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: error.errors.map(err => err.message)
                });
            }

            // Error de constraint único de Sequelize
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(409).json({
                    success: false,
                    message: 'Resource already exists',
                    field: error.errors[0]?.path
                });
            }

            // Error de foreign key de Sequelize
            if (error.name === 'SequelizeForeignKeyConstraintError') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid reference to related resource'
                });
            }

            // Error de CORS
            if (error.message && error.message.includes('CORS')) {
                return res.status(403).json({
                    success: false,
                    message: 'CORS policy violation'
                });
            }

            // Error de JSON malformado
            if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid JSON format'
                });
            }

            // Error genérico del servidor
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                ...(this.config.get('NODE_ENV') === 'development' && { 
                    error: error.message,
                    stack: error.stack 
                })
            });
        };
    }

    // Middleware para manejar rutas no encontradas
    getNotFoundMiddleware() {
        return (req, res) => {
            Logger.warn(`Route not found: ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
            res.status(404).json({
                success: false,
                message: 'Route not found',
                path: req.originalUrl,
                method: req.method
            });
        };
    }

    // Middleware para sanitizar entrada
    getSanitizationMiddleware() {
        return (req, res, next) => {
            // Función para sanitizar strings
            const sanitizeString = (str) => {
                if (typeof str !== 'string') return str;
                return str.trim().replace(/[<>]/g, '');
            };

            // Función recursiva para sanitizar objetos
            const sanitizeObject = (obj) => {
                if (typeof obj !== 'object' || obj === null) {
                    return typeof obj === 'string' ? sanitizeString(obj) : obj;
                }

                if (Array.isArray(obj)) {
                    return obj.map(sanitizeObject);
                }

                const sanitized = {};
                for (const [key, value] of Object.entries(obj)) {
                    sanitized[key] = sanitizeObject(value);
                }
                return sanitized;
            };

            // Sanitizar body, query y params
            if (req.body) {
                req.body = sanitizeObject(req.body);
            }
            if (req.query) {
                req.query = sanitizeObject(req.query);
            }
            if (req.params) {
                req.params = sanitizeObject(req.params);
            }

            next();
        };
    }

    // Obtener todos los middlewares configurados
    getAllMiddleware() {
        return {
            cors: this.getCorsMiddleware(),
            security: this.getSecurityMiddleware(),
            rateLimit: this.getRateLimitMiddleware(),
            authRateLimit: this.getAuthRateLimitMiddleware(),
            requestLogging: this.getRequestLoggingMiddleware(),
            contentTypeValidation: this.getContentTypeValidationMiddleware(),
            sanitization: this.getSanitizationMiddleware(),
            errorHandling: this.getErrorHandlingMiddleware(),
            notFound: this.getNotFoundMiddleware()
        };
    }
}

export default MiddlewareCollection;