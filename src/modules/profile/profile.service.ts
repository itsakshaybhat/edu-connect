import type { FastifyInstance } from "fastify";
import type { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { AppError } from "../../errors/app.error.ts";
import type { ProfileResponse, ChangePasswordInput } from "./profile.types.ts";
import bcrypt from "bcrypt";

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

interface PasswordUserRow extends RowDataPacket {
    id: number;
    password_has: string;
};

export async function changePassword(
    app: FastifyInstance,
    userId: number,
    input: ChangePasswordInput,
) {
    const [users] = await app.db.query<PasswordUserRow[]>(
        `
            SELECT 
                id,
                password_hash
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
            "User not found",
        );
    }

    const currentPasswordMatches = 
            await bcrypt.compare(
                input.currentPassword,
                user.password_hash
            );
    
    if(!currentPasswordMatches){
        throw new AppError(
            401,
            "Current Password is incorrect",
        )
    }

    const samePassword = 
        await bcrypt.compare(
            input.newPassword,
            user.password_hash,
        )

    if(samePassword) {
        throw new AppError(
            400,
            "New password must be different from current Password",
        )
    }

    const passwordHash = await bcrypt.hash(input.newPassword, 10);

    await app.db.execute<ResultSetHeader>(
        `
            UPDATE users
            SET password_hash = ?
            WHERE id = ?    
        `,[
            passwordHash,
            userId,
        ]
    );

    await app.db.execute<ResultSetHeader>(
        `
            DELETE FROM refresh_tokens
            WHERE user_id = ?
        `,
        [ userId]
    );
}