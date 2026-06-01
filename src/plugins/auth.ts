import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

async function authPlugin(app: FastifyInstance) {
    if (!app.hasRequestDecorator("user")) {
        app.decorateRequest("user", null as never);
    }
}

export default fp(authPlugin);