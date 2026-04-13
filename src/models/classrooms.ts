import { pgSchema, foreignKey, bigserial, bigint, varchar, integer, timestamp, smallint, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

const api = pgSchema("api");

export const classroomsInApi = api.table("classrooms", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	teacherId: integer("teacher_id").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	courseId: bigint("course_id", { mode: "number" }),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	status: smallint().default(sql`'1'`).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	enrollmentCode: varchar("enrollment_code", { length: 6 }),
	externalClassId: varchar("external_class_id", { length: 255 }),
}, (table) => [
	unique("classrooms_slug_unique").on(table.slug),
	unique("classrooms_enrollment_code_unique").on(table.enrollmentCode),
]);

export const classroomStudentInApi = api.table("classroom_student", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	classroomId: bigint("classroom_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	studentId: bigint("student_id", { mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	profileId: bigint("profile_id", { mode: "number" }),
}, (table) => [
	foreignKey({
			columns: [table.classroomId],
			foreignColumns: [classroomsInApi.id],
			name: "classroom_student_classroom_id_foreign"
		}).onDelete("cascade"),
]);
