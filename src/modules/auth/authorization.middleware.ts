import type { FastifyRequest, FastifyReply } from "fastify";
import type { AuthUser } from "./auth.types.ts";
import { AppError } from "../../errors/app.error.ts";

export function authorize(...allowedRoles: string[]) {
    return async function (
        request: FastifyRequest,
        reply: FastifyReply
    ) {
        const user = request.user as AuthUser;
        if (!user) {
            throw new AppError(
                401,
                "Authentication required"
            ) 
        }   
        if (!allowedRoles.includes(user.role)) {
            throw new AppError(
                403,
                "Forbidden"
            );
        }
    };
};