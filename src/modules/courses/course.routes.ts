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
    });

    app.patch("/api/v1/courses/:id", {
        preHandler: [
            authenticate,
            authorize("instructor", "admin"),
        ],
        schema: updateCourseSchema,
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
    ]
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