import type { FastifyReply, FastifyRequest } from 'fastify'

// https://github.com/login/oauth/authorize?client_id=Ov23li45PAZRmAvP7xIb

export async function authenticateUserHook(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify()
  } catch {
    return reply.status(401).send({ message: 'Unauthorized' })
  }
}
