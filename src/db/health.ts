import { pool } from './pool.ts';

export async function checkDatabaseConnection() {
    const connection = await pool.getConnection();

    try{
        await connection.ping();
        console.log("\nDatabase Connected Successfully\n");
    } catch (error) {
        console.log(`The database connection error ${error}`);
        console.error(error);
        process.exit(1);
    } finally {
        connection.release();
}}