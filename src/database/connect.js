import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({
    path: './.env'
});

const config = {
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'postgres',
    password: process.env.PGPASSWORD || null,
    port:process.env.PGPORT || 5432,
    max: 50
}

if(process.env.NODE_ENV === 'production') {
    config.ssl = { rejectUnauthorized: false }
}
console.log(config, process.env.NODE_ENV);

const pool = new pg.Pool();

pool.on('error', (err) => {
    console.log("Error: ", err);
})

export default pool;