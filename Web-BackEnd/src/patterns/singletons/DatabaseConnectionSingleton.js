// 🔗 Database Connection Singleton - Ensures single database connection
// Following Singleton Pattern and Single Responsibility Principle

import { Sequelize } from 'sequelize';
import { Logger } from '../../utils/Logger.js';
import { ConfigurationManager } from '../../utils/ConfigurationManager.js';

/**
 * 🏛️ Database Connection Singleton
 * Ensures only one database connection exists throughout the application
 */
export class DatabaseConnectionSingleton {
  static #instance = null;
  #connection = null;
  #logger = null;
  #config = null;
  #isConnected = false;

  constructor() {
    if (DatabaseConnectionSingleton.#instance) {
      throw new Error('Database connection already exists. Use getInstance() method.');
    }

    this.#logger = Logger.getInstance();
    this.#config = ConfigurationManager.getInstance();
  }

  /**
   * Get the singleton instance
   * @returns {DatabaseConnectionSingleton}
   */
  static getInstance() {
    if (!DatabaseConnectionSingleton.#instance) {
      DatabaseConnectionSingleton.#instance = new DatabaseConnectionSingleton();
    }
    return DatabaseConnectionSingleton.#instance;
  }

  /**
   * Initialize database connection
   */
  async connect() {
    if (this.#isConnected && this.#connection) {
      this.#logger.info('📊 Database connection already established');
      return this.#connection;
    }

    try {
      const dbConfig = this.#buildConnectionConfig();
      
      this.#connection = new Sequelize(dbConfig);
      
      // Configure connection pool and options
      this.#configureConnection();
      
      this.#logger.info('🔗 Attempting database connection...');
      
      await this.#connection.authenticate();
      
      this.#isConnected = true;
      this.#logger.success('✅ Database connection established successfully');
      
      return this.#connection;
    } catch (error) {
      this.#logger.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Test database connection
   */
  async testConnection() {
    try {
      await this.#connection.authenticate();
      this.#logger.info('✅ Database connection test successful');
      return true;
    } catch (error) {
      this.#logger.error('❌ Database connection test failed:', error);
      throw error;
    }
  }

  /**
   * Initialize and load all database models
   */
  async initializeModels() {
    try {
      this.#logger.info('📋 Loading database models...');
      
      // Import and initialize all models
      const { UserModel } = await import('../../models/User.js');
      const { ResourceModel } = await import('../../models/Resource.js');
      const { CategoryModel } = await import('../../models/Category.js');
      const { CommentModel } = await import('../../models/Comment.js');
      const { TagModel } = await import('../../models/Tag.js');
      const { ResourceTagModel } = await import('../../models/ResourceTag.js');

      // Initialize models with sequelize instance
      const User = UserModel(this.#connection);
      const Resource = ResourceModel(this.#connection);
      const Category = CategoryModel(this.#connection);
      const Comment = CommentModel(this.#connection);
      const Tag = TagModel(this.#connection);
      const ResourceTag = ResourceTagModel(this.#connection);

      // Setup associations
      this.setupAssociations({
        User,
        Resource,
        Category,
        Comment,
        Tag,
        ResourceTag
      });

      this.#logger.info('✅ Database models loaded and associated');
      return { User, Resource, Category, Comment, Tag, ResourceTag };
      
    } catch (error) {
      this.#logger.error('❌ Failed to initialize models:', error);
      throw error;
    }
  }

  /**
   * Setup model associations
   */
  setupAssociations(models) {
    const { User, Resource, Category, Comment, Tag, ResourceTag } = models;

    // User associations
    User.hasMany(Resource, {
      foreignKey: 'userId',
      as: 'resources'
    });

    User.hasMany(Comment, {
      foreignKey: 'userId',
      as: 'comments'
    });

    // Resource associations
    Resource.belongsTo(User, {
      foreignKey: 'userId',
      as: 'author'
    });

    Resource.belongsTo(Category, {
      foreignKey: 'categoryId',
      as: 'categoryData'
    });

    Resource.hasMany(Comment, {
      foreignKey: 'resourceId',
      as: 'comments'
    });

    Resource.belongsToMany(Tag, {
      through: ResourceTag,
      foreignKey: 'resource_id',
      otherKey: 'tag_id',
      as: 'tagList'
    });

    // Category associations
    Category.hasMany(Resource, {
      foreignKey: 'categoryId',
      as: 'resources'
    });

    // Comment associations
    Comment.belongsTo(User, {
      foreignKey: 'userId',
      as: 'author'
    });

    Comment.belongsTo(Resource, {
      foreignKey: 'resourceId',
      as: 'resource'
    });

    // Tag associations
    Tag.belongsToMany(Resource, {
      through: ResourceTag,
      foreignKey: 'tag_id',
      otherKey: 'resource_id',
      as: 'resourceList'
    });

    this.#logger.info('✅ Model associations configured');
  }

  /**
   * Synchronize database models
   */
  async syncModels(options = {}) {
    try {
      // First, initialize models if not already done
      await this.initializeModels();
      
      const defaultOptions = {
        force: this.#config.get('NODE_ENV') === 'development' && this.#config.get('DB_FORCE_SYNC', true),
        alter: false, // Disable alter to avoid ENUM conflicts
        logging: (msg) => this.#logger.debug('📋 Sequelize:', msg)
      };

      const syncOptions = { ...defaultOptions, ...options };
      
      this.#logger.info(`🔄 Synchronizing database with options: ${JSON.stringify(syncOptions)}`);
      await this.#connection.sync(syncOptions);
      
      this.#logger.info('✅ Database models synchronized successfully');
    } catch (error) {
      this.#logger.error('❌ Model synchronization failed:', error);
      throw error;
    }
  }

  /**
   * Get the database connection
   * @returns {Sequelize}
   */
  getConnection() {
    if (!this.#isConnected || !this.#connection) {
      throw new Error('Database connection not established. Call connect() first.');
    }
    return this.#connection;
  }

  /**
   * Disconnect from database
   */
  async disconnect() {
    if (this.#connection) {
      try {
        await this.#connection.close();
        this.#isConnected = false;
        this.#logger.info('🔌 Database connection closed');
      } catch (error) {
        this.#logger.error('❌ Error closing database connection:', error);
        throw error;
      }
    }
  }

  /**
   * Check if connected
   * @returns {boolean}
   */
  isConnected() {
    return this.#isConnected;
  }

  /**
   * Build connection configuration
   * @private
   */
  #buildConnectionConfig() {
    const config = {
      database: this.#config.get('DB_NAME'),
      username: this.#config.get('DB_USER'), 
      password: this.#config.get('DB_PASSWORD'),
      host: this.#config.get('DB_HOST', 'localhost'),
      port: parseInt(this.#config.get('DB_PORT', '5432')),
      dialect: 'postgres',
      dialectOptions: this.#getDialectOptions(),
      pool: this.#getPoolConfig(),
      logging: this.#getLoggingConfig(),
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    };

    return config;
  }

  /**
   * Configure connection options
   * @private
   */
  #configureConnection() {
    // Set up hooks for connection events
    this.#connection.addHook('beforeConnect', async (config) => {
      this.#logger.debug('🔗 Establishing database connection...');
    });

    this.#connection.addHook('afterConnect', async (connection, config) => {
      this.#logger.debug('✅ Database connection established');
    });

    this.#connection.addHook('beforeDisconnect', async (connection) => {
      this.#logger.debug('🔌 Closing database connection...');
    });
  }

  /**
   * Get dialect-specific options
   * @private
   */
  #getDialectOptions() {
    const options = {};
    
    if (this.#config.get('NODE_ENV') === 'production') {
      options.ssl = {
        require: true,
        rejectUnauthorized: false
      };
    }

    return options;
  }

