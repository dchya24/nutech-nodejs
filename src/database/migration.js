import pool from './connect.js';

const migrate = async () => {
    const trx = await pool.connect();
    try {
        
        await trx.query("BEGIN");

        await trx.query(`
            create table if not exists services (
                id serial primary key,
                service_code varchar(20) not null unique,
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
            create table if not exists transactions (
                id serial primary key,
                user_id integer not null,
                service_id integer,
                invoice_number varchar(20) not null unique,
                transaction_type TRANSACTION_TYPE not null,
                description text not null,
                total_amount bigint not null,
                created_on timestamp not null default now(),
                foreign key (user_id) references users(id),
                foreign key (service_id) references services(id)
            )
        `);

        await trx.query("COMMIT");
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

export default migrate;