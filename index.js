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
    
    let message = err.message;
    let headerStatusCode = 500;
    let statusCode = 999;

    if(err instanceof multer.MulterError) {
        statusCode = 999;
        if(err.code === "LIMIT_FILE_SIZE") {
            statusCode = 104;
            headerStatusCode = 400;
            message = "Ukuran file terlalu besar, maksimal 5MB";
        }
    }

    res.status(headerStatusCode).json({
        status: statusCode,
        message: err.message,
        data: null
    })

    return
})

app.listen(PORT, () => {
    console.log(`Server run on port ${PORT}`)
})