// Test para verificar qué hay realmente en la base de datos
import sequelize from './src/config/database.js';
import User from './src/models/User.js';
import bcrypt from 'bcryptjs';

const checkUserInDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a la base de datos');

        // Buscar el usuario test
        const user = await User.findOne({ 
            where: { email: 'test@test.com' } 
        });

        if (!user) {
            console.log('❌ Usuario no encontrado en la base de datos');
            return;
        }

        console.log('👤 Usuario encontrado:');
        console.log('  - ID:', user.id);
        console.log('  - Email:', user.email);
        console.log('  - Name:', user.name);
        console.log('  - Status:', user.status);
        console.log('  - Password hash length:', user.password?.length);
        console.log('  - Password hash preview:', user.password?.substring(0, 20) + '...');

        // Probar la comparación directamente
        const testPassword = '123456';
        console.log('\n🔐 Probando comparación directa:');
        console.log('  - Test password:', testPassword);
        console.log('  - Test password length:', testPassword.length);
        
        const isValid = await bcrypt.compare(testPassword, user.password);
        console.log('  - Comparison result:', isValid);

        // Probar con variaciones
        const variations = ['123456', ' 123456', '123456 ', 'test123', 'password'];
        console.log('\n🧪 Probando variaciones:');
        for (const pwd of variations) {
            const result = await bcrypt.compare(pwd, user.password);
            console.log(`  - "${pwd}": ${result}`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
};

checkUserInDB();