import type { FastifyRequest, FastifyReply } from 'fastify'
import * as usersService from '../services/users.service'

export async function getUsers(
  request: FastifyRequest<{ Querystring: { startDate: string; endDate: string } }>,
  reply: FastifyReply
) {
  const { startDate, endDate } = request.query
  if (!startDate || !endDate) {
    return reply.status(400).send({ error: 'Start date and end date are required.' })
  }
  try {
    const users = await usersService.getAllUsers(request.server.db, startDate, endDate)
    reply.send({ success: true, users })
  } catch (error) {
    request.log.error(error)
    reply.status(500).send({ error: 'An error occurred while fetching users' })
  }
}

export async function getUserById(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const userId = parseInt(request.params.id, 10)
  if (isNaN(userId)) {
    return reply.status(400).send({ success: false, error: 'Invalid user ID' })
  }
  try {
    const userDetails = await usersService.getUserById(request.server.db, userId)
    if (!userDetails.length) {
      return reply.status(404).send({ success: false, error: 'User not found' })
    }
    const user = userDetails[0] as Record<string, unknown>
    reply.send({
      success: true,
      user: {
        id: String(user.id),
        email: user.email,
        created_at: user.created_at || 'N/A',
        updated_at: user.updated_at || 'N/A',
        user_type: user.user_type || 'N/A',
        age: user.age || 'N/A',
        status: user.status || 'N/A',
        curriculum: user.curriculum || 'N/A',
        profile_count: String(user.profile_count),
      },
    })
  } catch (error) {
    request.log.error(error)
    reply.status(500).send({ success: false, error: 'Failed to fetch user details' })
  }
}
