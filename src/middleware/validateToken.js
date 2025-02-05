import { verifyToken } from '../helpers/jwt.js';

const validateToken = (req, res, next) => {
    try {
        const bearerToken = req.headers['authorization'];
        if (!bearerToken) {
            throw new Error("Token tidak ditemukan");
        }
    
        const token = bearerToken.split(' ')[1];
        const user = verifyToken(token);
        req.email = user.email;
        next();
    }
    catch (err) {
        res.status(401).json({
            status: 108,
            message: "Token tidak tidak valid atau kadaluwarsa",
            data: null
        });
    }
}

export default validateToken;