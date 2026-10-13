import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildTestApp } from "./helpers/build-test-app.ts";

let app: Awaited<ReturnType<typeof buildTestApp>>;

describe("Enrollment Routes", () => {
	beforeAll(async () => {
		app = await buildTestApp();
	});

	afterAll(async () => {
		await app.close();
	});

	it("should allow a student to enroll in a course and prevent duplicate enrollments", async () => {
		// create instructor and course
		const instructorEmail = `enroll-instructor+${Date.now()}@example.com`;
		const instructorPassword = "Password123";

		await app.inject({
			method: "POST",
			url: "/api/v1/auth/register",
			payload: {
				name: "Instructor",
				email: instructorEmail,
				password: instructorPassword,
			},
		});

		await app.db.execute(`UPDATE users SET role = 'instructor' WHERE email = ?`, [instructorEmail]);

		const loginInst = await app.inject({
			method: "POST",
			url: "/api/v1/auth/login",
			payload: { email: instructorEmail, password: instructorPassword },
		});
		const instToken = loginInst.json().data.accessToken as string;

		const createCourse = await app.inject({
			method: "POST",
			url: "/api/v1/courses",
			headers: { authorization: `Bearer ${instToken}` },
			payload: { title: "Enrollment Course" },
		});
		expect(createCourse.statusCode).toBe(201);
		const courseId = createCourse.json().data.id as number;

		// create student
		const studentEmail = `student+${Date.now()}@example.com`;
		const studentPassword = "Password123";
		await app.inject({
			method: "POST",
			url: "/api/v1/auth/register",
			payload: { name: "Student", email: studentEmail, password: studentPassword },
		});

		const loginStudent = await app.inject({
			method: "POST",
			url: "/api/v1/auth/login",
			payload: { email: studentEmail, password: studentPassword },
		});
		expect(loginStudent.statusCode).toBe(200);
		const studentToken = loginStudent.json().data.accessToken as string;

		// enroll once
		const enrollRes = await app.inject({
			method: "POST",
			url: `/api/v1/courses/${courseId}/enroll`,
			headers: { authorization: `Bearer ${studentToken}` },
		});
		expect(enrollRes.statusCode).toBe(201);

		// enroll again -> conflict
		const enrollAgain = await app.inject({
			method: "POST",
			url: `/api/v1/courses/${courseId}/enroll`,
			headers: { authorization: `Bearer ${studentToken}` },
		});
		expect(enrollAgain.statusCode).toBe(409);
	});
});
