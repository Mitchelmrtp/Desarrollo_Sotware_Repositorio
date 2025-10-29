// Test simple para verificar el login
import fetch from 'node-fetch';

const testLogin = async () => {
    try {
        console.log('🧪 Testing backend connectivity...');
        
        // Test 1: Health check
        const healthResponse = await fetch('http://localhost:3001/api/health');
        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('✅ Health check passed:', healthData.message);
        } else {
            console.log('❌ Health check failed:', healthResponse.status);
            return;
        }

        // Test 2: Register a test user
        console.log('\n🧪 Testing user registration...');
        const registerData = {
            name: "Test User",
            email: "test@test.com",
            password: "123456",
            first_name: "Test",
            last_name: "User",
            role: "user"
        };

        const registerResponse = await fetch('http://localhost:3001/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        });

        if (registerResponse.ok) {
            const regData = await registerResponse.json();
            console.log('✅ Registration successful:', regData.message);
        } else {
            const regError = await registerResponse.json();
            console.log('⚠️ Registration response:', regError.message);
        }

        // Test 3: Login with the test user
        console.log('\n🧪 Testing user login...');
        const loginData = {
            email: "test@test.com",
            password: "123456"
        };

        const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        if (loginResponse.ok) {
            const loginResult = await loginResponse.json();
            console.log('✅ Login successful:', loginResult.message);
            console.log('👤 User data received:', !!loginResult.data.user);
            console.log('🔑 Token received:', !!loginResult.data.accessToken);
        } else {
            const loginError = await loginResponse.json();
            console.log('❌ Login failed:', loginError.message);
            console.log('📄 Full error response:', loginError);
        }

    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
};

testLogin();