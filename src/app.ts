import Fastify from 'fastify';
import databasePlugin from "./plugins/database.ts";
import jwtPlugin from "./plugins/jwt.ts";
import cookiePlugin from "./plugins/cookie.ts";
import {authRoutes} from "./modules/auth/auth.routes.ts";

import {healthRoutes,jwtTestRoute} from "./modules/health/routes.ts";


export function buildApp() {
    const app = Fastify();

    app.register(databasePlugin);

    app.register(cookiePlugin);

    app.register(jwtPlugin);

    app.register(healthRoutes);

    app.register(jwtTestRoute);

    app.register(authRoutes);

    return app;
}