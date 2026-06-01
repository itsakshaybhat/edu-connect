import type { Pool, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import bcrypt from "bcrypt";
import type { FastifyInstance } from "fastify";
import type { RegisterUserInput } from "./auth.types.ts";
import  {AppError} from '../../errors/app.error.ts';
import type { LoginUserInput } from "./auth.types.ts";
import { generateAccessToken, 
         generateRefreshToken,
} from "./token.service.ts";

interface UserRow extends RowDataPacket {
    id: number;
    // email: string;
    // password_hash: string;
    role: string;
}

export async function registerUser(
    db: Pool,
    input: RegisterUserInput,
){
    const { name, email, password } = input;

    const [existingUsers] = await db.query<RowDataPacket[]>(
        `SELECT id
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [email]
    );

    if(existingUsers.length > 0) {
        throw new AppError(
            409,
            "Email already exists"
        );
    }

    const passwordHash = await bcrypt.hash(password,10);

    const [result] = await db.execute<ResultSetHeader>(
        `
        INSERT INTO users
        (
            name,
            email,
            password_hash,
            role
        )
        VALUES (?,?,?,?)
        `,
        [name,email,passwordHash,"student"]
    );
    return {
        id: result.insertId,
    };
}

export async function loginUser(app: FastifyInstance, input:LoginUserInput){
    const { email, password } = input;

    const [users] = await app.db.query<UserRow[]>(
        `
        SELECT 
            id,
            email,
            password_hash,
            role
        FROM users 
        WHERE email = ?
        LIMIT 1
        `,
        [email]
    );
    const user = users[0];
    if(!user) {
        throw new AppError(401, "Invalid Credentials");
    }
    const passwordMatches = await bcrypt.compare(
        password,
        user.password_hash
    );

    if(!passwordMatches){
        throw new AppError(401,"Invalid Credentials");
    }

    const accessToken = generateAccessToken(
        app,
        user.id,
        user.role
    );

    const refreshToken = generateRefreshToken(
        app,
        user.id,
    );

    await app.db.execute<ResultSetHeader>(
        `
        INSERT INTO refresh_tokens
        (
            user_id,
            token,
            expires_at
        )
        VALUES (?, ? , DATE_ADD(NOW(), INTERVAL 7 DAY))
        `,
        [
            user.id,
            refreshToken,
        ]
    );
    return {
        accessToken,
        refreshToken,
    };
}

interface RefreshTokenRow extends RowDataPacket {
    id: number;
    user_id: number;
    token: string;
    expires_at: Date;
}


export async function refreshAccessToken(
    app: FastifyInstance,
    refreshToken: string
) {
    let payload: {userId: number};

    try{
        payload = app.jwt.verify<{userId: number}>(
            refreshToken
        );
    } catch (error) {
        throw new AppError(
            401,
            "Invalid refresh token"
        )
    }

    const [tokens] = await app.db.query<RefreshTokenRow[]>(
        `
        SELECT 
            id,
            user_id,
            token,
            expires_at
        FROM refresh_tokens
        WHERE token = ?
        LIMIT 1
        `,
        [refreshToken]
    );

    const storedToken = tokens[0];

    if(!storedToken) {
        throw new AppError(
            401,
            "Invalid refresh token"
        )
    };

    const [users] = await app.db.query<UserRow[]>(
        `
            SELECT 
                id,
                role
            FROM users 
            WHERE id = ?
            LIMIT 1
        `,
        [payload.userId]
    );

    const user = users[0];

    if(!user) {
        throw new AppError(
            401,
            "Invalid refresh token"
        )
    }
    const accessToken = generateAccessToken(
        app,
        user.id,
        user.role
    );

    return {
        accessToken,
    };
}