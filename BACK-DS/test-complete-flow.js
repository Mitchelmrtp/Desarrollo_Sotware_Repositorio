// Test completo del flujo frontend-backend
import sequelize from './src/config/database.js';
import User from './src/models/User.js';

const testCompleteFlow = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a la base de datos');

        // 1. Limpiar usuario de test anterior
        await User.destroy({ where: { email: 'flowtest2@test.com' } });
        console.log('🗑️ Usuario de test eliminado');

        // 2. Crear usuario de test (simulando registro desde frontend)
        console.log('\n🔧 === SIMULANDO REGISTRO DESDE FRONTEND ===');
        const newUser = await User.create({
            name: 'Flow Test',
            email: 'flowtest2@test.com', 
            password: 'testpass123', // Contraseña raw - será hasheada por hook
            first_name: 'Flow',
            last_name: 'Test',
            role: 'user',
            status: 'active'
        });

        console.log('✅ Usuario creado:', {
            id: newUser.id,
            email: newUser.email,
            hashLength: newUser.password.length
        });

        console.log('\n🔧 === SIMULANDO LOGIN DESDE FRONTEND ===');
        
        // 3. Simular el flujo de login completo
        // Buscar usuario por email
        const foundUser = await User.findOne({ 
            where: { 
                email: 'flowtest2@test.com',
                status: 'active'
            } 
        });

        if (!foundUser) {
            throw new Error('Usuario no encontrado');
        }

        // Verificar contraseña usando bcrypt directo (como hace authService)
        const bcrypt = await import('bcryptjs');
        const isPasswordValid = await bcrypt.default.compare('testpass123', foundUser.password);
        
        console.log('🔐 Verificación de contraseña:', isPasswordValid);
        
        if (isPasswordValid) {
            console.log('✅ LOGIN EXITOSO - El flujo completo funciona');
            console.log('🎯 Usuario autenticado:', {
                id: foundUser.id,
                email: foundUser.email,
                name: foundUser.name,
                role: foundUser.role
            });
        } else {
            console.log('❌ LOGIN FALLIDO - Contraseña incorrecta');
        }

    } catch (error) {
        console.error('❌ Error en el test:', error.message);
    } finally {
        await sequelize.close();
    }
};

testCompleteFlow();