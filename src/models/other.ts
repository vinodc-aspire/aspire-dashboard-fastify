import { pgSchema, foreignKey, bigserial, bigint, varchar, json, integer, timestamp, index, unique, boolean, smallint, date, text, check, inet, serial, doublePrecision, numeric, uuid, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

const api = pgSchema("api");

export const categoriesInApi = api.table("categories", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	show: boolean().default(false).notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	background: varchar({ length: 255 }).notNull(),
	icon: json().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	order: integer().default(0).notNull(),
}, (table) => [
	index().using("btree", table.order.asc().nullsLast().op("int4_ops")),
	unique("categories_slug_unique").on(table.slug),
]);

export const classroomCourseInApi = api.table("classroom_course", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	classroomId: bigint("classroom_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	courseId: bigint("course_id", { mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const countriesInApi = api.table("countries", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	code: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const companiesInApi = api.table("companies", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	maxRegistrations: integer("max_registrations").default(20).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	countryId: bigint("country_id", { mode: "number" }),
}, (table) => [
	foreignKey({
			columns: [table.countryId],
			foreignColumns: [countriesInApi.id],
			name: "companies_country_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const competitionsInApi = api.table("competitions", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	slug: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	background: varchar({ length: 255 }).notNull(),
	overview: text().notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	unique("competitions_slug_unique").on(table.slug),
]);

export const schoolsInApi = api.table("schools", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	countryId: bigint("country_id", { mode: "number" }),
	name: varchar({ length: 255 }).notNull(),
	address: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.countryId],
			foreignColumns: [countriesInApi.id],
			name: "schools_country_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const competitionRegistrationsInApi = api.table("competition_registrations", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	competitionId: bigint("competition_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	schoolId: bigint("school_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	countryId: bigint("country_id", { mode: "number" }).notNull(),
	firstname: varchar({ length: 255 }).notNull(),
	lastname: varchar({ length: 255 }).notNull(),
	guiderName: varchar("guider_name", { length: 255 }),
	otherInformation: varchar("other_information", { length: 255 }),
	email: varchar({ length: 255 }).notNull(),
	birthdate: date().notNull(),
	summary: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.competitionId],
			foreignColumns: [competitionsInApi.id],
			name: "competition_registrations_competition_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.countryId],
			foreignColumns: [countriesInApi.id],
			name: "competition_registrations_country_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.schoolId],
			foreignColumns: [schoolsInApi.id],
			name: "competition_registrations_school_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
	unique("competition_registrations_email_unique").on(table.email),
]);

export const contributorsInApi = api.table("contributors", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	image: varchar({ length: 255 }),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const contributorCourseInApi = api.table("contributor_course", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	courseId: bigint("course_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	contributorId: bigint("contributor_id", { mode: "number" }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.contributorId],
			foreignColumns: [contributorsInApi.id],
			name: "contributor_course_contributor_id_foreign"
		}).onUpdate("cascade").onDelete("cascade"),
	unique("contributor_course_course_id_contributor_id_unique").on(table.courseId, table.contributorId),
]);

export const courseProfileInApi = api.table("course_profile", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	courseId: bigint("course_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	profileId: bigint("profile_id", { mode: "number" }),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	unique("course_profile_course_id_profile_id_unique").on(table.courseId, table.profileId),
]);

export const logTypesInApi = api.table("log_types", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	shortname: varchar({ length: 255 }).notNull(),
	description: varchar({ length: 255 }),
});

export const curatorsInApi = api.table("curators", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	companyId: bigint("company_id", { mode: "number" }),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [companiesInApi.id],
			name: "curators_company_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
	unique("curators_email_unique").on(table.email),
]);

