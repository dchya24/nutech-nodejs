import pool from '../../database/connect.js';

const getServices = async (req, res, next) => {
    try {
        const trx = await pool.connect();
        const services = await trx.query(`
            select 
                service_code, 
                service_name, 
                service_icon, 
                service_tariff
            from services
        `);

        trx.release();

        res.status(200).json({
            status: 0,
            message: "Sukses",
            data: services.rows
        });
    }
    catch (err) {
        console.log("[information/handler.getServices]", err);
        next(err);
    }
}

const getBanners = async (req, res, next) => {
    try {
        const trx = await pool.connect();
        const banners = await trx.query(`
            select
                banner_name,
                banner_image,
                description
            from banners
        `);

        trx.release();

        res.status(200).json({
            status: 0,
            message: "Sukses",
            data: banners.rows
        });
        
    }
    catch (err) {
        console.log("[information/handler.getBanners]", err);
        next(err);
    }
}

export default { getServices, getBanners };