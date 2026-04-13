import Fastify from 'fastify'
import cors from '@fastify/cors'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import drizzlePlugin from './plugins/drizzle'
import { healthRoutes } from './routes/health.routes'

declare module 'fastify' {
  interface FastifyInstance {
    db: NodePgDatabase
  }
}

export async function buildServer() {
  const app = Fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: true,
          messageFormat: '{msg} - {responseTime}ms',
          ignore: 'req,res,reqId,responseTime,pid,hostname',
        },
      },
    },
  }).withTypeProvider<TypeBoxTypeProvider>()

  await app.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  })

  await app.register(drizzlePlugin, {
    url: process.env.DATABASE_URL!,
  })

  app.register(healthRoutes)

  // Route modules will be added here in subsequent tasks

  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      success: false,
      error: `Route ${request.url} not found`,
      code: 404,
    })
  })

  app.setErrorHandler((error, _request, reply) => {
    const statusCode = (error as { statusCode?: number }).statusCode ?? 500
    reply.status(statusCode).send({
      success: false,
      error: error.message,
      code: statusCode,
    })
  })

  return app
}
