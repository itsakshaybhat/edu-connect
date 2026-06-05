import type { FastifyInstance } from 'fastify';
import { authenticate } from "../auth/auth.middleware.ts";
import { authorize } from "../auth/authorization.middleware.ts";
import { createCourse,  getCourseById, listCourses, updateCourse, verifyCourseOwnership, deleteCourse} from "./course.service.ts";
import { createCourseSchema, listCourseSchema, updateCourseSchema } from "./course.schemas.ts";
import type { CreateCourseInput, ListCourseQuery, UpdateCourseInput } from "./course.types.ts";
import type { AuthUser } from "../auth/auth.types.ts";


export async function courseRoutes(
    app: FastifyInstance,
) {
    app.post(
        "/api/v1/courses",
        {
            preHandler: [authenticate, authorize("instructor", "admin")],
            schema: {
                tags: ["Courses"],
                summary: "Create Course",
                description: "Create a new course",
                ...createCourseSchema,
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
                                    id: { type: "integer" },
                                    instructor_id: { type: "integer" },
                                    title: { type: "string" },
                                    description: { type: ["string", "null"] },
                                    created_at: { type: "string", format: "date-time" },
                                    updated_at: { type: "string", format: "date-time" },
                                },
                            },
                        },
                    },
                },
            },
            
        }, async (request, reply) => {
            const course = await createCourse(
                app,
                (request.user as any)!.userId,
                request.body as CreateCourseInput
            );
            return reply.status(201).send({
                success: true,
                data: course,
            })
        });

    app.get("/api/v1/courses/:id", {
        schema: {
            tags: ["Courses"],
            summary: "Get Course",
            description: "Retrieve a course by id",
            params: {
                type: "object",
                required: ["id"],
                properties: { id: { type: "integer", minimum: 1 } },
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        success: { type: "boolean" },
                        data: {
                            type: "object",
                            properties: {
                                id: { type: "integer" },
                                instructorId: { type: "integer" },
                                title: { type: "string" },
                                description: { type: ["string", "null"] },
                                createdAt: { type: "string", format: "date-time" },
                                updatedAt: { type: "string", format: "date-time" },
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
        const { id } = request.params as {id: string};

        const course = await getCourseById(app,Number(id));

        return {
            success: true,
            data: course,
        }
    });

    app.get("/api/v1/courses", {
        schema: {
            tags: ["Courses"],
            summary: "List Courses",
            description: "List courses with optional filters and pagination",
            ...listCourseSchema,
            response: {
                200: {
                    type: "object",
                    properties: {
                        success: { type: "boolean" },
                        data: {
                            type: "object",
                            properties: {
                                data: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            id: { type: "integer" },
                                            instructorId: { type: "integer" },
                                            title: { type: "string" },
                                            description: { type: ["string", "null"] },
                                            createdAt: { type: "string", format: "date-time" },
                                            updatedAt: { type: "string", format: "date-time" },
                                        },
                                    },
                                },
                                meta: {
                                    type: "object",
                                    properties: {
                                        page: { type: "integer" },
                                        limit: { type: "integer" },
                                        total: { type: "integer" },
                                        totalPages: { type: "integer" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },async (request) => {
        const courses = await listCourses(app, request.query as ListCourseQuery);
        return { 
            success: true,
            data: courses,
        };
    });

    app.patch("/api/v1/courses/:id", {
        preHandler: [
            authenticate,
            authorize("instructor", "admin"),
        ],
        schema: {
            tags: ["Courses"],
            summary: "Update Course",
            description: "Update a course (partial)",
            ...updateCourseSchema,
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
                                instructorId: { type: "integer" },
                                title: { type: "string" },
                                description: { type: ["string", "null"] },
                                createdAt: { type: "string", format: "date-time" },
                                updatedAt: { type: "string", format: "date-time" },
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
    },
    async (request) =>{
        const { id } = request.params as { id: number;};

        await verifyCourseOwnership(
            app,
            id,
            request.user as AuthUser,
        )

        const course = await updateCourse(
            app, 
            id,
            request.body as UpdateCourseInput,
        );

        return {
            success: true,
            data: course,
        }
});

app.delete("/api/v1/courses/:id", {
    preHandler: [
        authenticate,
        authorize("instructor", "admin"),
    ],
    schema: {
        tags: ["Courses"],
        summary: "Delete Course",
        description: "Delete a course by id",
        params: {
            type: "object",
            required: ["id"],
            properties: { id: { type: "integer", minimum: 1 } },
        },
        security: [
            {
                bearerAuth: [],
            }
        ],
        response: {
            204: {
                description: "No Content",
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
}, async (request, reply)=>{
    const { id } = request.params as {
        id: number;
    }

    await verifyCourseOwnership(
        app,
        id,
        request.user as AuthUser,
    );

    await deleteCourse(
        app,
        id,
    );

    return reply.status(204).send();
})
}