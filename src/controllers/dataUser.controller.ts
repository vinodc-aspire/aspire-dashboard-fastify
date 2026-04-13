import type { FastifyRequest, FastifyReply } from 'fastify'
import * as dataUserService from '../services/dataUser.service'

export async function getUserDataReport(
  request: FastifyRequest<{ Querystring: { startDate: string; endDate: string } }>,
  reply: FastifyReply
) {
  const { startDate, endDate } = request.query
  if (!startDate || !endDate) return reply.status(400).send({ error: 'Start date and end date are required.' })
  try {
    reply.send(await dataUserService.getUserDataReport(request.server.db, startDate, endDate))
  } catch (error) {
    request.log.error(error)
    reply.status(500).send({ error: 'An error occurred while fetching the user data report' })
  }
}
