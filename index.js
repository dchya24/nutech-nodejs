import express from 'express';
import dotenv from 'dotenv';
import router from './src/api.js';
import multer from 'multer';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"))

app.use("/", router)

app.use((err, req, res, next) => {
    console.log("Error: ", err);

    if(err instanceof multer.MulterError) {
        let message = err.message;

        if(err.code === "LIMIT_FILE_SIZE") {
            message = "Ukuran file terlalu besar, maksimal 5MB";
        }

        res.status(400).json({
            status: 102,
            message: message,
            data: null
        })
        return
    }
    res.status(500).json({
        status: 999,
        message: err.message,
        data: null
    })
})

app.listen(PORT, () => {
    console.log(`Server run on port ${PORT}`)
})