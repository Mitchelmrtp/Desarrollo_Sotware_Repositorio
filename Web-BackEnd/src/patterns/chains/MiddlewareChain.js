// ⛓️ Middleware Chain - Chain of Responsibility Pattern
// Following Chain of Responsibility and Single Responsibility Principle

import { Logger } from '../../utils/Logger.js';

/**
 * ⛓️ Middleware Chain
 * Implements Chain of Responsibility pattern for middleware execution
 */
export class MiddlewareChain {
  constructor() {
    this.middlewares = [];
    this.logger = Logger.getInstance();
  }

  /**
   * Add middleware to the chain
   * @param {Function} middleware - Express middleware function
   * @param {Object} options - Middleware options
   * @returns {MiddlewareChain}
   */
  add(middleware, options = {}) {
    if (typeof middleware !== 'function') {
      throw new Error('Middleware must be a function');
    }

    const middlewareInfo = {
      handler: middleware,
      name: options.name || middleware.name || 'anonymous',
      order: options.order || this.middlewares.length,
      condition: options.condition || (() => true)
    };

    this.middlewares.push(middlewareInfo);
    this.logger.debug(`➕ Added middleware: ${middlewareInfo.name}`);
    
    return this;
  }

  /**
   * Add conditional middleware
   * @param {Function} condition - Condition function
   * @param {Function} middleware - Middleware to add if condition is true
   * @param {Object} options - Options
   * @returns {MiddlewareChain}
   */
  addIf(condition, middleware, options = {}) {
    return this.add(middleware, { ...options, condition });
  }

  /**
   * Add middleware before another middleware
   * @param {string} targetName - Name of target middleware
   * @param {Function} middleware - New middleware
   * @param {Object} options - Options
   * @returns {MiddlewareChain}
   */
  addBefore(targetName, middleware, options = {}) {
    const targetIndex = this.middlewares.findIndex(m => m.name === targetName);
    
    if (targetIndex === -1) {
      throw new Error(`Middleware '${targetName}' not found`);
    }

    const middlewareInfo = {
      handler: middleware,
      name: options.name || middleware.name || 'anonymous',
      order: targetIndex,
      condition: options.condition || (() => true)
    };

    this.middlewares.splice(targetIndex, 0, middlewareInfo);
    this.logger.debug(`➕ Added middleware '${middlewareInfo.name}' before '${targetName}'`);
    
    return this;
  }

  /**
   * Add middleware after another middleware
   * @param {string} targetName - Name of target middleware
   * @param {Function} middleware - New middleware
   * @param {Object} options - Options
   * @returns {MiddlewareChain}
   */
  addAfter(targetName, middleware, options = {}) {
    const targetIndex = this.middlewares.findIndex(m => m.name === targetName);
    
    if (targetIndex === -1) {
      throw new Error(`Middleware '${targetName}' not found`);
    }

    const middlewareInfo = {
      handler: middleware,
      name: options.name || middleware.name || 'anonymous',
      order: targetIndex + 1,
      condition: options.condition || (() => true)
    };

    this.middlewares.splice(targetIndex + 1, 0, middlewareInfo);
    this.logger.debug(`➕ Added middleware '${middlewareInfo.name}' after '${targetName}'`);
    
    return this;
  }

  /**
   * Remove middleware by name
   * @param {string} name - Middleware name
   * @returns {MiddlewareChain}
   */
  remove(name) {
    const index = this.middlewares.findIndex(m => m.name === name);
    
    if (index !== -1) {
      this.middlewares.splice(index, 1);
      this.logger.debug(`➖ Removed middleware: ${name}`);
    }
    
    return this;
  }

  /**
   * Clear all middlewares
   * @returns {MiddlewareChain}
   */
  clear() {
    this.middlewares = [];
    this.logger.debug('🧹 Cleared all middlewares');
    return this;
  }

  /**
   * Sort middlewares by order
   * @returns {MiddlewareChain}
   */
  sort() {
    this.middlewares.sort((a, b) => a.order - b.order);
    return this;
  }

  /**
   * Apply all middlewares to Express app
   * @param {Express.Application} app - Express application
   */
  apply(app) {
    this.sort();
    
    this.logger.info(`⛓️ Applying ${this.middlewares.length} middlewares...`);
    
    for (const middleware of this.middlewares) {
      try {
        if (middleware.condition()) {
          app.use(middleware.handler);
          this.logger.debug(`✅ Applied middleware: ${middleware.name}`);
        } else {
          this.logger.debug(`⏭️ Skipped middleware: ${middleware.name} (condition not met)`);
        }
      } catch (error) {
        this.logger.error(`❌ Failed to apply middleware '${middleware.name}':`, error);
        throw error;
      }
    }
    
    this.logger.success('✅ All middlewares applied successfully');
  }

  /**
   * Get middleware information
   * @returns {Array}
   */
  getMiddlewares() {
    return this.middlewares.map(m => ({
      name: m.name,
      order: m.order,
      hasCondition: m.condition !== (() => true)
    }));
  }

  /**
   * Create a new chain from current chain
   * @returns {MiddlewareChain}
   */
  clone() {
    const newChain = new MiddlewareChain();
    newChain.middlewares = [...this.middlewares];
    return newChain;
  }
}