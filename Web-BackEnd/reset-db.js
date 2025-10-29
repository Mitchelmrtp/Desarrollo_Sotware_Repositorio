/**
 * Reset Database Script
 * Script para limpiar y recrear la base de datos completamente
 */

import { DatabaseConnectionSingleton } from './src/patterns/singletons/DatabaseConnectionSingleton.js';
import { Logger } from './src/utils/Logger.js';

async function resetDatabase() {
    try {
        console.log('🗑️ Resetting database...');
        
        // Get database instance
        const db = DatabaseConnectionSingleton.getInstance();
        
        // Connect to database
        await db.connect();
        
        // Test connection
        await db.testConnection();
        
        console.log('🔥 Dropping all tables and recreating...');
        
        // Use force: true to drop and recreate all tables
        await db.syncModels({ force: true });
        
        console.log('✅ Database reset completed successfully!');
        
        // Disconnect
        await db.disconnect();
        console.log('✅ Database disconnected successfully!');
        
    } catch (error) {
        console.error('❌ Database reset failed:', error);
        process.exit(1);
    }
}

// Run reset
resetDatabase();
