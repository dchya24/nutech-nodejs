import { verifyToken } from '../helpers/jwt.js';
import memberRepository from '../modules/membership/repository.js';
import pool from '../database/connect.js';

const validateToken = async (req, res, next) => {
    try {
        const bearerToken = req.headers['authorization'];
        if (!bearerToken) {
            throw new Error("Token tidak ditemukan");
        }
    
        const token = bearerToken.split(' ')[1];
        const user = verifyToken(token);

        // check if user is not null
        const checkUser = await memberRepository.findByEmail(pool, user.email);
        
        if (!checkUser) {
            throw new Error("User tidak ditemukan");
        }

        req.email = user.email;
        next();
    }
    catch (err) {
        console.log("[validateToken] Error: ", err);
        res.status(401).json({
            status: 108,
            message: "Token tidak tidak valid atau kadaluwarsa",
            data: null
        });
    }
}

export default validateToken;