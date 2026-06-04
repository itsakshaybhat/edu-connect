import { buildApp } from './app.ts';
import { env } from './config/env.ts';

import { checkDatabaseConnection } from './db/health.ts';

const start = async () =>{
    await checkDatabaseConnection();

    const app = buildApp();

    await app.listen({
        port: env.PORT,
    }, (err, address)=>{
        if(err){
            console.error(err);
            process.exit(0);
        }
        console.log(`\nServer Started at ${address}\n`);
    })
}

start();