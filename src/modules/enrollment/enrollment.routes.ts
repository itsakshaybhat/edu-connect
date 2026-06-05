import type { FastifyInstance } from "fastify";
import { authenticate } from "../auth/auth.middleware.ts";

import { enrollSchema } from "./enrollment.schema.ts";
import { enrollInCourse } from "./enrollment.service.ts";
import type { AuthUser } from "../auth/auth.types.ts";

export async function enrollmentRoutes(
    app: FastifyInstance,
) {
    app.post("/api/v1/courses/:id/enroll",
        {
            preHandler:[
                authenticate,
            ],
            schema: {
                tags: ["Enrollment"],
                summary: "Enroll in Course",
                description: "Enroll the authenticated user in a course",
                ...enrollSchema,
                security: [
                    {
                        bearerAuth: [],
                    }
                ],
                response: {
                    201: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            data: {
                                type: "object",
                                properties: {
                                    message: { type: "string" },
                                },
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
        }, async (request, reply) =>{
            const { id }  = request.params as {id:number};

            const result = await enrollInCourse(
                app,
                (request.user as AuthUser)!.userId,
                id,
            );

            return reply.status(201).send({
                success:true,
                data: result,
            });
        }
    )
}