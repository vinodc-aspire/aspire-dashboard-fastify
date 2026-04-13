import { pgSchema, foreignKey, bigserial, bigint, varchar, json, integer, timestamp, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const api = pgSchema("api");

export const usersInApi = api.table("users", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
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
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	paymentPlanId: bigint("payment_plan_id", { mode: "number" }),
	lastPayDate: timestamp("last_pay_date", { mode: 'string' }),
	shouldDelete: boolean("should_delete").default(false).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	paymentHistoryId: bigint("payment_history_id", { mode: "number" }),
	stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
	role: varchar({ length: 255 }),
	phoneCountryCode: varchar("phone_country_code", { length: 5 }),
	phoneNumber: varchar("phone_number", { length: 20 }),
	otp: varchar({ length: 10 }),
	externalIdentityId: varchar("external_identity_id", { length: 255 }),
	externalIdentityType: varchar("external_identity_type", { length: 255 }),
	externalUserType: varchar("external_user_type", { length: 255 }),
	isTestAccount: boolean("is_test_account").default(false).notNull(),
});

export const additionalSignupDataInApi = api.table("additional_signup_data", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
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
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInApi.id],
			name: "additional_signup_data_user_id_foreign"
		}).onDelete("cascade"),
]);

export const profilesInApi = api.table("profiles", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }),
	name: varchar({ length: 255 }).notNull(),
	picture: varchar({ length: 255 }),
	gender: boolean().notNull(),
	bornAt: timestamp("born_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	class: integer(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInApi.id],
			name: "profiles_user_id_foreign"
		}).onUpdate("cascade").onDelete("set null"),
]);
