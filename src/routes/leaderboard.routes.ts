import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import * as leaderboardController from '../controllers/leaderboard.controller'

export const leaderboardRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get('/leaderboard', {
    schema: { response: { 200: Type.Object({ message: Type.String(), data: Type.Any() }), 500: Type.Object({ message: Type.String() }) } },
  }, leaderboardController.getAllLeaderboard)

  app.get('/leaderboard/:teacherId', {
    schema: {
      params: Type.Object({ teacherId: Type.String() }),
      response: {
        200: Type.Object({ message: Type.String(), data: Type.Any() }),
        400: Type.Object({ message: Type.String() }),
        404: Type.Object({ message: Type.String() }),
        500: Type.Object({ message: Type.String() }),
      },
    },
  }, leaderboardController.getLeaderboardDetails)
}
