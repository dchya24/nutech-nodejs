import bcrypt from "bcrypt";
import error from "../../type/error.js";
import repo from "./repository.js";
import fs from "fs";
import { generateToken } from "../../helpers/jwt.js";
import pool from "../../database/connect.js";

const register = async (req, res, next) => {
    const trx = await pool.connect();
    try {
        trx.query("BEGIN");
        const { email, first_name, last_name, password } = req.body;

        const newUser = new repo.User(null,email, first_name, last_name, password);

        // Check if user already exist
        const user = await repo.findByEmail(trx, email);
        if (user) {
            throw new Error(error.USER_EXIST);
        }

        // Save user to database
        const result = await repo.save(trx, newUser);

        if (!result) {
            throw new Error("Gagal menyimpan data user");
        }

        await trx.query("COMMIT");

        res.status(200).json({
            status: 0,
            message: "Registrasi berhasil silahkan login",
            data: null
        })
    }
    catch (err) {
        console.log("[membership/handler.register] Error: ", err);
        await trx.query("ROLLBACK");

        // Handle error if user already exist
        if (err.message === error.USER_EXIST) {
            res.status(409).json({
                status: 101,
                message: "Email sudah terdaftar",
                data: null
            });
            return;
        }

        next(err);
    }

}

const login = async (req, res, next) => {
    const trx = await pool.connect();
    try {
        const { email, password } = req.body;

        // Check if user exist
        const user = await repo.findByEmail(trx, email);
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
        console.log("[membership/handler.login] Error: ", err);

        // Handle error if user not found or invalid credensial
        if (err.message === error.USER_NOT_FOUND || err.message === error.INVALID_CREDENSIAL) {
            res.status(401).json({
                status: 103,
                message: error.INVALID_CREDENSIAL,
                data: null
            });
            return;
        }

        next(err);
    }
}

const getProfile = async (req, res, next) => {
    const trx = await pool.connect();
    try {
        const email = req.email;
    
        const user = await repo.findByEmail(trx, email);
    
        res.status(200).json({
            status: 0,
            message: "Success",
            data: user.toResponse()
        });
    }
    catch(err) {
        console.log("Error: ", err);

        next(err);
    }
}

const updateProfile = async (req, res) => {
    const trx = await pool.connect();
    try{
        await trx.query("BEGIN");

        const { first_name, last_name } = req.body;
        const email = req.email;

        const user = await repo.findByEmail(trx, email);

        user.first_name = first_name;
        user.last_name = last_name;

        const result = await repo.update(trx, user);

        if (!result) {
            throw new Error(error.FAILED_UPDATE);
        }

        await trx.query("COMMIT");

        res.status(200).json({
            status: 0,
            message: "Update profile success",
            data: user.toResponse()
        });
    }
    catch (err) {
        console.log("[membership/handler.updateProfile] Error: ", err);
        await trx.query("ROLLBACK");

        if(err.message === error.FAILED_UPDATE) {
            res.status(500).json({
                status: 999,
                message: "Gagal mengupdate profile",
                data: null
            });
            return;
        }

        next(err);
    }
}

const updateProfileImage = async (req, res) => {
    const trx = await pool.connect();
    try{
        await trx.query("BEGIN");

        if(!req.file) {
            throw new Error(error.EMPTY_IMAGE);
        }

        // update profile image
        const oldImage = user.profile_image;
        user.profile_image = req.file.path;

        const updated = await repo.update(trx, user);

        if (!updated) {
            throw new Error();
        }

        if(oldImage) {
            // get project path
            const projectPath = process.cwd();
            const oldImagePath = projectPath + "/" + oldImage;

            // delete old image if exist
            if(fs.existsSync(oldImagePath)) {
                fs.unlink(oldImagePath, (err) => {
                    if(err) {
                        console.error("Error delete file: ", err);
                        throw new Error(error.FAILED_DELETE_FILE);
                    }
                });
            }
        }

        await trx.query("COMMIT");

        res.status(200).json({
            status: 0,
            message: "Update profile image success",
            data: user.toResponse()
        });
    }
    catch (err) {
        console.error("[membership/handler.updateProfileImage] Error:", err);
        await trx.query("ROLLBACK");

        if(err.message === error.EMPTY_IMAGE) {
            res.status(400).json({
                status: 102,
                message: err.message,
                data: null
            });
            return;
        }
        else if(err.message === error.FAILED_DELETE_FILE || err.message === error.FAILED_UPDATE) {
            res.status(500).json({
                status: 999,
                message: "Gagal mengupdate profile image",
                data: null
            });
            return;
        }

        next(err);
    }
}

export default { 
    register, 
    login, 
    getProfile,
    updateProfile,
    updateProfileImage
};