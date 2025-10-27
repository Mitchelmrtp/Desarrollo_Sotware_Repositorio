// 🗄️ Base Repository - Repository Pattern implementation
// Following Repository Pattern and Interface Segregation Principle

import { Logger } from '../utils/Logger.js';
import { DatabaseConnectionSingleton } from '../patterns/singletons/DatabaseConnectionSingleton.js';

/**
 * 🗄️ Abstract Base Repository
 * Base class for all repository implementations
 */
export class BaseRepository {
  constructor(model) {
    this.model = model;
    this.logger = Logger.getInstance();
    this.db = DatabaseConnectionSingleton.getInstance();
  }

  /**
   * Find all records with optional conditions
   * @param {Object} options - Query options
   * @returns {Promise<Array>}
   */
  async findAll(options = {}) {
    try {
      const {
        where = {},
        include = [],
        order = [['createdAt', 'DESC']],
        limit = null,
        offset = null,
        attributes = null
      } = options;

      const queryOptions = {
        where,
        include,
        order,
        ...(attributes && { attributes }),
        ...(limit && { limit }),
        ...(offset && { offset })
      };

      const timer = this.logger.time(`${this.constructor.name}.findAll`);
      const result = await this.model.findAll(queryOptions);
      timer();

      this.logger.debug(`Found ${result.length} records`, {
        repository: this.constructor.name,
        conditions: where
      });

      return result;
    } catch (error) {
      this.logger.error(`Error in ${this.constructor.name}.findAll:`, error);
      throw error;
    }
  }

  /**
   * Find records with pagination
   * @param {Object} options - Query options with pagination
   * @returns {Promise<Object>}
   */
  async findAndCountAll(options = {}) {
    try {
      const {
        where = {},
        include = [],
        order = [['createdAt', 'DESC']],
        limit = 10,
        offset = 0,
        attributes = null
      } = options;

      const queryOptions = {
        where,
        include,
        order,
        limit,
        offset,
        ...(attributes && { attributes })
      };

      const timer = this.logger.time(`${this.constructor.name}.findAndCountAll`);
      const result = await this.model.findAndCountAll(queryOptions);
      timer();

      this.logger.debug(`Found ${result.rows.length} of ${result.count} records`, {
        repository: this.constructor.name,
        pagination: { limit, offset }
      });

      return {
        data: result.rows,
        total: result.count,
        page: Math.floor(offset / limit) + 1,
        pages: Math.ceil(result.count / limit),
        limit
      };
    } catch (error) {
      this.logger.error(`Error in ${this.constructor.name}.findAndCountAll:`, error);
      throw error;
    }
  }

  /**
   * Find single record by primary key
   * @param {string|number} id - Primary key value
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>}
   */
  async findById(id, options = {}) {
    try {
      const {
        include = [],
        attributes = null
      } = options;

      const queryOptions = {
        include,
        ...(attributes && { attributes })
      };

      const timer = this.logger.time(`${this.constructor.name}.findById`);
      const result = await this.model.findByPk(id, queryOptions);
      timer();

      this.logger.debug(`Found record by ID: ${id}`, {
        repository: this.constructor.name,
        found: !!result
      });

      return result;
    } catch (error) {
      this.logger.error(`Error in ${this.constructor.name}.findById:`, error);
      throw error;
    }
  }

  /**
   * Find single record by conditions
   * @param {Object} conditions - Where conditions
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>}
   */
  async findOne(conditions, options = {}) {
    try {
      const {
        include = [],
        attributes = null,
        order = [['createdAt', 'DESC']]
      } = options;

      const queryOptions = {
        where: conditions,
        include,
        order,
        ...(attributes && { attributes })
      };

      const timer = this.logger.time(`${this.constructor.name}.findOne`);
      const result = await this.model.findOne(queryOptions);
      timer();

      this.logger.debug(`Found single record`, {
        repository: this.constructor.name,
        conditions,
        found: !!result
      });

      return result;
    } catch (error) {
      this.logger.error(`Error in ${this.constructor.name}.findOne:`, error);
      throw error;
    }
  }

