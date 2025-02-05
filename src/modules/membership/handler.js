import bcrypt from "bcrypt";
import error from "../../helpers/error.js";
import repo from "./repository.js";
import { generateToken } from "../../helpers/jwt.js";

const register = async (req, res) => {
    const { email, first_name, last_name, password } = req.body;
    try {
        const newUser = new repo.User(email, first_name, last_name, password);

        // Check if user already exist
        const user = await repo.findByEmail(email);
        if (user) {
            throw new Error(error.USER_EXIST);
        }

        // Save user to database
        await repo.save(newUser);

        res.status(200).json({
            status: 0,
            message: "Registrasi berhasil silahkan login",
            data: null
        })
    }
    catch (err) {
        console.log("Error: ", err);

        if (err.message === error.USER_EXIST) {
            res.status(409).json({
                status: 101,
                message: "Email sudah terdaftar",
                data: null
            });
            return;
        }

        res.status(500).json({
            status: 999,
            message: "Internal Server Error"
        });
    }

}

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if user exist
        const user = await repo.findByEmail(email);
        if (!user) {
            throw new Error(error.USER_NOT_FOUND);
        }

        // Check if password match
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            throw new Error(error.INVALID_CREDENSIAL);
        }

        // generate token
        const token = generateToken({id: user.id, email: user.email});

        res.status(200).json({
            status: 0,
            message: "Login Sukses",
            data: {
                token: token
            }
        });
    }
    catch (err) {
        console.log("Error: ", err);

        // Handle error if user not found or invalid credensial
        if (err.message === error.USER_NOT_FOUND || err.message === error.INVALID_CREDENSIAL) {
            res.status(401).json({
                status: 103,
                message: error.INVALID_CREDENSIAL,
                data: null
            });
            return;
        }

        res.status(500).json({
            status: 999,
            message: "Internal Server Error"
        });
    }
}

export default { register, login };