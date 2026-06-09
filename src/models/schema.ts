import { pgTable, pgSchema, index, uniqueIndex, check, bigint, varchar, smallint, timestamp, boolean, unique, text, jsonb, uuid, json, integer, date, serial, inet, doublePrecision, foreignKey, bigserial, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const nodeapi = pgSchema("nodeapi");


export const userOtpsInNodeapi = nodeapi.table("user_otps", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.user_otps_id_seq'::regclass)`).primaryKey().notNull(),
	contact: varchar({ length: 255 }).notNull(),
	contactType: varchar("contact_type", { length: 255 }).notNull(),
	otp: varchar({ length: 4 }).notNull(),
	attemptsUsed: smallint("attempts_used").default(sql`'0'`).notNull(),
	blockedUntil: timestamp("blocked_until", { mode: 'string' }),
	isUsed: boolean("is_used").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	resendCount: smallint("resend_count").default(sql`'0'`).notNull(),
}, (table) => [
	index("user_otps_contact_idx").using("btree", table.contact.asc().nullsLast().op("text_ops")),
	uniqueIndex("user_otps_contact_idx1").using("btree", table.contact.asc().nullsLast().op("text_ops")),
	check("user_otps_contact_type_check", sql`(contact_type)::text = ANY ((ARRAY['phone'::character varying, 'email'::character varying])::text[])`),
]);

export const curriculumsInNodeapi = nodeapi.table("curriculums", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.curriculums_id_seq'::regclass)`).primaryKey().notNull(),
	shortName: varchar("short_name", { length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	title: varchar({ length: 255 }),
	background: varchar({ length: 255 }),
	enabled: boolean().default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	unique("curriculums_slug_key").on(table.slug),
]);

export const appLogsInNodeapi = nodeapi.table("app_logs", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.app_logs_id_seq'::regclass)`).primaryKey().notNull(),
	type: varchar({ length: 50 }).notNull(),
	level: varchar({ length: 20 }).notNull(),
	message: text().notNull(),
	context: jsonb(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }),
	ip: varchar({ length: 45 }),
	ref: uuid(),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("app_logs_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("app_logs_level_idx").using("btree", table.level.asc().nullsLast().op("text_ops")),
	index("app_logs_ref_idx").using("btree", table.ref.asc().nullsLast().op("uuid_ops")),
	index("app_logs_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
	index("app_logs_user_id_idx").using("btree", table.userId.asc().nullsLast().op("int8_ops")),
]);

export const additionalSignupDataInNodeapi = nodeapi.table("additional_signup_data", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.additional_signup_data_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
	userType: varchar("user_type", { length: 255 }).notNull(),
	subjects: json().notNull(),
	schoolYear: integer("school_year").notNull(),
	age: integer().notNull(),
	studentName: varchar("student_name", { length: 255 }).notNull(),
	purpose: json().notNull(),
	interestingActivities: json("interesting_activities").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	curriculumId: bigint("curriculum_id", { mode: "number" }).default(sql`'1'`).notNull(),
	schoolCode: varchar("school_code", { length: 25 }),
	region: varchar({ length: 255 }),
});

export const categoriesInNodeapi = nodeapi.table("categories", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.categories_id_seq'::regclass)`).primaryKey().notNull(),
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
	index("categories_order_idx").using("btree", table.order.asc().nullsLast().op("int4_ops")),
	unique("categories_slug_key").on(table.slug),
]);

export const chaptersInNodeapi = nodeapi.table("chapters", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.chapters_id_seq'::regclass)`).primaryKey().notNull(),
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
	index("chapters_order_idx").using("btree", table.order.desc().nullsFirst().op("int4_ops")),
	index("chapters_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	unique("chapters_course_id_unit_id_slug_key").on(table.courseId, table.unitId, table.slug),
]);

export const classroomCourseInNodeapi = nodeapi.table("classroom_course", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.classroom_course_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	classroomId: bigint("classroom_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	courseId: bigint("course_id", { mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const classroomStudentInNodeapi = nodeapi.table("classroom_student", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.classroom_student_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	classroomId: bigint("classroom_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	studentId: bigint("student_id", { mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	profileId: bigint("profile_id", { mode: "number" }),
});

export const companiesInNodeapi = nodeapi.table("companies", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.companies_id_seq'::regclass)`).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	maxRegistrations: integer("max_registrations").default(20).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	countryId: bigint("country_id", { mode: "number" }),
});

export const companyTemplatesInNodeapi = nodeapi.table("company_templates", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.company_templates_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	companyId: bigint("company_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	templateId: bigint("template_id", { mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	unique("company_templates_company_id_template_id_key").on(table.companyId, table.templateId),
]);

export const competitionRegistrationsInNodeapi = nodeapi.table("competition_registrations", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.competition_registrations_id_seq'::regclass)`).primaryKey().notNull(),
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
	unique("competition_registrations_email_key").on(table.email),
]);

