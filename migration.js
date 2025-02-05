import pool from './src/database/connect.js';

const migrate = async () => {
    const trx = await pool.connect();
    try {
        
        trx.query("BEGIN");

        const createTable = await trx.query(`
            create table if not exists services (
                id serial primary key,
                service_code varchar(20) not null,
                service_name varchar(100) not null,
                service_icon text not null,
                service_tariff bigint not null
            );
            create table if not exists banners (
                id serial primary key,
                banner_name varchar(20) not null,
                banner_image text not null,
                description text not null
            );
            create table if not exists users (
                id serial primary key,
                email varchar(100) not null unique,
                first_name varchar(100) not null,
                last_name varchar(100) not null,
                password text not null,
                profile_image text not null default 'https://fastly.picsum.photos/id/847/200/200.jpg?hmac=ET2eUKsG4SCaCnGMrTpgEBXpx7YG1j2X8DpBnHC25wA'
            );
        `);

        if(createTable) {
            console.log("Table created successfully");
    
            const insertData = await trx.query(`
                insert into services (service_code, service_name, service_icon, service_tariff) values
                ('PAJAK', 'Pajak PBB', 'https://fastly.picsum.photos/id/665/200/200.jpg?hmac=hWcfvzYgHAwJFOUaHZa2oZpOOL7yx_x8Bnhq0dFVQRw', 40000),  
                ('PLN', 'Listrik', 'https://fastly.picsum.photos/id/665/200/200.jpg?hmac=hWcfvzYgHAwJFOUaHZa2oZpOOL7yx_x8Bnhq0dFVQRw', 10000),
                ('PDAM', 'PDAM Berlangganan', 'https://fastly.picsum.photos/id/665/200/200.jpg?hmac=hWcfvzYgHAwJFOUaHZa2oZpOOL7yx_x8Bnhq0dFVQRw', 40000),
                ('Pulsa', 'Pulsa', 'https://fastly.picsum.photos/id/665/200/200.jpg?hmac=hWcfvzYgHAwJFOUaHZa2oZpOOL7yx_x8Bnhq0dFVQRw', 10000),
                ('PGN', 'PGN Berlangganan', 'https://fastly.picsum.photos/id/665/200/200.jpg?hmac=hWcfvzYgHAwJFOUaHZa2oZpOOL7yx_x8Bnhq0dFVQRw', 50000),
                ('Musik', 'Musik Berlangganan', 'https://fastly.picsum.photos/id/665/200/200.jpg?hmac=hWcfvzYgHAwJFOUaHZa2oZpOOL7yx_x8Bnhq0dFVQRw', 50000),
                ('TV', 'TV Berlangganan', 'https://fastly.picsum.photos/id/665/200/200.jpg?hmac=hWcfvzYgHAwJFOUaHZa2oZpOOL7yx_x8Bnhq0dFVQRw', 50000),
                ('PAKET_DATA', 'Paket Data', 'https://fastly.picsum.photos/id/665/200/200.jpg?hmac=hWcfvzYgHAwJFOUaHZa2oZpOOL7yx_x8Bnhq0dFVQRw', 50000),
                ('VOUCHER_GAME', 'Voucher Game', 'https://fastly.picsum.photos/id/665/200/200.jpg?hmac=hWcfvzYgHAwJFOUaHZa2oZpOOL7yx_x8Bnhq0dFVQRw', 100000),
                ('VOUCHER_MAKANAN', 'Voucher Makanan', 'https://fastly.picsum.photos/id/665/200/200.jpg?hmac=hWcfvzYgHAwJFOUaHZa2oZpOOL7yx_x8Bnhq0dFVQRw', 100000),
                ('QURBAN', 'Qurban', 'https://fastly.picsum.photos/id/665/200/200.jpg?hmac=hWcfvzYgHAwJFOUaHZa2oZpOOL7yx_x8Bnhq0dFVQRw', 200000),
                ('ZAKAT', 'Zakat', 'https://fastly.picsum.photos/id/665/200/200.jpg?hmac=hWcfvzYgHAwJFOUaHZa2oZpOOL7yx_x8Bnhq0dFVQRw', 300000);
                insert into banners (banner_name, banner_image, description) values
                ('Banner 1', 'https://random-image-pepebigotes.vercel.app/api/random-image', 'Banner 1 Description'),
                ('Banner 2', 'https://random-image-pepebigotes.vercel.app/api/random-image', 'Banner 2 Description'),
                ('Banner 3', 'https://random-image-pepebigotes.vercel.app/api/random-image', 'Banner 3 Description'),
                ('Banner 4', 'https://random-image-pepebigotes.vercel.app/api/random-image', 'Banner 4 Description'),
                ('Banner 5', 'https://random-image-pepebigotes.vercel.app/api/random-image', 'Banner 5 Description'),
                ('Banner 6', 'https://random-image-pepebigotes.vercel.app/api/random-image', 'Banner 6 Description');
            `);
    
            if(insertData) {
                console.log("Data inserted successfully");
            }
        }

        trx.query("COMMIT");
    }
    catch (err) {
        trx.query("ROLLBACK");
        throw err;
    }
    finally {
        trx.release();
        trx.end();
    }
}

migrate().then(() => {
    console.log("Migration completed");
}).catch(err => {
    console.log("Error: ", err);
}).finally(() => {
    process.exit(1);
})

process.on('SIGTERM', () => {
    console.log('Signal received.');
});