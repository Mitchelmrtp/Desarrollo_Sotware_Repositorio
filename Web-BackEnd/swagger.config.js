/**
 * Swagger API Documentation Configuration
 * Configuración de documentación de API con Swagger
 */

import swaggerJsdoc from 'swagger-jsdoc';
import { ConfigurationManager } from './src/utils/ConfigurationManager.js';

const config = ConfigurationManager.getInstance();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: config.get('API_TITLE', 'Academic Resources API'),
      version: config.get('API_VERSION', '1.0.0'),
      description: config.get('API_DESCRIPTION', 'REST API for Academic Resource Sharing Platform'),
      contact: {
        name: 'API Support',
        email: 'support@academicresources.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.get('PORT', '3000')}`,
        description: 'Development server'
      },
      {
        url: 'https://api.academicresources.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API Key for service-to-service authentication'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          required: ['message'],
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            code: {
              type: 'string',
              example: 'ERROR_CODE'
            },
            details: {
              type: 'object',
              additionalProperties: true
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully'
            },
            data: {
              type: 'object',
              additionalProperties: true
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: true
              }
            },
            pagination: {
              type: 'object',
              properties: {
                page: {
                  type: 'integer',
                  example: 1
                },
                limit: {
                  type: 'integer',
                  example: 10
                },
                totalItems: {
                  type: 'integer',
                  example: 100
                },
                totalPages: {
                  type: 'integer',
                  example: 10
                },
                hasNext: {
                  type: 'boolean',
                  example: true
                },
                hasPrev: {
                  type: 'boolean',
                  example: false
                }
              }
            }
          }
        },
        User: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            id: {
              type: 'integer',
              description: 'User ID'
            },
            username: {
              type: 'string',
              description: 'Username'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address'
            },
            firstName: {
              type: 'string',
              description: 'First name'
            },
            lastName: {
              type: 'string',
              description: 'Last name'
            },
            role: {
              type: 'string',
              enum: ['admin', 'teacher', 'student'],
              description: 'User role'
            },
            isActive: {
              type: 'boolean',
              description: 'Account status'
            },
            avatar: {
              type: 'string',
              description: 'Avatar URL'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Resource: {
          type: 'object',
          required: ['title', 'description', 'categoryId', 'userId'],
          properties: {
            id: {
              type: 'integer',
              description: 'Resource ID'
            },
            title: {
              type: 'string',
              description: 'Resource title'
            },
            description: {
              type: 'string',
              description: 'Resource description'
            },
            content: {
              type: 'string',
              description: 'Resource content'
            },
            fileUrl: {
              type: 'string',
              description: 'File URL'
            },
            thumbnailUrl: {
              type: 'string',
              description: 'Thumbnail URL'
            },
            categoryId: {
              type: 'integer',
              description: 'Category ID'
            },
            userId: {
              type: 'integer',
              description: 'Owner user ID'
            },
            isPublic: {
              type: 'boolean',
              description: 'Public visibility'
            },
            downloadCount: {
              type: 'integer',
              description: 'Download count'
            },
            rating: {
              type: 'number',
              format: 'float',
              description: 'Average rating'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      },
      parameters: {
        PageParam: {
          name: 'page',
          in: 'query',
          description: 'Page number',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          }
        },
        LimitParam: {
          name: 'limit',
          in: 'query',
          description: 'Items per page',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          }
        },
        SortParam: {
          name: 'sort',
          in: 'query',
          description: 'Sort field and direction (e.g., "createdAt:desc")',
          schema: {
            type: 'string',
            default: 'createdAt:desc'
          }
        },
        SearchParam: {
          name: 'search',
          in: 'query',
          description: 'Search term',
          schema: {
            type: 'string'
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication endpoints'
      },
      {
        name: 'Users',
        description: 'User management endpoints'
      },
      {
        name: 'Resources',
        description: 'Resource management endpoints'
      },
      {
        name: 'Categories',
        description: 'Category management endpoints'
      },
      {
        name: 'Comments',
        description: 'Comment management endpoints'
      },
      {
        name: 'System',
        description: 'System health and information endpoints'
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/models/*.js'
  ]
};

const specs = swaggerJsdoc(options);

export default specs;