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
      schema: {
        tags: ["Lessons"],
        summary: "Create Lesson",
        description: "Create a lesson for a course",
        ...createLessonSchema,
        security: [
          {
              bearerAuth: [],
          }
        ],
        response: {
          201: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  course_id: { type: "integer" },
                  title: { type: "string" },
                  content: { type: ["string", "null"] },
                  lesson_order: { type: "integer" },
                  created_at: { type: "string", format: "date-time" },
                  updated_at: { type: "string", format: "date-time" },
                },
              },
            },
          },
          409: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
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
    {
      schema: {
        tags: ["Lessons"],
        summary: "List Lessons",
          response: {
            200: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                data: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "integer" },
                      course_id: { type: "integer" },
                      title: { type: "string" },
                      content: { type: ["string", "null"] },
                      lesson_order: { type: "integer" },
                      created_at: { type: "string", format: "date-time" },
                      updated_at: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
          },
        description: "List lessons for a course",
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "integer", minimum: 1 } },
        },
      },
    }, async (request) => {
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
      schema: {
        tags: ["Lessons"],
        summary: "Delete Lesson",
        description: "Delete a lesson by id",
        params: {
          type: "object",
          required: ["id"],
          properties: { id: { type: "integer", minimum: 1 } },
        },
        security: [
            {
                bearerAuth: [],
            }
        ],
        response: {
          204: {
            description: "No Content",
          },
          404: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
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
      schema: {
        tags: ["Lessons"],
        summary: "Update Lesson",
        description: "Update a lesson",
        ...updateLessonSchema,
        security: [
            {
                bearerAuth: [],
            }
        ],
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  id: { type: "integer" },
                  course_id: { type: "integer" },
                  title: { type: "string" },
                  content: { type: ["string", "null"] },
                  lesson_order: { type: "integer" },
                  created_at: { type: "string", format: "date-time" },
                  updated_at: { type: "string", format: "date-time" },
                },
              },
            },
          },
          400: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
          404: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
          409: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
            },
          },
        },
      },
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