  /**
   * Create new record
   * @param {Object} data - Record data
   * @param {Object} options - Create options
   * @returns {Promise<Object>}
   */
  async create(data, options = {}) {
    try {
      const timer = this.logger.time(`${this.constructor.name}.create`);
      const result = await this.model.create(data, options);
      timer();

      this.logger.info(`Created new record`, {
        repository: this.constructor.name,
        id: result.id || result.dataValues?.id
      });

      return result;
    } catch (error) {
      this.logger.error(`Error in ${this.constructor.name}.create:`, error);
      throw error;
    }
  }

  /**
   * Update record by primary key
   * @param {string|number} id - Primary key value
   * @param {Object} data - Update data
   * @param {Object} options - Update options
   * @returns {Promise<Object|null>}
   */
  async updateById(id, data, options = {}) {
    try {
      const timer = this.logger.time(`${this.constructor.name}.updateById`);
      
      const [affectedRows] = await this.model.update(data, {
        where: { id },
        ...options
      });

      if (affectedRows === 0) {
        timer();
        return null;
      }

      const result = await this.findById(id);
      timer();

      this.logger.info(`Updated record by ID: ${id}`, {
        repository: this.constructor.name,
        affectedRows
      });

      return result;
    } catch (error) {
      this.logger.error(`Error in ${this.constructor.name}.updateById:`, error);
      throw error;
    }
  }

  /**
   * Delete record by primary key
   * @param {string|number} id - Primary key value
   * @param {Object} options - Delete options
   * @returns {Promise<boolean>}
   */
  async deleteById(id, options = {}) {
    try {
      const timer = this.logger.time(`${this.constructor.name}.deleteById`);
      
      const affectedRows = await this.model.destroy({
        where: { id },
        ...options
      });

      timer();

      const deleted = affectedRows > 0;
      
      this.logger.info(`Delete record by ID: ${id}`, {
        repository: this.constructor.name,
        deleted,
        affectedRows
      });

      return deleted;
    } catch (error) {
      this.logger.error(`Error in ${this.constructor.name}.deleteById:`, error);
      throw error;
    }
  }

  /**
   * Check if record exists
   * @param {Object} conditions - Where conditions
   * @returns {Promise<boolean>}
   */
  async exists(conditions) {
    try {
      const timer = this.logger.time(`${this.constructor.name}.exists`);
      
      const count = await this.model.count({
        where: conditions
      });

      timer();

      const exists = count > 0;
      
      this.logger.debug(`Check existence`, {
        repository: this.constructor.name,
        conditions,
        exists
      });

      return exists;
    } catch (error) {
      this.logger.error(`Error in ${this.constructor.name}.exists:`, error);
      throw error;
    }
  }

  /**
   * Count records
   * @param {Object} conditions - Where conditions
   * @returns {Promise<number>}
   */
  async count(conditions = {}) {
    try {
      const timer = this.logger.time(`${this.constructor.name}.count`);
      
      const count = await this.model.count({
        where: conditions
      });

      timer();

      this.logger.debug(`Count records`, {
        repository: this.constructor.name,
        conditions,
        count
      });

      return count;
    } catch (error) {
      this.logger.error(`Error in ${this.constructor.name}.count:`, error);
      throw error;
    }
  }

  /**
   * Execute raw SQL query
   * @param {string} sql - SQL query
   * @param {Object} options - Query options
   * @returns {Promise<Array>}
   */
  async query(sql, options = {}) {
    try {
      const timer = this.logger.time(`${this.constructor.name}.query`);
      
      const connection = this.db.getConnection();
      const result = await connection.query(sql, options);

      timer();

      this.logger.debug(`Executed raw query`, {
        repository: this.constructor.name,
        sql: sql.substring(0, 100) + (sql.length > 100 ? '...' : '')
      });

      return result;
    } catch (error) {
      this.logger.error(`Error in ${this.constructor.name}.query:`, error);
      throw error;
    }
  }

  /**
   * Begin database transaction
   * @returns {Promise<Transaction>}
   */
  async beginTransaction() {
    try {
      const connection = this.db.getConnection();
      const transaction = await connection.transaction();
      
      this.logger.debug(`Transaction started`, {
        repository: this.constructor.name
      });

      return transaction;
    } catch (error) {
      this.logger.error(`Error starting transaction in ${this.constructor.name}:`, error);
      throw error;
    }
  }
}