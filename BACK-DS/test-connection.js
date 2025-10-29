import 'dotenv/config';
import { Sequelize } from 'sequelize';

console.log('Testing database connection...');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);

const sequelize = new Sequelize(
  process.env.DB_NAME || 'resource_platform_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
  }
);

async function testConnection() {
  try {
    console.log('Attempting to connect...');
    await sequelize.authenticate();
    console.log('✅ Connection to PostgreSQL established successfully.');
    
    // Test a simple query
    const result = await sequelize.query('SELECT version();');
    console.log('PostgreSQL version:', result[0][0].version);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
}

testConnection();
