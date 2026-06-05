import type { FastifyInstance } from "fastify";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { CreateCourseInput, UpdateCourseInput } from "./course.types.ts";
import { AppError } from "../../errors/app.error.ts";
import type { ListCourseQuery } from "./course.types.ts";
import type { AuthUser } from "../auth/auth.types.ts";

interface CourseRow extends RowDataPacket {
    id: number; 
    instructor_id: number;
    title: string;
    description: string;
    created_at: Date;
    updated_at: Date;
}

export async function createCourse(
    app: FastifyInstance,
    instructorId: number,
    input: CreateCourseInput,
) {
    const [result] = await app.db.execute<ResultSetHeader>(
        `
        INSERT INTO courses
        (
            instructor_id,
            title,
            description
        ) 
        VALUES ( ?, ?, ? )
        `,
        [instructorId, input.title, input.description ?? null],
    );

    const [courses] = await app.db.query<CourseRow[]>(
        `
            SELECT 
                id,
                instructor_id,
                title,
                description,
                created_at,
                updated_at
            FROM courses
            WHERE id = ?
            LIMIT 1
        `,
        [result.insertId]

        //         {
        //   fieldCount: number;
        //   affectedRows: number;
        //   insertId: number;
        //   info: string;
        //   serverStatus: number;
        //   warningStatus: number;
        // }
    );

    return courses[0];
}

export interface CourseDetails {
    id: number;
    instructorId: number;
    title: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export async function getCourseById(
    app: FastifyInstance,
    courseId: number,
): Promise<CourseDetails> {
    const [courses] = await app.db.query<CourseRow[]>(
        `
        SELECT 
            id,
            instructor_id,
            title,
            description,
            created_at,
            updated_at
        FROM courses
        WHERE id = ?
        LIMIT 1
        `,
        [courseId],
    );

    const course = courses[0];

    if (!course) {
        throw new AppError(
            404,
            "Course not found",
        );
    }

    return {
        id: course.id,
        instructorId: course.instructor_id,
        title: course.title,
        description: course.description,
        createdAt: course.created_at,
        updatedAt: course.updated_at,
    };
}

const sortColumnMap = {
    createdAt: "created_at",
    title: "title",
} as const;

export async function listCourses(
    app: FastifyInstance,
    query: ListCourseQuery,
) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const offset = (page - 1) * limit;
    const sortBy = query.sortBy ?? "createdAt";

    const order = query.order ?? "desc";
    const sortColumn = sortColumnMap[sortBy];

    const whereClauses: string[] = [];
    const whereParams: unknown[] = [];

    if (query.instructorId) {
        whereClauses.push("instructor_id = ?");
        whereParams.push(query.instructorId);
    }

    const whereSql =
        whereClauses.length > 0
            ? `WHERE ${whereClauses.join(" AND ")}`
            : "";

    const sql = `
        SELECT 
            id,
            instructor_id,
            title,
            description,
            created_at,
            updated_at
        FROM courses
        ${whereSql}
        ORDER BY ${sortColumn} ${order}
        LIMIT ?
        OFFSET ?
    `;

    const [courses] = await app.db.query<CourseRow[]>(
        sql,
        [
            ...whereParams,
            limit,
            offset,
        ],
    );

    const countSql = `
        SELECT COUNT(*) AS total
        FROM courses
        ${whereSql}
    `;
    interface CountRow extends RowDataPacket {
        total: number;
    }

    const [countRows]:any = await app.db.query<CountRow[]>(
        countSql,
        whereParams,
    );

    const total = countRows[0].total;

    const totalPages = Math.ceil(total / limit);

    const mappedCourses = courses.map((course) => ({
        id: course.id,
        instructorId: course.instructor_id,
        title: course.title,
        description: course.description,
        createdAt: course.created_at,
        updatedAt: course.updated_at,
    }));

    return {
        data: mappedCourses,
        meta: {
            page,
            limit,
            total,
            totalPages,
        },
    };
}

export async function updateCourse(
  app: FastifyInstance,
  courseId: number,
  input: UpdateCourseInput,
) {
  const sets: string[] = [];
  const params: unknown[] = [];

  if (input.title !== undefined) {
    sets.push("title = ?");
    params.push(input.title);
  }

  if (input.description !== undefined) {
    sets.push("description = ?");
    params.push(input.description);
  }

  if (sets.length === 0) {
    return await getCourseById(app, courseId);
  }

  sets.push("updated_at = NOW()");

    await app.db.execute({
        sql: `
            UPDATE courses
            SET ${sets.join(", ")}
            WHERE id = ?
        `,
        values: [...params, courseId],
    });

  const course = await getCourseById(app, courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  return course;
}

interface CourseOwnerRow extends RowDataPacket {
    id: number;
    instructor_id: number;
}

export async function getCourseOwner(
    app: FastifyInstance,
    courseId: number
) {
    const [courses] = await app.db.query<CourseOwnerRow[]>(
        `
        SELECT 
            id,
            instructor_id
        FROM courses
        WHERE id = ? 
        LIMIT 1
        `,
        [courseId]
    );
    return courses[0];
}

export async function verifyCourseOwnership (
    app:FastifyInstance,
    courseId: number,
    user: AuthUser
) {
    const course = await getCourseOwner(app, courseId);

    if(!course) {
        throw new AppError(404, "Course not found");
    }

    if(user.role === "admin"){
        return;
    }

    if(course.instructor_id !== user.userId){
        throw new AppError(403, "Forbidden");
    }
}

export async function deleteCourse(
    app: FastifyInstance,
    courseId: number,
) {
    const [result] = await app.db.execute<ResultSetHeader>(
        `
            DELETE FROM courses
            WHERE id = ?
        `,
        [courseId]
    );

    if(result.affectedRows === 0) {
        throw new AppError(
            404,
            "Course not found",
        );
    }
}