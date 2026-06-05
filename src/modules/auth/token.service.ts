import type { FastifyInstance } from "fastify";
import { env } from "../../config/env.ts";

export function generateAccessToken(
    app: FastifyInstance,
    userId: number,
    role: string,
) {
    return app.jwt.sign(
        {
            userId,
            role,
        },
        {
            expiresIn: env.JWT_ACCESS_EXPIRES_IN,
        }
    )
}

export function generateRefreshToken(
    app: FastifyInstance,
    userId: number
) {
    return app.jwt.sign (
        {
            userId,
        },
        {
            expiresIn: env.JWT_REFRESH_EXPIRES_IN,
        }
    );
} 