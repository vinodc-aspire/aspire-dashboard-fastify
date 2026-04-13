import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import * as dataUserController from '../controllers/dataUser.controller'

export const dataUserRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get('/user-data', {
    schema: {
      querystring: Type.Object({ startDate: Type.String(), endDate: Type.String() }),
      response: { 200: Type.Any(), 400: Type.Object({ error: Type.String() }), 500: Type.Object({ error: Type.String() }) },
    },
  }, dataUserController.getUserDataReport)
}
