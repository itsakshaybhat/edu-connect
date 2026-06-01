import type { FastifyInstance } from 'fastify';
import { authenticate } from "../auth/auth.middleware.ts";
import { authorize } from "../auth/authorization.middleware.ts";
import { createCourse,  getCourseById, listCourses } from "./course.service.ts";
import { createCourseSchema, listCourseSchema } from "./course.schemas.ts";
import type { CreateCourseInput, ListCourseQuery } from "./course.types.ts";  


export async function courseRoutes(
    app: FastifyInstance
) {
    app.post(
        "/api/v1/courses",
        {
            preHandler: [authenticate, authorize("instructor", "admin")],
            schema: createCourseSchema,
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

    app.get("/api/v1/courses/:id", async (request) => {
        const { id } = request.params as {id: string};

        const course = await getCourseById(app,Number(id));

        return {
            success: true,
            data: course,
        }
    });

    app.get("/api/v1/courses", {
        schema: listCourseSchema,
    },async (request) => {
        const courses = await listCourses(app, request.query as ListCourseQuery);
        return { 
            success: true,
            data: courses,
        };
    }
    )

}