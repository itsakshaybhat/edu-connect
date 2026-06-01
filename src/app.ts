import Fastify from 'fastify';
import databasePlugin from "./plugins/database.ts";
import jwtPlugin from "./plugins/jwt.ts";
import cookiePlugin from "./plugins/cookie.ts";
import {authRoutes} from "./modules/auth/auth.routes.ts";
import errorHandlerPlugin from "./plugins/error-handler.ts";
import {healthRoutes,jwtTestRoute} from "./modules/health/routes.ts";


export function buildApp() {
    const app = Fastify({logger: true});

    app.register(databasePlugin);

    app.register(cookiePlugin);

    app.register(jwtPlugin);

    app.register(errorHandlerPlugin)

    app.register(healthRoutes);

    app.register(jwtTestRoute);

    app.register(authRoutes);

    return app;
}