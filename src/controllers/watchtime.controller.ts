import type { FastifyRequest, FastifyReply } from 'fastify'
import * as watchtimeService from '../services/watchtime.service'

export async function getWatchtimeReport(
  request: FastifyRequest<{ Querystring: { startDate: string; endDate: string } }>,
  reply: FastifyReply
) {
  const { startDate, endDate } = request.query
  if (!startDate || !endDate) return reply.status(400).send({ error: 'Start date and end date are required.' })
  try {
    reply.send(await watchtimeService.getWatchtimeReport(request.server.db, startDate, endDate))
  } catch (error) {
    request.log.error(error)
    reply.status(500).send({ error: 'An error occurred while fetching watchtime report' })
  }
}

export async function getZeroActivityReport(
  request: FastifyRequest<{ Querystring: { startDate: string; endDate: string } }>,
  reply: FastifyReply
) {
  const { startDate, endDate } = request.query
  if (!startDate || !endDate) return reply.status(400).send({ error: 'Start date and end date are required.' })
  try {
    reply.send(await watchtimeService.getZeroActivityReport(request.server.db, startDate, endDate))
  } catch (error) {
    request.log.error(error)
    reply.status(500).send({ error: 'An error occurred while fetching zero activity report' })
  }
}
