import type { FastifyInstance } from "fastify";
import { env } from "../../config/env.ts";

export function generateAccessToken(
    app: FastifyInstance,
    userId: number,
    role: string,
) {
    return app.jwt.sign(
        {
            sub: userId,
            role,
        },
        {
            secret: env.JWT_ACCESS_SECRET,
            expiresIn: env.JWT_ACCESS_EXPIRES_IN,
        }
    )
}