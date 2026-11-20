import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import * as curriculumsController from '../controllers/curriculums.controller'

const Curriculum = Type.Object({
  id: Type.Number(),
  short_name: Type.String(),
  name: Type.String(),
})

export const curriculumsRoutes: FastifyPluginAsyncTypebox = async (app) => {
  // GET /api/curriculums — enabled curriculums from the curriculums table
  app.get('/curriculums', {
    schema: {
      response: {
        200: Type.Array(Curriculum),
        500: Type.Object({ error: Type.String() }),
      },
    },
  }, curriculumsController.getCurriculums)
}