export const classroomsInNodeapi = nodeapi.table("classrooms", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.classrooms_id_seq'::regclass)`).primaryKey().notNull(),
	teacherId: integer("teacher_id").notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	status: smallint().default(sql`'1'`).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	enrollmentCode: varchar("enrollment_code", { length: 6 }),
	externalClassId: varchar("external_class_id", { length: 255 }),
}, (table) => [
	unique("classrooms_slug_key").on(table.slug),
	unique("classrooms_enrollment_code_key").on(table.enrollmentCode),
]);

export const competitionsInNodeapi = nodeapi.table("competitions", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.competitions_id_seq'::regclass)`).primaryKey().notNull(),
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
	unique("competitions_slug_key").on(table.slug),
]);

export const contributorCourseInNodeapi = nodeapi.table("contributor_course", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.contributor_course_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	courseId: bigint("course_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	contributorId: bigint("contributor_id", { mode: "number" }).notNull(),
}, (table) => [
	unique("contributor_course_course_id_contributor_id_key").on(table.courseId, table.contributorId),
]);

export const contributorsInNodeapi = nodeapi.table("contributors", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.contributors_id_seq'::regclass)`).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	image: varchar({ length: 255 }),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const countriesInNodeapi = nodeapi.table("countries", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.countries_id_seq'::regclass)`).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	code: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const courseProfileInNodeapi = nodeapi.table("course_profile", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.course_profile_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	courseId: bigint("course_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	profileId: bigint("profile_id", { mode: "number" }),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	unique("course_profile_course_id_profile_id_key").on(table.courseId, table.profileId),
]);

export const drizzleMigrationsInNodeapi = nodeapi.table("__drizzle_migrations", {
	id: serial().primaryKey().notNull(),
	hash: text().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	createdAt: bigint("created_at", { mode: "number" }),
});

export const coursesInNodeapi = nodeapi.table("courses", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.courses_id_seq'::regclass)`).primaryKey().notNull(),
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
	index("courses_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	unique("courses_category_id_slug_key").on(table.categoryId, table.slug),
]);

export const curatorLogsInNodeapi = nodeapi.table("curator_logs", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.curator_logs_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	curatorId: bigint("curator_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	logTypeId: bigint("log_type_id", { mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const curatorsInNodeapi = nodeapi.table("curators", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.curators_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	companyId: bigint("company_id", { mode: "number" }),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	unique("curators_email_key").on(table.email),
]);

export const dimOptionsInNodeapi = nodeapi.table("dim_options", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.dim_options_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	questionId: bigint("question_id", { mode: "number" }).notNull(),
	text: text().notNull(),
	order: integer().default(1).notNull(),
	isCorrect: boolean("is_correct").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const dimQuestionsInNodeapi = nodeapi.table("dim_questions", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.dim_questions_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	dimTestId: bigint("dim_test_id", { mode: "number" }).notNull(),
	text: text().notNull(),
	points: integer().default(1).notNull(),
	order: integer().default(1).notNull(),
	difficulty: integer().default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	explanation: text(),
});

export const dimTestCoursesInNodeapi = nodeapi.table("dim_test_courses", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.dim_test_courses_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	dimTestId: bigint("dim_test_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	courseId: bigint("course_id", { mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
}, (table) => [
	unique("dim_test_courses_dim_test_id_course_id_key").on(table.dimTestId, table.courseId),
]);

