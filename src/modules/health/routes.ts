import type { FastifyInstance } from "fastify";
import { authenticate } from "../../modules/auth/auth.middleware.ts";
import { authorize } from "../auth/authorization.middleware.ts";

export async function healthRoutes(app: FastifyInstance) {
    app.get("/health", {
        schema: {
            tags: ["Health"],
            summary: "Health Check",
            description: "Basic database health check",
            response: {
                200: {
                    type: "object",
                    properties: {
                        success: { type: "boolean" },
                        data: {
                            type: "array",
                            items: {
                                type: "object",
                            },
                        },
                    },
                },
            },
        },
    }, async (request, reply)=>{
        const [rows] = await app.db.query("SELECT 1");
        return {
            success: true,
            data: rows,
        }
    });
}

export async function jwtTestRoute(app: FastifyInstance) {
    app.get("/jwt-test", {
        schema: {
            tags: ["Health"],
            summary: "JWT Test",
            description: "Generate a test JWT token",
            response: {
                200: {
                    type: "object",
                    properties: {
                        token: { type: "string" },
                    },
                },
            },
        },
    }, async()=>{
        const token = app.jwt.sign({
            sub: 1, //subject (who the token belongs to)
            role: "student",
        });
        return {
            token,
        }
    });
}

export async function authenticateRoute(app: FastifyInstance) {
    app.get("/api/v1/me", { preHandler: [authenticate],
        schema: {
            tags: ["Auth"],
            summary: "Get Current User",
            description: "Returns the currently authenticated user's claims",
            response: {
                200: {
                    type: "object",
                    properties: {
                        success: { type: "boolean" },
                        data: {
                            type: "object",
                            properties: {
                                userId: { type: "integer" },
                                role: { type: "string" },
                            },
                        },
                    },
                },
            },
        },
    },
        async(request)=>{
            return {
                success:true,
                data: request.user,
            }
        }
    )
}

export async function authorizeMiddleware(app: FastifyInstance){
    app.post("/api/v1/admin-test", {
        preHandler: [
            authenticate,
            authorize("admin"),
        ],
        schema: {
            tags: ["Auth"],
            summary: "Admin Test",
            description: "Protected endpoint for admin role testing",
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
                    },
                },
            },
        },
    },async()=>{
        return {
            success: true,
        }
    })
}
