import { buildApp } from './app.ts';
import { env } from './config/env.ts';
import {pool} from "./db/pool.ts";

import { checkDatabaseConnection } from './db/health.ts';

const start = async () => {
    try {
        await checkDatabaseConnection();

        const app = buildApp();
        await app.listen({ port: env.PORT })
        console.log(`\nServer Started at http://localhost:${env.PORT}\n`);

        process.on("SIGINT", async () => {
            console.log("Closing DB pool...");
            await pool.end();
            process.exit(0);
        }); //Signal Interupt

        process.on("SIGTERM", async () => {
            console.log("Closing DB pool...");
            await pool.end();
            process.exit(0);
        }); //Signal Termination
        
    } catch (error) {
        console.error("Failed to start Server", error);
        process.exit(1);
    }
}

start();