export const curatorLogsInApi = api.table("curator_logs", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	curatorId: bigint("curator_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	logTypeId: bigint("log_type_id", { mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.curatorId],
			foreignColumns: [curatorsInApi.id],
			name: "curator_logs_curator_id_foreign"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.logTypeId],
			foreignColumns: [logTypesInApi.id],
			name: "curator_logs_log_type_id_foreign"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const dimTestsInApi = api.table("dim_tests", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	enabled: boolean().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	slug: varchar({ length: 255 }).notNull(),
	type: varchar({ length: 255 }),
}, (table) => [
	unique("dim_tests_slug_unique").on(table.slug),
	check("dim_tests_type_check", sql`(type)::text = ANY (ARRAY[('csv'::character varying)::text, ('latex'::character varying)::text])`),
]);

export const dimQuestionsInApi = api.table("dim_questions", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	dimTestId: bigint("dim_test_id", { mode: "number" }).notNull(),
	text: text().notNull(),
	points: integer().default(1).notNull(),
	order: integer().default(1).notNull(),
	difficulty: integer().default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	explanation: text(),
}, (table) => [
	foreignKey({
			columns: [table.dimTestId],
			foreignColumns: [dimTestsInApi.id],
			name: "dim_questions_dim_test_id_foreign"
		}).onDelete("cascade"),
]);

export const dimOptionsInApi = api.table("dim_options", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	questionId: bigint("question_id", { mode: "number" }).notNull(),
	text: text().notNull(),
	order: integer().default(1).notNull(),
	isCorrect: boolean("is_correct").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.questionId],
			foreignColumns: [dimQuestionsInApi.id],
			name: "dim_options_question_id_foreign"
		}).onDelete("cascade"),
]);

export const dimTestCoursesInApi = api.table("dim_test_courses", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	dimTestId: bigint("dim_test_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	courseId: bigint("course_id", { mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.dimTestId],
			foreignColumns: [dimTestsInApi.id],
			name: "dim_test_courses_dim_test_id_foreign"
		}).onDelete("cascade"),
	unique("dim_test_courses_dim_test_id_course_id_unique").on(table.dimTestId, table.courseId),
]);

export const dimTestResultsInApi = api.table("dim_test_results", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	dimTestId: bigint("dim_test_id", { mode: "number" }).notNull(),
	studentId: integer("student_id").notNull(),
	profileId: integer("profile_id").notNull(),
	score: integer().notNull(),
	total: integer().notNull(),
	result: json().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.dimTestId],
			foreignColumns: [dimTestsInApi.id],
			name: "dim_test_results_dim_test_id_foreign"
		}).onDelete("cascade"),
]);

export const emailNotificationsInApi = api.table("email_notifications", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	profileId: bigint("profile_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	courseId: bigint("course_id", { mode: "number" }),
	type: integer().default(1).notNull(),
	sended: boolean().default(false).notNull(),
	resend: boolean().default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const examInApi = api.table("exam", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	classroomId: integer("classroom_id").notNull(),
	startdateandtime: timestamp({ mode: 'string' }).notNull(),
	enddateandtime: timestamp({ mode: 'string' }).notNull(),
	duration: integer().notNull(),
	status: smallint().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	examType: varchar("exam_type", { length: 255 }).default('test').notNull(),
});

export const examQuestionsInApi = api.table("exam_questions", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	examId: bigint("exam_id", { mode: "number" }).notNull(),
	question: text().notNull(),
	answers: json().notNull(),
	explanation: text(),
	status: smallint().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.examId],
			foreignColumns: [examInApi.id],
			name: "exam_questions_exam_id_foreign"
		}),
]);

export const examResultsInApi = api.table("exam_results", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	examId: bigint("exam_id", { mode: "number" }).notNull(),
	studentId: integer("student_id").notNull(),
	profileId: integer("profile_id").notNull(),
	score: integer().notNull(),
	total: integer().notNull(),
	result: json().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.examId],
			foreignColumns: [examInApi.id],
			name: "exam_results_exam_id_foreign"
		}),
]);

export const failedJobsInApi = api.table("failed_jobs", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	connection: text().notNull(),
	queue: text().notNull(),
	payload: text().notNull(),
	exception: text().notNull(),
	failedAt: timestamp("failed_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	uuid: text(),
});

