import type { FastifyInstance } from "fastify";
import { AppError } from "../../errors/app.error.ts";
import { authenticate } from "../auth/auth.middleware.ts";
import type { AuthUser } from "../auth/auth.types.ts";
import { getProfile, updateProfile, changePassword} from "./profile.service.ts";
import { updateProfileSchema, changePasswordSchema } from "./profile.schema.ts";
import type { ChangePasswordInput } from "./profile.types.ts";

export async function profileRoutes(
    app: FastifyInstance
) {
    app.get("/api/v1/profile", {
        preHandler: [authenticate],
    }, async (request) => {
        const user = request.user as AuthUser | null;
        const userId = user?.userId;

        if (!userId) {
            throw new AppError(401, "Authentication required");
        }

        const profile = await getProfile(
            app,
            userId
        );
        return {
            success: true,
            data: profile,
        }
    });

    app.patch("/api/v1/profile", {
        preHandler: [authenticate],
        schema: updateProfileSchema,
    }, async (request) => {
        const body = request.body as {
            name: string;
        };

        const profile = await updateProfile(
            app,
            (request.user as any)!.userId,
            body.name,
        );

        return {
            success: true,
            data: profile,
        }
    });

    app.patch("/api/v1/profile/password", 
        { 
            preHandler: [authenticate],
            schema:changePasswordSchema,
        },
        async (request, reply) => {
            await changePassword(
                app,
                (request.user as AuthUser).userId,
                request.body as ChangePasswordInput,                
            );

            reply.clearCookie("refreshToken", {
                path: "/",
            });

            return reply.status(200).send({
                success: true,
                message: "Password changed successfully. Please login again",
            });
        }
    )
}