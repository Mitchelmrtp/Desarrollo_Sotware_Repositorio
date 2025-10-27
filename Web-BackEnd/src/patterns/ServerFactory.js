/**
 * Server Factory Implementation
 * Utiliza el patrón Factory para crear diferentes tipos de servidores
 */

import { Logger } from '../utils/Logger.js';
import ServerApplication from '../core/ServerApplication.js';

class HTTPServer {
    constructor(port, host) {
        this.port = port;
        this.host = host;
        this.serverApp = new ServerApplication();
        this.server = null;
    }

    async start() {
        try {
            Logger.info(`Starting HTTP Server on ${this.host}:${this.port}...`);
            
            // Inicializar la aplicación del servidor
            await this.serverApp.initialize();
            
            // Obtener la aplicación Express
            const app = this.serverApp.getApp();
            
            return new Promise((resolve, reject) => {
                this.server = app.listen(this.port, this.host, (error) => {
                    if (error) {
                        Logger.error(`HTTP Server failed to start: ${error.message}`);
                        reject(error);
                    } else {
                        Logger.info(`HTTP Server started successfully on ${this.host}:${this.port}`);
                        resolve(this.server);
                    }
                });

                this.server.on('error', (error) => {
                    Logger.error(`HTTP Server error: ${error.message}`);
                    reject(error);
                });
            });
        } catch (error) {
            Logger.error('Error starting HTTP server:', error);
            throw error;
        }
    }

    async stop() {
        return new Promise((resolve) => {
            if (this.server) {
                this.server.close(() => {
                    Logger.info('HTTP Server stopped');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    getServerApp() {
        return this.serverApp;
    }
}

class HTTPSServer {
    constructor(port, host, options) {
        this.port = port;
        this.host = host;
        this.options = options;
        this.serverApp = new ServerApplication();
        this.server = null;
    }

    async start() {
        try {
            const https = await import('https');
            
            Logger.info(`Starting HTTPS Server on ${this.host}:${this.port}...`);
            
            // Inicializar la aplicación del servidor
            await this.serverApp.initialize();
            
            // Obtener la aplicación Express
            const app = this.serverApp.getApp();
            
            return new Promise((resolve, reject) => {
                this.server = https.createServer(this.options, app);
                
                this.server.listen(this.port, this.host, (error) => {
                    if (error) {
                        Logger.error(`HTTPS Server failed to start: ${error.message}`);
                        reject(error);
                    } else {
                        Logger.info(`HTTPS Server started successfully on ${this.host}:${this.port}`);
                        resolve(this.server);
                    }
                });

                this.server.on('error', (error) => {
                    Logger.error(`HTTPS Server error: ${error.message}`);
                    reject(error);
                });
            });
        } catch (error) {
            Logger.error('Error starting HTTPS server:', error);
            throw error;
        }
    }

    async stop() {
        return new Promise((resolve) => {
            if (this.server) {
                this.server.close(() => {
                    Logger.info('HTTPS Server stopped');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    getServerApp() {
        return this.serverApp;
    }
}

export class ServerFactory {
    static createServer(type, port, host, options = {}) {
        Logger.info(`Creating ${type.toUpperCase()} server instance`);

        switch (type.toLowerCase()) {
            case 'http':
                return new HTTPServer(port, host);
            
            case 'https':
                if (!options.key || !options.cert) {
                    throw new Error('HTTPS server requires SSL certificate options (key and cert)');
                }
                return new HTTPSServer(port, host, options);
            
            default:
                Logger.error(`Unsupported server type: ${type}`);
                throw new Error(`Unsupported server type: ${type}`);
        }
    }

    static async createAndStartServer(type, port, host, options = {}) {
        try {
            const server = this.createServer(type, port, host, options);
            await server.start();
            return server;
        } catch (error) {
            Logger.error('Error creating and starting server:', error);
            throw error;
        }
    }
}