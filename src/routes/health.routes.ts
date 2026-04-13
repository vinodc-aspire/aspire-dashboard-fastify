import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'

export const healthRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get('/health', {
    schema: {
      response: {
        200: Type.Object({
          status: Type.String(),
          port: Type.Number(),
        }),
      },
    },
  }, async (_request, reply) => {
    reply.send({ status: 'ok', port: Number(process.env.PORT) || 3001 })
  })
}
