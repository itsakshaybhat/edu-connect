import type { FastifyInstance } from "fastify";

import { authenticate } from "../auth/auth.middleware.js";
import { authorize } from "../auth/authorization.middleware.js";

import type{ AuthUser } from "../auth/auth.types.ts";

import {
  createLessonSchema,
  updateLessonSchema,
} from "./lesson.schema.js";
import type {
  CreateLessonInput,
  UpdateLessonInput,
} from "./lesson.types.js";

import {
  createLesson,
  getCourseLessons,
  deleteLesson,
  updateLesson,
  verifyLessonOwnership,
} from "./lesson.service.js";

import {
  verifyCourseOwnership,
} from "../courses/course.service.js";

export async function lessonRoutes(
  app: FastifyInstance
) {
  app.post(
    "/api/v1/courses/:id/lessons",
    {
      preHandler: [
        authenticate,
        authorize("instructor", "admin"),
      ],
      schema: createLessonSchema,
    },
    async (request, reply) => {
      const { id } =
        request.params as {
          id: number;
        };

      await verifyCourseOwnership(
        app,
        id,
        (request.user as AuthUser)
      );

      const lesson =
        await createLesson(
          app,
          id,
          request.body as CreateLessonInput
        );

      return reply.status(201).send({
        success: true,
        data: lesson,
      });
    }
  );

  app.get(
    "/api/v1/courses/:id/lessons",
    async (request) => {
      const { id } =
        request.params as {
          id: number;
        };

      const lessons =
        await getCourseLessons(
          app,
          id
        );

      return {
        success: true,
        data: lessons,
      };
    }
  );

  app.delete(
    "/api/v1/lessons/:id",
    {
      preHandler: [
        authenticate,
        authorize("instructor", "admin"),
      ],
    },
    async (request, reply) => {
      const { id } =
        request.params as {
          id: number;
        };

      await verifyLessonOwnership(
        app,
        id,
        (request.user as AuthUser)
      );

      await deleteLesson(
        app,
        id
      );

      return reply.status(204).send();
    }
  );

  app.patch(
    "/api/v1/lessons/:id",
    {
      preHandler: [
        authenticate,
        authorize("instructor", "admin"),
      ],
      schema: updateLessonSchema,
    },
    async (request) => {
      const { id } = request.params as { id: number };

      await verifyLessonOwnership(
        app,
        id,
        (request.user as AuthUser)!,
      );

      const lesson = await updateLesson(
        app,
        id,
        request.body as UpdateLessonInput,
      );

      return {
        success: true,
        data: lesson,
      };
    }
  );
}