import type{ FastifyInstance } from "fastify";
import { registerSchema } from "./auth.schemas.ts";
import { registerUser } from "./auth.service.ts";

export async function authRoutes(app: FastifyInstance) {
    app.post("/api/v1/auth/register",{
        schema: registerSchema,
    }, async(request, reply)=>{
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
}