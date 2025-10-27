// ⚙️ Configuration Manager - Singleton Pattern for configuration management
// Following Singleton Pattern and Single Responsibility Principle

/**
 * ⚙️ Configuration Manager Singleton
 * Centralized configuration management system
 */
export class ConfigurationManager {
  static #instance = null;
  #config = new Map();
  #validated = false;

  constructor() {
    if (ConfigurationManager.#instance) {
      return ConfigurationManager.#instance;
    }

    this.#loadConfiguration();
    ConfigurationManager.#instance = this;
  }

  /**
   * Get singleton instance
   * @returns {ConfigurationManager}
   */
  static getInstance() {
    if (!ConfigurationManager.#instance) {
      ConfigurationManager.#instance = new ConfigurationManager();
    }
    return ConfigurationManager.#instance;
  }

  /**
   * Load configuration from environment variables
   * @private
   */
  #loadConfiguration() {
    // Load all environment variables
    for (const [key, value] of Object.entries(process.env)) {
      this.#config.set(key, value);
    }

    // Set default values
    this.#setDefaults();
  }

  /**
   * Set default configuration values
   * @private
   */
  #setDefaults() {
    const defaults = {
      NODE_ENV: 'development',
      PORT: '3001',
      HOST: 'localhost',
      LOG_LEVEL: 'info',
      ENABLE_COLORS: 'true',
      API_VERSION: '1.0.0',
      
      // Database defaults
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_DIALECT: 'postgres',
      DB_POOL_MAX: '10',
      DB_POOL_MIN: '0',
      DB_POOL_ACQUIRE: '30000',
      DB_POOL_IDLE: '10000',
      
      // Security defaults
      BCRYPT_ROUNDS: '12',
      JWT_EXPIRES_IN: '24h',
      RATE_LIMIT_MAX: '100',
      
      // Server defaults
      TRUST_PROXY: 'true',
      CORS_ORIGINS: '',
      
      // Feature flags
      ENABLE_SWAGGER: 'true',
      ENABLE_METRICS: 'false'
    };

    for (const [key, value] of Object.entries(defaults)) {
      if (!this.#config.has(key)) {
        this.#config.set(key, value);
      }
    }
  }

  /**
   * Get configuration value
   * @param {string} key - Configuration key
   * @param {*} defaultValue - Default value if key not found
   * @returns {*} Configuration value
   */
  get(key, defaultValue = undefined) {
    return this.#config.get(key) || defaultValue;
  }

  /**
   * Set configuration value
   * @param {string} key - Configuration key
   * @param {*} value - Configuration value
   */
  set(key, value) {
    this.#config.set(key, String(value));
  }

  /**
   * Check if configuration key exists
   * @param {string} key - Configuration key
   * @returns {boolean}
   */
  has(key) {
    return this.#config.has(key);
  }

  /**
   * Get configuration as integer
   * @param {string} key - Configuration key
   * @param {number} defaultValue - Default value
   * @returns {number}
   */
  getInt(key, defaultValue = 0) {
    const value = this.get(key);
    return value ? parseInt(value, 10) : defaultValue;
  }

  /**
   * Get configuration as float
   * @param {string} key - Configuration key
   * @param {number} defaultValue - Default value
   * @returns {number}
   */
  getFloat(key, defaultValue = 0.0) {
    const value = this.get(key);
    return value ? parseFloat(value) : defaultValue;
  }

  /**
   * Get configuration as boolean
   * @param {string} key - Configuration key
   * @param {boolean} defaultValue - Default value
   * @returns {boolean}
   */
  getBool(key, defaultValue = false) {
    const value = this.get(key, '').toLowerCase();
    return ['true', '1', 'yes', 'on'].includes(value) || defaultValue;
  }

  /**
   * Get configuration as array
   * @param {string} key - Configuration key
   * @param {string} delimiter - Array delimiter
   * @param {Array} defaultValue - Default value
   * @returns {Array}
   */
  getArray(key, delimiter = ',', defaultValue = []) {
    const value = this.get(key);
    return value ? value.split(delimiter).map(v => v.trim()).filter(Boolean) : defaultValue;
  }

  /**
   * Validate required configuration keys
   * @param {Array<string>} requiredKeys - Array of required keys
   * @throws {Error} If required keys are missing
   */
  validateRequired(requiredKeys) {
    const missingKeys = requiredKeys.filter(key => !this.has(key));
    
    if (missingKeys.length > 0) {
      throw new Error(`Missing required configuration keys: ${missingKeys.join(', ')}`);
    }

    this.#validated = true;
  }

  /**
   * Check if configuration has been validated
   * @returns {boolean}
   */
  isValidated() {
    return this.#validated;
  }

  /**
   * Get all configuration as object (excluding sensitive data)
   * @param {boolean} includeSensitive - Include sensitive keys
   * @returns {Object}
   */
  getAll(includeSensitive = false) {
    const config = {};
    const sensitiveKeys = [
      'DB_PASSWORD',
      'JWT_SECRET', 
      'JWT_REFRESH_SECRET',
      'EMAIL_PASSWORD',
      'API_KEY',
      'SECRET_KEY'
    ];

    for (const [key, value] of this.#config.entries()) {
      if (includeSensitive || !sensitiveKeys.some(sk => key.includes(sk))) {
        config[key] = value;
      } else if (sensitiveKeys.some(sk => key.includes(sk))) {
        config[key] = '***';
      }
    }

    return config;
  }

  /**
   * Get database configuration object
   * @returns {Object}
   */
  getDatabaseConfig() {
    return {
      host: this.get('DB_HOST'),
      port: this.getInt('DB_PORT'),
      database: this.get('DB_NAME'),
      username: this.get('DB_USER'),
      password: this.get('DB_PASSWORD'),
      dialect: this.get('DB_DIALECT'),
      pool: {
        max: this.getInt('DB_POOL_MAX'),
        min: this.getInt('DB_POOL_MIN'),
        acquire: this.getInt('DB_POOL_ACQUIRE'),
        idle: this.getInt('DB_POOL_IDLE')
      }
    };
  }

  /**
   * Get JWT configuration object
   * @returns {Object}
   */
  getJWTConfig() {
    return {
      secret: this.get('JWT_SECRET'),
      refreshSecret: this.get('JWT_REFRESH_SECRET'),
      expiresIn: this.get('JWT_EXPIRES_IN'),
      refreshExpiresIn: this.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      issuer: this.get('JWT_ISSUER', 'resource-share-api'),
      audience: this.get('JWT_AUDIENCE', 'resource-share-app')
    };
  }

  /**
   * Get email configuration object
   * @returns {Object}
   */
  getEmailConfig() {
    return {
      host: this.get('EMAIL_HOST'),
      port: this.getInt('EMAIL_PORT'),
      secure: this.getBool('EMAIL_SECURE'),
      auth: {
        user: this.get('EMAIL_USER'),
        pass: this.get('EMAIL_PASSWORD')
      },
      from: this.get('EMAIL_FROM'),
      replyTo: this.get('EMAIL_REPLY_TO')
    };
  }

  /**
   * Check if running in development mode
   * @returns {boolean}
   */
  isDevelopment() {
    return this.get('NODE_ENV') === 'development';
  }

  /**
   * Check if running in production mode
   * @returns {boolean}
   */
  isProduction() {
    return this.get('NODE_ENV') === 'production';
  }

  /**
   * Check if running in test mode
   * @returns {boolean}
   */
  isTest() {
    return this.get('NODE_ENV') === 'test';
  }

  /**
   * Reload configuration from environment
   */
  reload() {
    this.#config.clear();
    this.#validated = false;
    this.#loadConfiguration();
  }

  /**
   * Reset configuration to defaults
   */
  reset() {
    this.#config.clear();
    this.#validated = false;
    this.#setDefaults();
  }
}