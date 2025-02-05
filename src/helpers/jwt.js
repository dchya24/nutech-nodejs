import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Generate token
export const generateToken = (user) => {
    return jwt.sign({
        id: user.id,
        email: user.email,
    }, JWT_SECRET, { expiresIn: '12h' });
}

// Verify token
export const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
}