// Script para limpiar y probar con un usuario nuevo
import sequelize from './src/config/database.js';
import User from './src/models/User.js';
import bcrypt from 'bcryptjs';


const cleanAndTest = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a la base de datos');

        // 1. Eliminar usuario existente
        const deleted = await User.destroy({ 
            where: { email: 'test@test.com' },
            force: true // Eliminación permanente, no soft delete
        });
        console.log('🗑️ Usuarios eliminados:', deleted);

        // 2. Crear nuevo usuario con contraseña conocida (será hasheada por el hook)
        const plainPassword = '123456';
        console.log('🔐 Contraseña original:', plainPassword);

        const newUser = await User.create({
            name: 'Test User',
            email: 'test@test.com',
            password: plainPassword, // Raw password - hook will hash it
            first_name: 'Test',
            last_name: 'User',
            role: 'user',
            status: 'active'
        });
        
        console.log('🔐 Hash después del hook:', newUser.password);
        console.log('👤 Usuario creado:', newUser.id);

        // 3. Verificar inmediatamente con el hash del hook
        const verification = await bcrypt.compare(plainPassword, newUser.password);
        console.log('✅ Verificación inmediata:', verification);

        // 4. Recuperar de la base de datos y verificar
        const savedUser = await User.findOne({ where: { email: 'test@test.com' } });
        const dbVerification = await bcrypt.compare(plainPassword, savedUser.password);
        console.log('✅ Verificación desde DB:', dbVerification);

        console.log('\n🎯 Resumen:');
        console.log('- Contraseña original:', plainPassword);
        console.log('- Hash en DB (hook):', savedUser.password);
        console.log('- Verificación funciona:', dbVerification);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
};

cleanAndTest();