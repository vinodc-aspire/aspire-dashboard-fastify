import type { FastifyRequest, FastifyReply } from 'fastify'
import * as dashboardService from '../services/dashboard.service'

export async function getDashboardStats(
  request: FastifyRequest<{ Querystring: { startDate: string; endDate: string } }>,
  reply: FastifyReply
) {
  const { startDate, endDate } = request.query
  if (!startDate || !endDate) {
    return reply.status(400).send({ error: 'Start date and end date are required.' })
  }
  try {
    const data = await dashboardService.getDashboardStats(request.server.db, startDate, endDate)
    reply.send(data)
  } catch (error) {
    request.log.error(error)
    reply.status(500).send({ error: 'Failed to fetch dashboard statistics' })
  }
}

export async function getChartData(
  request: FastifyRequest<{ Querystring: { type: string; period: string } }>,
  reply: FastifyReply
) {
  const { type, period } = request.query
  if (!type || !period) {
    return reply.status(400).send({ error: 'Type and period are required.' })
  }
  try {
    const data = await dashboardService.getChartData(request.server.db, type, period)
    reply.send(data)
  } catch (error) {
    request.log.error(error)
    reply.status(500).send({ error: 'Failed to fetch chart data' })
  }
}
