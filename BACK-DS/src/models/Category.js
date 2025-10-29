import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Category = sequelize.define('Category', {
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
      is: /^[a-z0-9]+(?:-[a-z0-9]+)*$/i // slug format
    }
  },
  description: {
    type: DataTypes.TEXT
  },
  color: {
    type: DataTypes.STRING,
    validate: {
      is: /^#[0-9A-F]{6}$/i // hex color code
    }
  },
  icon: {
    type: DataTypes.STRING
  },
  image_url: {
    type: DataTypes.STRING,
    validate: {
      isUrl: true
    }
  },
  parent_id: {
    type: DataTypes.UUID,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  },
  resources_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'categories',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['name'] },
    { fields: ['slug'] },
    { fields: ['parent_id'] },
    { fields: ['status'] },
    { fields: ['level'] },
    { fields: ['sort_order'] }
  ]
});

// Self-referencing association for parent-child relationships
Category.belongsTo(Category, { 
  as: 'parent', 
  foreignKey: 'parent_id' 
});

Category.hasMany(Category, { 
  as: 'children', 
  foreignKey: 'parent_id' 
});

// Instance methods
Category.prototype.generateSlug = function(name = null) {
  const text = name || this.name;
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim('-'); // Remove leading/trailing hyphens
};

Category.prototype.getPath = async function() {
  const path = [this];
  let current = this;
  
  while (current.parent_id) {
    current = await Category.findByPk(current.parent_id);
    if (current) {
      path.unshift(current);
    } else {
      break;
    }
  }
  
  return path;
};

Category.prototype.getFullPath = async function() {
  const path = await this.getPath();
  return path.map(cat => cat.name).join(' > ');
};

// Hooks
Category.beforeCreate(async (category) => {
  if (!category.slug) {
    category.slug = category.generateSlug();
  }
  
  // Set level based on parent
  if (category.parent_id) {
    const parent = await Category.findByPk(category.parent_id);
    if (parent) {
      category.level = parent.level + 1;
    }
  }
});

Category.beforeUpdate(async (category) => {
  if (category.changed('name') && !category.changed('slug')) {
    category.slug = category.generateSlug();
  }
});

// Class methods
Category.getRootCategories = function() {
  return this.findAll({
    where: {
      parent_id: null,
      status: 'active'
    },
    order: [['sort_order', 'ASC'], ['name', 'ASC']]
  });
};

Category.getTreeStructure = async function() {
  const categories = await this.findAll({
    where: { status: 'active' },
    order: [['level', 'ASC'], ['sort_order', 'ASC'], ['name', 'ASC']]
  });

  const categoryMap = {};
  const roots = [];

  // Create a map for quick lookup
  categories.forEach(cat => {
    categoryMap[cat.id] = {
      ...cat.toJSON(),
      children: []
    };
  });

  // Build tree structure
  categories.forEach(cat => {
    if (cat.parent_id && categoryMap[cat.parent_id]) {
      categoryMap[cat.parent_id].children.push(categoryMap[cat.id]);
    } else {
      roots.push(categoryMap[cat.id]);
    }
  });

  return roots;
};

export default Category;