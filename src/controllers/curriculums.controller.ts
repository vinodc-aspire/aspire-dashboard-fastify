import type { FastifyRequest, FastifyReply } from 'fastify'
import * as curriculumsService from '../services/curriculums.service'

export async function getCurriculums(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const curriculums = await curriculumsService.getCurriculums(request.server.db)
    reply.send(curriculums)
  } catch (error) {
    request.log.error(error)
    reply.status(500).send({ error: 'Failed to fetch curriculums' })
  }
}
