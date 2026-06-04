import type { FastifyInstance } from "fastify";
import {AppError} from "../../errors/app.error.ts";
import type {ResultSetHeader, RowDataPacket} from "mysql2/promise";

interface CourseExistRow extends RowDataPacket {
    id: number;
}

async function verifyCourseExists(
    app: FastifyInstance,
    courseId: number,
) {
    const [ courses ] = await app.db.query<CourseExistRow[]>(
        `
            SELECT id 
            FROM courses
            WHERE id = ?
            LIMIT 1    
        `, [courseId]
    );
    
    if(!courses[0]) {
        throw new AppError(404, "Course not found");
    }

}

export async function enrollInCourse(
    app: FastifyInstance,
    userId: number,
    courseId: number,
) {
    await verifyCourseExists(
        app,
        courseId,
    );

    try {
        await app.db.execute<ResultSetHeader>(
            `
                INSERT INTO enrollments
                (
                    user_id,
                    course_id
                )
                VALUES ( ?, ? )
                `,
                [userId, courseId]
        );
    } catch(error: any) {
        if ( error.code === "ER_DUP_ENTRY"){
            throw new AppError(409, "Already enrolled");
        }
    }
    return {
        message: "Enrollment Successful",
    }
}