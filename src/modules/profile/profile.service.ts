import type { FastifyInstance } from "fastify";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { AppError } from "../../errors/app.error.ts";
import type { ProfileResponse } from "./profile.types.ts";

interface UserProfileRow extends RowDataPacket {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: Date;
};

export async function getProfile(app:FastifyInstance,userId: number): Promise<ProfileResponse> {
    const [users] = await app.db.query<UserProfileRow[]>(
        `
        SELECT
            id,
            name,
            email,
            role,
            created_at
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [userId]
    );
    
    const user = users[0];

    if(!user) {
        throw new AppError(
            404,
            "User not found"
        );
    }

    return {
        id:user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
    };
}

export async function updateProfile(app:FastifyInstance, userId: number, name: string){
    const [result] = await app.db.execute<ResultSetHeader>(
        `
        UPDATE users
        SET name = ?
        WHERE id = ?
        `,
        [name, userId]
    );
    if(result.affectedRows === 0) {
        throw new AppError(
            404,
            "User not found"
        );
    }
    return getProfile(app, userId);
}