export const dimTestResultsInNodeapi = nodeapi.table("dim_test_results", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.dim_test_results_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	dimTestId: bigint("dim_test_id", { mode: "number" }).notNull(),
	studentId: integer("student_id").notNull(),
	profileId: integer("profile_id").notNull(),
	score: integer().notNull(),
	total: integer().notNull(),
	result: json().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const emailNotificationsInNodeapi = nodeapi.table("email_notifications", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.email_notifications_id_seq'::regclass)`).primaryKey().notNull(),
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

export const dimTestsInNodeapi = nodeapi.table("dim_tests", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.dim_tests_id_seq'::regclass)`).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	enabled: boolean().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	slug: varchar({ length: 255 }).notNull(),
	type: varchar({ length: 255 }),
}, (table) => [
	unique("dim_tests_slug_key").on(table.slug),
	check("dim_tests_type_check", sql`(type)::text = ANY (ARRAY[('csv'::character varying)::text, ('latex'::character varying)::text])`),
]);

export const examInNodeapi = nodeapi.table("exam", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.exam_id_seq'::regclass)`).primaryKey().notNull(),
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

export const examQuestionsInNodeapi = nodeapi.table("exam_questions", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.exam_questions_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	examId: bigint("exam_id", { mode: "number" }).notNull(),
	question: text().notNull(),
	answers: json().notNull(),
	explanation: text(),
	status: smallint().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const examResultsInNodeapi = nodeapi.table("exam_results", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.exam_results_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	examId: bigint("exam_id", { mode: "number" }).notNull(),
	studentId: integer("student_id").notNull(),
	profileId: integer("profile_id").notNull(),
	score: integer().notNull(),
	total: integer().notNull(),
	result: json().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const failedJobsInNodeapi = nodeapi.table("failed_jobs", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.failed_jobs_id_seq'::regclass)`).primaryKey().notNull(),
	connection: text().notNull(),
	queue: text().notNull(),
	payload: text().notNull(),
	exception: text().notNull(),
	failedAt: timestamp("failed_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	uuid: text(),
});

export const feedbacksInNodeapi = nodeapi.table("feedbacks", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.feedbacks_id_seq'::regclass)`).primaryKey().notNull(),
	topic: varchar({ length: 255 }).notNull(),
	message: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const gameCurrentLevelsInNodeapi = nodeapi.table("game_current_levels", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.game_current_levels_id_seq'::regclass)`).primaryKey().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	gameId: bigint("game_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	profileId: bigint("profile_id", { mode: "number" }).notNull(),
	level: smallint().default(sql`'1'`).notNull(),
}, (table) => [
	unique("game_current_levels_game_id_profile_id_key").on(table.gameId, table.profileId),
]);

export const gamesInNodeapi = nodeapi.table("games", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.games_id_seq'::regclass)`).primaryKey().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	slug: varchar({ length: 255 }).notNull(),
	type: smallint().default(sql`'1'`).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	lessonId: bigint("lesson_id", { mode: "number" }).notNull(),
	content: json().notNull(),
	description: varchar({ length: 255 }),
}, (table) => [
	index("games_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
]);

export const homeworkLessonInNodeapi = nodeapi.table("homework_lesson", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.homework_lesson_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	homeworkId: bigint("homework_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	lessonId: bigint("lesson_id", { mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const lessonCaptionsInNodeapi = nodeapi.table("lesson_captions", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.lesson_captions_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	lessonId: bigint("lesson_id", { mode: "number" }),
	captionUrl: varchar("caption_url", { length: 255 }).notNull(),
	kind: varchar({ length: 255 }).notNull(),
	label: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const logTypesInNodeapi = nodeapi.table("log_types", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.log_types_id_seq'::regclass)`).primaryKey().notNull(),
	shortname: varchar({ length: 255 }).notNull(),
	description: varchar({ length: 255 }),
});

export const logsInNodeapi = nodeapi.table("logs", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.logs_id_seq'::regclass)`).primaryKey().notNull(),
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

export const mailTypeRulesInNodeapi = nodeapi.table("mail_type_rules", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.mail_type_rules_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	mailTypeId: bigint("mail_type_id", { mode: "number" }).notNull(),
	rule: varchar({ length: 255 }).notNull(),
	description: varchar({ length: 255 }),
	value: varchar({ length: 255 }),
});

export const homeworksInNodeapi = nodeapi.table("homeworks", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.homeworks_id_seq'::regclass)`).primaryKey().notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text().notNull(),
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

export const outsourcingLogsInNodeapi = nodeapi.table("outsourcing_logs", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.outsourcing_logs_id_seq'::regclass)`).primaryKey().notNull(),
	category: varchar({ length: 255 }),
	title: varchar({ length: 255 }),
	message: varchar({ length: 255 }),
	agent: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const migrationsInNodeapi = nodeapi.table("migrations", {
	id: integer().default(sql`nextval('api.migrations_id_seq'::regclass)`).primaryKey().notNull(),
	migration: varchar({ length: 255 }).notNull(),
	batch: integer().notNull(),
});

export const leaderboardInNodeapi = nodeapi.table("leaderboard", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.leaderboard_id_seq'::regclass)`).primaryKey().notNull(),
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

export const partnersInNodeapi = nodeapi.table("partners", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.partners_id_seq'::regclass)`).primaryKey().notNull(),
	domain: varchar({ length: 255 }).notNull(),
	partnerName: varchar("partner_name", { length: 255 }).notNull(),
	defaultLanguage: varchar("default_language", { length: 255 }).default('en').notNull(),
	logo: varchar({ length: 255 }).notNull(),
	logoSize: varchar("logo_size", { length: 255 }).notNull(),
	sideLogo: varchar("side_logo", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const passwordResetsInNodeapi = nodeapi.table("password_resets", {
	email: varchar({ length: 255 }).notNull(),
	token: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
}, (table) => [
	index("password_resets_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
]);

export const classroomDimTestInNodeapi = nodeapi.table("classroom_dim_test", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	classroomId: bigint("classroom_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	dimTestId: bigint("dim_test_id", { mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.classroomId],
			foreignColumns: [classroomsInNodeapi.id],
			name: "classroom_dim_test_classroom_id_foreign"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.dimTestId],
			foreignColumns: [dimTestsInNodeapi.id],
			name: "classroom_dim_test_dim_test_id_foreign"
		}).onDelete("cascade"),
	unique("classroom_dim_test_classroom_id_dim_test_id_unique").on(table.classroomId, table.dimTestId),
]);

export const paymentHistoryInNodeapi = nodeapi.table("payment_history", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.payment_history_id_seq'::regclass)`).primaryKey().notNull(),
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
	unique("payment_history_purchase_token_key").on(table.purchaseToken),
	unique("payment_history_order_id_key").on(table.orderId),
	check("payment_history_cancel_status_check", sql`(cancel_status)::text = ANY (ARRAY[('0'::character varying)::text, ('1'::character varying)::text, ('2'::character varying)::text])`),
	check("payment_history_platform_check", sql`(platform)::text = ANY (ARRAY[('ANDROID'::character varying)::text, ('IOS'::character varying)::text, ('WEB'::character varying)::text])`),
]);

export const paymentOnboardsInNodeapi = nodeapi.table("payment_onboards", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.payment_onboards_id_seq'::regclass)`).primaryKey().notNull(),
	image: varchar({ length: 255 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: varchar({ length: 255 }).notNull(),
	order: varchar({ length: 255 }).default('1').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const profileDownloadLogsInNodeapi = nodeapi.table("profile_download_logs", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.profile_download_logs_id_seq'::regclass)`).primaryKey().notNull(),
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
});

export const ratingLikesInNodeapi = nodeapi.table("rating_likes", {
	id: integer().default(sql`nextval('api.rating_likes_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	ratingId: bigint("rating_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	profileId: bigint("profile_id", { mode: "number" }),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
}, (table) => [
	unique("rating_likes_rating_id_profile_id_key").on(table.ratingId, table.profileId),
]);

export const reportRatingsInNodeapi = nodeapi.table("report_ratings", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.report_ratings_id_seq'::regclass)`).primaryKey().notNull(),
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
	unique("report_ratings_profile_id_rating_id_key").on(table.profileId, table.ratingId),
]);

export const homeworkPushReportsInNodeapi = nodeapi.table("homework_push_reports", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	homeworkId: bigint("homework_id", { mode: "number" }).notNull(),
	sentAt: timestamp("sent_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.homeworkId],
			foreignColumns: [homeworksInNodeapi.id],
			name: "homework_push_reports_homework_id_foreign"
		}).onUpdate("cascade").onDelete("cascade"),
	unique("homework_push_reports_homework_id_unique").on(table.homeworkId),
]);

export const userPushTokensInNodeapi = nodeapi.table("user_push_tokens", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
	fcmToken: varchar("fcm_token", { length: 512 }),
	pushNotificationsEnabled: boolean("push_notifications_enabled").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInNodeapi.id],
			name: "user_push_tokens_user_id_foreign"
		}).onUpdate("cascade").onDelete("cascade"),
	unique("user_push_tokens_user_id_unique").on(table.userId),
]);

export const profilesInNodeapi = nodeapi.table("profiles", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.profiles_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }),
	name: varchar({ length: 255 }).notNull(),
	picture: varchar({ length: 255 }),
	gender: boolean().notNull(),
	bornAt: date("born_at"),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	class: integer(),
});

