import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { AppError } from "../errors/app.error.ts";

async function errorHandlerPlugin(
    app: FastifyInstance
){
    app.setErrorHandler((error, request, reply)=>{
        if (error instanceof AppError) {
            const appError = error as AppError;
            return reply.status(appError.statusCode).send({
                success: false,
                message: appError.message,
            });
        }
        request.log.error(`\n\n The system error: \n ${error}`);
        return reply.status(500).send({
            success: false,
            message: "Internal Server Error(EHFP)"
        })
    })
}


export default fp(errorHandlerPlugin);