  /**
   * Get connection pool configuration
   * @private
   */
  #getPoolConfig() {
    return {
      max: parseInt(this.#config.get('DB_POOL_MAX', '10')),
      min: parseInt(this.#config.get('DB_POOL_MIN', '0')),
      acquire: parseInt(this.#config.get('DB_POOL_ACQUIRE', '30000')),
      idle: parseInt(this.#config.get('DB_POOL_IDLE', '10000'))
    };
  }

  /**
   * Get logging configuration
   * @private
   */
  #getLoggingConfig() {
    const nodeEnv = this.#config.get('NODE_ENV');
    
    if (nodeEnv === 'test') {
      return false;
    }
    
    if (nodeEnv === 'production') {
      return false;
    }

    return (msg) => this.#logger.debug('📊 SQL:', msg);
  }

  /**
   * Get health status
   */
  async getHealthStatus() {
    try {
      if (!this.#isConnected) {
        return { status: 'disconnected', healthy: false };
      }

      await this.#connection.authenticate();
      
      const stats = {
        status: 'connected',
        healthy: true,
        pool: {
          total: this.#connection.connectionManager.pool.size,
          used: this.#connection.connectionManager.pool.used,
          waiting: this.#connection.connectionManager.pool.pending
        }
      };

      return stats;
    } catch (error) {
      return {
        status: 'error',
        healthy: false,
        error: error.message
      };
    }
  }
}