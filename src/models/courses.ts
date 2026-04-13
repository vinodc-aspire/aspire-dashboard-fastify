import { pgSchema, foreignKey, bigserial, bigint, varchar, json, integer, timestamp, boolean, index, unique, text, smallint } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

const api = pgSchema("api");

export const coursesInApi = api.table("courses", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	categoryId: bigint("category_id", { mode: "number" }),
	slug: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	author: varchar({ length: 255 }).notNull(),
	description: varchar({ length: 255 }).notNull(),
	background: varchar({ length: 255 }).notNull(),
	bibliography: json().notNull(),
	included: json().notNull(),
	overview: text().notNull(),
	releasedAt: timestamp("released_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	limit: integer(),
	isActive: boolean("is_active").default(true).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	curriculumId: bigint("curriculum_id", { mode: "number" }).default(sql`'1'`).notNull(),
	status: integer().default(3).notNull(),
	ribbonDays: integer("ribbon_days"),
}, (table) => [
	index().using("btree", table.slug.asc().nullsLast().op("text_ops")),
	unique("courses_category_id_slug_unique").on(table.categoryId, table.slug),
]);

export const unitsInApi = api.table("units", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	courseId: bigint("course_id", { mode: "number" }),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	order: integer(),
}, (table) => [
	index().using("btree", table.order.desc().nullsFirst().op("int4_ops")),
	index().using("btree", table.slug.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [coursesInApi.id],
			name: "units_course_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
	unique("units_course_id_slug_unique").on(table.courseId, table.slug),
]);

export const chaptersInApi = api.table("chapters", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	courseId: bigint("course_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	unitId: bigint("unit_id", { mode: "number" }),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	order: integer(),
}, (table) => [
	index().using("btree", table.order.desc().nullsFirst().op("int4_ops")),
	index().using("btree", table.slug.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [coursesInApi.id],
			name: "chapters_course_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.unitId],
			foreignColumns: [unitsInApi.id],
			name: "chapters_unit_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
	unique("chapters_course_id_unit_id_slug_unique").on(table.courseId, table.unitId, table.slug),
]);

export const lessonsInApi = api.table("lessons", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	courseId: bigint("course_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	unitId: bigint("unit_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	chapterId: bigint("chapter_id", { mode: "number" }),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	image: varchar({ length: 255 }).notNull(),
	duration: varchar({ length: 255 }),
	summary: text().notNull(),
	pdf: varchar({ length: 255 }),
	notes: json(),
	key: varchar({ length: 255 }),
	video: varchar({ length: 255 }),
	poster: varchar({ length: 255 }),
	tracks: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	download: json(),
	order: integer(),
	games: json(),
	type: smallint().default(sql`'0'`).notNull(),
	isLockedForTrial: boolean("is_locked_for_trial").default(true).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	dimTestId: bigint("dim_test_id", { mode: "number" }),
}, (table) => [
	index().using("btree", table.order.desc().nullsFirst().op("int4_ops")),
	index().using("btree", table.slug.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.chapterId],
			foreignColumns: [chaptersInApi.id],
			name: "lessons_chapter_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [coursesInApi.id],
			name: "lessons_course_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.unitId],
			foreignColumns: [unitsInApi.id],
			name: "lessons_unit_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
	unique("lessons_course_id_unit_id_chapter_id_slug_unique").on(table.courseId, table.unitId, table.chapterId, table.slug),
]);

export const lessonProfileInApi = api.table("lesson_profile", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	lessonId: bigint("lesson_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	profileId: bigint("profile_id", { mode: "number" }),
	watched: varchar({ length: 255 }).default('0').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	platformId: bigint("platform_id", { mode: "number" }),
}, (table) => [
	foreignKey({
			columns: [table.lessonId],
			foreignColumns: [lessonsInApi.id],
			name: "lesson_profile_lesson_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
	unique("lesson_profile_lesson_id_profile_id_unique").on(table.lessonId, table.profileId),
]);
