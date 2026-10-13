import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildTestApp } from "./helpers/build-test-app.ts";

let app: Awaited<ReturnType<typeof buildTestApp>>;

describe("Courses Routes", () => {
	beforeAll(async () => {
		app = await buildTestApp();
	});

	afterAll(async () => {
		await app.close();
	});

	it("should allow an instructor to create, read, update and delete a course", async () => {
		const instructorEmail = `instructor+${Date.now()}@example.com`;
		const instructorPassword = "Password123";

		// register instructor
		const reg = await app.inject({
			method: "POST",
			url: "/api/v1/auth/register",
			payload: {
				name: "Instructor",
				email: instructorEmail,
				password: instructorPassword,
			},
		});
		expect(reg.statusCode).toBe(201);

		// promote to instructor role directly in DB
		await app.db.execute(
			`UPDATE users SET role = 'instructor' WHERE email = ?`,
			[instructorEmail],
		);

		// login
		const loginRes = await app.inject({
			method: "POST",
			url: "/api/v1/auth/login",
			payload: {
				email: instructorEmail,
				password: instructorPassword,
			},
		});
		expect(loginRes.statusCode).toBe(200);
		const tokens = loginRes.json();
		const accessToken = tokens.data.accessToken as string;
		expect(accessToken).toBeDefined();

		// create course
		const createRes = await app.inject({
			method: "POST",
			url: "/api/v1/courses",
			headers: { authorization: `Bearer ${accessToken}` },
			payload: {
				title: "Test Course",
				description: "A course created during tests",
			},
		});
		expect(createRes.statusCode).toBe(201);
		const created = createRes.json();
		expect(created.success).toBe(true);
		expect(created.data.id).toBeDefined();
		const courseId = created.data.id as number;

		// get course
		const getRes = await app.inject({
			method: "GET",
			url: `/api/v1/courses/${courseId}`,
		});
		expect(getRes.statusCode).toBe(200);
		const gotten = getRes.json();
		expect(gotten.data.title).toBe("Test Course");

		// list courses by instructorId
		const listRes = await app.inject({
			method: "GET",
			url: `/api/v1/courses?instructorId=${created.data.instructor_id}`,
		});
		expect(listRes.statusCode).toBe(200);
		const listBody = listRes.json();
		expect(Array.isArray(listBody.data.data)).toBe(true);

		// update course
		const patchRes = await app.inject({
			method: "PATCH",
			url: `/api/v1/courses/${courseId}`,
			headers: { authorization: `Bearer ${accessToken}` },
			payload: {
				title: "Updated Test Course",
			},
		});
		expect(patchRes.statusCode).toBe(200);
		const patched = patchRes.json();
		expect(patched.data.title).toBe("Updated Test Course");

		// delete course
		const delRes = await app.inject({
			method: "DELETE",
			url: `/api/v1/courses/${courseId}`,
			headers: { authorization: `Bearer ${accessToken}` },
		});
		expect(delRes.statusCode).toBe(204);
	});
});
