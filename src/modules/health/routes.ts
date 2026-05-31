import type { FastifyInstance } from "fastify";

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
            sub: 1,
            role: "student",
        });
        return {
            token,
        }
    });
}
