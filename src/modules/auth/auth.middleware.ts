import type { FastifyRequest, FastifyReply } from "fastify";
import { AppError } from "../../errors/app.error.ts";

export async function authenticate(
    request: FastifyRequest,
    reply: FastifyReply,
) { 
    try {
        const payload = await request.jwtVerify<{
            userId: number;
            role: string;
        }>();

        request.user = payload;
    } catch (error) {
        throw new AppError(
            401,
            "Authentication required"
        );
    }
}