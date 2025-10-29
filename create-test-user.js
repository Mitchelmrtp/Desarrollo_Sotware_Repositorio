// Script para crear un usuario de prueba
import { User } from './BACK-DS/src/models/User.js';
import bcrypt from 'bcryptjs';

async function createTestUser() {
    try {
        console.log('🔄 Creando usuario de prueba...');
        
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        const testUser = await User.create({
            name: 'Usuario Test',
            email: 'test@example.com',
            password: hashedPassword,
            role: 'user',
            status: 'active'
        });
        
        console.log('✅ Usuario creado exitosamente:', {
            id: testUser.id,
            name: testUser.name,
            email: testUser.email,
            role: testUser.role
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creando usuario:', error.message);
        process.exit(1);
    }
}

createTestUser();