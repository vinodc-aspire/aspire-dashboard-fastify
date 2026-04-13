import type { FastifyRequest, FastifyReply } from 'fastify'
import * as leaderboardService from '../services/leaderboard.service'
import { fixBigInts } from '../utils/fixBigInts'

export async function getAllLeaderboard(request: FastifyRequest, reply: FastifyReply) {
  try {
    const data = await leaderboardService.getAllLeaderboard(request.server.db)
    reply.send({ message: 'Leaderboard fetched successfully.', data: fixBigInts(data) })
  } catch (error) {
    request.log.error(error)
    reply.status(500).send({ message: 'Failed to load leaderboard data.' })
  }
}

export async function getLeaderboardDetails(
  request: FastifyRequest<{ Params: { teacherId: string } }>,
  reply: FastifyReply
) {
  const teacherId = Number(request.params.teacherId)
  if (!teacherId) return reply.status(400).send({ message: 'Invalid teacher ID.' })
  try {
    const data = await leaderboardService.getLeaderboardDetails(request.server.db, teacherId)
    if (!data) return reply.status(404).send({ message: 'Teacher not found in leaderboard.' })
    reply.send({ message: 'Details fetched successfully.', data: fixBigInts(data) })
  } catch (error) {
    request.log.error(error)
    reply.status(500).send({ message: 'Something went wrong.' })
  }
}
