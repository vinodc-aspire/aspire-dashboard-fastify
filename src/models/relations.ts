import { relations } from "drizzle-orm/relations";
import { classroomsInNodeapi, classroomDimTestInNodeapi, dimTestsInNodeapi, homeworksInNodeapi, homeworkPushReportsInNodeapi, usersInNodeapi, userPushTokensInNodeapi, lessonsInNodeapi, lessonWatchSessionsInNodeapi, platformsInNodeapi, profilesInNodeapi } from "./schema";

export const classroomDimTestInNodeapiRelations = relations(classroomDimTestInNodeapi, ({one}) => ({
	classroomsInNodeapi: one(classroomsInNodeapi, {
		fields: [classroomDimTestInNodeapi.classroomId],
		references: [classroomsInNodeapi.id]
	}),
	dimTestsInNodeapi: one(dimTestsInNodeapi, {
		fields: [classroomDimTestInNodeapi.dimTestId],
		references: [dimTestsInNodeapi.id]
	}),
}));

export const classroomsInNodeapiRelations = relations(classroomsInNodeapi, ({many}) => ({
	classroomDimTestInNodeapis: many(classroomDimTestInNodeapi),
}));

export const dimTestsInNodeapiRelations = relations(dimTestsInNodeapi, ({many}) => ({
	classroomDimTestInNodeapis: many(classroomDimTestInNodeapi),
}));

export const homeworkPushReportsInNodeapiRelations = relations(homeworkPushReportsInNodeapi, ({one}) => ({
	homeworksInNodeapi: one(homeworksInNodeapi, {
		fields: [homeworkPushReportsInNodeapi.homeworkId],
		references: [homeworksInNodeapi.id]
	}),
}));

export const homeworksInNodeapiRelations = relations(homeworksInNodeapi, ({many}) => ({
	homeworkPushReportsInNodeapis: many(homeworkPushReportsInNodeapi),
	lessonWatchSessionsInNodeapis: many(lessonWatchSessionsInNodeapi),
}));

export const userPushTokensInNodeapiRelations = relations(userPushTokensInNodeapi, ({one}) => ({
	usersInNodeapi: one(usersInNodeapi, {
		fields: [userPushTokensInNodeapi.userId],
		references: [usersInNodeapi.id]
	}),
}));

export const usersInNodeapiRelations = relations(usersInNodeapi, ({many}) => ({
	userPushTokensInNodeapis: many(userPushTokensInNodeapi),
}));

export const lessonWatchSessionsInNodeapiRelations = relations(lessonWatchSessionsInNodeapi, ({one}) => ({
	lessonsInNodeapi: one(lessonsInNodeapi, {
		fields: [lessonWatchSessionsInNodeapi.lessonId],
		references: [lessonsInNodeapi.id]
	}),
	platformsInNodeapi: one(platformsInNodeapi, {
		fields: [lessonWatchSessionsInNodeapi.platformId],
		references: [platformsInNodeapi.id]
	}),
	profilesInNodeapi: one(profilesInNodeapi, {
		fields: [lessonWatchSessionsInNodeapi.profileId],
		references: [profilesInNodeapi.id]
	}),
	homeworksInNodeapi: one(homeworksInNodeapi, {
		fields: [lessonWatchSessionsInNodeapi.homeworkId],
		references: [homeworksInNodeapi.id]
	}),
}));

export const lessonsInNodeapiRelations = relations(lessonsInNodeapi, ({many}) => ({
	lessonWatchSessionsInNodeapis: many(lessonWatchSessionsInNodeapi),
}));

export const platformsInNodeapiRelations = relations(platformsInNodeapi, ({many}) => ({
	lessonWatchSessionsInNodeapis: many(lessonWatchSessionsInNodeapi),
}));

export const profilesInNodeapiRelations = relations(profilesInNodeapi, ({many}) => ({
	lessonWatchSessionsInNodeapis: many(lessonWatchSessionsInNodeapi),
}));