/**
 * Test Database Connection Script
 * Script para probar la conexión a la base de datos
 */

import { DatabaseConnectionSingleton } from './src/patterns/singletons/DatabaseConnectionSingleton.js';
import { Logger } from './src/utils/Logger.js';

async function testDatabaseConnection() {
    try {
        console.log('🔧 Testing database connection...');
        
        // Get database instance
        const db = DatabaseConnectionSingleton.getInstance();
        
        // Connect to database
        await db.connect();
        
        // Test connection
        await db.testConnection();
        
        console.log('✅ Database connection test successful!');
        
        // Test model synchronization
        console.log('🔄 Testing model synchronization...');
        await db.syncModels({ alter: true });
        
        console.log('✅ Model synchronization successful!');
        
        // Disconnect
        await db.disconnect();
        console.log('✅ Database disconnected successfully!');
        
    } catch (error) {
        console.error('❌ Database test failed:', error);
        process.exit(1);
    }
}

// Run test
testDatabaseConnection();
