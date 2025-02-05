import { verifyToken } from '../helpers/jwt.js';

const validateToken = (req, res, next) => {
    const bearerToken = req.headers['authorization'];
    if (!bearerToken) {
        res.status(401).json({
            status: 102,
            message: "Token tidak ditemukan",
            data: null
        });
    }

    const token = bearerToken.split(' ')[1];

    try {
        const user = verifyToken(token);
        req.email = user.email;
        next();
    }
    catch (err) {
        res.status(401).json({
            status: 102,
            message: "Token tidak valid",
            data: null
        });
    }
}

export default validateToken;