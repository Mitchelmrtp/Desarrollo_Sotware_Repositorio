import { User } from '../models/index.js';
import { 
    authenticateUser, 
    generateTokenPair, 
    refreshAccessToken,
    logoutUser 
} from '../services/authService.js';

// Register new user
export const register = async (req, res) => {
    try {
        const { name, email, password, first_name, last_name, role = 'user' } = req.body;
        console.log('🔵 Registration attempt:', { email, passwordLength: password?.length, name, first_name, last_name });

        // Validate required fields
        if (!name || !email || !password) {
            console.log('❌ Missing required fields');
            return res.error('Nombre, email y contraseña son requeridos', 400);
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            console.log('❌ User already exists:', email);
            return res.error('El email ya está registrado', 400);
        }

        // Create user (password will be hashed automatically by User model hooks)
        console.log('👤 Creating user in database...');
        const user = await User.create({
            name,
            email,
            password: password, // Raw password - will be hashed by beforeCreate hook
            first_name,
            last_name,
            role,
            status: 'active'
        });
        console.log('✅ User created:', { id: user.id, email: user.email });

        // Generate tokens
        const tokens = generateTokenPair(user);
        console.log('✅ Tokens generated for new user');

        const safeUser = user.toSafeObject();
        console.log('👤 Safe user object:', JSON.stringify(safeUser, null, 2));
        console.log('🔑 Tokens:', JSON.stringify(tokens, null, 2));

        const responseData = {
            user: safeUser,
            ...tokens
        };
        console.log('📤 Full response data:', JSON.stringify(responseData, null, 2));

        res.success(responseData, 'Usuario registrado exitosamente', 201);

    } catch (error) {
        console.error('❌ Register error:', error);
        res.error('Error interno del servidor', 500);
    }
};

// Login user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('🔵 Login attempt details:');
        console.log('  - Email:', email);
        console.log('  - Password length:', password?.length);
        console.log('  - Password preview:', password?.substring(0, 3) + '...');
        console.log('  - Full request body keys:', Object.keys(req.body));

        // Validate required fields
        if (!email || !password) {
            console.log('❌ Missing credentials');
            return res.error('Email y contraseña son requeridos', 400);
        }

        // Authenticate user
        const user = await authenticateUser(email, password);
        console.log('✅ User authenticated:', user.email);

        // Generate tokens
        const tokens = generateTokenPair(user);
        console.log('✅ Tokens generated successfully');

        const safeUser = user.toSafeObject();
        console.log('👤 Login safe user object:', JSON.stringify(safeUser, null, 2));
        console.log('🔑 Login tokens:', JSON.stringify(tokens, null, 2));

        const responseData = {
            user: safeUser,
            ...tokens
        };
        console.log('📤 Login full response data:', JSON.stringify(responseData, null, 2));

        res.success(responseData, 'Login exitoso');

    } catch (error) {
        console.error('❌ Login error:', error.message);
        
        if (error.message === 'Credenciales inválidas' || 
            error.message === 'Cuenta suspendida o desactivada') {
            return res.error(error.message, 401);
        }

        res.error('Error interno del servidor', 500);
    }
};

// Get current user profile
export const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.error('Usuario no encontrado', 404);
        }

        res.success(user.toSafeObject(), 'Perfil obtenido exitosamente');

    } catch (error) {
        console.error('Get profile error:', error);
        res.error('Error interno del servidor', 500);
    }
};

// Refresh access token
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            return res.error('Refresh token requerido', 400);
        }

        const result = await refreshAccessToken(token);

        res.success({
            accessToken: result.accessToken,
            user: result.user
        }, 'Token renovado exitosamente');

    } catch (error) {
        console.error('Refresh token error:', error);
        res.error('Refresh token inválido', 401);
    }
};

// Logout user
export const logout = async (req, res) => {
    try {
        await logoutUser(req.user.userId);

        res.success(null, 'Logout exitoso');

    } catch (error) {
        console.error('Logout error:', error);
        res.error('Error interno del servidor', 500);
    }
};

// Forgot password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ where: { email } });
        if (!user) {
            // Don't reveal if email exists for security
            return res.success(null, 'Si el email existe, recibirás un enlace de recuperación');
        }

        // Generate password reset token
        const { generatePasswordResetToken } = await import('../services/authService.js');
        const resetToken = generatePasswordResetToken(user.id);

        // In a real application, you would:
        // 1. Save the token to database with expiration
        // 2. Send email with reset link
        
        // For now, return the token (REMOVE IN PRODUCTION)
        console.log(`Password reset token for ${email}: ${resetToken}`);

        res.success({
            // TODO: Remove in production
            ...(process.env.NODE_ENV === 'development' && { resetToken })
        }, 'Si el email existe, recibirás un enlace de recuperación');

    } catch (error) {
        console.error('Forgot password error:', error);
        res.error('Error interno del servidor', 500);
    }
};

// Reset password
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.error('Token y nueva contraseña son requeridos', 400);
        }

        // Verify password reset token
        const { verifyPasswordResetToken } = await import('../services/authService.js');
        const decoded = verifyPasswordResetToken(token);

        // Find user
        const user = await User.findByPk(decoded.userId);
        if (!user) {
            return res.error('Usuario no encontrado', 404);
        }

        // Hash new password
        const hashedPassword = await hashPassword(password);

        // Update password
        await user.update({ password: hashedPassword });

        res.success(null, 'Contraseña restablecida exitosamente');

    } catch (error) {
        console.error('Reset password error:', error);
        
        if (error.message.includes('Token de restablecimiento inválido')) {
            return res.error(error.message, 400);
        }

        res.error('Error interno del servidor', 500);
    }
};