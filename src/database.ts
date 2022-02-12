import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const client = new Pool({
    host: process.env.POSTGRES_HOST,
    database: (process.env.TEST_OR_DEV=='dev') ? process.env.POSTGRES_DB : process.env.POSTGRES_TEST_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    port : parseInt(process.env.POSTGRES_PORT as string)
});

export default client;