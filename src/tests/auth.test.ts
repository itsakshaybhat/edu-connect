import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildTestApp } from "./helpers/build-test-app.ts";

let app: Awaited<ReturnType<typeof buildTestApp>>;

describe("Auth Routes", () => {
    beforeAll(async () => {
        app = await buildTestApp();
    });

    afterAll(async () => {
        await app.close();
    })

    it("should register a new user", async ()=>{
        const email = `test+${Date.now()}@example.com`;

        const response = await app.inject({
            method: "POST",
            url: "/api/v1/auth/register",
            payload: {
                name: "Test User",
                email,
                password: "Password123",
            }
        });
        expect(response.statusCode).toBe(201);

        const body = response.json();

        expect(body.success).toBe(true);

        expect(body.data.id).toBeDefined();

        // duplicate registration should fail
        const dup = await app.inject({
            method: "POST",
            url: "/api/v1/auth/register",
            payload: {
              name: "Test User",
                email,
                password: "Password123",
            }
        });
        expect(dup.statusCode).toBe(409);
        const dupBody = dup.json();
        expect(dupBody.message).toBe("Email already exists");
    })

    it("should login, refresh token, and logout current session", async ()=>{
        const email = `test+login+${Date.now()}@example.com`;
        const password = "Password123";

        const reg = await app.inject({
            method: "POST",
            url: "/api/v1/auth/register",
            payload: {
                name: "Login User",
                email,
                password,
            }
        });
        expect(reg.statusCode).toBe(201);

        const login = await app.inject({
            method: "POST",
            url: "/api/v1/auth/login",
            payload: {
                email,
                password,
            }
        });
        expect(login.statusCode).toBe(200);
        const tokens = login.json();
        expect(tokens.success).toBe(true);
        const accessToken = tokens.data.accessToken as string;
        const refreshToken = tokens.data.refreshToken as string;
        expect(accessToken).toBeDefined();
        expect(refreshToken).toBeDefined();

        // refresh using cookie header
        const refreshRes = await app.inject({
            method: "POST",
            url: "/api/v1/auth/refresh",
            headers: {
                cookie: `refreshToken=${refreshToken}`,
            },
        });
        expect(refreshRes.statusCode).toBe(200);
        const refreshed = refreshRes.json();
        expect(refreshed.success).toBe(true);
        expect(refreshed.data.accessToken).toBeDefined();
        expect(refreshed.data.refreshToken).toBeDefined();

        // logout current session (deletes refresh token)
        const logoutRes = await app.inject({
            method: "POST",
            url: "/api/v1/auth/logout",
            headers: {
                cookie: `refreshToken=${refreshed.data.refreshToken}`,
            },
        });
        expect(logoutRes.statusCode).toBe(204);

        // using the same refresh token should now fail
        const refreshAfterLogout = await app.inject({
            method: "POST",
            url: "/api/v1/auth/refresh",
            headers: {
                cookie: `refreshToken=${refreshed.data.refreshToken}`,
            },
        });
        expect(refreshAfterLogout.statusCode).toBe(401);
        const afterBody = refreshAfterLogout.json();
        expect(afterBody.message).toBe("Invalid refresh token");
    })

    it("should logout from all devices using logout-all", async ()=>{
        const email = `test+logoutall+${Date.now()}@example.com`;
        const password = "Password123";

        const reg = await app.inject({
            method: "POST",
            url: "/api/v1/auth/register",
            payload: {
                name: "LogoutAll User",
                email,
                password,
            }
        });
        expect(reg.statusCode).toBe(201);

        const login = await app.inject({
            method: "POST",
            url: "/api/v1/auth/login",
            payload: {
                email,
                password,
            }
        });
        expect(login.statusCode).toBe(200);
        const tokens = login.json();
        const accessToken = tokens.data.accessToken as string;
        const refreshToken = tokens.data.refreshToken as string;

        // call logout-all with Authorization header
        const logoutAllRes = await app.inject({
            method: "POST",
            url: "/api/v1/auth/logout-all",
            headers: {
                authorization: `Bearer ${accessToken}`,
            },
        });
        expect(logoutAllRes.statusCode).toBe(204);

        // refresh should fail after logout-all
        const refreshAfter = await app.inject({
            method: "POST",
            url: "/api/v1/auth/refresh",
            headers: {
                cookie: `refreshToken=${refreshToken}`,
            },
        });
        expect(refreshAfter.statusCode).toBe(401);
        const refreshAfterBody = refreshAfter.json();
        expect(refreshAfterBody.message).toBe("Invalid refresh token");
    })

})           