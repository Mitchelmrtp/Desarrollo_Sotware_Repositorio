#!/usr/bin/env node

/**
 * Development Helper Script
 * Script de ayuda para desarrollo
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { Logger } from '../src/utils/Logger.js';

class DevHelper {
    constructor() {
        this.commands = {
            setup: 'Complete project setup',
            'db:reset': 'Reset database completely',
            'db:fresh': 'Fresh database with seeds',
            'test:all': 'Run all tests with coverage',
            'lint:all': 'Lint and format all code',
            'check:health': 'Check application health',
            'clean:logs': 'Clean log files',
            'clean:all': 'Clean everything (logs, coverage, node_modules)',
            'docker:build': 'Build Docker image',
            'docker:run': 'Run application in Docker'
        };
    }

    async run() {
        const command = process.argv[2];

        if (!command) {
            this.showHelp();
            return;
        }

        if (command === 'help' || command === '--help' || command === '-h') {
            this.showHelp();
            return;
        }

        try {
            switch (command) {
                case 'setup':
                    await this.setup();
                    break;
                case 'db:reset':
                    await this.resetDatabase();
                    break;
                case 'db:fresh':
                    await this.freshDatabase();
                    break;
                case 'test:all':
                    await this.runAllTests();
                    break;
                case 'lint:all':
                    await this.lintAndFormat();
                    break;
                case 'check:health':
                    await this.checkHealth();
                    break;
                case 'clean:logs':
                    await this.cleanLogs();
                    break;
                case 'clean:all':
                    await this.cleanAll();
                    break;
                case 'docker:build':
                    await this.buildDocker();
                    break;
                case 'docker:run':
                    await this.runDocker();
                    break;
                default:
                    Logger.error(`Unknown command: ${command}`);
                    this.showHelp();
            }
        } catch (error) {
            Logger.error(`Command failed: ${error.message}`);
            process.exit(1);
        }
    }

    showHelp() {
        console.log('');
        console.log('🛠️  Academic Resources API - Development Helper');
        console.log('');
        console.log('Usage: node scripts/dev.js <command>');
        console.log('');
        console.log('Available commands:');
        console.log('');
        Object.entries(this.commands).forEach(([cmd, desc]) => {
            console.log(`  ${cmd.padEnd(15)} ${desc}`);
        });
        console.log('');
        console.log('Examples:');
        console.log('  node scripts/dev.js setup');
        console.log('  node scripts/dev.js db:fresh');
        console.log('  node scripts/dev.js test:all');
        console.log('');
    }

    async setup() {
        Logger.info('🚀 Running complete project setup...');

        this.exec('npm install');

        if (!existsSync('.env')) {
            if (existsSync('.env.example')) {
                this.exec('cp .env.example .env');
                Logger.info('📝 Created .env from .env.example');
                Logger.warn('⚠️  Please update .env with your configuration');
            } else {
                Logger.warn('⚠️  .env.example not found, please create .env manually');
            }
        }

        await this.resetDatabase();
        Logger.info('✅ Project setup completed!');
    }

    async resetDatabase() {
        Logger.info('🗄️  Resetting database...');

        try {
            this.exec('npm run db:drop', { stdio: 'pipe' });
        } catch (error) {
            Logger.info('Database does not exist, creating new one');
        }

        this.exec('npm run db:create');
        this.exec('npm run db:migrate');
        Logger.info('✅ Database reset completed');
    }

    async freshDatabase() {
        await this.resetDatabase();
        Logger.info('🌱 Seeding database...');
        this.exec('npm run db:seed');
        Logger.info('✅ Fresh database with seeds ready');
    }

    async runAllTests() {
        Logger.info('🧪 Running all tests...');
        this.exec('npm run test:coverage');
        this.exec('npm run lint');
        Logger.info('✅ All tests completed');
    }

    async lintAndFormat() {
        Logger.info('🔧 Linting and formatting code...');
        this.exec('npm run lint:fix');
        this.exec('npm run format');
        Logger.info('✅ Code linted and formatted');
    }

    async checkHealth() {
        Logger.info('🏥 Checking application health...');

        // Check Node.js version
        const nodeVersion = process.version;
        Logger.info(`Node.js version: ${nodeVersion}`);

        // Check npm version
        try {
            const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
            Logger.info(`npm version: ${npmVersion}`);
        } catch (error) {
            Logger.warn('npm not found');
        }

        // Check dependencies
        Logger.info('Checking dependencies...');
        this.exec('npm audit', { stdio: 'pipe' });

        // Check environment file
        if (existsSync('.env')) {
            Logger.info('✅ .env file exists');
        } else {
            Logger.warn('⚠️  .env file missing');
        }

        // Check database connection (if server is running)
        try {
            this.exec('npm run health-check', { stdio: 'pipe' });
            Logger.info('✅ Server health check passed');
        } catch (error) {
            Logger.warn('⚠️  Server not running or health check failed');
        }

        Logger.info('✅ Health check completed');
    }

    async cleanLogs() {
        Logger.info('🧹 Cleaning log files...');

        if (existsSync('logs')) {
            this.exec('rm -rf logs/*');
            Logger.info('✅ Log files cleaned');
        } else {
            Logger.info('ℹ️  No log files to clean');
        }
    }

    async cleanAll() {
        Logger.info('🧹 Cleaning all temporary files...');

        const cleanCommands = [
            'rm -rf logs/*',
            'rm -rf coverage',
            'rm -rf node_modules',
            'rm -f *.log',
            'rm -rf .nyc_output'
        ];

        cleanCommands.forEach(cmd => {
            try {
                this.exec(cmd, { stdio: 'pipe' });
            } catch (error) {
                // Ignore errors for files that don't exist
            }
        });

        Logger.info('✅ Cleanup completed');
        Logger.info('💡 Run "npm install" to reinstall dependencies');
    }

    async buildDocker() {
        Logger.info('🐳 Building Docker image...');
        this.exec('docker build -t academic-resources-api .');
        Logger.info('✅ Docker image built successfully');
    }

    async runDocker() {
        Logger.info('🐳 Running application in Docker...');
        this.exec('docker run -p 3000:3000 --env-file .env academic-resources-api');
    }

    exec(command, options = {}) {
        Logger.info(`Executing: ${command}`);
        return execSync(command, {
            stdio: 'inherit',
            encoding: 'utf8',
            ...options
        });
    }
}

// Ejecutar helper si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const helper = new DevHelper();
    helper.run().catch((error) => {
        Logger.error('Dev helper failed:', error);
        process.exit(1);
    });
}

export { DevHelper };