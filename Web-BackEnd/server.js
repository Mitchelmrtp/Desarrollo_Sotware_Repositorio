/**
 * Main Server Entry Point
 * Punto de entrada principal del servidor
 */

import { ConfigurationManager } from './src/utils/ConfigurationManager.js';
import { Logger } from './src/utils/Logger.js';
import { ServerFactory } from './src/patterns/factories/ServerFactory.js';

class ServerRunner {
    constructor() {
        this.config = ConfigurationManager.getInstance();
        this.server = null;
    }

    async start() {
        try {
            Logger.info('Starting Academic Resources API Server...');

            // Configuración del servidor
            const serverType = this.config.get('SERVER_TYPE', 'http');
            const port = parseInt(this.config.get('PORT', '3000'));
            const host = this.config.get('HOST', 'localhost');

            Logger.info(`Server configuration: ${serverType.toUpperCase()} on ${host}:${port}`);
            Logger.info(`Environment: ${this.config.get('NODE_ENV', 'development')}`);

            // Crear y iniciar servidor usando Factory
            if (serverType === 'https') {
                // Configuración HTTPS (requiere certificados)
                const fs = await import('fs');
                const sslOptions = {
                    key: fs.readFileSync(this.config.get('SSL_KEY_PATH')),
                    cert: fs.readFileSync(this.config.get('SSL_CERT_PATH'))
                };
                
                this.server = await ServerFactory.createAndStartServer('https', port, host, sslOptions);
            } else {
                // Configuración HTTP
                this.server = await ServerFactory.createAndStartServer('http', port, host);
            }

            Logger.info('✅ Academic Resources API Server started successfully!');
            Logger.info(`📍 Server running on: http${serverType === 'https' ? 's' : ''}://${host}:${port}`);
            Logger.info(`📖 API Info: http${serverType === 'https' ? 's' : ''}://${host}:${port}/api/info`);
            Logger.info(`🏥 Health Check: http${serverType === 'https' ? 's' : ''}://${host}:${port}/api/health`);

            return this.server;
        } catch (error) {
            Logger.error('❌ Failed to start server:', error);
            process.exit(1);
        }
    }

    async stop() {
        try {
            if (this.server) {
                Logger.info('Stopping server...');
                await this.server.stop();
                Logger.info('✅ Server stopped successfully');
            }
        } catch (error) {
            Logger.error('❌ Error stopping server:', error);
        }
    }
}

// Inicializar y ejecutar servidor
const serverRunner = new ServerRunner();

// Manejar cierre graceful
process.on('SIGTERM', async () => {
    Logger.info('SIGTERM received, shutting down gracefully...');
    await serverRunner.stop();
    process.exit(0);
});

process.on('SIGINT', async () => {
    Logger.info('SIGINT received, shutting down gracefully...');
    await serverRunner.stop();
    process.exit(0);
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
    Logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    Logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Iniciar servidor
const isMainModule = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));

if (isMainModule) {
    serverRunner.start().catch((error) => {
        Logger.error('Failed to start server:', error);
        process.exit(1);
    });
}

export default serverRunner;