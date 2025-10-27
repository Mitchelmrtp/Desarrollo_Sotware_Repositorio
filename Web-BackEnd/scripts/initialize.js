#!/usr/bin/env node

/**
 * Academic Resources API Initialization Script
 * Script de inicialización de la API de Recursos Académicos
 */

import { Logger } from './src/utils/Logger.js';
import { ConfigurationManager } from './src/utils/ConfigurationManager.js';
import { DatabaseConnectionSingleton } from './src/patterns/DatabaseConnectionSingleton.js';

class ProjectInitializer {
    constructor() {
        this.config = ConfigurationManager.getInstance();
    }

    async run() {
        try {
            Logger.info('🚀 Starting Academic Resources API Initialization...');

            // 1. Verificar Node.js version
            await this.checkNodeVersion();

            // 2. Verificar variables de entorno
            await this.checkEnvironment();

            // 3. Verificar conexión a base de datos
            await this.checkDatabase();

            // 4. Inicializar estructuras de base de datos
            await this.initializeDatabase();

            // 5. Crear datos de prueba (opcional)
            if (process.argv.includes('--with-seed')) {
                await this.seedDatabase();
            }

            Logger.info('✅ Initialization completed successfully!');
            Logger.info('');
            Logger.info('🎯 Next steps:');
            Logger.info('   1. Copy .env.example to .env and configure your environment');
            Logger.info('   2. Run: npm run dev (for development)');
            Logger.info('   3. Run: npm start (for production)');
            Logger.info('   4. Visit: http://localhost:3000/api/docs (API documentation)');
            Logger.info('');

        } catch (error) {
            Logger.error('❌ Initialization failed:', error);
            process.exit(1);
        }
    }

    async checkNodeVersion() {
        Logger.info('Checking Node.js version...');
        
        const nodeVersion = process.version;
        const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

        Logger.info(`Current Node.js version: ${nodeVersion}`);

        if (majorVersion < 18) {
            throw new Error('Node.js version 18 or higher is required');
        }

        Logger.info('✅ Node.js version check passed');
    }

    async checkEnvironment() {
        Logger.info('Checking environment configuration...');

        const requiredVars = [
            'DB_HOST',
            'DB_PORT',
            'DB_NAME',
            'DB_USER',
            'DB_PASSWORD',
            'JWT_SECRET'
        ];

        const missing = requiredVars.filter(varName => !this.config.get(varName));

        if (missing.length > 0) {
            Logger.warn(`Missing environment variables: ${missing.join(', ')}`);
            Logger.warn('Please copy .env.example to .env and configure the missing variables');
            
            if (!process.argv.includes('--skip-env-check')) {
                throw new Error('Environment configuration incomplete');
            }
        } else {
            Logger.info('✅ Environment configuration check passed');
        }
    }

    async checkDatabase() {
        Logger.info('Checking database connection...');

        try {
            const db = DatabaseConnectionSingleton.getInstance();
            await db.testConnection();
            Logger.info('✅ Database connection check passed');
        } catch (error) {
            Logger.error('Database connection failed:', error.message);
            Logger.info('');
            Logger.info('🔧 Database setup help:');
            Logger.info('   1. Make sure PostgreSQL is installed and running');
            Logger.info('   2. Create a database with the name specified in DB_NAME');
            Logger.info('   3. Verify DB_HOST, DB_PORT, DB_USER, and DB_PASSWORD');
            Logger.info('');
            
            if (!process.argv.includes('--skip-db-check')) {
                throw error;
            }
        }
    }

    async initializeDatabase() {
        Logger.info('Initializing database schema...');

        try {
            const db = DatabaseConnectionSingleton.getInstance();
            
            // Sincronizar modelos (crear tablas)
            await db.syncModels({ force: false });
            
            Logger.info('✅ Database schema initialized successfully');
        } catch (error) {
            Logger.error('Database initialization failed:', error);
            throw error;
        }
    }

    async seedDatabase() {
        Logger.info('Seeding database with sample data...');

        try {
            // Importar servicios para crear datos de prueba
            const { UserService } = await import('./src/services/UserService.js');
            const { CategoryService } = await import('./src/services/CategoryService.js');

            const userService = new UserService();
            const categoryService = new CategoryService();

            // Crear categorías de prueba
            const categories = [
                { name: 'Mathematics', description: 'Mathematical resources and materials' },
                { name: 'Science', description: 'Science-related educational content' },
                { name: 'Programming', description: 'Programming tutorials and examples' },
                { name: 'Literature', description: 'Literature and language resources' }
            ];

            for (const categoryData of categories) {
                try {
                    await categoryService.createCategory(categoryData);
                    Logger.info(`Created category: ${categoryData.name}`);
                } catch (error) {
                    if (error.message.includes('already exists')) {
                        Logger.info(`Category already exists: ${categoryData.name}`);
                    } else {
                        throw error;
                    }
                }
            }

            // Crear usuario administrador de prueba
            const adminUser = {
                username: 'admin',
                email: 'admin@test.com',
                password: 'admin123',
                firstName: 'Admin',
                lastName: 'User',
                role: 'admin'
            };

            try {
                await userService.createUser(adminUser);
                Logger.info('Created admin user: admin@test.com / admin123');
            } catch (error) {
                if (error.message.includes('already exists')) {
                    Logger.info('Admin user already exists');
                } else {
                    throw error;
                }
            }

            Logger.info('✅ Database seeding completed');

        } catch (error) {
            Logger.error('Database seeding failed:', error);
            throw error;
        }
    }
}

// Ejecutar inicializador si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const initializer = new ProjectInitializer();
    initializer.run().catch((error) => {
        Logger.error('Initialization script failed:', error);
        process.exit(1);
    });
}

export { ProjectInitializer };