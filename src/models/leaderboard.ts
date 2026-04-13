import { pgSchema, bigserial, varchar, integer, timestamp, doublePrecision } from "drizzle-orm/pg-core"

const api = pgSchema("api");

export const leaderboardInApi = api.table("leaderboard", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	teacherId: integer("teacher_id").notNull(),
	teacherName: varchar("teacher_name", { length: 255 }).notNull(),
	region: varchar({ length: 255 }),
	country: varchar({ length: 255 }).notNull(),
	totalPoints: doublePrecision("total_points").notNull(),
	classroomCount: integer("classroom_count").notNull(),
	homeworkCount: integer("homework_count").notNull(),
	studentCount: integer("student_count").notNull(),
	completedHomeworkCount: integer("completed_homework_count").notNull(),
	averageCompletionRate: doublePrecision("average_completion_rate").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	q1Points: doublePrecision("q1_points").default(0),
	q2Points: doublePrecision("q2_points").default(0),
	q3Points: doublePrecision("q3_points").default(0),
	q4Points: doublePrecision("q4_points").default(0),
});
