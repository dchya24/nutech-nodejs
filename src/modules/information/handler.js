import pool from '../../database/connect.js';

const getServices = async (req, res, next) => {
    try {
        const services = await pool.query(`
            select 
                service_code, 
                service_name, 
                service_icon, 
                service_tariff
            from services
        `);

        res.status(200).json({
            status: 0,
            message: "Sukses",
            data: services.rows
        });
    }
    catch (err) {
        console.log("Error: ", err);
        next(err);
    }
}

const getBanners = async (req, res, next) => {
    try {
        const banners = await pool.query(`
            select
                banner_name,
                banner_image,
                description
            from banners
        `);
        res.status(200).json({
            status: 0,
            message: "Sukses",
            data: banners.rows
        });
    }
    catch (err) {
        console.log("Error: ", err);
        next(err);
    }
}

export default { getServices, getBanners };