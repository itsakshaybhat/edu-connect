import type { FastifyInstance } from "fastify";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { AppError } from "../../errors/app.error.ts";
import type { AuthUser } from "../auth/auth.types.ts";
import type { CreateLessonInput, UpdateLessonInput } from "./lesson.types.ts";


interface LessonRow extends RowDataPacket {
    id: number;
    course_id: number;
    title: string;
    content: string | null;
    lesson_order: number;
    created_at: Date;
    updated_at: Date;
};


export async function createLesson(
    app: FastifyInstance,
    courseId: number,
    input: CreateLessonInput
) {
    try {
        const [result] = await app.db.execute<ResultSetHeader>(
            `
                INSERT INTO lessons
                (   
                    course_id,
                    title,
                    content,
                    lesson_order
                )
                VALUES (?, ?, ?, ?)
                `,
                [
                    courseId,
                    input.title,
                    input.content ?? null,
                    input.lessonOrder,
                ]
        );

        const [lessons] = await app.db.query<LessonRow[]>(
            `
                SELECT * 
                FROM lessons
                WHERE id = ? 
                LIMIT 1
            `,
            [
                result.insertId
            ]
        )

        return lessons[0];
    } catch (error:any) {
        if(error.code === "ER_DUP_ENTRY"){
            throw new AppError(
                409,
                "Lesson order already exits",
            );
        }
        throw error;
    }
}

export async function getCourseLessons(
    app: FastifyInstance,
    courseId: number,
){ 
    const [ lessons ] = await app.db.query<LessonRow[]> (
        `
            SELECT 
            id,
            course_id,
            title,
            content,
            lesson_order,
            created_at,
            updated_at
        FROM lessons
        WHERE course_id = ?
        ORDER BY lesson_order ASC     
        `,
        [
            courseId
        ]
    );

    return lessons;
}

export async function deleteLesson (
    app: FastifyInstance,
    lessonId: number,
){
    const [result] = await app.db.execute<ResultSetHeader>(
        `
            DELETE FROM lessons
            WHERE id = ?    
        `,
        [lessonId]
    );
    if(result.affectedRows === 0) {
        throw new AppError (
            404,
            "Lesson not found",
        )
    }
}

interface LessonOwnerRow extends RowDataPacket {
    id: number;
    instructor_id: number;
}

export async function getLessonOwner(
    app: FastifyInstance,
    lessonId: number,
) {
    const [rows] = await app.db.query<LessonOwnerRow[]>(
        `
        SELECT
            l.id,
            c.instructor_id
        FROM lessons l
        INNER JOIN courses c
            ON c.id = l.course_id
        WHERE l.id = ?
        LIMIT 1
        `,
        [lessonId],
    );

    return rows[0];
}

export async function verifyLessonOwnership(
    app: FastifyInstance,
    lessonId: number,
    user: AuthUser,
) {
    const lesson = await getLessonOwner(app, lessonId);

    if (!lesson) {
        throw new AppError(404, "Lesson not found");
    }

    if (user.role === "admin") {
        return;
    }

    if (lesson.instructor_id !== user.userId) {
        throw new AppError(403, "Forbidden");
    }
}

export async function updateLesson(
    app: FastifyInstance,
    lessonId: number,
    input: UpdateLessonInput,
) {
    const updates: string[] = [];
    const values: unknown[] = [];

    if (input.title !== undefined) {
        updates.push("title = ?");
        values.push(input.title);
    }

    if (input.content !== undefined) {
        updates.push("content = ?");
        values.push(input.content);
    }

    if (input.lessonOrder !== undefined) {
        updates.push("lesson_order = ?");
        values.push(input.lessonOrder);
    }

    if (updates.length === 0) {
        throw new AppError(400, "No fields provided for update");
    }

    values.push(lessonId);

    try {
        await app.db.execute(
            `
            UPDATE lessons
            SET ${updates.join(", ")}
            WHERE id = ?
            `,
            values,
        );
    } catch (error: any) {
        if (error.code === "ER_DUP_ENTRY") {
            throw new AppError(409, "Lesson order already exists");
        }

        throw error;
    }

    const [lessons] = await app.db.query<LessonRow[]>(
        `
        SELECT *
        FROM lessons
        WHERE id = ?
        LIMIT 1
        `,
        [lessonId],
    );

    if (!lessons[0]) {
        throw new AppError(404, "Lesson not found");
    }

    return lessons[0];
}