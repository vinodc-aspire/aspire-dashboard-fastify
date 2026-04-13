import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import * as dataPointController from '../controllers/dataPoint.controller'

export const dataPointRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get('/data-point', {
    schema: {
      querystring: Type.Object({ startDate: Type.String(), endDate: Type.String() }),
      response: { 200: Type.Any(), 400: Type.Object({ error: Type.String() }), 500: Type.Object({ error: Type.String() }) },
    },
  }, dataPointController.getDataPointReport)

  app.get('/test', {
    schema: { response: { 200: Type.Object({ message: Type.String() }) } },
  }, async (_request, reply) => { reply.send({ message: 'Test OK!' }) })
}
