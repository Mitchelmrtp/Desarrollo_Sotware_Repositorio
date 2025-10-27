// 📚 Swagger Document Builder - Builder Pattern for API documentation
// Following Builder Pattern and Single Responsibility Principle

/**
 * 📚 Swagger Document Builder
 * Builds Swagger/OpenAPI documentation using Builder pattern
 */
export class SwaggerDocumentBuilder {
  constructor() {
    this.document = {
      openapi: '3.0.0',
      info: {
        title: '',
        description: '',
        version: ''
      },
      servers: [],
      components: {
        securitySchemes: {},
        schemas: {}
      },
      paths: {},
      tags: []
    };
  }

  /**
   * Set API title
   * @param {string} title - API title
   * @returns {SwaggerDocumentBuilder}
   */
  setTitle(title) {
    this.document.info.title = title;
    return this;
  }

  /**
   * Set API description
   * @param {string} description - API description
   * @returns {SwaggerDocumentBuilder}
   */
  setDescription(description) {
    this.document.info.description = description;
    return this;
  }

  /**
   * Set API version
   * @param {string} version - API version
   * @returns {SwaggerDocumentBuilder}
   */
  setVersion(version) {
    this.document.info.version = version;
    return this;
  }

  /**
   * Set contact information
   * @param {Object} contact - Contact information
   * @returns {SwaggerDocumentBuilder}
   */
  setContact(contact) {
    this.document.info.contact = contact;
    return this;
  }

  /**
   * Set license information
   * @param {Object} license - License information
   * @returns {SwaggerDocumentBuilder}
   */
  setLicense(license) {
    this.document.info.license = license;
    return this;
  }

  /**
   * Add server
   * @param {string} url - Server URL
   * @param {string} description - Server description
   * @returns {SwaggerDocumentBuilder}
   */
  addServer(url, description = '') {
    this.document.servers.push({ url, description });
    return this;
  }

  /**
   * Add Bearer authentication
   * @returns {SwaggerDocumentBuilder}
   */
  addBearerAuth() {
    this.document.components.securitySchemes.bearerAuth = {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT'
    };
    return this;
  }

  /**
   * Add API Key authentication
   * @param {string} name - API key name
   * @param {string} location - API key location (header, query, cookie)
   * @returns {SwaggerDocumentBuilder}
   */
  addApiKeyAuth(name, location = 'header') {
    this.document.components.securitySchemes.apiKeyAuth = {
      type: 'apiKey',
      in: location,
      name: name
    };
    return this;
  }

  /**
   * Add schema definition
   * @param {string} name - Schema name
   * @param {Object} schema - Schema definition
   * @returns {SwaggerDocumentBuilder}
   */
  addSchema(name, schema) {
    this.document.components.schemas[name] = schema;
    return this;
  }

  /**
   * Add common schemas
   * @returns {SwaggerDocumentBuilder}
   */
  addCommonSchemas() {
    // Error schema
    this.addSchema('Error', {
      type: 'object',
      properties: {
        error: {
          type: 'string',
          description: 'Error message'
        },
        message: {
          type: 'string',
          description: 'Detailed error description'
        },
        statusCode: {
          type: 'integer',
          description: 'HTTP status code'
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          description: 'Error timestamp'
        }
      },
      required: ['error', 'message', 'statusCode', 'timestamp']
    });

    // Success response schema
    this.addSchema('SuccessResponse', {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true
        },
        data: {
          type: 'object',
          description: 'Response data'
        },
        message: {
          type: 'string',
          description: 'Success message'
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          description: 'Response timestamp'
        }
      },
      required: ['success', 'timestamp']
    });

    // Pagination schema
    this.addSchema('Pagination', {
      type: 'object',
      properties: {
        page: {
          type: 'integer',
          minimum: 1,
          description: 'Current page number'
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          description: 'Items per page'
        },
        total: {
          type: 'integer',
          description: 'Total number of items'
        },
        pages: {
          type: 'integer',
          description: 'Total number of pages'
        }
      },
      required: ['page', 'limit', 'total', 'pages']
    });

    // User schema
    this.addSchema('User', {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'User unique identifier'
        },
        name: {
          type: 'string',
          description: 'User full name'
        },
        email: {
          type: 'string',
          format: 'email',
          description: 'User email address'
        },
        role: {
          type: 'string',
          enum: ['user', 'teacher', 'admin'],
          description: 'User role'
        },
        avatar: {
          type: 'string',
          nullable: true,
          description: 'User avatar URL'
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          description: 'Account creation timestamp'
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          description: 'Last update timestamp'
        }
      },
      required: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt']
    });

    return this;
  }

  /**
   * Add tag
   * @param {string} name - Tag name
   * @param {string} description - Tag description
   * @returns {SwaggerDocumentBuilder}
   */
  addTag(name, description = '') {
    this.document.tags.push({ name, description });
    return this;
  }

  /**
   * Add common tags
   * @returns {SwaggerDocumentBuilder}
   */
  addCommonTags() {
    this.addTag('Authentication', 'User authentication and authorization endpoints');
    this.addTag('Users', 'User management endpoints');
    this.addTag('Resources', 'Academic resource management endpoints');
    this.addTag('Search', 'Search and discovery endpoints');
    this.addTag('Admin', 'Administrative endpoints');
    this.addTag('Health', 'Health check and monitoring endpoints');
    return this;
  }

  /**
   * Build and return the complete Swagger document
   * @returns {Object}
   */
  build() {
    // Add common schemas and tags if not already added
    this.addCommonSchemas();
    this.addCommonTags();

    // Validate required fields
    if (!this.document.info.title) {
      throw new Error('API title is required');
    }
    
    if (!this.document.info.version) {
      throw new Error('API version is required');
    }

    return { ...this.document };
  }

  /**
   * Reset builder to initial state
   * @returns {SwaggerDocumentBuilder}
   */
  reset() {
    this.document = {
      openapi: '3.0.0',
      info: {
        title: '',
        description: '',
        version: ''
      },
      servers: [],
      components: {
        securitySchemes: {},
        schemas: {}
      },
      paths: {},
      tags: []
    };
    return this;
  }
}