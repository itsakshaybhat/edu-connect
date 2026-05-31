import fp from 'fastify-plugin';
import { pool } from '../db/pool.ts';

async function databasePlugin(fastify:any) {
    fastify.decorate("db", pool);
}

export default fp(databasePlugin);  