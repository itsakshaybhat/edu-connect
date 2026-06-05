import Fastify from 'fastify';
import databasePlugin from "./plugins/database.ts";
import jwtPlugin from "./plugins/jwt.ts";
import cookiePlugin from "./plugins/cookie.ts";
import authPlugin from "./plugins/auth.ts";
import { authRoutes } from "./modules/auth/auth.routes.ts";
import errorHandlerPlugin from "./plugins/error-handler.ts";
import {
    healthRoutes,
    jwtTestRoute, 
    authenticateRoute,
    authorizeMiddleware
} from "./modules/health/routes.ts";
import { profileRoutes } from "./modules/profile/profile.routes.ts";
import { courseRoutes } from "./modules/courses/course.routes.ts";
import { enrollmentRoutes } from "./modules/enrollment/enrollment.routes.ts";
import { lessonRoutes } from "./modules/lessons/lesson.routes.ts";



export function buildApp() {
    const app = Fastify({ logger: true });

    app.register(databasePlugin);
    app.register(cookiePlugin);
    app.register(jwtPlugin);
    app.register(authPlugin);
    app.register(errorHandlerPlugin);

//  const plugins = [
//     databasePlugin,
//     cookiePlugin,
//     jwtPlugin,
//     authPlugin,
//     errorHandlerPlugin
// ];

// plugins.forEach(plugin => app.register(plugin));
    app.register(healthRoutes);
    app.register(jwtTestRoute);
    app.register(authenticateRoute);
    app.register(authorizeMiddleware);


    app.register(profileRoutes);
    app.register(authRoutes);
    app.register(enrollmentRoutes);
    app.register(courseRoutes);
    app.register(lessonRoutes);


    return app;
}