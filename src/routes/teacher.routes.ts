import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import * as teacherController from '../controllers/teacher.controller'

export const teacherRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get('/report/teacher', {
    schema: {
      querystring: Type.Object({ startDate: Type.String(), endDate: Type.String() }),
      response: { 200: Type.Any(), 400: Type.Object({ error: Type.String() }), 500: Type.Object({ error: Type.String() }) },
    },
  }, teacherController.getTeacherReport)
}
