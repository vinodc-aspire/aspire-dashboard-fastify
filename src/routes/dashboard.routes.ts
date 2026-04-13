import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import * as dashboardController from '../controllers/dashboard.controller'

const ErrorResponse = Type.Object({ error: Type.String() })

export const dashboardRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get('/dashboard-stats', {
    schema: {
      querystring: Type.Object({ startDate: Type.String(), endDate: Type.String() }),
      response: {
        200: Type.Object({
          courseWatchtime: Type.Object({ total: Type.Number(), thisWeek: Type.Number() }),
          homeworkWatchtime: Type.Object({ total: Type.Number(), thisWeek: Type.Number() }),
          classrooms: Type.Object({ total: Type.Number(), thisWeek: Type.Number() }),
          homeworks: Type.Object({ total: Type.Number(), thisWeek: Type.Number() }),
        }),
        400: ErrorResponse,
        500: ErrorResponse,
      },
    },
  }, dashboardController.getDashboardStats)

  app.get('/chart-data', {
    schema: {
      querystring: Type.Object({ type: Type.String(), period: Type.String() }),
      response: { 200: Type.Any(), 400: ErrorResponse, 500: ErrorResponse },
    },
  }, dashboardController.getChartData)
}