export const ratingsInNodeapi = nodeapi.table("ratings", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.ratings_id_seq'::regclass)`).primaryKey().notNull(),
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
});

export const reportTypesInNodeapi = nodeapi.table("report_types", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.report_types_id_seq'::regclass)`).primaryKey().notNull(),
	type: varchar({ length: 255 }).notNull(),
});

export const stripePricesInNodeapi = nodeapi.table("stripe_prices", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.stripe_prices_id_seq'::regclass)`).primaryKey().notNull(),
	currency: varchar({ length: 255 }).notNull(),
	country: varchar({ length: 255 }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	paymentPlanId: bigint("payment_plan_id", { mode: "number" }).notNull(),
	priceId: varchar("price_id", { length: 255 }).notNull(),
	price: numeric({ precision: 8, scale:  2 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	unique("stripe_prices_price_id_currency_key").on(table.currency, table.priceId),
]);

export const requestLogsInNodeapi = nodeapi.table("request_logs", {
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
	unique("request_logs_id_key").on(table.id),
]);

export const searchLogsInNodeapi = nodeapi.table("search_logs", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.search_logs_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	profileId: bigint("profile_id", { mode: "number" }).notNull(),
	keyword: varchar({ length: 255 }).notNull(),
	resultCount: integer("result_count").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const platformsInNodeapi = nodeapi.table("platforms", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.platforms_id_seq'::regclass)`).primaryKey().notNull(),
	platform: varchar({ length: 255 }).notNull(),
	description: varchar({ length: 255 }),
});

export const studentQuizProgressInNodeapi = nodeapi.table("student_quiz_progress", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.student_quiz_progress_id_seq'::regclass)`).primaryKey().notNull(),
	result: jsonb().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	studentProgressId: bigint("student_progress_id", { mode: "number" }).notNull(),
});

export const schoolsInNodeapi = nodeapi.table("schools", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.schools_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	countryId: bigint("country_id", { mode: "number" }),
	name: varchar({ length: 255 }).notNull(),
	address: varchar({ length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const unitsInNodeapi = nodeapi.table("units", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.units_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	courseId: bigint("course_id", { mode: "number" }),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	order: integer(),
}, (table) => [
	index("units_order_idx").using("btree", table.order.desc().nullsFirst().op("int4_ops")),
	index("units_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	unique("units_course_id_slug_key").on(table.courseId, table.slug),
]);

export const userActivitiesInNodeapi = nodeapi.table("user_activities", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.user_activities_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userLogId: bigint("user_log_id", { mode: "number" }).notNull(),
	type: varchar({ length: 50 }).notNull(),
	description: text(),
	activityTime: timestamp("activity_time", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	index("user_activities_user_log_id_activity_time_idx").using("btree", table.userLogId.asc().nullsLast().op("int8_ops"), table.activityTime.asc().nullsLast().op("int8_ops")),
]);

export const userDeleteInNodeapi = nodeapi.table("user_delete", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.user_delete_id_seq'::regclass)`).primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	isDeleted: boolean("is_deleted").default(false).notNull(),
	userType: varchar("user_type", { length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	unique("user_delete_user_id_key").on(table.userId),
	check("user_delete_user_type_check", sql`(user_type)::text = ANY (ARRAY[('0'::character varying)::text, ('1'::character varying)::text])`),
]);

export const userLogsInNodeapi = nodeapi.table("user_logs", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.user_logs_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	profileId: bigint("profile_id", { mode: "number" }).notNull(),
	logDate: date("log_date").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
}, (table) => [
	unique("user_logs_user_id_profile_id_log_date_key").on(table.userId, table.profileId, table.logDate),
]);

export const mailTypesInNodeapi = nodeapi.table("mail_types", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.mail_types_id_seq'::regclass)`).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
});

export const materialsInNodeapi = nodeapi.table("materials", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.materials_id_seq'::regclass)`).primaryKey().notNull(),
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

export const lessonProfileInNodeapi = nodeapi.table("lesson_profile", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.lesson_profile_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	lessonId: bigint("lesson_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	profileId: bigint("profile_id", { mode: "number" }),
	watched: varchar({ length: 255 }).default('0').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	platformId: bigint("platform_id", { mode: "number" }),
	watchSeconds: integer("watch_seconds").default(0).notNull(),
	watchCount: integer("watch_count").default(0).notNull(),
}, (table) => [
	unique("lesson_profile_lesson_id_profile_id_key").on(table.lessonId, table.profileId),
]);

export const lessonsInNodeapi = nodeapi.table("lessons", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.lessons_id_seq'::regclass)`).primaryKey().notNull(),
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
	index("lessons_order_idx").using("btree", table.order.desc().nullsFirst().op("int4_ops")),
	index("lessons_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	unique("lessons_course_id_unit_id_chapter_id_slug_key").on(table.courseId, table.unitId, table.chapterId, table.slug),
]);

export const notesInNodeapi = nodeapi.table("notes", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.notes_id_seq'::regclass)`).primaryKey().notNull(),
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

export const paymentPlansInNodeapi = nodeapi.table("payment_plans", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.payment_plans_id_seq'::regclass)`).primaryKey().notNull(),
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

export const profileQuizLogsInNodeapi = nodeapi.table("profile_quiz_logs", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.profile_quiz_logs_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	profileId: bigint("profile_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	testId: bigint("test_id", { mode: "number" }),
	status: boolean(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	platformId: bigint("platform_id", { mode: "number" }),
});

export const templatesInNodeapi = nodeapi.table("templates", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.templates_id_seq'::regclass)`).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	mailTypeId: bigint("mail_type_id", { mode: "number" }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	subject: varchar({ length: 255 }).notNull(),
	body: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
});

export const testsInNodeapi = nodeapi.table("tests", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.tests_id_seq'::regclass)`).primaryKey().notNull(),
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

export const studentProgressInNodeapi = nodeapi.table("student_progress", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.student_progress_id_seq'::regclass)`).primaryKey().notNull(),
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
	homeworkWatchSeconds: integer("homework_watch_seconds").default(0).notNull(),
}, (table) => [
	unique("student_progress_user_id_homework_id_lesson_id_key").on(table.userId, table.homeworkId, table.lessonId),
]);

export const usersInNodeapi = nodeapi.table("users", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).default(sql`nextval('api.users_id_seq'::regclass)`).primaryKey().notNull(),
	email: varchar({ length: 255 }),
	password: varchar({ length: 255 }).notNull(),
	refreshTokens: json("refresh_tokens"),
	verifyToken: varchar("verify_token", { length: 255 }),
	verifiedAt: timestamp("verified_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	companyId: integer("company_id"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	countryId: bigint("country_id", { mode: "number" }),
	lastSeen: timestamp("last_seen", { mode: 'string' }),
	shouldPay: boolean("should_pay").default(true).notNull(),
	shouldDelete: boolean("should_delete").default(false).notNull(),
	role: varchar({ length: 255 }),
	phoneCountryCode: varchar("phone_country_code", { length: 5 }),
	phoneNumber: varchar("phone_number", { length: 20 }),
	externalIdentityId: varchar("external_identity_id", { length: 255 }),
	externalIdentityType: varchar("external_identity_type", { length: 255 }),
	externalUserType: varchar("external_user_type", { length: 255 }),
	isTestAccount: boolean("is_test_account").default(false).notNull(),
	phone: varchar({ length: 255 }),
	verifyPhone: boolean("verify_phone").default(false).notNull(),
	verifyEmail: boolean("verify_email").default(false).notNull(),
	accountComplete: boolean("account_complete").default(false).notNull(),
	userType: varchar("user_type", { length: 255 }),
	curriculum: integer(),
	country: integer(),
	schoolCode: varchar("school_code", { length: 255 }),
	region: varchar({ length: 255 }),
}, (table) => [
	uniqueIndex("users_phone_idx").using("btree", table.phone.asc().nullsLast().op("text_ops")).where(sql`(phone IS NOT NULL)`),
	unique("users_email_key").on(table.email),
]);

export const lessonWatchSessionsInNodeapi = nodeapi.table("lesson_watch_sessions", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	profileId: bigint("profile_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	lessonId: bigint("lesson_id", { mode: "number" }).notNull(),
	sessionSeconds: integer("session_seconds").default(0).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	platformId: bigint("platform_id", { mode: "number" }),
	watchedAt: timestamp("watched_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	type: varchar({ length: 20 }).default('course').notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	homeworkId: bigint("homework_id", { mode: "number" }),
}, (table) => [
	foreignKey({
			columns: [table.lessonId],
			foreignColumns: [lessonsInNodeapi.id],
			name: "lesson_watch_sessions_lesson_id_foreign"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.platformId],
			foreignColumns: [platformsInNodeapi.id],
			name: "lesson_watch_sessions_platform_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.profileId],
			foreignColumns: [profilesInNodeapi.id],
			name: "lesson_watch_sessions_profile_id_foreign"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.homeworkId],
			foreignColumns: [homeworksInNodeapi.id],
			name: "lesson_watch_sessions_homework_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
]);
