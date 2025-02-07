import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({
    path: './.env'
});
const pool = new pg.Pool({
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'postgres',
    password: process.env.PGPASSWORD || null,
    port:process.env.PGPORT || 5432,
    max: 50,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on('error', (err) => {
    console.log("Error: ", err);
})

export default pool;