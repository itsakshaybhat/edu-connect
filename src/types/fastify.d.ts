import "fastify";
import { Pool } from "mysql2/promise";
import { AuthUser } from "../modules/auth/auth.types";


declare module "fastify" {
    interface FastifyInstance {
        db: Pool;
    }

    interface FastifyRequest {
        user: AuthUser | null;
    }    
}

