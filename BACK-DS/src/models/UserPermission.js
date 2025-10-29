import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserPermission = sequelize.define('UserPermission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  permission_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'permissions',
      key: 'id'
    }
  },
  granted_by: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  granted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  expires_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'user_permissions',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'permission_id']
    },
    { fields: ['permission_id'] },
    { fields: ['granted_by'] },
    { fields: ['expires_at'] }
  ]
});

// Instance methods
UserPermission.prototype.isExpired = function() {
  return this.expires_at && this.expires_at < new Date();
};

UserPermission.prototype.isActive = function() {
  return !this.isExpired();
};

export default UserPermission;