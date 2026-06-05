import type { FastifyInstance } from "fastify";
import { registerSchema, loginSchema } from "./auth.schemas.ts";
import { registerUser, loginUser, refreshAccessToken, logoutUser, logoutAllDevices } from "./auth.service.ts";
import { AppError } from "../../errors/app.error.ts";
import { authenticate } from "./auth.middleware.ts";
import type { AuthUser } from "./auth.types.ts";

export async function authRoutes(app: FastifyInstance) {
    app.post("/api/v1/auth/register", {
        schema: registerSchema, 
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
        schema: loginSchema,
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

    app.post("/api/v1/auth/refresh", async (request, reply) => {
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

    app.post("/api/v1/auth/logout",
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

    app.post("/api/v1/auth/logout-all",{
        preHandler: [authenticate],
    },async (request, reply)=>{
        await logoutAllDevices(
            app,
            (request.user as AuthUser)!.userId,
        );
        reply.clearCookie("refreshToken", {
            path: "/",
        });
        return reply.status(204).send();
    })
}
