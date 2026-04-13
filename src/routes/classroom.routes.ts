import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import * as classroomController from '../controllers/classroom.controller'

export const classroomRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get('/report/classroom', {
    schema: {
      querystring: Type.Object({ startDate: Type.String(), endDate: Type.String() }),
      response: { 200: Type.Any(), 400: Type.Object({ error: Type.String() }), 500: Type.Object({ error: Type.String() }) },
    },
  }, classroomController.getClassroomReport)
}
