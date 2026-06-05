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
        schema: {
            tags: ["Profile"],
            summary: "Get Profile",
            description: "Get current authenticated user's profile",
            security: [
                {
                    bearerAuth: [],
                }
            ],
            response: {
                200: {
                    type: "object",
                    properties: {
                        success: { type: "boolean" },
                        data: {
                            type: "object",
                            properties: {
                                id: { type: "integer" },
                                name: { type: "string" },
                                email: { type: "string" },
                                role: { type: "string" },
                                createdAt: { type: "string", format: "date-time" },
                            },
                        },
                    },
                },
                404: {
                    type: "object",
                    properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                    },
                },
            },
        },
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
        schema: {
            tags: ["Profile"],
            summary: "Update Profile",
            description: "Update current user's profile",
            ...updateProfileSchema,
            security: [
                {
                    bearerAuth: [],
                }
            ],
            response: {
                200: {
                    type: "object",
                    properties: {
                        success: { type: "boolean" },
                        data: {
                            type: "object",
                            properties: {
                                id: { type: "integer" },
                                name: { type: "string" },
                                email: { type: "string" },
                                role: { type: "string" },
                                createdAt: { type: "string", format: "date-time" },
                            },
                        },
                    },
                },
            },
        },
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
            schema: {
                tags: ["Profile"],
                summary: "Change Password",
                description: "Change current user's password",
                ...changePasswordSchema,
                security: [
                {
                    bearerAuth: [],
                }
            ],
                response: {
                    200: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            message: { type: "string" },
                        },
                    },
                    400: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            message: { type: "string" },
                        },
                    },
                    401: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            message: { type: "string" },
                        },
                    },
                },
            },
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