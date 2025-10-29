import 'dotenv/config';
import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'resource_platform_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

async function checkDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to PostgreSQL');
    
    // Check if database exists and list tables
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📊 Tables in database:');
    if (results.length === 0) {
      console.log('   No tables found - database is empty');
    } else {
      results.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }
    
    // Try to create database if it doesn't exist
    console.log('\n🔨 Attempting to sync models...');
    
    // Simple test model
    const TestModel = sequelize.define('test_table', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      }
    });
    
    await TestModel.sync({ force: true });
    console.log('✅ Test model synced successfully');
    
    // Clean up test table
    await TestModel.drop();
    console.log('✅ Test table cleaned up');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database check failed:', error);
    process.exit(1);
  }
}

checkDatabase();
