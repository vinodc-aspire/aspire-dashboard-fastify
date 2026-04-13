import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import * as watchtimeController from '../controllers/watchtime.controller'

export const watchtimeRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get('/watchtime', {
    schema: {
      querystring: Type.Object({ startDate: Type.String(), endDate: Type.String() }),
      response: { 200: Type.Any(), 400: Type.Object({ error: Type.String() }), 500: Type.Object({ error: Type.String() }) },
    },
  }, watchtimeController.getWatchtimeReport)

  app.get('/zero', {
    schema: {
      querystring: Type.Object({ startDate: Type.String(), endDate: Type.String() }),
      response: { 200: Type.Any(), 400: Type.Object({ error: Type.String() }), 500: Type.Object({ error: Type.String() }) },
    },
  }, watchtimeController.getZeroActivityReport)
}
