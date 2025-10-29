import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 100],
      notEmpty: true
    }
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 100],
      notEmpty: true,
      is: /^[a-z0-9_]+$/i
    }
  },
  description: {
    type: DataTypes.TEXT
  },
  resource: {
    type: DataTypes.STRING,
    allowNull: false // e.g., 'resources', 'users', 'categories'
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false // e.g., 'create', 'read', 'update', 'delete'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  }
}, {
  tableName: 'permissions',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['resource', 'action']
    },
    { fields: ['slug'] },
    { fields: ['status'] }
  ]
});

// Class methods
Permission.createPermission = async function(resource, action, description = null) {
  const name = `${resource}.${action}`;
  const slug = name.toLowerCase().replace(/\./g, '_');
  
  return await this.create({
    name,
    slug,
    description: description || `${action} ${resource}`,
    resource,
    action
  });
};

export default Permission;