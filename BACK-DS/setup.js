#!/usr/bin/env node

/**
 * Setup script for BACK-DS backend
 * This script checks dependencies and initializes the database
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

const REQUIRED_DIRS = [
    'public/uploads/resources',
    'public/uploads/thumbnails', 
    'public/uploads/profiles',
    'public/uploads/general'
];

const REQUIRED_PACKAGES = [
    'express',
    'sequelize',
    'pg',
    'pg-hstore',
    'jsonwebtoken',
    'bcryptjs',
    'multer',
    'joi',
    'cors',
    'helmet',
    'express-rate-limit',
    'dotenv'
];

async function checkDirectories() {
    console.log('📁 Verificando directorios...');
    
    for (const dir of REQUIRED_DIRS) {
        try {
            await fs.access(dir);
            console.log(`✅ ${dir} existe`);
        } catch {
            await fs.mkdir(dir, { recursive: true });
            console.log(`📁 Creado: ${dir}`);
        }
    }
}

async function checkPackages() {
    console.log('📦 Verificando dependencias...');
    
    try {
        const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
        const installed = Object.keys(packageJson.dependencies || {});
        
        const missing = REQUIRED_PACKAGES.filter(pkg => !installed.includes(pkg));
        
        if (missing.length > 0) {
            console.log(`📦 Instalando paquetes faltantes: ${missing.join(', ')}`);
            execSync(`npm install ${missing.join(' ')}`, { stdio: 'inherit' });
        } else {
            console.log('✅ Todas las dependencias están instaladas');
        }
    } catch (error) {
        console.error('❌ Error verificando dependencias:', error.message);
    }
}

async function checkEnvFile() {
    console.log('🔧 Verificando archivo .env...');
    
    try {
        await fs.access('.env');
        console.log('✅ Archivo .env existe');
        
        // Read and validate .env
        const envContent = await fs.readFile('.env', 'utf8');
        const requiredVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];
        
        for (const varName of requiredVars) {
            if (!envContent.includes(varName)) {
                console.warn(`⚠️  Variable ${varName} no encontrada en .env`);
            }
        }
    } catch {
        console.log('📝 Creando archivo .env de ejemplo...');
        const envTemplate = `# Base de datos PostgreSQL
DB_NAME=back_ds
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=127.0.0.1
DB_PORT=5432

# JWT Secrets
JWT_SECRET=tu-jwt-secret-muy-seguro
JWT_REFRESH_SECRET=tu-refresh-secret-muy-seguro

# Servidor
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
`;
        await fs.writeFile('.env.example', envTemplate);
        console.log('📝 Archivo .env.example creado. Copia y renombra a .env');
    }
}

async function main() {
    console.log('🚀 Inicializando BACK-DS...\n');
    
    await checkDirectories();
    console.log('');
    
    await checkPackages();
    console.log('');
    
    await checkEnvFile();
    console.log('');
    
    console.log('✅ Inicialización completada!');
    console.log('💡 Para ejecutar el servidor: npm run dev');
}

main().catch(console.error);