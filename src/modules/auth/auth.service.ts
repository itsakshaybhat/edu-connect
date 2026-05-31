import type { Pool, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import bcrypt from "bcrypt";
import type { RegisterUserInput } from "./auth.types.ts";
import  {AppError} from '../../errors/app.error.ts';

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