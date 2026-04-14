import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'
import * as testAccountsController from '../controllers/testAccounts.controller'

const ErrorResponse = Type.Object({ error: Type.String() })

const TestAccountRow = Type.Object({
  id: Type.String(),
  email: Type.Any(),
  name: Type.Any(),
  role: Type.Any(),
  curriculum_id: Type.Any(),
  created_at: Type.Any(),
})

const UserSearchResult = Type.Object({
  id: Type.String(),
  email: Type.Any(),
  name: Type.Any(),
  role: Type.Any(),
})

export const testAccountsRoutes: FastifyPluginAsyncTypebox = async (app) => {
  // GET /api/test-accounts — list all test accounts
  app.get('/test-accounts', {
    schema: {
      response: {
        200: Type.Array(TestAccountRow),
        500: ErrorResponse,
      },
    },
  }, testAccountsController.getTestAccounts)

  // GET /api/test-accounts/search?email= — find existing user by email
  app.get('/test-accounts/search', {
    schema: {
      querystring: Type.Object({ email: Type.String() }),
      response: {
        200: UserSearchResult,
        400: ErrorResponse,
        404: ErrorResponse,
        500: ErrorResponse,
      },
    },
  }, testAccountsController.searchUser)

  // POST /api/test-accounts — create a new test account
  app.post('/test-accounts', {
    schema: {
      body: Type.Object({
        email: Type.String(),
        password: Type.String(),
        name: Type.String(),
        role: Type.String(),
        curriculum: Type.Number(),
        grade: Type.Optional(Type.Number()),
      }),
      response: {
        201: TestAccountRow,
        400: ErrorResponse,
        500: ErrorResponse,
      },
    },
  }, testAccountsController.createTestAccount)

  // PATCH /api/test-accounts/:userId — mark or unmark a user
  app.patch('/test-accounts/:userId', {
    schema: {
      params: Type.Object({ userId: Type.String() }),
      body: Type.Object({ is_testaccount: Type.Boolean() }),
      response: {
        200: Type.Object({ id: Type.String(), email: Type.Any(), is_testaccount: Type.Any() }),
        400: ErrorResponse,
        404: ErrorResponse,
        500: ErrorResponse,
      },
    },
  }, testAccountsController.toggleTestAccount)
}
