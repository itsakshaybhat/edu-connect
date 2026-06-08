import bcrypt from "bcrypt";
import crypto from "node:crypto";
import type { FastifyInstance } from "fastify";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { OAuth2Client } from "google-auth-library";
import { env } from "../../config/env.ts";

export const googleClient = new OAuth2Client(
    env.googleClientId,
    env.googleClientSecret,
    env.googleRedirectUri,
);

export function getGoogleAuthUrl() {
    return googleClient.generateAuthUrl({
        access_type: "offline", // I am telling, server need the refresh token

        scope: [
            "openid",
            "email",
            "profile",
        ]
    });
}

export async function getGoogleUserFromCode(code: string) {
    const { tokens } = await googleClient.getToken(code);

    if (!tokens.id_token) {
        throw new Error("Google ID token missing");
    }

    const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: env.googleClientId,
    });

    const payload = ticket.getPayload();

    if (!payload) {
        throw new Error("Google payload missing");
    }

    return {
        providerUserId: payload.sub,
        email: payload.email!,
        name: payload.name ?? "Google User",
        emailVerified: payload.email_verified ?? false,
    }
}

interface UserRow extends RowDataPacket {
    id: number;
    email: string;
    role: string;
};

interface OAuthAccountRow extends RowDataPacket {
    id: number;
    user_id: number;
    provider: string;
    provider_user_id: string;
}

export async function findOrCreateGoogleUser(
    app: FastifyInstance,
    googleUser: {
        providerUserId: string;
        email: string;
        name: string;
        emailVerified: boolean;
    }
): Promise<UserRow> {
    const [oauthAccounts] = await app.db.query<OAuthAccountRow[]>(
        `
            SELECT 
                user_id
            FROM oauth_accounts
            WHERE provider = ?
            AND provider_user_id  = ?
            LIMIT 1
        `,
        [
            "google",
            googleUser.providerUserId
        ]
    );

    const existingOAuth = oauthAccounts[0];

    if (existingOAuth) {
        const [users] = await app.db.query<UserRow[]>(
            `
                SELECT 
                    id,
                    email,
                    role
                FROM users
                WHERE id = ?
                LIMIT 1
            `,
            [existingOAuth.user_id]
        );
        return users[0]!;
    }
    //Above code checks whether the id is already in the table.

    const [usersByEmail] = await app.db.query<UserRow[]>(
        `
            SELECT 
                id,
                email,
                role
            FROM users
            WHERE email = ?
            LIMIT 1
        `, [googleUser.email]
    );

    let user = usersByEmail[0];

    if (!user) {
        const randomPassword = crypto.randomUUID();
        const passwordHash = await bcrypt.hash(
            randomPassword,
            10
        );

        const [result] = await app.db.execute<ResultSetHeader>(
            `
                INSERT INTO users 
                (
                    name, 
                    email,
                    password_hash,
                    role    
                ) 
                VALUES (?, ?, ?, ?)
                `,
            [
                googleUser.name,
                googleUser.email,
                passwordHash,
                "student"
            ]
        );
        
        user = {
            id: result.insertId,
            email: googleUser.email,
            role: "student",
        } as UserRow;
    }

    await app.db.execute<ResultSetHeader>(
        `
            INSERT INTO oauth_accounts
            (
                user_id,
                provider,
                provider_user_id    
            )
            VALUES (?, ?, ?)
        `,
        [
            user.id,
            "google",
            googleUser.providerUserId,
        ]
    );

    return user!;
}