// 📝 Logger Utility - Singleton Pattern for centralized logging
// Following Singleton Pattern and Single Responsibility Principle

import { ConfigurationManager } from './ConfigurationManager.js';

/**
 * 📝 Logger Singleton
 * Centralized logging system with multiple levels and outputs
 */
export class Logger {
  static #instance = null;
  
  constructor() {
    if (Logger.#instance) {
      return Logger.#instance;
    }

    this.config = ConfigurationManager.getInstance();
    this.logLevel = this.config.get('LOG_LEVEL', 'info');
    this.enableColors = this.config.get('ENABLE_COLORS', 'true') === 'true';
    
    // Log levels hierarchy
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3,
      verbose: 4
    };

    // Colors for console output
    this.colors = {
      error: '\x1b[31m',   // Red
      warn: '\x1b[33m',    // Yellow
      info: '\x1b[36m',    // Cyan
      debug: '\x1b[35m',   // Magenta
      verbose: '\x1b[37m', // White
      success: '\x1b[32m', // Green
      reset: '\x1b[0m'     // Reset
    };

    Logger.#instance = this;
  }

  /**
   * Get singleton instance
   * @returns {Logger}
   */
  static getInstance() {
    if (!Logger.#instance) {
      Logger.#instance = new Logger();
    }
    return Logger.#instance;
  }

  /**
   * Check if log level should be processed
   * @param {string} level - Log level
   * @returns {boolean}
   * @private
   */
  #shouldLog(level) {
    return this.levels[level] <= this.levels[this.logLevel];
  }

  /**
   * Format log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   * @returns {string} Formatted message
   * @private
   */
  #formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const levelUpper = level.toUpperCase().padEnd(7);
    
    let logMessage = `[${timestamp}] ${levelUpper} ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      logMessage += ` | ${JSON.stringify(meta)}`;
    }

    return logMessage;
  }

  /**
   * Apply color to message
   * @param {string} level - Log level
   * @param {string} message - Message to colorize
   * @returns {string} Colorized message
   * @private
   */
  #colorize(level, message) {
    if (!this.enableColors) {
      return message;
    }

    const color = this.colors[level] || this.colors.reset;
    return `${color}${message}${this.colors.reset}`;
  }

  /**
   * Core logging method
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object|Error} meta - Additional data or error object
   * @private
   */
  #log(level, message, meta = {}) {
    if (!this.#shouldLog(level)) {
      return;
    }

    // Handle Error objects
    let logMeta = meta;
    if (meta instanceof Error) {
      logMeta = {
        error: meta.message,
        stack: meta.stack,
        name: meta.name
      };
    }

    const formattedMessage = this.#formatMessage(level, message, logMeta);
    const coloredMessage = this.#colorize(level, formattedMessage);

    // Output to console
    console.log(coloredMessage);

    // In production, you might want to send to external logging service
    if (this.config.get('NODE_ENV') === 'production') {
      this.#sendToExternalLogger(level, message, logMeta);
    }
  }

  /**
   * Send log to external logging service (placeholder)
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} meta - Metadata
   * @private
   */
  #sendToExternalLogger(level, message, meta) {
    // Placeholder for external logging services like:
    // - Winston with transports
    // - ELK Stack
    // - CloudWatch
    // - Datadog
    // - etc.
  }

  /**
   * Log error messages
   * @param {string} message - Error message
   * @param {Object|Error} meta - Additional data or error object
   */
  error(message, meta = {}) {
    this.#log('error', message, meta);
  }

  /**
   * Log warning messages
   * @param {string} message - Warning message
   * @param {Object} meta - Additional metadata
   */
  warn(message, meta = {}) {
    this.#log('warn', message, meta);
  }

  /**
   * Log info messages
   * @param {string} message - Info message
   * @param {Object} meta - Additional metadata
   */
  info(message, meta = {}) {
    this.#log('info', message, meta);
  }

  /**
   * Log debug messages
   * @param {string} message - Debug message
   * @param {Object} meta - Additional metadata
   */
  debug(message, meta = {}) {
    this.#log('debug', message, meta);
  }

  /**
   * Log verbose messages
   * @param {string} message - Verbose message
   * @param {Object} meta - Additional metadata
   */
  verbose(message, meta = {}) {
    this.#log('verbose', message, meta);
  }

  /**
   * Log success messages (special case of info)
   * @param {string} message - Success message
   * @param {Object} meta - Additional metadata
   */
  success(message, meta = {}) {
    const formattedMessage = this.#formatMessage('info', message, meta);
    const coloredMessage = this.#colorize('success', formattedMessage);
    
    if (this.#shouldLog('info')) {
      console.log(coloredMessage);
    }
  }

  /**
   * Set log level
   * @param {string} level - New log level
   */
  setLevel(level) {
    if (this.levels.hasOwnProperty(level)) {
      this.logLevel = level;
      this.info(`Log level set to: ${level}`);
    } else {
      this.warn(`Invalid log level: ${level}. Available levels: ${Object.keys(this.levels).join(', ')}`);
    }
  }

  /**
   * Get current log level
   * @returns {string}
   */
  getLevel() {
    return this.logLevel;
  }

  /**
   * Create child logger with context
   * @param {Object} context - Context to add to all logs
   * @returns {Object} Child logger
   */
  createChild(context = {}) {
    return {
      error: (message, meta = {}) => this.error(message, { ...context, ...meta }),
      warn: (message, meta = {}) => this.warn(message, { ...context, ...meta }),
      info: (message, meta = {}) => this.info(message, { ...context, ...meta }),
      debug: (message, meta = {}) => this.debug(message, { ...context, ...meta }),
      verbose: (message, meta = {}) => this.verbose(message, { ...context, ...meta }),
      success: (message, meta = {}) => this.success(message, { ...context, ...meta })
    };
  }

  /**
   * Performance timing utility
   * @param {string} label - Timer label
   * @returns {Function} End timer function
   */
  time(label) {
    const startTime = process.hrtime.bigint();
    this.debug(`⏱️ Timer started: ${label}`);
    
    return () => {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      this.debug(`⏱️ Timer ended: ${label} (${duration.toFixed(2)}ms)`);
      return duration;
    };
  }

  // Static methods for easy access
  static getInstance() {
    if (!Logger.#instance) {
      Logger.#instance = new Logger();
    }
    return Logger.#instance;
  }

  static info(message, ...args) {
    return Logger.getInstance().info(message, ...args);
  }

  static error(message, ...args) {
    return Logger.getInstance().error(message, ...args);
  }

  static warn(message, ...args) {
    return Logger.getInstance().warn(message, ...args);
  }

  static debug(message, ...args) {
    return Logger.getInstance().debug(message, ...args);
  }

  static verbose(message, ...args) {
    return Logger.getInstance().verbose(message, ...args);
  }

  static time(label) {
    return Logger.getInstance().time(label);
  }
}