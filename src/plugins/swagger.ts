import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";

async function swaggerPlugin(app: FastifyInstance) {
    await app.register(swagger,{
        openapi: {
            info: {
                title: "EduConnect API",
                description: "Online Learning Platform Backend API",
                version: "1.0.0",
            },

            servers: [
                {
                    url: "http://localhost:3000",
                    description: "Local Development",
                }
            ],

            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT",
                    },
                },
            },
        },
    });
    await app.register(swaggerUI, {
        routePrefix: "/docs",
    })
}

export default fp(swaggerPlugin);