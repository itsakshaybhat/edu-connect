import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildTestApp } from "./helpers/build-test-app.ts";

let app: Awaited<ReturnType<typeof buildTestApp>>;

describe("Lessons Routes", () => {
	beforeAll(async () => {
		app = await buildTestApp();
	});

	afterAll(async () => {
		await app.close();
	});

	it("should allow instructor to create, list, update and delete lessons", async () => {
		const instructorEmail = `lessons-instructor+${Date.now()}@example.com`;
		const instructorPassword = "Password123";

		await app.inject({
			method: "POST",
			url: "/api/v1/auth/register",
			payload: { name: "Instructor", email: instructorEmail, password: instructorPassword },
		});

		await app.db.execute(`UPDATE users SET role = 'instructor' WHERE email = ?`, [instructorEmail]);

		const loginInst = await app.inject({ method: "POST", url: "/api/v1/auth/login", payload: { email: instructorEmail, password: instructorPassword } });
		const token = loginInst.json().data.accessToken as string;

		const createCourse = await app.inject({ method: "POST", url: "/api/v1/courses", headers: { authorization: `Bearer ${token}` }, payload: { title: "Lessons Course" } });
		expect(createCourse.statusCode).toBe(201);
		const courseId = createCourse.json().data.id as number;

		// create lesson
		const createLesson = await app.inject({
			method: "POST",
			url: `/api/v1/courses/${courseId}/lessons`,
			headers: { authorization: `Bearer ${token}` },
			payload: { title: "Lesson 1", content: "Lesson content", lessonOrder: 1 },
		});
		expect(createLesson.statusCode).toBe(201);
		const lessonId = createLesson.json().data.id as number;

		// list lessons
		const listRes = await app.inject({ method: "GET", url: `/api/v1/courses/${courseId}/lessons` });
		expect(listRes.statusCode).toBe(200);
		const lessons = listRes.json();
		expect(Array.isArray(lessons.data)).toBe(true);

		// update lesson
		const updateRes = await app.inject({ method: "PATCH", url: `/api/v1/lessons/${lessonId}`, headers: { authorization: `Bearer ${token}` }, payload: { title: "Updated Lesson 1" } });
		expect(updateRes.statusCode).toBe(200);
		const updated = updateRes.json();
		expect(updated.data.title).toBe("Updated Lesson 1");

		// delete lesson
		const delRes = await app.inject({ method: "DELETE", url: `/api/v1/lessons/${lessonId}`, headers: { authorization: `Bearer ${token}` } });
		expect(delRes.statusCode).toBe(204);
	});
});
