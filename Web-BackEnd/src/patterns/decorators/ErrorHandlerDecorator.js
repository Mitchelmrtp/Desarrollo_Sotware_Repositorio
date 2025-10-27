// 🎭 Error Handler Decorator - Decorator Pattern for error handling
// Following Decorator Pattern and Single Responsibility Principle

import { Logger } from '../../utils/Logger.js';
import { ConfigurationManager } from '../../config/ConfigurationManager.js';

/**
 * 🎭 Error Handler Decorator
 * Decorates Express app with comprehensive error handling
 */
export class ErrorHandlerDecorator {
  constructor(app) {
    this.app = app;
    this.logger = Logger.getInstance();
    this.config = ConfigurationManager.getInstance();
  }

  /**
   * Apply error handling to the app
   */
  apply() {
    // 404 Handler
    this.add404Handler();
    
    // Global error handler
    this.addGlobalErrorHandler();
    
    // Unhandled rejection handler
    this.addUnhandledRejectionHandler();
    
    // Uncaught exception handler
    this.addUncaughtExceptionHandler();

    this.logger.info('🎭 Error handling decorators applied');
  }

  /**
   * Add 404 Not Found handler
   * @private
   */
  add404Handler() {
    this.app.use((req, res, next) => {
      const error = new NotFoundError(`Route ${req.method} ${req.path} not found`);
      error.statusCode = 404;
      next(error);
    });
  }

  /**
   * Add global error handler middleware
   * @private
   */
  addGlobalErrorHandler() {
    // eslint-disable-next-line no-unused-vars
    this.app.use((error, req, res, next) => {
      const errorResponse = this.buildErrorResponse(error, req);
      
      // Log error
      this.logError(error, req);
      
      // Send response
      res.status(errorResponse.statusCode).json(errorResponse);
    });
  }

  /**
   * Add unhandled promise rejection handler
   * @private
   */
  addUnhandledRejectionHandler() {
    process.on('unhandledRejection', (reason, promise) => {
      this.logger.error('🚨 Unhandled Promise Rejection:', {
        reason: reason,
        promise: promise
      });

      // In production, we might want to gracefully shutdown
      if (this.config.get('NODE_ENV') === 'production') {
        this.logger.error('💀 Shutting down due to unhandled promise rejection');
        process.exit(1);
      }
    });
  }

  /**
   * Add uncaught exception handler
   * @private
   */
  addUncaughtExceptionHandler() {
    process.on('uncaughtException', (error) => {
      this.logger.error('🚨 Uncaught Exception:', error);
      
      // Always exit on uncaught exceptions
      this.logger.error('💀 Shutting down due to uncaught exception');
      process.exit(1);
    });
  }

  /**
   * Build error response object
   * @param {Error} error - Error object
   * @param {Express.Request} req - Express request object
   * @returns {Object} Error response
   * @private
   */
  buildErrorResponse(error, req) {
    const statusCode = this.getStatusCode(error);
    const isDevelopment = this.config.get('NODE_ENV') === 'development';
    
    const response = {
      error: error.name || 'Error',
      message: this.getErrorMessage(error, isDevelopment),
      statusCode: statusCode,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    };

    // Add stack trace in development
    if (isDevelopment && error.stack) {
      response.stack = error.stack;
    }

    // Add validation errors if present
    if (error.validationErrors) {
      response.validationErrors = error.validationErrors;
    }

    // Add additional error details if present
    if (error.details) {
      response.details = error.details;
    }

    return response;
  }

  /**
   * Get HTTP status code from error
   * @param {Error} error - Error object
   * @returns {number} HTTP status code
   * @private
   */
  getStatusCode(error) {
    if (error.statusCode) {
      return error.statusCode;
    }

    if (error.status) {
      return error.status;
    }

    // Map error types to status codes
    switch (error.constructor.name) {
      case 'ValidationError':
        return 400;
      case 'UnauthorizedError':
        return 401;
      case 'ForbiddenError':
        return 403;
      case 'NotFoundError':
        return 404;
      case 'ConflictError':
        return 409;
      case 'TooManyRequestsError':
        return 429;
      default:
        return 500;
    }
  }

  /**
   * Get error message based on environment
   * @param {Error} error - Error object
   * @param {boolean} isDevelopment - Is development environment
   * @returns {string} Error message
   * @private
   */
  getErrorMessage(error, isDevelopment) {
    if (isDevelopment) {
      return error.message || 'An error occurred';
    }

    // In production, don't expose internal error messages
    if (error.statusCode >= 400 && error.statusCode < 500) {
      return error.message || 'Bad request';
    }

    return 'Internal server error';
  }

  /**
   * Log error with appropriate level
   * @param {Error} error - Error object
   * @param {Express.Request} req - Express request object
   * @private
   */
  logError(error, req) {
    const statusCode = this.getStatusCode(error);
    const context = {
      method: req.method,
      path: req.path,
      statusCode: statusCode,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id
    };

    if (statusCode >= 500) {
      this.logger.error('💥 Server Error:', error, context);
    } else if (statusCode >= 400) {
      this.logger.warn('⚠️ Client Error:', error.message, context);
    } else {
      this.logger.info('ℹ️ Request Error:', error.message, context);
    }
  }
}

/**
 * 🚫 Custom Error Classes
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, validationErrors = []) {
    super(message, 400);
    this.validationErrors = validationErrors;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
  }
}