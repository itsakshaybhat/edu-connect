import type { FastifyInstance } from "fastify";
import { authenticate } from "../../modules/auth/auth.middleware.ts";
import { authorize } from "../auth/authorization.middleware.ts";

export async function healthRoutes(app: FastifyInstance) {
    app.get("/health", async (request, reply)=>{
        const [rows] = await app.db.query("SELECT 1");
        return {
            success: true,
            data: rows,
        }
    });
}

export async function jwtTestRoute(app: FastifyInstance) {
    app.get("/jwt-test", async()=>{
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
    app.get("/api/v1/me", { preHandler: [authenticate],},
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
    },async()=>{
        return {
            success: true,
        }
    })
}
