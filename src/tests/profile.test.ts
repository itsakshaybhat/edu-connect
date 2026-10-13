import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildTestApp } from "./helpers/build-test-app.ts";

let app: Awaited<ReturnType<typeof buildTestApp>>;

describe("Profile Routes", () => {
	beforeAll(async () => {
		app = await buildTestApp();
	});

	afterAll(async () => {
		await app.close();
	});

	it("should get and update profile and change password", async () => {
		const email = `profile-user+${Date.now()}@example.com`;
		const password = "Password123";

		await app.inject({ method: "POST", url: "/api/v1/auth/register", payload: { name: "Profile User", email, password } });

		// login
		const login = await app.inject({ method: "POST", url: "/api/v1/auth/login", payload: { email, password } });
		expect(login.statusCode).toBe(200);
		const token = login.json().data.accessToken as string;

		// get profile
		const getRes = await app.inject({ method: "GET", url: "/api/v1/profile", headers: { authorization: `Bearer ${token}` } });
		expect(getRes.statusCode).toBe(200);
		const profile = getRes.json();
		expect(profile.data.email).toBe(email);

		// update profile
		const updateRes = await app.inject({ method: "PATCH", url: "/api/v1/profile", headers: { authorization: `Bearer ${token}` }, payload: { name: "Updated Name" } });
		expect(updateRes.statusCode).toBe(200);
		const updated = updateRes.json();
		expect(updated.data.name).toBe("Updated Name");

		// change password
		const changeRes = await app.inject({ method: "PATCH", url: "/api/v1/profile/password", headers: { authorization: `Bearer ${token}` }, payload: { currentPassword: password, newPassword: "NewPassword123" } });
		expect(changeRes.statusCode).toBe(200);
		const changeBody = changeRes.json();
		expect(changeBody.message).toMatch(/Password changed/i);
	});
});
