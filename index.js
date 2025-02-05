import express from 'express';
import dotenv from 'dotenv';
// import router from './routes/api.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use("/", router)

app.listen(PORT, () => {
    console.log(`Server run on port ${PORT}`)
})