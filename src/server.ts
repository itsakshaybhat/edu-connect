import { buildApp } from './app.ts';
import { env } from './config/env.ts';
import { checkDatabaseConnection } from './db/health.ts';

const start = async () =>{
    await checkDatabaseConnection();

    const app = buildApp();

    await app.listen({
        port: env.PORT,
    })
}

start();