export const feedbacksInApi = api.table("feedbacks", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	topic: varchar({ length: 255 }).notNull(),
	message: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const platformsInApi = api.table("platforms", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	platform: varchar({ length: 255 }).notNull(),
	description: varchar({ length: 255 }),
});

export const gamesInApi = api.table("games", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	slug: varchar({ length: 255 }).notNull(),
	type: smallint().default(sql`'1'`).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	lessonId: bigint("lesson_id", { mode: "number" }).notNull(),
	content: json().notNull(),
	description: varchar({ length: 255 }),
}, (table) => [
	index().using("btree", table.slug.asc().nullsLast().op("text_ops")),
]);

export const gameCurrentLevelsInApi = api.table("game_current_levels", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	gameId: bigint("game_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	profileId: bigint("profile_id", { mode: "number" }).notNull(),
	level: smallint().default(sql`'1'`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.gameId],
			foreignColumns: [gamesInApi.id],
			name: "game_current_levels_game_id_foreign"
		}),
	unique("game_current_levels_game_id_profile_id_unique").on(table.gameId, table.profileId),
]);

export const lessonCaptionsInApi = api.table("lesson_captions", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	lessonId: bigint("lesson_id", { mode: "number" }),
	captionUrl: varchar("caption_url", { length: 255 }).notNull(),
	kind: varchar({ length: 255 }).notNull(),
	label: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const logsInApi = api.table("logs", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	ip: inet().notNull(),
	agent: varchar({ length: 255 }).notNull(),
	action: varchar({ length: 255 }).notNull(),
	description: varchar({ length: 255 }).notNull(),
	subjectType: varchar("subject_type", { length: 255 }).notNull(),
	subjectId: varchar("subject_id", { length: 255 }).notNull(),
	causerType: varchar("causer_type", { length: 255 }).notNull(),
	causerId: varchar("causer_id", { length: 255 }),
	properties: json().notNull(),
	actionAt: timestamp("action_at", { mode: 'string' }).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const mailTypesInApi = api.table("mail_types", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
});

export const mailTypeRulesInApi = api.table("mail_type_rules", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	mailTypeId: bigint("mail_type_id", { mode: "number" }).notNull(),
	rule: varchar({ length: 255 }).notNull(),
	description: varchar({ length: 255 }),
	value: varchar({ length: 255 }),
}, (table) => [
	foreignKey({
			columns: [table.mailTypeId],
			foreignColumns: [mailTypesInApi.id],
			name: "mail_type_rules_mail_type_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const materialsInApi = api.table("materials", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	courseId: bigint("course_id", { mode: "number" }),
	type: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	url: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	order: integer().default(1).notNull(),
});

export const migrationsInApi = api.table("migrations", {
	id: serial().primaryKey().notNull(),
	migration: varchar({ length: 255 }).notNull(),
	batch: integer().notNull(),
});

export const notesInApi = api.table("notes", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	courseId: bigint("course_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	lessonId: bigint("lesson_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	profileId: bigint("profile_id", { mode: "number" }),
	time: varchar({ length: 255 }).notNull(),
	text: varchar({ length: 255 }).notNull(),
	color: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const outsourcingLogsInApi = api.table("outsourcing_logs", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	category: varchar({ length: 255 }),
	title: varchar({ length: 255 }),
	message: varchar({ length: 255 }),
	agent: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const partnersInApi = api.table("partners", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	domain: varchar({ length: 255 }).notNull(),
	partnerName: varchar("partner_name", { length: 255 }).notNull(),
	defaultLanguage: varchar("default_language", { length: 255 }).default('en').notNull(),
	logo: varchar({ length: 255 }).notNull(),
	logoSize: varchar("logo_size", { length: 255 }).notNull(),
	sideLogo: varchar("side_logo", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const passwordResetsInApi = api.table("password_resets", {
	email: varchar({ length: 255 }).notNull(),
	token: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
}, (table) => [
	index().using("btree", table.email.asc().nullsLast().op("text_ops")),
]);

export const paymentPlansInApi = api.table("payment_plans", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: varchar({ length: 255 }).notNull(),
	price: numeric({ precision: 8, scale:  2 }).notNull(),
	currency: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	isSpecial: boolean("is_special").default(false).notNull(),
	marketIdIos: varchar("market_id_ios", { length: 255 }),
	marketIdAndroid: varchar("market_id_android", { length: 255 }),
	stripeKey: varchar("stripe_key", { length: 255 }),
	affectedDays: integer("affected_days"),
	trialDays: integer("trial_days").default(7),
	defaultStripePriceKey: varchar("default_stripe_price_key", { length: 255 }),
});

export const paymentHistoryInApi = api.table("payment_history", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	paymentPlanId: bigint("payment_plan_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	purchaseToken: varchar("purchase_token", { length: 255 }).notNull(),
	orderId: varchar("order_id", { length: 255 }).notNull(),
	status: boolean().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	purchaseTime: bigint("purchase_time", { mode: "number" }).notNull(),
	quantity: smallint().notNull(),
	isTrialPeriod: boolean("is_trial_period").default(false).notNull(),
	cancelStatus: varchar("cancel_status", { length: 255 }),
	platform: varchar({ length: 255 }).default('WEB').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.paymentPlanId],
			foreignColumns: [paymentPlansInApi.id],
			name: "payment_history_payment_plan_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
	unique("payment_history_purchase_token_unique").on(table.purchaseToken),
	unique("payment_history_order_id_unique").on(table.orderId),
	check("payment_history_cancel_status_check", sql`(cancel_status)::text = ANY (ARRAY[('0'::character varying)::text, ('1'::character varying)::text, ('2'::character varying)::text])`),
	check("payment_history_platform_check", sql`(platform)::text = ANY (ARRAY[('ANDROID'::character varying)::text, ('IOS'::character varying)::text, ('WEB'::character varying)::text])`),
]);

export const paymentOnboardsInApi = api.table("payment_onboards", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	image: varchar({ length: 255 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: varchar({ length: 255 }).notNull(),
	order: varchar({ length: 255 }).default('1').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const profileDownloadLogsInApi = api.table("profile_download_logs", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	profileId: bigint("profile_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	materialId: bigint("material_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	lessonId: bigint("lesson_id", { mode: "number" }),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	platformId: bigint("platform_id", { mode: "number" }),
}, (table) => [
	foreignKey({
			columns: [table.platformId],
			foreignColumns: [platformsInApi.id],
			name: "profile_download_logs_platform_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.materialId],
			foreignColumns: [materialsInApi.id],
			name: "profile_download_logs_material_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const profileQuizLogsInApi = api.table("profile_quiz_logs", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	profileId: bigint("profile_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	testId: bigint("test_id", { mode: "number" }),
	status: boolean(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	platformId: bigint("platform_id", { mode: "number" }),
}, (table) => [
	foreignKey({
			columns: [table.platformId],
			foreignColumns: [platformsInApi.id],
			name: "profile_quiz_logs_platform_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const ratingsInApi = api.table("ratings", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	profileId: bigint("profile_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	courseId: bigint("course_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	ratingId: bigint("rating_id", { mode: "number" }),
	comment: text(),
	rating: integer().default(0),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	parentId: integer("parent_id"),
}, (table) => [
	foreignKey({
			columns: [table.parentId],
			foreignColumns: [table.id],
			name: "ratings_parent_id_foreign"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.ratingId],
			foreignColumns: [table.id],
			name: "ratings_rating_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const ratingLikesInApi = api.table("rating_likes", {
	id: serial().primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	ratingId: bigint("rating_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	profileId: bigint("profile_id", { mode: "number" }),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.ratingId],
			foreignColumns: [ratingsInApi.id],
			name: "rating_likes_rating_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
	unique("rating_likes_rating_id_profile_id_unique").on(table.ratingId, table.profileId),
]);

export const reportTypesInApi = api.table("report_types", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	type: varchar({ length: 255 }).notNull(),
});

export const reportRatingsInApi = api.table("report_ratings", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	profileId: bigint("profile_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	ratingId: bigint("rating_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	reportTypeId: bigint("report_type_id", { mode: "number" }),
	customMessage: text("custom_message"),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.ratingId],
			foreignColumns: [ratingsInApi.id],
			name: "report_ratings_rating_id_foreign"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.reportTypeId],
			foreignColumns: [reportTypesInApi.id],
			name: "report_ratings_report_type_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
	unique("report_ratings_profile_id_rating_id_unique").on(table.profileId, table.ratingId),
]);

export const requestLogsInApi = api.table("request_logs", {
	id: uuid().notNull(),
	token: varchar({ length: 255 }).notNull(),
	ip: inet().notNull(),
	method: varchar({ length: 255 }).notNull(),
	agent: varchar({ length: 255 }).notNull(),
	headers: text().notNull(),
	requestBody: json("request_body").notNull(),
	responseBody: json("response_body").notNull(),
	actionAt: timestamp("action_at", { mode: 'string' }).notNull(),
}, (table) => [
	unique("request_logs_id_unique").on(table.id),
]);

export const searchLogsInApi = api.table("search_logs", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	profileId: bigint("profile_id", { mode: "number" }).notNull(),
	keyword: varchar({ length: 255 }).notNull(),
	resultCount: integer("result_count").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const stripePricesInApi = api.table("stripe_prices", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	currency: varchar({ length: 255 }).notNull(),
	country: varchar({ length: 255 }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	paymentPlanId: bigint("payment_plan_id", { mode: "number" }).notNull(),
	priceId: varchar("price_id", { length: 255 }).notNull(),
	price: numeric({ precision: 8, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.paymentPlanId],
			foreignColumns: [paymentPlansInApi.id],
			name: "stripe_prices_payment_plan_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
	unique("stripe_prices_price_id_currency_unique").on(table.currency, table.priceId),
]);

export const templatesInApi = api.table("templates", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	mailTypeId: bigint("mail_type_id", { mode: "number" }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	subject: varchar({ length: 255 }).notNull(),
	body: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.mailTypeId],
			foreignColumns: [mailTypesInApi.id],
			name: "templates_mail_type_id_foreign"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const companyTemplatesInApi = api.table("company_templates", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	companyId: bigint("company_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	templateId: bigint("template_id", { mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [companiesInApi.id],
			name: "company_templates_company_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [templatesInApi.id],
			name: "company_templates_template_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
	unique("company_templates_company_id_template_id_unique").on(table.companyId, table.templateId),
]);

export const testsInApi = api.table("tests", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	lessonId: bigint("lesson_id", { mode: "number" }),
	title: text().notNull(),
	description: text(),
	answers: json().notNull(),
	explanation: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	audio: varchar({ length: 255 }),
	type: varchar({ length: 255 }),
}, (table) => [
	check("tests_type_check", sql`(type)::text = ANY (ARRAY[('csv'::character varying)::text, ('latex'::character varying)::text])`),
]);

export const userActivitiesInApi = api.table("user_activities", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userLogId: bigint("user_log_id", { mode: "number" }).notNull(),
	type: varchar({ length: 50 }).notNull(),
	description: text(),
	activityTime: timestamp("activity_time", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const userDeleteInApi = api.table("user_delete", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	isDeleted: boolean("is_deleted").default(false).notNull(),
	userType: varchar("user_type", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	unique("user_delete_user_id_unique").on(table.userId),
	check("user_delete_user_type_check", sql`(user_type)::text = ANY (ARRAY[('0'::character varying)::text, ('1'::character varying)::text])`),
]);

export const userLogsInApi = api.table("user_logs", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	profileId: bigint("profile_id", { mode: "number" }).notNull(),
	logDate: date("log_date").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	unique("user_logs_user_id_profile_id_log_date_unique").on(table.userId, table.profileId, table.logDate),
]);
