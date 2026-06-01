import Fastify from 'fastify';
import databasePlugin from "./plugins/database.ts";
import jwtPlugin from "./plugins/jwt.ts";
import cookiePlugin from "./plugins/cookie.ts";
import authPlugin from "./plugins/auth.ts";
import {authRoutes} from "./modules/auth/auth.routes.ts";
import errorHandlerPlugin from "./plugins/error-handler.ts";
import {healthRoutes,jwtTestRoute,authenticateRoute,authorizeMiddleware} from "./modules/health/routes.ts";
import {profileRoutes} from "./modules/profile/profile.routes.ts";
export function buildApp() {
    const app = Fastify({logger: true});

    app.register(databasePlugin);

    app.register(cookiePlugin);
    app.register(jwtPlugin);
    app.register(authPlugin);

    app.register(errorHandlerPlugin);
   
    app.register(authenticateRoute);
    app.register(jwtTestRoute);
    app.register(healthRoutes);
    app.register(profileRoutes);
    app.register(authRoutes);
    app.register(authorizeMiddleware);

    return app;
}