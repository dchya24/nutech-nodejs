import client from '../database/connect.js';

const getServices = async (req, res) => {
    try {
        const services = await client.query("select * from services");
        res.status(200).json({
            status: 0,
            message: "Sukses",
            data: services.rows
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

const getBanners = async (req, res) => {
    try {
        const banners = await client.query("select * from banners");
        res.status(200).json({
            status: 0,
            message: "Sukses",
            data: banners.rows
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

export default { getServices, getBanners };