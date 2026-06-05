import fp from 'fastify-plugin';
import { pool } from '../db/pool.ts';
import type { FastifyInstance } from "fastify";

async function databasePlugin(fastify:FastifyInstance) {
    fastify.decorate("db", pool);
}

export default fp(databasePlugin);  