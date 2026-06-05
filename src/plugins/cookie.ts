import fp from "fastify-plugin";
import cookie from "@fastify/cookie";
import type { FastifyInstance } from "fastify";

async function cookiePlugin(app: FastifyInstance) {
    app.register(cookie);
}

export default fp(cookiePlugin);
