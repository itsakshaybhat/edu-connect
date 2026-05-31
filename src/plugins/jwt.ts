import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import type { FastifyInstance } from "fastify";
import { env } from "../config/env.ts";

async function jwtPlugin(app: FastifyInstance) {
    app.register(jwt, {
        secret: env.JWT_ACCESS_SECRET,
    });
}

export default fp(jwtPlugin);