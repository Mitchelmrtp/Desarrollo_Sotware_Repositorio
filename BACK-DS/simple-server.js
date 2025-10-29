import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Sequelize, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors());
app.use(express.json());

// Test database connection
const sequelize = new Sequelize(
  process.env.DB_NAME || 'repositorio',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '123',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});

// Test database endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query('SELECT version()');
    res.json({
      message: 'Database connection successful',
      version: results[0].version
    });
  } catch (error) {
    res.status(500).json({
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Auth endpoints - real database implementation
app.post('/auth/register', async (req, res) => {
  try {
    console.log('📝 Register attempt:', { 
      name: req.body.name, 
      email: req.body.email,
      passwordLength: req.body.password ? req.body.password.length : 0
    });
    
    const { name, email, password } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email and password are required'
      });
    }
    
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }
    
    // Create new user (password will be hashed by the beforeCreate hook)
    const newUser = await User.create({
      name,
      email,
      password
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email 
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    console.log('✅ User registered successfully:', { id: newUser.id, email: newUser.email });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors.map(err => err.message)
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error during registration'
    });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt:', { email: req.body.email });
    
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email 
      }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    console.log('✅ Login successful:', { id: user.id, email: user.email });
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during login'
    });
  }
});

app.post('/auth/logout', (req, res) => {
  console.log('👋 Logout attempt');
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Catch all route for debugging missing endpoints
app.all('*', (req, res) => {
  console.log(`❓ Missing route: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    error: 'Route not found',
    method: req.method,
    url: req.url,
    message: `The endpoint ${req.method} ${req.url} is not implemented yet`
  });
});

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Sync database models (create tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('📊 Database models synchronized');
    
    app.listen(PORT, () => {
      console.log(`🚀 Backend running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔍 Database test: http://localhost:${PORT}/api/db-test`);
      console.log(`👤 Auth endpoints: /auth/register, /auth/login, /auth/logout`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
