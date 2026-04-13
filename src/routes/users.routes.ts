import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import * as usersController from '../controllers/users.controller'

const ErrorResponse = Type.Object({ error: Type.String() })

export const usersRoutes: FastifyPluginAsyncTypebox = async (app) => {
  app.get('/users', {
    schema: {
      querystring: Type.Object({ startDate: Type.String(), endDate: Type.String() }),
      response: {
        200: Type.Object({ success: Type.Boolean(), users: Type.Array(Type.Any()) }),
        400: ErrorResponse,
        500: ErrorResponse,
      },
    },
  }, usersController.getUsers)

  app.get('/users/:id', {
    schema: {
      params: Type.Object({ id: Type.String() }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          user: Type.Object({
            id: Type.String(), email: Type.Any(), created_at: Type.Any(),
            updated_at: Type.Any(), user_type: Type.Any(), age: Type.Any(),
            status: Type.Any(), curriculum: Type.Any(), profile_count: Type.String(),
          }),
        }),
        400: Type.Object({ success: Type.Boolean(), error: Type.String() }),
        404: Type.Object({ success: Type.Boolean(), error: Type.String() }),
        500: Type.Object({ success: Type.Boolean(), error: Type.String() }),
      },
    },
  }, usersController.getUserById)
}
