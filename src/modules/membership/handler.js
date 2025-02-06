import bcrypt from "bcrypt";
import error from "../../helpers/error.js";
import repo from "./repository.js";
import fs from "fs";
import { generateToken } from "../../helpers/jwt.js";

const register = async (req, res) => {
    try {
        const { email, first_name, last_name, password } = req.body;

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
    try {
        const { email, password } = req.body;

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

const getProfile = async (req, res) => {
    const email = req.email;

    const user = await repo.findByEmail(email);

    if (!user) {
        res.status(404).json({
            status: 102,
            message: "User not found",
            data: null
        });
        return;
    }

    res.status(200).json({
        status: 0,
        message: "Success",
        data: user.toResponse()
    });

}

const updateProfile = async (req, res) => {
    try{
        const { first_name, last_name } = req.body;
        const email = req.email;

        const user = await repo.findByEmail(email);

        if (!user) {
            res.status(404).json({
                status: 102,
                message: "User not found",
                data: null
            });
            return;
        }

        user.first_name = first_name;
        user.last_name = last_name;

        await repo.update(user);

        res.status(200).json({
            status: 0,
            message: "Update profile success",
            data: user.toResponse()
        });
    }
    catch (err) {
        console.log("Error: ", err);
        res.status(500).json({
            status: 999,
            message: "Internal Server Error"
        });
    }
}

const updateProfileImage = async (req, res) => {
    try{
        if(!req.file) {
            throw new Error(error.EMPTY_IMAGE);
        }

        const email = req.email;
        const user = await repo.findByEmail(email);

        if (!user) {
            res.status(404).json({
                status: 102,
                message: "User not found",
                data: null
            });
            return;
        }

        const oldImage = user.profile_image;
        user.profile_image = req.file.path;

        await repo.update(user);

        // delete old image
        if(oldImage) {
            // get project path
            const projectPath = process.cwd();
            const oldImagePath = projectPath + "/" + oldImage;

            // check if file exist
            if(fs.existsSync(oldImagePath)) {
                fs.unlink(oldImagePath, (err) => {
                    if(err) {
                        console.error("Error delete file: ", err);
                        throw new Error("Error delete file");
                    }
                });
            }
        }

        res.status(200).json({
            status: 0,
            message: "Update profile image success",
            data: user.toResponse()
        });
    }
    catch (err) {
        console.error("Error:", err);

        if(err.message === error.EMPTY_IMAGE) {
            res.status(400).json({
                status: 104,
                message: error.EMPTY_IMAGE,
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

export default { 
    register, 
    login, 
    getProfile,
    updateProfile,
    updateProfileImage
};