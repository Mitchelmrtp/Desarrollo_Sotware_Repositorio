// Models index file - Establishes all model relationships
import User from './User.js';
import Resource from './Resource.js';
import Category from './Category.js';
import Comment from './Comment.js';
import ResourceLike from './ResourceLike.js';
import Permission from './Permission.js';
import UserPermission from './UserPermission.js';

// ===== USER RELATIONSHIPS =====
// User has many resources
User.hasMany(Resource, {
  foreignKey: 'user_id',
  as: 'resources'
});
Resource.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'author'
});

// User has many comments
User.hasMany(Comment, {
  foreignKey: 'user_id',
  as: 'comments'
});
Comment.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'author'
});

// User has many resource likes
User.hasMany(ResourceLike, {
  foreignKey: 'user_id',
  as: 'likes'
});
ResourceLike.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// User permissions
User.belongsToMany(Permission, {
  through: UserPermission,
  foreignKey: 'user_id',
  otherKey: 'permission_id',
  as: 'permissions'
});
Permission.belongsToMany(User, {
  through: UserPermission,
  foreignKey: 'permission_id',
  otherKey: 'user_id',
  as: 'users'
});

// ===== RESOURCE RELATIONSHIPS =====
// Resource belongs to category
Resource.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});
Category.hasMany(Resource, {
  foreignKey: 'category_id',
  as: 'resources'
});

// Resource has many comments
Resource.hasMany(Comment, {
  foreignKey: 'resource_id',
  as: 'comments'
});
Comment.belongsTo(Resource, {
  foreignKey: 'resource_id',
  as: 'resource'
});

// Resource has many likes
Resource.hasMany(ResourceLike, {
  foreignKey: 'resource_id',
  as: 'likes'
});
ResourceLike.belongsTo(Resource, {
  foreignKey: 'resource_id',
  as: 'resource'
});

// Many-to-many: Users can like many resources
User.belongsToMany(Resource, {
  through: ResourceLike,
  foreignKey: 'user_id',
  otherKey: 'resource_id',
  as: 'likedResources'
});
Resource.belongsToMany(User, {
  through: ResourceLike,
  foreignKey: 'resource_id',
  otherKey: 'user_id',
  as: 'likedByUsers'
});

// ===== PERMISSION RELATIONSHIPS =====
User.hasMany(UserPermission, {
  foreignKey: 'user_id',
  as: 'userPermissions'
});
UserPermission.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

Permission.hasMany(UserPermission, {
  foreignKey: 'permission_id',
  as: 'userPermissions'
});
UserPermission.belongsTo(Permission, {
  foreignKey: 'permission_id',
  as: 'permission'
});

// Granted by user relationship
UserPermission.belongsTo(User, {
  foreignKey: 'granted_by',
  as: 'grantor'
});

export {
  User,
  Resource,
  Category,
  Comment,
  ResourceLike,
  Permission,
  UserPermission
};

export default {
  User,
  Resource,
  Category,
  Comment,
  ResourceLike,
  Permission,
  UserPermission
};