import { pgSchema, foreignKey, bigserial, bigint, varchar, integer, timestamp, boolean, date, unique, jsonb } from "drizzle-orm/pg-core"

export const api = pgSchema("api");

export const homeworksInApi = api.table("homeworks", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: varchar({ length: 255 }).notNull(),
	dueDate: date("due_date").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	classroomId: bigint("classroom_id", { mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	slug: varchar({ length: 255 }),
	attemptLimit: integer("attempt_limit").default(1).notNull(),
	allowSkipVideo: boolean("allow_skip_video").default(false).notNull(),
	allowAfterDueDate: boolean("allow_after_due_date").default(false).notNull(),
	showAnswers: boolean("show_answers").default(false).notNull(),
});

export const homeworkLessonInApi = api.table("homework_lesson", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	homeworkId: bigint("homework_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	lessonId: bigint("lesson_id", { mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.homeworkId],
			foreignColumns: [homeworksInApi.id],
			name: "homework_lesson_homework_id_foreign"
		}).onDelete("cascade"),
]);

export const studentProgressInApi = api.table("student_progress", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	homeworkId: bigint("homework_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	lessonId: bigint("lesson_id", { mode: "number" }).notNull(),
	progress: integer(),
	completed: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	attempt: integer().default(0).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	profileId: bigint("profile_id", { mode: "number" }),
	completedDate: timestamp("completed_date", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.homeworkId],
			foreignColumns: [homeworksInApi.id],
			name: "student_progress_homework_id_foreign"
		}).onDelete("cascade"),
	unique("student_progress_user_id_homework_id_lesson_id_unique").on(table.userId, table.homeworkId, table.lessonId),
]);

export const studentQuizProgressInApi = api.table("student_quiz_progress", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	result: jsonb().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	studentProgressId: bigint("student_progress_id", { mode: "number" }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.studentProgressId],
			foreignColumns: [studentProgressInApi.id],
			name: "student_quiz_progress_student_progress_id_foreign"
		}).onDelete("cascade"),
]);
