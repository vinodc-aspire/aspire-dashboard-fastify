import type { FastifyRequest, FastifyReply } from 'fastify'
import * as testAccountsService from '../services/testAccounts.service'

export async function getTestAccounts(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const accounts = await testAccountsService.getTestAccounts(request.server.db)
    reply.send(accounts)
  } catch (error) {
    request.log.error(error)
    reply.status(500).send({ error: 'Failed to fetch test accounts' })
  }
}

export async function searchUser(
  request: FastifyRequest<{ Querystring: { email: string } }>,
  reply: FastifyReply
) {
  const { email } = request.query
  if (!email) {
    return reply.status(400).send({ error: 'email query parameter is required' })
  }
  try {
    const user = await testAccountsService.searchUserByEmail(request.server.db, email)
    if (!user) {
      return reply.status(404).send({ error: 'No user found with that email' })
    }
    reply.send(user)
  } catch (error) {
    request.log.error(error)
    reply.status(500).send({ error: 'Failed to search for user' })
  }
}

export async function createTestAccount(
  request: FastifyRequest<{
    Body: { email: string; password: string; name: string; role: string; curriculum: number; grade?: number }
  }>,
  reply: FastifyReply
) {
  const { email, password, name, role, curriculum, grade } = request.body
  if (!email || !password || !name || !role || curriculum == null) {
    return reply.status(400).send({ error: 'email, password, name, role, and curriculum are required' })
  }
  try {
    const account = await testAccountsService.createTestAccount(request.server.db, {
      email, password, name, role, curriculum, grade,
    })
    reply.status(201).send(account)
  } catch (error) {
    const err = error as { statusCode?: number; message?: string }
    const statusCode = err.statusCode ?? 500
    reply.status(statusCode).send({ error: err.message ?? 'Failed to create test account' })
  }
}

export async function toggleTestAccount(
  request: FastifyRequest<{
    Params: { userId: string }
    Body: { is_testaccount: boolean }
  }>,
  reply: FastifyReply
) {
  const { userId } = request.params
  const { is_testaccount } = request.body
  if (is_testaccount == null) {
    return reply.status(400).send({ error: 'is_testaccount is required' })
  }
  try {
    const updated = await testAccountsService.toggleTestAccount(
      request.server.db,
      userId,
      is_testaccount
    )
    reply.send(updated)
  } catch (error) {
    const err = error as { statusCode?: number; message?: string }
    const statusCode = err.statusCode ?? 500
    reply.status(statusCode).send({ error: err.message ?? 'Failed to update test account' })
  }
}

export async function bulkMarkTestAccounts(
  request: FastifyRequest<{ Body: { emails: string[] } }>,
  reply: FastifyReply
) {
  const { emails } = request.body
  if (!Array.isArray(emails) || emails.length === 0) {
    return reply.status(400).send({ error: 'emails array is required' })
  }
  try {
    const results = await testAccountsService.bulkMarkTestAccounts(request.server.db, emails)
    reply.send({ results })
  } catch (error) {
    const err = error as { statusCode?: number; message?: string }
    const statusCode = err.statusCode ?? 500
    reply.status(statusCode).send({ error: err.message ?? 'Failed to bulk mark test accounts' })
  }
}
