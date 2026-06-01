import type { FastifyInstance } from "fastify";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { CreateCourseInput } from "./course.types.ts";
import { AppError } from "../../errors/app.error.ts";
import type { ListCourseQuery } from "./course.types.ts";

interface CourseRow extends RowDataPacket {
    id: number;
    instructor_id: number;
    title: string;
    description: string;
    created_at: Date;
    updated_at: Date;
};

export async function createCourse(app: FastifyInstance, instructorId: number, input: CreateCourseInput) {
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
};


export async function getCourseById(app: FastifyInstance, courseId: number): Promise<CourseDetails> {
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
        [courseId]
    );
    const course = courses[0];
    if (!course) {
        throw new AppError(
            404,
            "Course not found",
        )
    }
    return {
        id: course.id,
        instructorId: course.instructor_id,
        title: course.title,
        description: course.description,
        createdAt: course.created_at,
        updatedAt: course.updated_at,
    }
}

const sortColumnMap = {
    createdAt: "created_at",
    title: "title",
} as const;

export async function listCourses(
    app: FastifyInstance,
    query: ListCourseQuery
) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const offset = (page - 1) * limit;
    const sortBy = query.sortBy ?? "createdAt";

    const order = query.order ?? "desc";
    const sortColumn = sortColumnMap[sortBy];

    let sql = `
                SELECT 
                        id,
                        instructor_id,
                        title,
                        description,
                        created_at,
                        updated_at
                FROM courses
            `;

    const params: unknown[] = [];

    if (query.instructorId) {
        sql += `
                WHERE instructor_id = ?
            `;
        params.push(query.instructorId);
    }

    sql += `
            ORDER BY ${sortColumn} ${order}
            LIMIT ?
            OFFSET ?
    `;

    params.push(limit);
    params.push(offset);

    const [courses] = await app.db.query<CourseRow[]>(
        sql,
        params,
    );

    return courses.map((course) => ({
        id: course.id,
        instructorId: course.instructor_id,
        title: course.title,
        description: course.description,
        createdAt: course.created_at,
        updatedAt: course.updated_at,
    }));
}
