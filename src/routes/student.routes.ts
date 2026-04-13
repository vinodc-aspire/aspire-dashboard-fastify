import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import * as studentController from '../controllers/student.controller'

export const studentRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get('/report/student', {
    schema: {
      querystring: Type.Object({ startDate: Type.String(), endDate: Type.String() }),
      response: { 200: Type.Any(), 400: Type.Object({ error: Type.String() }), 500: Type.Object({ error: Type.String() }) },
    },
  }, studentController.getStudentReport)
}
