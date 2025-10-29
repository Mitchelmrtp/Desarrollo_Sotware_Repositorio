import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';

// JWT secret keys (should be in environment variables)
const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'your-access-token-secret';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret';

// Token expiration times
const ACCESS_TOKEN_EXPIRES_IN = '1h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

// Generate access token
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRES_IN
    });
};

// Generate refresh token
export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN
    });
};

// Verify access token
export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (error) {
        throw new Error('Token inválido o expirado');
    }
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw new Error('Refresh token inválido o expirado');
    }
};

// Hash password
export const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

// Verify password
export const verifyPassword = async (plainPassword, hashedPassword) => {
    console.log('🔐 Password verification details:');
    console.log('  - Plain password length:', plainPassword?.length);
    console.log('  - Hashed password length:', hashedPassword?.length);
    console.log('  - Hashed password preview:', hashedPassword?.substring(0, 20) + '...');
    
    const result = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('  - Comparison result:', result);
    
    return result;
};

// Generate token pair
export const generateTokenPair = (user) => {
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role
    };

    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload)
    };
};

// Authenticate user credentials
export const authenticateUser = async (email, password) => {
    try {
        console.log('🔍 Authenticating user:', email);
        
        // Find user by email
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            console.log('❌ User not found:', email);
            throw new Error('Credenciales inválidas');
        }

        console.log('✅ User found:', { id: user.id, email: user.email, status: user.status });

        // Check if user is active
        if (user.status === 'suspended' || user.status === 'deleted') {
            console.log('❌ User account inactive:', user.status);
            throw new Error('Cuenta suspendida o desactivada');
        }

        // Verify password
        console.log('🔐 Verifying password...');
        const isValidPassword = await verifyPassword(password, user.password);
        console.log('🔐 Password verification result:', isValidPassword);
        
        if (!isValidPassword) {
            console.log('❌ Invalid password for user:', email);
            throw new Error('Credenciales inválidas');
        }

        // Update last login
        console.log('✅ Updating last login timestamp');
        await user.update({ last_login_at: new Date() });

        console.log('✅ Authentication successful for:', email);
        return user;
    } catch (error) {
        console.error('❌ Authentication failed:', error.message);
        throw error;
    }
};

// Refresh access token
export const refreshAccessToken = async (refreshToken) => {
    try {
        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);
        
        // Find user
        const user = await User.findByPk(decoded.userId);
        
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        if (user.status === 'suspended' || user.status === 'deleted') {
            throw new Error('Cuenta suspendida o desactivada');
        }

        // Generate new access token
        const newAccessToken = generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role
        });

        return {
            accessToken: newAccessToken,
            user: user.toSafeObject()
        };
    } catch (error) {
        throw error;
    }
};

// Validate token and get user
export const validateTokenAndGetUser = async (token) => {
    try {
        const decoded = verifyAccessToken(token);
        
        const user = await User.findByPk(decoded.userId, {
            attributes: { exclude: ['password'] }
        });
        
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        if (user.status === 'suspended' || user.status === 'deleted') {
            throw new Error('Cuenta suspendida o desactivada');
        }

        return { user, decoded };
    } catch (error) {
        throw error;
    }
};

// Logout user (invalidate tokens)
// Note: In a production app, you might want to maintain a blacklist of tokens
export const logoutUser = async (userId) => {
    try {
        // Update user's last logout time
        await User.update(
            { last_logout: new Date() },
            { where: { id: userId } }
        );
        
        return true;
    } catch (error) {
        console.error('Logout error:', error);
        return false;
    }
};

// Check if user has permission
export const checkUserPermission = (user, requiredRole) => {
    const roleHierarchy = {
        'user': 0,
        'moderator': 1,
        'admin': 2
    };

    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
};

// Generate password reset token
export const generatePasswordResetToken = (userId) => {
    return jwt.sign(
        { userId, type: 'password_reset' },
        ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
    );
};

// Verify password reset token
export const verifyPasswordResetToken = (token) => {
    try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        
        if (decoded.type !== 'password_reset') {
            throw new Error('Token inválido');
        }
        
        return decoded;
    } catch (error) {
        throw new Error('Token de restablecimiento inválido o expirado');
    }
};