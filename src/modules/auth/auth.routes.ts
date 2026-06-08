import type { FastifyInstance } from "fastify";
import { registerSchema, loginSchema } from "./auth.schemas.ts";
import { registerUser, loginUser, refreshAccessToken, logoutUser, logoutAllDevices } from "./auth.service.ts";
import { AppError } from "../../errors/app.error.ts";
import { authenticate } from "./auth.middleware.ts";
import type { AuthUser } from "./auth.types.ts";
import { getGoogleAuthUrl, getGoogleUserFromCode, findOrCreateGoogleUser } from "./google-auth.service.ts";
import { generateAccessToken, generateRefreshToken } from "./token.service.ts";
import type { ResultSetHeader } from "mysql2/promise";

export async function authRoutes(app: FastifyInstance) {
    app.post("/api/v1/auth/register", {
        schema: {
            tags: ["Auth"],
            summary: "Register User",
            description: "Creates a new student account",
            ...registerSchema,
            response: {
                201: {
                    type: "object",
                    properties: {
                        success: { type: "boolean" },
                        data: {
                            type: "object",
                            properties: {
                                id: { type: "integer" },
                            },
                            additionalProperties: false,
                        },
                    },
                },
                409: {
                    type: "object",
                    properties: {
                        success: { type: "boolean" },
                        message: { type: "string" },
                    },
                },
            },

        },
    }, async (request, reply) => {
        const user = await registerUser(
            app.db,
            request.body as {
                name: string;
                email: string;
                password: string;
            }
        );
        return reply.status(201).send({
            success: true,
            data: user,
        });
    });

    app.post("/api/v1/auth/login", {
        schema: {
            tags: ["Auth"],
            summary: "Login User",
            description: "Authenticate user and returns JWT tokens",
            ...loginSchema,
            response: {
                200: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                        },
                        data: {
                            type: "object",
                            properties: {
                                accessToken: { type: "string" },
                                refreshToken: { type: "string" },
                            },
                            additionalProperties: false,
                        }
                    },
                },
                401: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                        },
                        message: {
                            type: "string",
                        }
                    }
                }
            }
        },
    }, async (request, reply) => {
        const result = await loginUser(
            app,
            request.body as {
                email: string;
                password: string;
            }
        );
        reply.setCookie("refreshToken", result.refreshToken,
            {
                httpOnly: true, //JS can't access the token
                path: "/", //Cookie is available where (for entire website)
                sameSite: "strict", //ONly from the requested user side 
                secure: false, //Use the communincation for http if true for https
            }
        );

        return {
            success: true,
            data: {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            }
        }
    });

    app.post("/api/v1/auth/refresh", {
        schema: {
            tags: ["Auth"],
            summary: "Refresh Access Token",
            description: "Generates a new access token using the refresh token cookie",
            response: {
                200: {
                    type: "object",
                    properties: {
                        success: { type: "boolean" },
                        data: {
                            type: "object",
                            properties: {
                                accessToken: { type: "string" },
                                refreshToken: { type: "string" },
                            },
                            additionalProperties: false,
                        },
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
        }
    }, async (request, reply) => {
        const refreshToken = request.cookies.refreshToken;

        if (!refreshToken) {
            throw new AppError(
                401,
                "Refresh token missing"
            );
        }
        const result = await refreshAccessToken(
            app,
            refreshToken
        );

        return {
            success: true,
            data: result
        }
    })

    app.post("/api/v1/auth/logout", {
        schema: {
            tags: ["Auth"],
            summary: "Logout User",
            description: "Logs out the current session",
            response: {
                204: {
                    description: "No Content",
                },
            },
        }
    },
        async (request, reply) => {
            const refreshToken = request.cookies.refreshToken;

            if (refreshToken) {
                await logoutUser(
                    app,
                    refreshToken,
                );
            }
            return reply.status(204).send();
        }
    );

    app.post("/api/v1/auth/logout-all", {
        schema: {
            tags: ["Auth"],
            summary: "Logout All Users from all devices",
            description: "Logs out the current session of all the users",
            response: {
                204: {
                    description: "No Content",
                },
            },
        },
        preHandler: [authenticate],
    }, async (request, reply) => {
        await logoutAllDevices(
            app,
            (request.user as AuthUser)!.userId,
        );
        reply.clearCookie("refreshToken", {
            path: "/",
        });
        return reply.status(204).send();
    });

    app.get(
        "/api/v1/auth/google",
        async (_, reply) => {
            const url = getGoogleAuthUrl();

            return reply.redirect(url);
        }
    );

    app.get("/api/v1/auth/google/callback",
        async (request,reply) => {
            const { code } = request.query as {
                code: string,
            };

            const googleUser = await getGoogleUserFromCode(code);
            const user = await findOrCreateGoogleUser(
                app,
                googleUser
            );

            const accessToken = generateAccessToken(
                app,
                user.id,
                user.role,
            );
            
            const refreshToken = generateRefreshToken(
                app,
                user.id,
            );
            await app.db.execute<ResultSetHeader>(
                `
                    INSERT INTO refresh_tokens
                    (
                        user_id,
                        token,
                        expires_at
                    )
                    VALUES
                    (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))
                `,
                [
                    user.id,
                    refreshToken,
                ]
            );

            reply.setCookie(
                "refreshToken",
                refreshToken,
                {
                    httpOnly: true,
                    sameSite: "strict",
                    secure: false,
                    path: "/",
                }
            );

            return {
                success: true,
                data: {
                    accessToken,
                    refreshToken,
                },
            };
            
        }
    );
}


