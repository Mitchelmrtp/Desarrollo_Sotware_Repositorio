// Test específico para debugging de contraseñas
import bcrypt from 'bcryptjs';

const testPasswordHashing = async () => {
    const plainPassword = "123456";
    
    console.log('🔐 Testing password hashing...');
    console.log('Plain password:', plainPassword);
    console.log('Plain password length:', plainPassword.length);
    
    // Test 1: Hash the password like in registration
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    console.log('\n📝 Generated hash:', hashedPassword);
    console.log('Hash length:', hashedPassword.length);
    
    // Test 2: Compare the same password
    const isValid = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('\n✓ Comparison result:', isValid);
    
    // Test 3: Try different variations
    const testCases = [
        "123456",
        " 123456",
        "123456 ",
        " 123456 "
    ];
    
    console.log('\n🧪 Testing variations:');
    for (const testPassword of testCases) {
        const result = await bcrypt.compare(testPassword, hashedPassword);
        console.log(`  "${testPassword}" (length: ${testPassword.length}): ${result}`);
    }
    
    // Test 4: Check if we're double hashing
    console.log('\n🔄 Testing double hashing:');
    const doubleHashed = await bcrypt.hash(hashedPassword, saltRounds);
    console.log('Double hash result length:', doubleHashed.length);
    
    const doubleCompare = await bcrypt.compare(plainPassword, doubleHashed);
    console.log('Double hash comparison:', doubleCompare);
};

testPasswordHashing();