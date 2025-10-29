import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token de autenticación requerido' });
        }

        const token = authHeader.slice(7); // Remove 'Bearer ' prefix
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        
        // Verify user still exists and is active
        const user = await User.findByPk(decoded.userId);
        if (!user || user.status !== 'active') {
            return res.status(401).json({ message: 'Usuario no válido o inactivo' });
        }

        req.user = {
            userId: user.id,
            role: user.role,
            email: user.email
        };
        
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token inválido' });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado' });
        }
        
        return res.status(401).json({ message: 'Error de autenticación' });
    }
};

// Optional auth middleware - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req.user = null;
            return next();
        }

        const token = authHeader.slice(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        
        const user = await User.findByPk(decoded.userId);
        if (user && user.status === 'active') {
            req.user = {
                userId: user.id,
                role: user.role,
                email: user.email
            };
        } else {
            req.user = null;
        }
        
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

export default authMiddleware;